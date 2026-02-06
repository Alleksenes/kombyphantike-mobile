from playwright.sync_api import sync_playwright, Page, expect
import time

def verify_ui(page: Page):
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Browser error: {err}"))

    # Mock backend responses
    def handle_draft(route):
        print("Intercepted draft_curriculum")
        route.fulfill(json={
            "worksheet_data": [
                {
                    "source_sentence": "Test sentence.",
                    "target_sentence": "",
                    "ancient_context": "",
                    "knot": "Test knot"
                }
            ],
            "instruction_text": "Test instructions"
        })

    def handle_fill(route):
        print("Intercepted fill_curriculum, delaying...")
        # Delay to capture loader
        time.sleep(5)
        route.fulfill(json={
            "worksheet_data": [
                {
                    "source_sentence": "Test sentence.",
                    "target_sentence": "Filled sentence.",
                    "target_tokens": [
                        {"text": "Filled", "pos": "VERB"},
                        {"text": "sentence", "pos": "NOUN"},
                        {"text": ".", "pos": "PUNCT"}
                    ],
                    "ancient_context": "Context",
                    "knot": "Knot"
                }
            ]
        })

    page.route("**/draft_curriculum", handle_draft)
    page.route("**/fill_curriculum", handle_fill)

    # Go to home
    print("Navigating to home...")
    page.goto("http://localhost:8081")

    # Wait for app to load
    print("Waiting for Weaver...")
    page.wait_for_selector("text=The Weaver", timeout=10000)

    # Click Weave
    print("Clicking Weave...")
    button = page.get_by_role("button", name="Weave Curriculum")
    expect(button).to_be_visible()
    button.click(force=True)

    # Check if text changes to "Weaving Draft..."
    # page.wait_for_selector("text=Weaving Draft...", timeout=5000)

    # Wait for Results screen header "The Scroll"
    print("Waiting for The Scroll...")
    page.wait_for_selector("text=The Scroll", timeout=10000)

    # Wait a moment for the loader to appear
    print("Waiting for loader animation...")
    time.sleep(2)

    # Check for SVG in DOM
    print("Checking for SVG in DOM...")
    svgs = page.locator("svg").count()
    print(f"Found {svgs} SVGs")

    # Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/ui_verification.png")
    print("Screenshot saved.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ui(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
