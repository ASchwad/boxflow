import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000); // Wait for content to load

  // Take a clip of the hint node area
  await page.screenshot({
    path: '/tmp/hint-node-close-up.jpg',
    type: 'jpeg',
    quality: 90,
    clip: {
      x: 650,
      y: 350,
      width: 600,
      height: 400
    }
  });

  await browser.close();
  console.log('Screenshot saved to /tmp/hint-node-close-up.jpg');
})();
