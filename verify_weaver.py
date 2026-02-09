from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock API
    def handle_route(route):
        print(f"Intercepted request: {route.request.url}")
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"draft_data": [], "graph": {"nodes": [{"id": "1", "label": "Test Node", "status": "unlocked", "x": 100, "y": 100}], "links": []}}'
        )

    # Intercept all requests to draft_curriculum
    page.route("**/draft_curriculum", handle_route)

    try:
        print("Navigating to http://localhost:8081")
        page.goto("http://localhost:8081", timeout=60000)

        # 1. Verify Weaver Screen
        print("Waiting for 'Create a Curriculum'...")
        expect(page.get_by_text("Create a Curriculum")).to_be_visible(timeout=30000)

        # Take initial screenshot
        page.screenshot(path="weaver_initial.png")

        # 2. Verify Input Interaction (The Layering)
        print("Interacting with input...")
        input_field = page.get_by_placeholder("Enter a Theme")
        input_field.click()
        input_field.fill("Test Theme")

        # Verify input value
        print("Verifying input value...")
        expect(input_field).to_have_value("Test Theme")
        page.screenshot(path="weaver_filled.png")

        # 3. Trigger Weave
        print("Clicking Weave button...")
        button = page.get_by_text("Weave Curriculum")
        button.click()

        # 4. Verify Navigation to Constellation (The Navigation)
        print("Waiting for Constellation Map...")
        # Web fallback text in ConstellationMap.tsx
        expect(page.get_by_text("Constellation Map (Web View)")).to_be_visible(timeout=30000)
        expect(page.get_by_text("Test Node")).to_be_visible() # Verify graph data passed

        page.screenshot(path="weaver_verification.png")
        print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        page.screenshot(path="weaver_error.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
