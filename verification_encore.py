import time
from playwright.sync_api import sync_playwright

def verify(page):
    print("Navigating to home...")
    page.goto("http://localhost:8081")

    # Wait for content to load
    print("Waiting for content...")
    try:
        page.wait_for_selector("text=Create a Curriculum", timeout=10000)
        print("Home screen loaded.")
    except Exception as e:
        print(f"Error waiting for selector: {e}")
        page.screenshot(path="verification_error.png")
        return

    # Check background color via screenshot or computed style?
    # Since it's a canvas or view, screenshot is best.

    time.sleep(2)
    print("Taking screenshot...")
    page.screenshot(path="verification_encore.png")
    print("Screenshot saved to verification_encore.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify(page)
        finally:
            browser.close()
