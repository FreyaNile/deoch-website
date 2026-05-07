const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const filePath = path.resolve(__dirname, '../index.html');
  await page.goto(`file://${filePath}`);

  await page.evaluate(() => {
    localStorage.removeItem('deoch-test-sheet-v2');
    localStorage.removeItem('test-sheet-last-id');
  });

  await page.evaluate(() => {
    if (window.showFullSheet) {
      window.showFullSheet();
    }
  });

  await page.waitForSelector('#mobile-sheet-view', { state: 'visible', timeout: 5000 });

  await page.evaluate(() => {
    const name = document.getElementById('test-hud-name');
    const exp = document.getElementById('test-exp-input');
    const klass = document.getElementById('test-hud-class-text');
    if (name) name.textContent = 'Import Probe';
    if (klass) {
      klass.textContent = 'Wizard';
      klass.dataset.primaryClass = 'Wizard';
    }
    if (exp) exp.textContent = '1250';
  });

  await page.evaluate(() => window.TestSheet.saveCharacter());

  const exported = await page.evaluate(() => {
    window.TestSheet.exportCharacter();
    return document.getElementById('test-transfer-textarea')?.value || '';
  });

  if (!exported) {
    throw new Error('Export did not produce a character code.');
  }

  await page.evaluate(() => {
    window.TestSheet.newCharacter();
  });

  await page.evaluate((code) => {
    const textarea = document.getElementById('test-transfer-textarea');
    if (textarea) textarea.value = code;
  }, exported);

  await page.evaluate(() => window.TestSheet.importCharacter());

  const result = await page.evaluate(() => {
    const gallery = JSON.parse(localStorage.getItem('deoch-test-sheet-v2') || '[]');
    const lastId = localStorage.getItem('test-sheet-last-id');
    const active = gallery.find(c => c.id === lastId) || gallery[0];
    return {
      galleryCount: gallery.length,
      lastId,
      activeName: active?.name,
      activeClass: active?.primaryClass,
      activeExp: String(active?.exp ?? ''),
      hudName: document.getElementById('test-hud-name')?.textContent || '',
      hudClass: document.getElementById('test-hud-class-text')?.textContent || '',
      hudLevel: document.getElementById('test-hud-level')?.textContent || ''
    };
  });

  if (result.galleryCount !== 1) {
    throw new Error(`Expected 1 imported character, found ${result.galleryCount}.`);
  }
  if (result.activeName !== 'Import Probe') {
    throw new Error(`Expected imported name Import Probe, got ${result.activeName}.`);
  }
  if (result.activeClass !== 'Wizard') {
    throw new Error(`Expected imported class Wizard, got ${result.activeClass}.`);
  }
  if (result.activeExp !== '1250') {
    throw new Error(`Expected imported EXP 1250, got ${result.activeExp}.`);
  }
  if (result.hudName !== 'Import Probe') {
    throw new Error(`Expected HUD name Import Probe, got ${result.hudName}.`);
  }

  console.log('Import flow OK:', JSON.stringify(result));
  await browser.close();
})();
