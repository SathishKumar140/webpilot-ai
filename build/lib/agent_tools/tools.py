from playwright.async_api import Page
from langchain_core.tools import BaseTool, StructuredTool
from langchain.tools import tool
from urllib.parse import urljoin, urlparse
import base64
import asyncio
import json

class BrowserController:
    """
    A controller to manage browser interactions using Playwright.
    """
    def __init__(self, page: Page):
        self.page = page

    async def navigate(self, url: str):
        """Navigates the browser to the specified URL."""
        await self.page.goto(url)

    async def get_page_content(self) -> str:
        """Returns the full HTML content of the current page."""
        return await self.page.content()

    async def get_dom_state(self):
        """
        Returns a structured representation of the DOM, including forms and input fields.
        """
        dom_state = await self.page.evaluate('''
            () => {
                const elements = [];
                document.querySelectorAll('form, input, textarea, select, button, a').forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    elements.push({
                        id: index,
                        tag: el.tagName.toLowerCase(),
                        type: el.type,
                        name: el.name,
                        value: el.value,
                        action: el.action,
                        href: el.href,
                        bounding_box: {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height
                        },
                        attributes: Array.from(el.attributes).map(attr => ({
                            name: attr.name,
                            value: attr.value
                        }))
                    });
                });
                return elements;
            }
        ''')
        return dom_state

    async def click_element(self, selector: str):
        """Clicks an element identified by a CSS selector."""
        await self.page.click(selector)

    async def type_text(self, selector: str, text: str):
        """Types text into an element identified by a CSS selector."""
        await self.page.fill(selector, text)

    async def scroll_page(self, direction: str):
        """Scrolls the page up or down."""
        if direction == "up":
            await self.page.evaluate("window.scrollBy(0, -window.innerHeight)")
        else:
            await self.page.evaluate("window.scrollBy(0, window.innerHeight)")

    async def take_screenshot(self) -> str:
        """Takes a screenshot of the current page and returns it as a base64 encoded string."""
        screenshot_bytes = await self.page.screenshot(type='jpeg', quality=95)
        return base64.b64encode(screenshot_bytes).decode()

class AgentTools:
    """
    A collection of tools for the penetration testing agent to interact with the browser.
    """
    def __init__(self, browser_controller: BrowserController):
        self.browser_controller = browser_controller
        
        # Define get_dom_state as a StructuredTool
        self.get_dom_state = StructuredTool.from_function(
            func=self._get_dom_state_internal,
            name="get_dom_state",
            description="Returns a structured representation of the DOM, including forms and input fields, as a JSON string.",
            coroutine=self._get_dom_state_internal,
        )

    @tool
    async def maps_to_url(self, url: str) -> str:
        """
        Navigates the browser to the specified URL.
        Returns the URL after navigation and a screenshot.
        """
        await self.browser_controller.navigate(url)
        screenshot = await self.browser_controller.take_screenshot()
        return {"result": f"Navigated to {self.browser_controller.page.url}", "screenshot": screenshot}

    @tool
    async def click_element(self, selector: str) -> str:
        """
        Clicks an element on the page identified by a CSS selector.
        Returns the current URL and a screenshot after the click.
        """
        await self.browser_controller.click_element(selector)
        screenshot = await self.browser_controller.take_screenshot()
        return {"result": f"Clicked element with selector: {selector}", "screenshot": screenshot}

    @tool
    async def type_text(self, selector: str, text: str) -> str:
        """
        Types text into an input field or textarea identified by a CSS selector.
        Returns the current URL and a screenshot after typing.
        """
        await self.browser_controller.type_text(selector, text)
        screenshot = await self.browser_controller.take_screenshot()
        return {"result": f"Typed '{text}' into element with selector: {selector}", "screenshot": screenshot}

    @tool
    async def scroll_page(self, direction: str) -> str:
        """
        Scrolls the page up or down.
        Direction can be 'up' or 'down'.
        Returns the current URL and a screenshot after scrolling.
        """
        await self.browser_controller.scroll_page(direction)
        screenshot = await self.browser_controller.take_screenshot()
        return {"result": f"Scrolled page {direction}", "screenshot": screenshot}

    @tool
    async def get_page_content(self) -> str:
        """
        Returns the full HTML content of the current page.
        """
        content = await self.browser_controller.get_page_content()
        return {"result": content}

    async def _get_dom_state_internal(self) -> str:
        """
        Returns a structured representation of the DOM, including forms and input fields, as a JSON string.
        This is an internal method wrapped by a LangChain tool.
        """
        dom_state = await self.browser_controller.get_dom_state()
        return {"result": json.dumps(dom_state, indent=2)}
