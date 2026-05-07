const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}\nSTACK: ${err.stack}`));
  page.on('console', msg => {
    console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  const filePath = path.resolve(__dirname, '../../zprime/index.html');
  const url = `file://${filePath}`;
  
  await page.goto(url);
  await page.waitForTimeout(3000); // Give it more time

  await browser.close();
})();
