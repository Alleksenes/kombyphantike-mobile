from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Mobile viewport
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        page = context.new_page()

        # --- Verify History Screen ---
        print("Navigating to home for History check...")
        page.goto("http://localhost:8081")

        print("Waiting for 'The Weaver'...")
        page.get_by_text("The Weaver").first.wait_for()

        print("Clicking Archives...")
        # Now we are on Tabs index. Archives should be visible.
        archives_tab = page.get_by_text("Archives")
        archives_tab.click()

        print("Waiting for History Screen...")
        page.get_by_text("Archived Scrolls").first.wait_for()

        print("Taking screenshot of History Screen...")
        page.screenshot(path="/home/jules/verification/history_fixed.png")


        # --- Verify Paradigm Grid ---
        print("Navigating to home for Paradigm check...")
        page.goto("http://localhost:8081")

        print("Filling theme...")
        theme_input = page.get_by_label("Theme")
        if not theme_input.is_visible():
             theme_input = page.get_by_placeholder("e.g. Ancient Rome, Quantum Physics")
        theme_input.fill("Paradigm Test")

        print("Clicking Weave Curriculum...")
        page.get_by_text("Weave Curriculum").click()

        print("Waiting for Results...")
        # Wait for "Λέγω" or any greek word.
        # The mock data has "Λέγω".
        lego_word = page.get_by_text("Λέγω").first
        lego_word.wait_for(timeout=10000)

        print("Clicking word to open Inspector...")
        lego_word.click()

        # Wait for Inspector. It has tabs "Grammar", "Context", "Family".
        print("Waiting for Family tab...")
        family_tab = page.get_by_text("Family").first
        family_tab.wait_for()

        print("Clicking Family tab...")
        family_tab.click()

        # Wait for Paradigm Grid. Look for "Verb Paradigm" or "Singular".
        print("Waiting for Paradigm Grid...")
        page.get_by_text("Verb Paradigm").first.wait_for()

        print("Taking screenshot of Paradigm...")
        page.screenshot(path="/home/jules/verification/paradigm.png")

        browser.close()

if __name__ == "__main__":
    run()
