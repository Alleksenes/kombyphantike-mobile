from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Browser Log: {msg.text}"))

        # URL with a single node graph
        url = "http://localhost:8081/constellation?graph=%7B%22nodes%22%3A%5B%7B%22id%22%3A%221%22%2C%22label%22%3A%22Debug%20Node%22%2C%22type%22%3A%22theme%22%2C%22status%22%3A%22active%22%7D%5D%2C%22links%22%3A%5B%5D%7D"

        print(f"Navigating to {url}")
        page.goto(url)

        print("Waiting for page load...")
        time.sleep(5)

        page.screenshot(path="verification_screenshot.png")
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
