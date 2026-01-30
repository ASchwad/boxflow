import { chromium } from 'playwright';

async function validateUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Wait a bit for React Flow to render
    await page.waitForTimeout(2000);

    // Take full page screenshot
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/ui-validation-full.jpg',
      type: 'jpeg',
      fullPage: true
    });

    // Find the image node and take a focused screenshot
    const imageNode = await page.locator('[data-id="img-1"]').first();
    if (await imageNode.isVisible()) {
      await imageNode.screenshot({
        path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/ui-validation-imagenode.jpg',
        type: 'jpeg'
      });
      console.log('Image node screenshot saved');
    } else {
      console.log('Image node not found with data-id="img-1"');
    }

    // Check for image node by class
    const imageNodeByClass = await page.locator('.react-flow__node-image').first();
    if (await imageNodeByClass.isVisible()) {
      await imageNodeByClass.screenshot({
        path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/ui-validation-imagenode-class.jpg',
        type: 'jpeg'
      });
      console.log('Image node (by class) screenshot saved');
    } else {
      console.log('Image node not found with class react-flow__node-image');
    }

    console.log('Screenshots saved successfully');
  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await browser.close();
  }
}

validateUI();
