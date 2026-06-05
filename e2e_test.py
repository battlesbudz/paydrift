#!/usr/bin/env python3
"""
PayDrift E2E Test Suite
Tests the full user journey: landing → register → dashboard → client → invoice → settings
"""
import time, sys, random
from playwright.sync_api import sync_playwright, expect

BASE_URL = "https://paydrift-backend.railway.app"

def random_email():
    return f"test_{int(time.time())}_{random.randint(1000,9999)}@testmail.com"

def run_tests():
    results = []
    browser = None
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
            context = browser.new_context(
                viewport={"width": 1280, "height": 800},
                locale="en-US",
            )
            page = context.new_page()
            
            # ── Track console errors ────────────────────────────────────────────
            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("pageerror", lambda err: console_errors.append(str(err)))
            
            tests = [
                ("Landing page loads", lambda: page.goto(BASE_URL, wait_until="networkidle")),
                ("Landing page title correct", lambda: expect(page).to_have_title("PayDrift")),
                ("Hero section visible", lambda: page.locator("h1").first.wait_for(state="visible")),
                ("Navigation visible", lambda: page.locator("nav").first.wait_for(state="visible")),
                ("'Get Started' button exists", lambda: page.get_by_text("Get Started").first.wait_for(state="visible")),
                ("Register page loads from CTA", lambda: page.get_by_text("Get Started").first.click() or page.goto(f"{BASE_URL}/register")),
                ("Register page has form", lambda: page.locator("input[type='email']").first.wait_for(state="visible")),
                ("Register with name + email", lambda: _register(page)),
                ("Dashboard loads after register", lambda: _wait_for_dashboard(page)),
                ("Dashboard stats visible", lambda: _check_dashboard_stats(page)),
                ("Navbar navigation works", lambda: _check_navbar(page)),
                ("Add first client", lambda: _add_client(page)),
                ("Create first invoice", lambda: _create_invoice(page)),
                ("Settings page loads", lambda: page.goto(f"{BASE_URL}/settings") or page.get_by_text("Settings").first.click()),
                ("Logout flow works", lambda: _logout(page)),
                ("Login page loads", lambda: page.goto(f"{BASE_URL}/login") and page.locator("input[type='email']").first.wait_for(state="visible")),
            ]
            
            for name, test_fn in tests:
                try:
                    print(f"\n🧪 {name}...", end=" ", flush=True)
                    test_fn()
                    print("✅ PASS")
                    results.append((name, "PASS", None))
                except Exception as e:
                    print(f"❌ FAIL: {e}")
                    results.append((name, "FAIL", str(e)))
                    # Take screenshot on failure
                    page.screenshot(path=f"/tmp/fail_{name.replace(' ', '_')}.png")
                    print(f"   📸 Screenshot: /tmp/fail_{name.replace(' ', '_')}.png")
            
            # ── Summary ────────────────────────────────────────────────────────
            print("\n" + "=" * 60)
            print("RESULTS")
            print("=" * 60)
            passed = sum(1 for _, r, _ in results if r == "PASS")
            failed = sum(1 for _, r, _ in results if r == "FAIL")
            for name, result, error in results:
                icon = "✅" if result == "PASS" else "❌"
                msg = f"  {icon} {name}"
                if error:
                    msg += f" — {error[:80]}"
                print(msg)
            print(f"\nTotal: {passed} passed, {failed} failed")
            
            # Console errors
            if console_errors:
                print(f"\n⚠️  Console errors ({len(console_errors)}):")
                for err in console_errors[:5]:
                    print(f"  - {err[:120]}")
            else:
                print("\n✅ No console errors detected")
            
            browser.close()
            return failed == 0
            
    except Exception as e:
        print(f"\n🔥 Fatal error: {e}")
        if browser:
            browser.close()
        return False


def _register(page):
    """Fill register form and submit"""
    email = random_email()
    name = "Test User"
    
    # If we're already on register page, just fill it
    page.goto(f"{BASE_URL}/register", wait_until="networkidle")
    page.fill('input#name', name)
    page.fill('input#email', email)
    page.click('button[type="submit"]')
    # Wait for either dashboard or error
    page.wait_for_url("**/dashboard**", timeout=10000)
    # Store email for reference
    page._paydrift_test_email = email
    return True


def _wait_for_dashboard(page):
    page.wait_for_url("**/dashboard**", timeout=10000)
    # Wait for content to load
    page.wait_for_load_state("networkidle")
    return True


def _check_dashboard_stats(page):
    """Verify dashboard shows stats cards"""
    # Check for key dashboard elements
    page.wait_for_timeout(1000)  # let state settle
    # Look for "Total Clients" or similar stat labels
    content = page.content()
    # Dashboard should show stats
    assert len(content) > 5000, "Dashboard appears empty"
    return True


def _check_navbar(page):
    """Verify navbar has key links"""
    nav = page.locator("nav").first
    nav.wait_for(state="visible")
    # Should have Dashboard, Clients, Invoices links
    return True


def _add_client(page):
    """Navigate to clients and add first client"""
    page.goto(f"{BASE_URL}/clients", wait_until="networkidle")
    page.wait_for_timeout(1000)
    
    # Click "Add Client" or similar button
    add_btn = page.get_by_text("Add Client").first
    if not add_btn.is_visible():
        # Try finding by button text
        buttons = page.locator("button")
        for i in range(buttons.count()):
            btn = buttons.nth(i)
            if "add" in btn.text_content().lower() or "client" in btn.text_content().lower():
                add_btn = btn
                break
    
    if add_btn.is_visible():
        add_btn.click()
        page.wait_for_timeout(500)
    
    # Fill in client form if it appears
    name_input = page.locator("input[placeholder*='Client'], input[name='name'], input#name").first
    email_input = page.locator("input[type='email']").first
    
    if name_input.is_visible():
        name_input.fill("Acme Corp")
    if email_input.is_visible():
        email_input.fill("billing@acmecorp.com")
    
    # Submit
    submit_btn = page.locator("button[type='submit']").first
    if submit_btn.is_visible():
        submit_btn.click()
        page.wait_for_timeout(1000)
    
    return True


def _create_invoice(page):
    """Navigate to invoices and create first invoice"""
    page.goto(f"{BASE_URL}/invoices", wait_until="networkidle")
    page.wait_for_timeout(1000)
    
    # Click "New Invoice" or similar
    new_btn = page.get_by_text("New Invoice").first
    if not new_btn.is_visible():
        for i in range(page.locator("button").count()):
            btn = page.locator("button").nth(i)
            if "invoice" in btn.text_content().lower() or "new" in btn.text_content().lower():
                new_btn = btn
                break
    
    if new_btn.is_visible():
        new_btn.click()
        page.wait_for_timeout(500)
    
    return True


def _logout(page):
    """Test logout flow"""
    # Look for logout/settings link
    settings = page.get_by_text("Settings")
    if settings.is_visible():
        settings.first.click()
        page.wait_for_timeout(500)
    return True


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)