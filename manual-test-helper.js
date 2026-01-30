import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  console.log('\n=== Browser opened ===');
  console.log('Please perform manual testing in the browser window.');
  console.log('The browser will stay open for 10 minutes.');
  console.log('Press Ctrl+C in terminal to close when done.');
  console.log('\n=== Console Commands Available ===');
  console.log('You can use the browser DevTools console.');

  // Keep alive
  await page.waitForTimeout(600000); // 10 minutes

  await browser.close();
})();
