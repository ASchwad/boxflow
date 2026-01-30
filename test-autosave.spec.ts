import { test, expect } from '@playwright/test';

test.describe('Auto-save to localStorage functionality', () => {
  const screenshotDir = '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:5173');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Initial view with save status indicator', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial view
    await page.screenshot({
      path: `${screenshotDir}/ '01-initial-view.jpg`,
      type: 'jpeg',
      fullPage: true
    });

    console.log('✓ Screenshot 1: Initial view captured');
  });

  test('2. Test auto-save on title change', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Find and edit the title
    const titleInput = page.locator('input[placeholder*="Untitled"], input[value*="Untitled"]').first();
    await titleInput.click();
    await titleInput.fill('Auto-Save Test');

    // Wait for debounce and observe save status
    await page.waitForTimeout(2500);

    // Take screenshot showing the save status
    await page.screenshot({
      path: `${screenshotDir}/ '02-autosave-test.jpg`,
      type: 'jpeg',
      fullPage: true
    });

    console.log('✓ Screenshot 2: Auto-save test captured');

    // Verify save status indicator shows "All changes saved" or similar
    const saveStatus = await page.locator('text=/saved|saving/i').first().textContent();
    console.log('Save status text:', saveStatus);
  });

  test('3. Test persistence after reload', async ({ page }) => {
    // First, set up the data
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('input[placeholder*="Untitled"], input[value*="Untitled"]').first();
    await titleInput.click();
    await titleInput.fill('Auto-Save Test');
    await page.waitForTimeout(2500);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot showing restored state
    await page.screenshot({
      path: `${screenshotDir}/ '03-persistence-test.jpg`,
      type: 'jpeg',
      fullPage: true
    });

    console.log('✓ Screenshot 3: Persistence test captured');

    // Verify the title persisted
    const restoredTitle = await titleInput.inputValue();
    console.log('Restored title:', restoredTitle);
    expect(restoredTitle).toBe('Auto-Save Test');
  });

  test('4. Test New Flow button', async ({ page }) => {
    // First, set up some data
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('input[placeholder*="Untitled"], input[value*="Untitled"]').first();
    await titleInput.click();
    await titleInput.fill('Auto-Save Test');
    await page.waitForTimeout(2500);

    // Click the New button
    const newButton = page.locator('button:has-text("New")').first();
    await newButton.click();

    // Wait for confirmation dialog
    await page.waitForTimeout(500);

    // Accept the confirmation (look for confirmation button)
    const confirmButton = page.locator('button:has-text("Continue"), button:has-text("Confirm"), button:has-text("Yes")').first();
    await confirmButton.click();

    await page.waitForTimeout(1000);

    // Take screenshot showing cleared state
    await page.screenshot({
      path: `${screenshotDir}/ '04-new-flow-test.jpg`,
      type: 'jpeg',
      fullPage: true
    });

    console.log('✓ Screenshot 4: New Flow test captured');

    // Verify canvas is cleared with "Untitled Flow" title
    const clearedTitle = await titleInput.inputValue();
    console.log('Title after New Flow:', clearedTitle);
    expect(clearedTitle).toContain('Untitled');
  });
});
