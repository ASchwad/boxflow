import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Test 1: New Flow with 3 Connected Nodes');

  // Step 1-3: Navigate and click New
  console.log('Step 1-3: Navigate to app and start new flow');
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Click New button
  await page.click('button:has-text("New")');
  await page.waitForTimeout(500);

  // Check if confirmation dialog appears and accept it
  const confirmButton = page.locator('button:has-text("Confirm")');
  if (await confirmButton.isVisible().catch(() => false)) {
    await confirmButton.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: path.join(screenshotDir, '01-empty-canvas.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 01-empty-canvas.jpg');

  // Step 4-5: Add 3 Process Step nodes
  console.log('Step 4-5: Adding 3 Process Step nodes');

  // Get canvas element
  const canvas = page.locator('.react-flow__pane');
  const bbox = await canvas.boundingBox();

  // Add first node (top)
  const x1 = bbox.x + bbox.width / 2;
  const y1 = bbox.y + 200;
  await page.mouse.click(x1, y1, { button: 'right' });
  await page.waitForTimeout(300);
  await page.click('text="Process Step"');
  await page.waitForTimeout(500);

  // Add second node (middle)
  const x2 = bbox.x + bbox.width / 2;
  const y2 = bbox.y + bbox.height / 2;
  await page.mouse.click(x2, y2, { button: 'right' });
  await page.waitForTimeout(300);
  await page.click('text="Process Step"');
  await page.waitForTimeout(500);

  // Add third node (bottom)
  const x3 = bbox.x + bbox.width / 2;
  const y3 = bbox.y + bbox.height - 200;
  await page.mouse.click(x3, y3, { button: 'right' });
  await page.waitForTimeout(300);
  await page.click('text="Process Step"');
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(screenshotDir, '02-three-nodes-added.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 02-three-nodes-added.jpg');

  // Step 6-7: Connect the nodes
  console.log('Step 6-7: Connecting nodes');

  // Get all nodes
  const nodes = await page.locator('.react-flow__node').all();
  console.log(`Found ${nodes.length} nodes`);

  if (nodes.length >= 3) {
    // Connect node 1 to node 2
    const node1 = nodes[0];
    const node2 = nodes[1];
    const node3 = nodes[2];

    // Get the source handle of node 1 (bottom handle)
    const handle1 = node1.locator('.react-flow__handle-bottom');
    const handle1Box = await handle1.boundingBox();

    // Get the target handle of node 2 (top handle)
    const handle2Target = node2.locator('.react-flow__handle-top');
    const handle2TargetBox = await handle2Target.boundingBox();

    // Drag from node 1 bottom to node 2 top
    await page.mouse.move(handle1Box.x + handle1Box.width / 2, handle1Box.y + handle1Box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(handle2TargetBox.x + handle2TargetBox.width / 2, handle2TargetBox.y + handle2TargetBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Connect node 2 to node 3
    const handle2Source = node2.locator('.react-flow__handle-bottom');
    const handle2SourceBox = await handle2Source.boundingBox();

    const handle3Target = node3.locator('.react-flow__handle-top');
    const handle3TargetBox = await handle3Target.boundingBox();

    await page.mouse.move(handle2SourceBox.x + handle2SourceBox.width / 2, handle2SourceBox.y + handle2SourceBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(handle3TargetBox.x + handle3TargetBox.width / 2, handle3TargetBox.y + handle3TargetBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(500);
  }

  await page.screenshot({
    path: path.join(screenshotDir, '03-nodes-connected.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 03-nodes-connected.jpg');

  // Step 8-15: Enter presentation mode and navigate through steps
  console.log('Step 8-15: Presentation mode navigation');

  await page.click('button:has-text("Present")');
  await page.waitForTimeout(1000);

  // Get viewport info helper
  async function getViewportInfo() {
    return await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      if (viewport) {
        const transform = viewport.style.transform;
        return { transform };
      }
      return { transform: 'not found' };
    });
  }

  // Step 1
  let viewportInfo = await getViewportInfo();
  console.log('Step 1 viewport:', viewportInfo);
  await page.screenshot({
    path: path.join(screenshotDir, '04-presentation-step-1.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 04-presentation-step-1.jpg');

  // Step 2
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(800);
  viewportInfo = await getViewportInfo();
  console.log('Step 2 viewport:', viewportInfo);
  await page.screenshot({
    path: path.join(screenshotDir, '05-presentation-step-2.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 05-presentation-step-2.jpg');

  // Step 3
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(800);
  viewportInfo = await getViewportInfo();
  console.log('Step 3 viewport:', viewportInfo);
  await page.screenshot({
    path: path.join(screenshotDir, '06-presentation-step-3.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 06-presentation-step-3.jpg');

  // Step 4
  await page.click('button:has-text("Next")');
  await page.waitForTimeout(800);
  viewportInfo = await getViewportInfo();
  console.log('Step 4 viewport:', viewportInfo);
  await page.screenshot({
    path: path.join(screenshotDir, '07-presentation-step-4.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 07-presentation-step-4.jpg');

  // Step 16-18: Exit presentation and check step numbers
  console.log('Step 16-18: Check step numbers');

  // Exit presentation mode
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(screenshotDir, '08-exited-presentation.jpg'),
    type: 'jpeg',
    quality: 90
  });
  console.log('Screenshot: 08-exited-presentation.jpg');

  // Click on each node to see step numbers
  const allNodes = await page.locator('.react-flow__node').all();

  for (let i = 0; i < Math.min(allNodes.length, 3); i++) {
    console.log(`Checking node ${i + 1} properties`);
    await allNodes[i].dblclick();
    await page.waitForTimeout(500);

    // Get the "Reveal at Step" value
    const stepValue = await page.evaluate(() => {
      const input = document.querySelector('input[type="number"]');
      return input ? input.value : 'not found';
    });
    console.log(`Node ${i + 1} - Reveal at Step: ${stepValue}`);

    await page.screenshot({
      path: path.join(screenshotDir, `09-node-${i + 1}-properties.jpg`),
      type: 'jpeg',
      quality: 90
    });
    console.log(`Screenshot: 09-node-${i + 1}-properties.jpg`);

    // Close properties panel by clicking elsewhere
    await page.mouse.click(100, 100);
    await page.waitForTimeout(300);
  }

  // Step 19-20: Re-enter presentation mode and analyze viewport
  console.log('Step 19-20: Viewport behavior analysis');

  await page.click('button:has-text("Present")');
  await page.waitForTimeout(1000);

  const viewportChanges = [];

  for (let step = 1; step <= 4; step++) {
    const info = await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      const visibleNodes = Array.from(document.querySelectorAll('.react-flow__node')).filter(node => {
        return window.getComputedStyle(node).opacity !== '0';
      }).length;

      if (viewport) {
        const transform = viewport.style.transform;
        const match = transform.match(/translate\(([^,]+),([^)]+)\) scale\(([^)]+)\)/);
        if (match) {
          return {
            translateX: match[1],
            translateY: match[2],
            scale: match[3],
            visibleNodes,
            fullTransform: transform
          };
        }
      }
      return { error: 'viewport not found', visibleNodes };
    });

    viewportChanges.push({ step, ...info });
    console.log(`Step ${step} viewport analysis:`, info);

    if (step < 4) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(800);
    }
  }

  // Save viewport changes to a file
  fs.writeFileSync(
    path.join(screenshotDir, 'viewport-analysis.json'),
    JSON.stringify(viewportChanges, null, 2)
  );
  console.log('Saved viewport analysis to viewport-analysis.json');

  console.log('\n=== Test Complete ===');
  console.log('All screenshots saved to:', screenshotDir);

  await page.waitForTimeout(2000);
  await browser.close();
})();
