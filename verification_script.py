from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Emulate a mobile device to match the app's target better
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()

        print("Navigating to home...")
        page.goto("http://localhost:8081")

        # Wait for the app to load
        print("Waiting for 'The Weaver'...")
        # Check for title with correct text.
        # Note: React Native Web renders text in divs/spans.
        page.get_by_text("The Weaver").first.wait_for(timeout=30000)

        # 1. Verify Weaver Screen (Fonts & Centered Omega if visible)
        # We can't easily see Omega unless we trigger loading, which we will do.

        # Take a screenshot of Weaver Screen to verify Font and Background
        print("Taking screenshot of Weaver Screen...")
        page.screenshot(path="/home/jules/verification/weaver.png")

        # 2. Interact to go to Results
        print("Filling theme...")
        # Find input. React Native Paper TextInput usually has a label.
        # Check if we can find by label or placeholder.
        # "Theme" is the label.
        theme_input = page.get_by_label("Theme")
        # Or placeholder "e.g. Ancient Rome..."
        if not theme_input.is_visible():
             theme_input = page.get_by_placeholder("e.g. Ancient Rome, Quantum Physics")

        theme_input.fill("Test Theme")

        print("Clicking Weave Curriculum...")
        # Button text "Weave Curriculum"
        weave_button = page.get_by_text("Weave Curriculum")
        weave_button.click()

        # 3. Verify Omega Loader during loading (if possible to catch)
        # It might be fast in mock mode (800ms).
        # We might catch it with a quick screenshot or just wait for results.

        # 4. Verify Results Screen (WordChips with Greek Font)
        print("Waiting for Results...")
        # Look for "Knot" or some text from the mock data.
        # Mock data usually returns some Greek text.
        # Let's wait for a known element from PhilologyCard
        try:
            page.get_by_text("Knot").first.wait_for(timeout=10000)
        except:
            print("Timed out waiting for Knot. Maybe still loading or error.")
            page.screenshot(path="/home/jules/verification/error_results.png")
            return

        print("Taking screenshot of Results Screen...")
        page.screenshot(path="/home/jules/verification/results.png")

        # 5. Verify History Screen (Omega Loader instead of ActivityIndicator)
        # Navigate to History tab.
        # Tab bar usually has "Archives" or icon.
        # Text "Archives" is in the tab bar.
        print("Navigating to Archives...")
        archives_tab = page.get_by_text("Archives")
        archives_tab.click()

        print("Waiting for History Screen...")
        # "Archived Scrolls" is the header
        page.get_by_text("Archived Scrolls").first.wait_for()

        # History loads data on mount. If it takes time, we might see loader.
        # But mock data or empty state might load fast.
        # We just want to see the screen and verify background/font.
        print("Taking screenshot of History Screen...")
        page.screenshot(path="/home/jules/verification/history.png")

        browser.close()

if __name__ == "__main__":
    run()
