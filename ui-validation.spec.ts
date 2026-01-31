import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = './screenshots';

test.describe('UI Validation Workflow', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  });

  test('Complete UI validation workflow', async ({ page }) => {
    // Step 1: Navigate to application
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Step 2: Click "New" button to create fresh canvas
    const newButton = page.getByRole('button', { name: /new/i });
    await newButton.click();

    // Handle confirmation dialog if present
    const okButton = page.getByRole('button', { name: /ok/i });
    if (await okButton.isVisible().catch(() => false)) {
      await okButton.click();
    }

    await page.waitForTimeout(500);

    // Step 3: Take screenshot of empty canvas
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-empty-canvas.jpeg'),
      type: 'jpeg',
      fullPage: true
    });
    console.log('Screenshot 1: Empty canvas captured');

    // Step 4: Click "+" button on "Process Step" in node palette
    // The + button appears on hover, so we need to hover first
    // Target the first draggable div (Process Step is first in the list)
    const processStepCard = page.locator('div[draggable="true"]').first();

    // Hover to make the + button visible
    await processStepCard.hover();
    await page.waitForTimeout(500);

    // Find and click the + button by its title attribute
    const addButton = page.getByTitle('Add Process Step to canvas');
    await addButton.click();
    await page.waitForTimeout(500);

    // Step 5: Take screenshot showing node was added with step badge
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-node-added-with-badge.jpeg'),
      type: 'jpeg',
      fullPage: true
    });
    console.log('Screenshot 2: Node added with step badge');

    // Step 6: Click on the step badge to open quick step picker
    // Look for the circular badge on the newly added node
    const stepBadge = page.locator('.step-badge').last();
    await stepBadge.click();
    await page.waitForTimeout(300);

    // Step 7: Take screenshot showing step picker popover
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-step-picker-popover.jpeg'),
      type: 'jpeg',
      fullPage: true
    });
    console.log('Screenshot 3: Step picker popover opened');

    // Step 8: Change step to 3 using increment button
    // The increment button contains ChevronUp icon
    // We need to click twice to go from 1 to 3
    const incrementButton = page.locator('button').filter({
      has: page.locator('svg').first()
    }).last(); // ChevronUp button

    await incrementButton.click();
    await page.waitForTimeout(200);
    await incrementButton.click();
    await page.waitForTimeout(200);

    // Step 9: Take screenshot showing badge updated to 3
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-badge-updated-to-3.jpeg'),
      type: 'jpeg',
      fullPage: true
    });
    console.log('Screenshot 4: Badge updated to step 3');

    // Close popover by clicking outside or pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Step 10: Enter presentation mode by clicking "Present" button
    const presentButton = page.getByRole('button', { name: /present/i });
    await presentButton.click();
    await page.waitForTimeout(500);

    // Step 11: Take screenshot showing presentation mode
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-presentation-mode.jpeg'),
      type: 'jpeg',
      fullPage: true
    });
    console.log('Screenshot 5: Presentation mode (badge should be hidden)');

    console.log('\n=== All screenshots captured successfully ===');
    console.log('Screenshots saved in:', SCREENSHOTS_DIR);
  });
});
