import { chromium } from 'playwright';

async function captureCompleteNode() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find all elements within the image node
    const imageNode = await page.locator('.react-flow__node-image').first();

    // Get the main container div (the one with bg-white)
    const container = imageNode.locator('> div').first();

    // Screenshot the container
    await container.screenshot({
      path: '/Users/aschwad/Documents/Dev/experiments/react-flow-visualization-stepper/imagenode-container.jpg',
      type: 'jpeg',
    });

    console.log('Container screenshot saved');

    // Get all text content
    const allText = await container.allTextContents();
    console.log('All text in container:', allText);

    // Check image
    const img = container.locator('img');
    const imgStyle = await img.getAttribute('style');
    console.log('Image style:', imgStyle);

    // Check caption
    const caption = container.locator('p');
    const captionText = await caption.textContent();
    const captionClass = await caption.getAttribute('class');
    console.log('Caption text:', captionText);
    console.log('Caption class:', captionClass);

    // Check caption parent div
    const captionParent = container.locator('div.px-3');
    const captionParentClass = await captionParent.getAttribute('class');
    console.log('Caption parent class:', captionParentClass);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

captureCompleteNode();
