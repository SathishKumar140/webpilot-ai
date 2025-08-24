from playwright.async_api import Page
import base64
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

    async def click(self, x: int, y: int):
        """Clicks at a specific x,y coordinate."""
        await self.page.mouse.click(x, y)

    async def type_text(self, selector: str, text: str):
        """Types text into an element identified by a CSS selector."""
        await self.page.fill(selector, text)

    async def scroll_page(self, direction: str):
        """Scrolls the page up or down."""
        if direction == "up":
            await self.page.evaluate("window.scrollBy(0, -window.innerHeight)")
        else:
            await self.page.evaluate("window.scrollBy(0, window.innerHeight)")

    async def capture_screenshot(self) -> str:
        """Takes a screenshot of the current page and returns it as a base64 encoded string."""
        screenshot_bytes = await self.page.screenshot(type='jpeg', quality=95)
        return base64.b64encode(screenshot_bytes).decode()
