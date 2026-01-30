import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000); // Wait for content to load
  await page.screenshot({
    path: '/tmp/hint-node-verification.jpg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });
  await browser.close();
  console.log('Screenshot saved to /tmp/hint-node-verification.jpg');
})();
