from playwright.sync_api import sync_playwright
import time

def verify_weaver():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to http://localhost:8081")
        # Retry logic for server start
        for i in range(60):
            try:
                page.goto("http://localhost:8081", timeout=5000)
                break
            except Exception as e:
                print(f"Attempt {i+1} failed: {e}")
                time.sleep(2)
        else:
            print("Failed to connect to server")
            browser.close()
            return

        print("Waiting for 'Create a Curriculum' text...")
        try:
            # Wait for the main heading
            # Using a broad selector because sometimes text rendering differs
            page.wait_for_selector("text=Create a Curriculum", timeout=120000)

            # Additional wait for fonts and canvas to render
            time.sleep(5)

            print("Taking screenshot...")
            page.screenshot(path="weaver_verification.png")
            print("Screenshot saved to weaver_verification.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="weaver_error.png")

        browser.close()

if __name__ == "__main__":
    verify_weaver()
