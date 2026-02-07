import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    # Set viewport to mobile size
    context = browser.new_context(viewport={'width': 390, 'height': 844})
    page = context.new_page()

    print("Navigating to Expo Web...")
    try:
        page.goto("http://localhost:8081", timeout=60000)
        # Wait for some content. Weaver title is "The Weaver".
        page.wait_for_selector("text=The Weaver", timeout=60000)
    except Exception as e:
        print(f"Failed to load: {e}")
        browser.close()
        return

    print("Weaver screen loaded.")
    time.sleep(2)
    page.screenshot(path="verification/weaver_screen.png")

    # Enter theme
    print("Entering theme...")
    try:
        # Find input by placeholder or label
        page.get_by_placeholder("e.g. Ancient Rome, Quantum Physics").fill("Stoicism")
        time.sleep(1)

        # Click Weave
        print("Clicking Weave Curriculum...")
        # Use force=True as RN Web sometimes has touchable overlays
        page.get_by_text("Weave Curriculum").click(force=True)

        # Wait for navigation to Results
        print("Waiting for Results screen...")
        page.wait_for_selector("text=The Scroll", timeout=20000)

        print("Results screen loaded.")
        time.sleep(3) # Wait for content
        page.screenshot(path="verification/results_screen.png")

        # Verify Dark Mode colors
        # We can't easily check computed styles in Python without eval, but screenshot helps.

        # Switch to Analyze
        print("Switching to Analyze mode...")
        page.get_by_text("Analyze").click(force=True)
        time.sleep(1)

        # Take another screenshot
        page.screenshot(path="verification/analyze_mode.png")

        # Switch to Drill
        print("Switching to Drill mode...")
        page.get_by_text("Drill").click(force=True)
        time.sleep(1)

        # Take another screenshot
        page.screenshot(path="verification/drill_mode.png")

    except Exception as e:
        print(f"Error during interaction: {e}")
        page.screenshot(path="verification/error.png")

    browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
