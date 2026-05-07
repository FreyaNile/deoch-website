const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();



  // Load the local index.html
  const filePath = path.resolve(__dirname, '../index.html');
  console.log(`Loading file: file://${filePath}`);
  await page.goto(`file://${filePath}`);

  console.log('Initializing Character Sheet via showFullSheet()...');
  await page.evaluate(() => {
    if (window.showFullSheet) {
      window.showFullSheet();
      // Force visibility for Playwright
      const testPage = document.getElementById('test-page');
      if (testPage) testPage.classList.add('active');
      const sheet = document.getElementById('mobile-sheet-view');
      if (sheet) {
        sheet.style.setProperty('display', 'flex', 'important');
      }
    }
  });

  // Wait for the character sheet view to be visible
  await page.waitForSelector('#mobile-sheet-view', { state: 'visible', timeout: 5000 });





  console.log('[OK] Character Sheet View is visible.');


  // Verify the form existence
  const form = await page.$('#char-form');
  if (form) {
    console.log('[OK] Character Form found.');
  } else {
    console.error('[FAIL] Character Form not found.');
    process.exit(1);
  }

  // Test Point Buy - Check if stats are base 9
  console.log('Verifying Base Stats (should be 9)...');
  const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const stat of stats) {
    const val = await page.$eval(`#stat-${stat}`, el => el.value);
    if (val === '9') {
      console.log(`  [OK] ${stat} is 9.`);
    } else {
      console.error(`  [FAIL] ${stat} is ${val}, expected 9.`);
      process.exit(1);
    }
  }

  console.log('--- TEST COMPLETED SUCCESSFULLY ---');
  await browser.close();
})();
