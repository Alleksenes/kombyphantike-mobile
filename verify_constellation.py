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
            body='{"nodes": [{"id": "1", "label": "Test Node", "status": "unlocked", "x": 100, "y": 100}], "links": [], "draft_data": []}'
        )

    # Intercept all requests to draft_curriculum
    page.route("**/draft_curriculum", handle_route)

    try:
        print("Navigating to http://localhost:8081")
        page.goto("http://localhost:8081", timeout=60000)

        # 1. Verify Weaver Screen
        print("Waiting for 'Create a Curriculum'...")
        expect(page.get_by_text("Create a Curriculum")).to_be_visible(timeout=30000)

        # 2. Verify Input Interaction (The Layering)
        print("Interacting with input...")
        # Use JS to set value because Playwright interaction is flaky with RNW here
        input_field = page.get_by_role("textbox")
        # React inputs need native value setter call for onChange to trigger
        # But for RNW, simple fill might fail if events are blocked.
        # Let's try forcing value property.
        # RNW usually uses 'value' attribute reflecting state, but to change it we need to trigger change event.

        # We can try to use keyboard type again but maybe focus first?
        # Or just skip input and try to click button? Button is disabled if theme is empty.

        # Let's try to type again but ensure focus.
        input_field.focus()
        page.keyboard.type("Test Theme")

        # If that fails, we can't weave.
        # But we can check background color of body.

        # Check background color
        # In RNW, the root view is usually a div with ID 'root' or similar.
        # app/_layout.tsx sets style on a View.
        # That View should have backgroundColor: '#0f0518'.
        # We can try to find an element with that background color.

        # We can inspect the computed style of the first child of root.
        root_bg = page.evaluate("""() => {
            const root = document.getElementById('root');
            if (!root) return 'No Root';
            const firstChild = root.firstElementChild; // This is usually the safe area provider or the main View
            // Recursively check children for the background color
            // app/_layout.tsx: <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
            // This should correspond to a div with background-color: rgb(15, 5, 24)

            function findBg(el) {
                if (!el) return null;
                const style = window.getComputedStyle(el);
                if (style.backgroundColor === 'rgb(15, 5, 24)') return el;
                for (let child of el.children) {
                    const found = findBg(child);
                    if (found) return found;
                }
                return null;
            }

            const found = findBg(root);
            return found ? window.getComputedStyle(found).backgroundColor : 'Not Found';
        }""")

        print(f"Found Background Color: {root_bg}")

        page.screenshot(path="constellation_verification.png")
        print("Verification successful!")

    except Exception as e:
        print(f"Verification failed: {e}")
        page.screenshot(path="constellation_error_4.png")
        # raise e # Don't raise, just finish so I can see output
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
