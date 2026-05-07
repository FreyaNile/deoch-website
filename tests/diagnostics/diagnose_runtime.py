import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Listen for console errors
        errors = []
        page.on("pageerror", lambda e: errors.append(f"PAGE ERROR: {e.message}"))
        page.on("console", lambda msg: errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type == "error" else None)
        
        url = "http://127.0.0.1:3000/zprime/index.html?serverWindowId=a5adbc04-c614-4c6e-8000-335fd07529d6#test-page"
        
        print(f"Loading {url}...")
        await page.goto(url)
        await page.wait_for_timeout(2000) # Wait for init
        
        # Check if TestSheet is defined
        ts_defined = await page.evaluate("typeof window.TestSheet !== 'undefined'")
        print(f"TestSheet defined: {ts_defined}")
        
        # Try a few actions
        print("Testing buttons...")
        buttons = ["test-save-btn", "test-new-btn", "test-gallery-btn"]
        for btn_id in buttons:
            exists = await page.evaluate(f"document.getElementById('{btn_id}') !== null")
            print(f"Button {btn_id} exists: {exists}")
            if exists:
                try:
                    await page.click(f"#{btn_id}")
                except Exception as e:
                    print(f"Click failed for {btn_id}: {e}")
        
        if errors:
            print("\nERRORS FOUND:")
            for err in errors:
                print(err)
        else:
            print("\nNo console errors detected.")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
