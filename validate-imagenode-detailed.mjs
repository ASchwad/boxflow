import { chromium } from 'playwright';

async function validateImageNode() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== IMAGE NODE VALIDATION ===\n');

    // Find the image node
    const imageNode = await page.locator('.react-flow__node-image').first();

    if (!(await imageNode.isVisible())) {
      console.log('FAIL: Image node is not visible');
      return;
    }
    console.log('PASS: Image node is visible on canvas');

    // Check for the actual image element
    const img = imageNode.locator('img');
    if (!(await img.isVisible())) {
      console.log('FAIL: Image element not found');
    } else {
      console.log('PASS: Image element is present');

      // Get image dimensions
      const imgBox = await img.boundingBox();
      console.log(`  - Image rendered width: ${imgBox?.width}px`);
      console.log(`  - Image rendered height: ${imgBox?.height}px`);

      // Get image src
      const src = await img.getAttribute('src');
      console.log(`  - Image src: ${src}`);
    }

    // Check for white background and border
    const nodeDiv = imageNode.locator('> div').first();
    const bgClass = await nodeDiv.getAttribute('class');
    console.log(`\nNode container classes: ${bgClass}`);

    if (bgClass?.includes('bg-white')) {
      console.log('PASS: Node has white background');
    } else {
      console.log('FAIL: Node does not have white background class');
    }

    if (bgClass?.includes('border')) {
      console.log('PASS: Node has border styling');
    } else {
      console.log('FAIL: Node does not have border class');
    }

    // Check for caption
    const caption = imageNode.locator('p');
    if (await caption.isVisible()) {
      const captionText = await caption.textContent();
      console.log(`\nPASS: Caption is visible`);
      console.log(`  - Caption text: "${captionText}"`);

      if (captionText?.includes('Terminal output showing test results')) {
        console.log('PASS: Caption text matches expected value');
      } else {
        console.log('FAIL: Caption text does not match expected value');
      }
    } else {
      console.log('\nFAIL: Caption is not visible');
    }

    // Check for connection handles
    const handles = await imageNode.locator('.react-flow__handle').all();
    console.log(`\nConnection handles found: ${handles.length}`);

    if (handles.length >= 4) {
      console.log('PASS: All 4 connection handles are present');
    } else {
      console.log('FAIL: Expected 4 connection handles, found ' + handles.length);
    }

    // Take screenshots
    await page.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/validation-full.jpg',
      type: 'jpeg',
      fullPage: true
    });

    await imageNode.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/validation-imagenode-detail.jpg',
      type: 'jpeg'
    });

    console.log('\nScreenshots saved successfully\n');

  } catch (error) {
    console.error('Error during validation:', error);
  } finally {
    await browser.close();
  }
}

validateImageNode();
