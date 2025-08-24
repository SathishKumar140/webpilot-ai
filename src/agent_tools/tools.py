from typing import Dict, Any
from src.browser_controller.controller import BrowserController
import base64

class AgentTools:
    def __init__(self, controller: BrowserController):
        self.controller = controller

    async def _capture_and_encode_screenshot(self) -> str:
        """Captures a screenshot and returns it as a Base64 encoded string."""
        # The controller's capture_screenshot already returns a base64 encoded string
        return await self.controller.capture_screenshot()

    async def navigate(self, url: str) -> Dict[str, Any]:
        """Navigates the browser to the specified URL."""
        await self.controller.navigate(url)
        screenshot = await self._capture_and_encode_screenshot()
        return {"result": f"Navigated to {url}", "screenshot": screenshot}

    async def click_element(self, description: str) -> Dict[str, Any]:
        print(f"AgentTools: Attempting to click element described as: {description}")
        x, y = 450, 300 # Dummy coordinates
        await self.controller.click(x, y)
        screenshot = await self._capture_and_encode_screenshot()
        return {"result": f"Clicked element: {description} at {x},{y}", "screenshot": screenshot}

    async def type_text(self, text: str, input_field_description: str) -> Dict[str, Any]:
        print(f"AgentTools: Attempting to type '{text}' into field described as: {input_field_description}")
        selector = "textarea[name='q']"
        await self.controller.type_text(selector, text)
        screenshot = await self._capture_and_encode_screenshot()
        return {"result": f"Typed '{text}' into {input_field_description}", "screenshot": screenshot}

    async def scroll_page(self, direction: str) -> Dict[str, Any]:
        await self.controller.scroll_page(direction)
        screenshot = await self._capture_and_encode_screenshot()
        return {"result": f"Scrolled page {direction}", "screenshot": screenshot}

    async def finish_task(self, summary: str) -> Dict[str, Any]:
        print(f"AgentTools: Task finished with summary: {summary}")
        screenshot = await self._capture_and_encode_screenshot()
        return {"result": f"Task finished: {summary}", "screenshot": screenshot, "task_completed": True}

    async def get_page_content(self) -> Dict[str, Any]:
        """
        Returns the full HTML content of the current page.
        """
        html_content = await self.controller.page.content()
        return {"result": "Successfully retrieved page content", "content": html_content}
