from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        try:
            page.goto("http://localhost:8081", timeout=60000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        # Wait for content. The root view usually has some ID or structure.
        try:
            page.wait_for_selector("#root", state="attached", timeout=60000)
        except Exception as e:
            print(f"Selector timeout: {e}")
            page.screenshot(path="verification/timeout.png")
            return

        print("Page loaded. Waiting for potential animations/fonts...")
        time.sleep(10) # Give Skia and fonts time to load

        # Take screenshot
        page.screenshot(path="verification/atmosphere.png")
        print("Screenshot saved to verification/atmosphere.png")

        browser.close()

if __name__ == "__main__":
    run()
