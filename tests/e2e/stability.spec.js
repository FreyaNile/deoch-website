import { test, expect } from '@playwright/test';

test.describe('DEOCH Stability Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/');
    await page.waitForSelector('#test-page');
    
    // Clear storage for a clean state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Character Creation & Leveling Flow', async ({ page }) => {
    // 1. Create New Character
    await page.click('#test-new-btn');
    const name = await page.textContent('#test-hud-name');
    expect(name).toBe('Unknown Hero');

    // 2. Add EXP (Exp 250 -> Level 1)
    // Deoch formula: level = Math.floor((-1 + Math.sqrt(1 + exp / 62.5)) / 2)
    // For level 1, exp should be >= 250.
    await page.fill('#test-add-exp-input', '250');
    await page.keyboard.press('Enter');
    
    const level = await page.textContent('#test-hud-level');
    expect(level).toBe('1');

    // 3. Verify Stat Points (Level 0 -> 1 should grant 2 points)
    const points = await page.textContent('#test-available-points');
    expect(points).toBe('2');
  });

  test('Theme Persistence', async ({ page }) => {
    // Select a theme
    await page.selectOption('#theme-select', 'crimson');
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('crimson');

    // Reload and verify
    await page.reload();
    const persistedTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(persistedTheme).toBe('crimson');
  });

  test('Import/Export Integrity', async ({ page }) => {
    await page.click('#test-new-btn');
    await page.fill('#test-exp-input', '500');
    
    // Copy code
    await page.click('#test-copy-btn');
    const code = await page.evaluate(() => navigator.clipboard.readText());
    expect(code).toContain('"exp":500');

    // Reset and Import
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    await page.click('#test-import-btn-popup');
    await page.fill('#test-transfer-textarea', code);
    await page.click('#test-import-btn');

    const exp = await page.textContent('#test-exp-input');
    expect(exp).toBe('500');
  });
});
