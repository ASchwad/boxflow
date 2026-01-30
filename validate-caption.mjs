import { chromium } from 'playwright';

async function validateCaption() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Get the image node
    const imageNode = await page.locator('.react-flow__node-image').first();

    // Get full HTML of the node
    const nodeHTML = await imageNode.innerHTML();
    console.log('=== IMAGE NODE HTML ===');
    console.log(nodeHTML);
    console.log('\n');

    // Look for caption specifically
    const captionDiv = imageNode.locator('div').filter({ hasText: 'Terminal output' });
    const captionExists = await captionDiv.count();
    console.log(`Caption div count: ${captionExists}`);

    if (captionExists > 0) {
      const captionBox = await captionDiv.first().boundingBox();
      console.log('Caption bounding box:', captionBox);

      const captionVisible = await captionDiv.first().isVisible();
      console.log('Caption is visible:', captionVisible);
    }

    // Get the complete node including all children
    const nodeBox = await imageNode.boundingBox();
    console.log('\nNode bounding box:', nodeBox);

    // Take a taller screenshot to ensure we capture the caption
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/imagenode-tall.jpg',
      type: 'jpeg',
      clip: {
        x: Math.max(0, nodeBox.x - 20),
        y: Math.max(0, nodeBox.y - 20),
        width: nodeBox.width + 40,
        height: nodeBox.height + 60, // Extra height for caption
      }
    });

    console.log('\nTall screenshot saved');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

validateCaption();
