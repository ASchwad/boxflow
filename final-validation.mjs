import { chromium } from 'playwright';

async function finalValidation() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Scroll to ensure the image node is fully visible
    await page.evaluate(() => {
      const imageNode = document.querySelector('.react-flow__node-image');
      if (imageNode) {
        imageNode.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await page.waitForTimeout(500);

    // Get the image node outer wrapper
    const imageNodeWrapper = await page.locator('.react-flow__node-image').first();
    const box = await imageNodeWrapper.boundingBox();

    console.log('Image node bounding box:', box);

    // Take a regional screenshot with extra padding
    const padding = 100;
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/final-imagenode.jpg',
      type: 'jpeg',
      clip: {
        x: Math.max(0, box.x - padding),
        y: Math.max(0, box.y - padding),
        width: box.width + (padding * 2),
        height: box.height + (padding * 2),
      }
    });

    console.log('Final screenshot saved');

    // Also take a full page screenshot for context
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/final-fullpage.jpg',
      type: 'jpeg',
      fullPage: false,
    });

    console.log('Full page screenshot saved');

    // Get detailed measurements
    const img = await page.locator('.react-flow__node-image img').first();
    const imgBox = await img.boundingBox();
    console.log('Image element dimensions:', imgBox);

    const captionDiv = await page.locator('.react-flow__node-image div.px-3').first();
    const captionBox = await captionDiv.boundingBox();
    console.log('Caption div dimensions:', captionBox);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

finalValidation();
