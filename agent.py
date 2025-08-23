import asyncio
from playwright.async_api import async_playwright
from openai import AsyncOpenAI
import base64
import json
from utils import draw_bounding_boxes
import imageio
from pydantic import BaseModel

# --- State Representation ---

class TabInfo(BaseModel):
    url: str
    title: str

class PageInfo(BaseModel):
    viewport_width: int
    viewport_height: int
    page_width: int
    page_height: int
    scroll_x: int
    scroll_y: int

class BrowserStateSummary(BaseModel):
    dom_state: list
    url: str
    title: str
    tabs: list[TabInfo]
    page_info: PageInfo

# --- Action Abstraction ---

class Action:
    async def execute(self, page):
        raise NotImplementedError

class Click(Action):
    def __init__(self, element_id):
        self.element_id = element_id

    async def execute(self, page):
        elements = await page.query_selector_all("a, button, input, textarea, [role]")
        element = elements[self.element_id]
        await element.click(force=True)

class Type(Action):
    def __init__(self, element_id, text):
        self.element_id = element_id
        self.text = text

    async def execute(self, page):
        elements = await page.query_selector_all("a, button, input, textarea, [role]")
        element = elements[self.element_id]
        await element.fill(self.text)

class Hover(Action):
    def __init__(self, element_id):
        self.element_id = element_id

    async def execute(self, page):
        elements = await page.query_selector_all("a, button, input, textarea, [role]")
        element = elements[self.element_id]
        await element.hover()

class Scroll(Action):
    def __init__(self, direction):
        self.direction = direction

    async def execute(self, page):
        if self.direction == "up":
            await page.evaluate("window.scrollBy(0, -window.innerHeight)")
        else:
            await page.evaluate("window.scrollBy(0, window.innerHeight)")

class GoBack(Action):
    async def execute(self, page):
        await page.go_back()

class GoForward(Action):
    async def execute(self, page):
        await page.go_forward()

class Refresh(Action):
    async def execute(self, page):
        await page.reload()

class Done(Action):
    def __init__(self, summary):
        self.summary = summary

    async def execute(self, page):
        pass

class SwitchTab(Action):
    def __init__(self, tab_index):
        self.tab_index = tab_index

    async def execute(self, page):
        await page.context.pages[self.tab_index].bring_to_front()

class CloseTab(Action):
    async def execute(self, page):
        await page.close()

class NewTab(Action):
    async def execute(self, page):
        await page.context.new_page()

class GoTo(Action):
    def __init__(self, url):
        self.url = url

    async def execute(self, page):
        await page.goto(self.url)

# --- Controller ---

class Controller:
    async def execute_action(self, action, page):
        await action.execute(page)

# --- Agent ---

class Agent:
    def __init__(self, websocket):
        self.websocket = websocket
        self.client = AsyncOpenAI()
        self.history = []
        self.frames = []
        self.controller = Controller()

    async def run(self, task):
        await self.send_log(f"[FINAL_AGENT] Starting task: {task.instruction}")

        system_prompt = """
        You are an AI agent designed to operate in an iterative loop to automate browser tasks. Your ultimate goal is accomplishing the task provided by the user.

        At every step, your input will consist of: 
        1. A chronological event stream including your previous actions and their results.
        2. The current URL, open tabs, and interactive elements indexed for actions.
        3. A screenshot of the browser with bounding boxes around interactive elements.

        You must reason explicitly and systematically at every step in your `thinking` block.

        You must ALWAYS respond with a valid JSON in this exact format:

        {{
          "thinking": "A structured reasoning block that analyzes the current state and plans the next action.",
          "action": "The action to take."
        }}

        You can perform the following actions:
        - Hover(id)
        - Click(id)
        - Type(id, "text"): IMPORTANT: Only use this action on elements with a `tag` of `input` or `textarea`.
        - Scroll("up" or "down")
        - GoBack()
        - GoForward()
        - Refresh()
        - SwitchTab(tab_index)
        - CloseTab()
        - NewTab()
        - GoTo("url")
        - Done("summary")
        """

        self.history.append({"role": "system", "content": system_prompt})
        self.history.append({"role": "user", "content": f"The task is: {task.instruction}"})

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(task.url)

            for _ in range(15): # Increased step limit
                browser_state = await self.observe(page)
                await self.send_screenshot(page, browser_state.dom_state)
                self.history.append({"role": "user", "content": browser_state.model_dump_json()})

                action = await self.think(browser_state.dom_state)
                
                if action is None:
                    continue

                if isinstance(action, Done):
                    break
                
                await self.controller.execute_action(action, page)
                
                # Re-observe the page after each action to get the updated state
                browser_state = await self.observe(page)

            await browser.close()

        await self.send_log("[FINAL_AGENT] Task finished. Saving video...")
        video_filename = "agent_run.mp4"
        imageio.mimsave(video_filename, self.frames, fps=3)
        await self.send_log(f"[VIDEO]/{video_filename}")

    async def observe(self, page):
        page_state = await page.evaluate("""
            () => {
                return {
                    url: window.location.href,
                    title: document.title,
                    viewport_width: window.innerWidth,
                    viewport_height: window.innerHeight,
                    page_width: document.body.scrollWidth,
                    page_height: document.body.scrollHeight,
                    scroll_x: window.scrollX,
                    scroll_y: window.scrollY,
                }
            }
        """)

        tabs = []
        for p in page.context.pages:
            tabs.append(TabInfo(url=p.url, title=await p.title()))

        elements = await page.query_selector_all("a, button, input, textarea, [role]")
        dom_state = []
        for i, element in enumerate(elements):
            if await element.is_visible():
                tag_name = await element.evaluate("element => element.tagName.toLowerCase()")
                text = await element.inner_text()
                
                bounding_box = await element.bounding_box()
                
                dom_state.append({
                    "id": i,
                    "tag": tag_name,
                    "text": text[:100],
                    "bounding_box": bounding_box,
                })

        return BrowserStateSummary(
            dom_state=dom_state,
            url=page_state["url"],
            title=page_state["title"],
            tabs=tabs,
            page_info=PageInfo(**page_state)
        )

    async def think(self, dom_state):
        response = await self.client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=self.history,
            response_format={"type": "json_object"},
        )
        response_json = json.loads(response.choices[0].message.content)
        thinking = response_json.get("thinking", "")
        action_str = response_json.get("action", "")
        
        self.history.append({"role": "assistant", "content": response.choices[0].message.content})
        await self.send_log(f"[FINAL_AGENT] Thinking: {thinking}")
        await self.send_log(f"[FINAL_AGENT] Chose action: {action_str}")

        return self.parse_action(action_str, dom_state)


    def parse_action(self, action_str, dom_state):
        parts = action_str.strip().replace(")", "").split("(")
        action_name = parts[0].capitalize()
        params_str = parts[1] if len(parts) > 1 else ""

        action_classes = {
            "Hover": Hover,
            "Click": Click,
            "Type": Type,
            "Scroll": Scroll,
            "GoBack": GoBack,
            "GoForward": GoForward,
            "Refresh": Refresh,
            "Done": Done,
            "SwitchTab": SwitchTab,
            "CloseTab": CloseTab,
            "NewTab": NewTab,
            "GoTo": GoTo,
        }

        action_class = action_classes.get(action_name)
        if not action_class:
            return None

        try:
            if action_name in ["Hover", "Click"]:
                element_id = int(params_str)
                if element_id >= len(dom_state):
                    return None
                return action_class(element_id)
            elif action_name == "Type":
                id_str, text = params_str.split(",", 1)
                element_id = int(id_str.strip())
                if element_id >= len(dom_state):
                    return None
                return action_class(element_id, text.strip().strip('"'))
            elif action_name == "Scroll":
                return action_class(params_str.strip().strip('"'))
            elif action_name == "GoTo":
                return action_class(params_str.strip().strip('"'))
            elif action_name == "SwitchTab":
                return action_class(int(params_str))
            elif action_name == "Done":
                return action_class(params_str.strip().strip('"'))
            else:
                return action_class()
        except (ValueError, IndexError):
            return None

    async def send_log(self, message):
        await self.websocket.send_text(message)

    async def send_screenshot(self, page, elements):
        screenshot_bytes = await page.screenshot(type='jpeg', quality=95)
        self.frames.append(imageio.imread(screenshot_bytes))
        
        screenshot_with_boxes = draw_bounding_boxes(screenshot_bytes, elements)
        await self.websocket.send_bytes(screenshot_with_boxes)
