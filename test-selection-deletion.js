import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  console.log('2. Taking screenshot of initial view...');
  await page.screenshot({ path: '/tmp/01-initial-view.jpg', type: 'jpeg', quality: 90 });

  // Wait for React Flow to be ready
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(1000);

  console.log('3. Testing single node selection...');
  // Find and click on a node
  const firstNode = await page.locator('.react-flow__node').first();
  await firstNode.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/02-node-selected.jpg', type: 'jpeg', quality: 90 });

  console.log('4. Testing node deletion with Delete key...');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/03-node-deleted.jpg', type: 'jpeg', quality: 90 });

  console.log('5. Reloading page for edge selection test...');
  await page.reload();
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(1000);

  console.log('6. Testing edge selection...');
  // Find and click on an edge
  const firstEdge = await page.locator('.react-flow__edge-path').first();
  await firstEdge.click({ force: true });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/04-edge-selected.jpg', type: 'jpeg', quality: 90 });

  console.log('7. Testing edge deletion...');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/05-edge-deleted.jpg', type: 'jpeg', quality: 90 });

  console.log('8. Reloading page for multi-selection test...');
  await page.reload();
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(1000);

  console.log('9. Testing multi-selection with Shift+Click...');
  const nodes = await page.locator('.react-flow__node').all();
  if (nodes.length >= 2) {
    await nodes[0].click();
    await page.waitForTimeout(300);
    await page.keyboard.down('Shift');
    await nodes[1].click();
    await page.keyboard.up('Shift');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/06-multi-select.jpg', type: 'jpeg', quality: 90 });

    console.log('10. Testing multi-delete...');
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/07-multi-deleted.jpg', type: 'jpeg', quality: 90 });
  } else {
    console.log('Not enough nodes for multi-selection test');
  }

  console.log('11. Reloading page for drag selection test...');
  await page.reload();
  await page.waitForSelector('.react-flow');
  await page.waitForTimeout(1000);

  console.log('12. Testing drag box selection...');
  const reactFlow = await page.locator('.react-flow').first();
  const box = await reactFlow.boundingBox();
  if (box) {
    // Drag from top-left to create a selection box
    await page.mouse.move(box.x + 50, box.y + 50);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.up();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/08-drag-box-selection.jpg', type: 'jpeg', quality: 90 });

    console.log('13. Testing Backspace key for deletion...');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/09-backspace-deleted.jpg', type: 'jpeg', quality: 90 });
  }

  console.log('\nAll tests completed! Screenshots saved to /tmp/');
  console.log('Review the screenshots to validate the functionality.');

  await browser.close();
}

runTests().catch(console.error);
