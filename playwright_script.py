import asyncio
import websockets
from playwright.async_api import async_playwright
import logging

logging.basicConfig(level=logging.INFO)

async def run():
    is_headless = True  # Set to True for headless, False for debugging
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=is_headless)
        context = await browser.new_context(permissions=['geolocation'])
        page = await context.new_page()

        # Connect to the WebSocket server
        ws_uri = "ws://localhost:8080"
        websocket = await websockets.connect(ws_uri)
        logging.info(f"Connected to WebSocket server at {ws_uri}")

        try:
            # Your automation logic goes here
            await page.goto('https://test.infosoft-inc.com/', wait_until='domcontentloaded', timeout=60000)

            async def send_screenshot():
                # Only send screenshots if running in headless mode
                if websocket.state == websockets.protocol.State.OPEN and is_headless:
                    screenshot_buffer = await page.screenshot(type='jpeg', quality=50)
                    await websocket.send(screenshot_buffer)

            # Send a screenshot every 500 milliseconds
            while True:
                await send_screenshot()
                await asyncio.sleep(0.5)

            # Example of further automation: Login to the provided webpage
            await page.wait_for_selector('input[name="Username"]', timeout=60000)
            await page.type('input[name="Username"]', 'dev@infosoft-inc.com', timeout=60000) # Replace with actual username

            await page.wait_for_selector('input[name="Password"]', timeout=60000)
            await page.type('input[name="Password"]', 'abc123', timeout=60000) # Replace with actual password

            # Ensure the network is idle before attempting to click the button
            await page.wait_for_load_state('networkidle', timeout=60000)
            # Use the provided selector for the login button
            await page.click('button.login-btn:has-text("Login")', timeout=60000)

            # Keep the script running to continue sending screenshots
            # In a real application, you would close the browser when the automation is complete.
            # For this example, we'll just wait for a while.
            await asyncio.sleep(30) # Run for 30 seconds

        except Exception as e:
            logging.error(f"An error occurred: {e}")
        finally:
            await browser.close()
            await websocket.close()
            logging.info("Browser and WebSocket closed.")

if __name__ == "__main__":
    asyncio.run(run())
