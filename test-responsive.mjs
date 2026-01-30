import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test desktop view (1920x1080)
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: '/tmp/hint-node-desktop.jpg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  // Test tablet view (768x1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: '/tmp/hint-node-tablet.jpg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  // Test mobile view (375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: '/tmp/hint-node-mobile.jpg',
    type: 'jpeg',
    quality: 90,
    fullPage: true
  });

  await browser.close();
  console.log('Responsive test screenshots saved');
})();
