import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);

  // Screenshot before hover
  await page.screenshot({
    path: '/tmp/hint-node-before-hover.jpg',
    type: 'jpeg',
    quality: 90,
    clip: { x: 650, y: 350, width: 600, height: 400 }
  });

  // Try to hover over the hint node
  // The hint node appears to be around x: 950, y: 540 based on the full screenshot
  await page.mouse.move(950, 540);
  await page.waitForTimeout(500);

  // Screenshot after hover
  await page.screenshot({
    path: '/tmp/hint-node-after-hover.jpg',
    type: 'jpeg',
    quality: 90,
    clip: { x: 650, y: 350, width: 600, height: 400 }
  });

  await browser.close();
  console.log('Hover test screenshots saved');
})();
