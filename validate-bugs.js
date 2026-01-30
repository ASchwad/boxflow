import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    console.log('Navigated to application');

    // Step 1: Initial state
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots/step-1-initial.jpeg',
      type: 'jpeg',
      fullPage: true
    });
    console.log('Step 1 screenshot captured');

    // Click Next to go to Step 2
    const nextButton = await page.locator('button:has-text("Next")');
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots/step-2.jpeg',
      type: 'jpeg',
      fullPage: true
    });
    console.log('Step 2 screenshot captured');

    // Click Next to go to Step 3
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots/step-3.jpeg',
      type: 'jpeg',
      fullPage: true
    });
    console.log('Step 3 screenshot captured');

    // Click Next to go to Step 4
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots/step-4-final.jpeg',
      type: 'jpeg',
      fullPage: true
    });
    console.log('Step 4 screenshot captured');

    // Wait a bit longer for image to load in Step 4
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/screenshots/step-4-after-delay.jpeg',
      type: 'jpeg',
      fullPage: true
    });
    console.log('Step 4 (after delay) screenshot captured');

  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await browser.close();
  }
})();
