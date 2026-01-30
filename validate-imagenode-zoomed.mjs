import { chromium } from 'playwright';

async function validateImageNode() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find the image node and get its bounding box
    const imageNode = await page.locator('.react-flow__node-image').first();
    const box = await imageNode.boundingBox();

    if (!box) {
      console.log('Could not get bounding box');
      return;
    }

    // Take a screenshot with padding around the node
    const padding = 50;
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/imagenode-zoomed.jpg',
      type: 'jpeg',
      clip: {
        x: Math.max(0, box.x - padding),
        y: Math.max(0, box.y - padding),
        width: box.width + (padding * 2),
        height: box.height + (padding * 2),
      }
    });

    console.log('Zoomed screenshot saved');
    console.log(`Node position: x=${box.x}, y=${box.y}`);
    console.log(`Node size: width=${box.width}, height=${box.height}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

validateImageNode();
