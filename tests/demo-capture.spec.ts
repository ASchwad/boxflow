import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Capture simple 1-2-3 demo', async ({ page }) => {
  const screenshotDir = path.join(__dirname, '..', 'screenshots', 'demo');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  await page.setViewportSize({ width: 1000, height: 650 });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Set up file chooser handler before clicking Import
  const jsonPath = path.join(__dirname, 'simple-flow.json');

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('button:has-text("Import")')
  ]);
  await fileChooser.setFiles(jsonPath);
  await page.waitForTimeout(1000);

  // Screenshot 1: Editor with simple 1-2-3 flow
  await page.screenshot({ path: path.join(screenshotDir, '01-editor.png') });
  console.log('Saved 01-editor.png');

  // Enter presentation mode
  await page.click('button:has-text("Present")');
  await page.waitForTimeout(800);

  // Screenshot 2: Step 1
  await page.screenshot({ path: path.join(screenshotDir, '02-step1.png') });
  console.log('Saved 02-step1.png');

  // Step 2
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotDir, '03-step2.png') });
  console.log('Saved 03-step2.png');

  // Step 3
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotDir, '04-step3.png') });
  console.log('Saved 04-step3.png');
});
