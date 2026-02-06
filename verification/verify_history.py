from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Opening app...")
    try:
        page.goto("http://localhost:8081")

        # Wait for Weaver title (Wait longer for initial load)
        print("Waiting for Weaver...")
        expect(page.get_by_text("The Weaver")).to_be_visible(timeout=60000)

        # Check Tabs
        print("Checking Tabs...")
        # Verify Weaver tab is present using robust locator
        expect(page.get_by_role("tab", name="Weaver")).to_be_visible()

        # Click Archives
        print("Clicking Archives...")
        page.get_by_role("tab", name="Archives").click()

        # Check History Screen
        print("Checking History Screen...")
        expect(page.get_by_text("Archived Scrolls")).to_be_visible()

        # Check for empty state (since DB is fresh)
        expect(page.get_by_text("No scrolls found.")).to_be_visible()

        print("Taking screenshot...")
        page.screenshot(path="verification/verification_history.png")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
