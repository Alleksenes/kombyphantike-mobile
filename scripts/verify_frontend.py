from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home...")
        page.goto("http://localhost:8081")

        # Wait for "The Weaver" title or similar
        try:
            page.wait_for_selector('text="The Weaver"', timeout=60000)
        except:
            print("Timeout waiting for Home screen. Dumping content.")
            print(page.content())
            browser.close()
            return

        print("Home screen loaded.")
        page.screenshot(path="/home/jules/verification/home.png")

        # Click "View History"
        # In react-native-web, text is often in divs or spans.
        # Button mode="text" usually has the text accessible.
        print("Clicking View History...")
        page.get_by_text("View History").click()

        # Wait for History screen
        # It has "History" in header and "No saved curriculums yet" if empty.
        page.wait_for_selector('text="History"', timeout=10000)

        print("History screen loaded.")
        # Check for empty state
        page.wait_for_selector('text="No saved curriculums yet."', timeout=10000)

        page.screenshot(path="/home/jules/verification/history_empty.png")
        print("Screenshots saved.")

        browser.close()

if __name__ == "__main__":
    run()
