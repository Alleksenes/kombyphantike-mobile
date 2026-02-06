from playwright.sync_api import Page, expect, sync_playwright
import time

def test_weave_mock(page: Page):
    # 1. Go to app
    print("Navigating to app...")
    # Try 8081
    page.goto("http://localhost:8081", timeout=60000)

    # Wait for loading
    page.wait_for_timeout(10000)

    # 2. Click "Weave Curriculum"
    print("Clicking Weave Curriculum...")
    weave_btn = page.get_by_role("button", name="Weave Curriculum")
    if not weave_btn.is_visible():
        print("Button not found via role, trying text...")
        weave_btn = page.get_by_text("Weave Curriculum")

    expect(weave_btn).to_be_visible(timeout=30000)
    weave_btn.click(force=True)

    # 3. Wait for navigation to Results
    print("Waiting for results...")
    # Should see "The Scroll"
    expect(page.get_by_text("The Scroll")).to_be_visible(timeout=30000)

    # 4. Click a word to open Inspector
    print("Clicking a word (Λέγω)...")
    # Using text exact match might be tricky with spans, try 'Λέγω'
    word = page.get_by_text("Λέγω").first
    expect(word).to_be_visible()
    word.click(force=True)

    # 5. Wait for Inspector Sheet
    print("Waiting for Inspector...")
    # Look for "Morphology" which is in the Inspector
    expect(page.get_by_text("Morphology")).to_be_visible(timeout=5000)

    # 6. Screenshot Grammar
    print("Taking screenshot (grammar)...")
    page.screenshot(path="verification/verification.png")

    # 7. Click Family Tab
    print("Clicking Family tab...")
    family_tab = page.get_by_text("FAMILY")
    family_tab.click(force=True)

    # Wait for ParadigmGrid
    # It has "Verb Paradigm" title
    expect(page.get_by_text("Verb Paradigm")).to_be_visible()

    # Screenshot Family
    print("Taking screenshot (family)...")
    page.screenshot(path="verification/verification_family.png")

    print("Done.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_weave_mock(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
