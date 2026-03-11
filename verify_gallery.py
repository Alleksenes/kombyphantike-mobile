from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to dev gallery...")
            # We don't wait for networkidle because web bundles can take time or continuously ping
            page.goto("http://localhost:8081/dev/gallery")

            print("Waiting for root element to load...")
            # Increased timeout for initial render (webpack/metro takes time)
            page.wait_for_selector("text=Active Node", timeout=60000)
            print("Page loaded.")

            # Wait for specific content to render
            expect(page.locator("text=κόσμον")).to_be_visible(timeout=10000)
            print("Card rendered.")

            # Take a screenshot of the initial state
            page.screenshot(path="gallery_initial.png")

            # Click the knot word to open the inspector
            print("Clicking knot word 'κόσμον'...")
            page.locator("text=κόσμον").click()

            # Wait for the bottom sheet to animate up
            time.sleep(2)

            # Expect the inspector to show the Davidian Note (first element to avoid strict mode violations)
            expect(page.locator("text=The Davidian Note").first).to_be_visible(timeout=5000)
            print("Inspector opened.")

            # Take a screenshot of the inspector open
            page.screenshot(path="gallery_inspector.png")
            print("Screenshots captured successfully.")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="gallery_error.png")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    run()
