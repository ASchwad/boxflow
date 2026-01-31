import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * User Scenario Test - Mimics the exact user flow that's buggy
 *
 * Bug report:
 * - At step 2, an edge shows to a node that's NOT visible
 * - At step 3, node 3 is not showing
 */

test.describe('User Scenario - Edge Visibility Bug', () => {
  test('Create flow with mixed node types and verify presentation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Set up dialog handler for clearing canvas
    page.on('dialog', async dialog => {
      console.log('Dialog:', dialog.message());
      await dialog.accept();
    });

    // Clear any existing data
    await page.click('button:has-text("New")');
    await page.waitForTimeout(1000);

    // Get canvas for positioning
    const canvasBounds = await page.locator('.react-flow').boundingBox();
    if (!canvasBounds) throw new Error('Canvas not found');

    const startX = canvasBounds.x + 300;
    const startY = canvasBounds.y + 100;

    // Create 3 nodes at different positions
    // Node 1: Process Step at position 1
    await page.mouse.click(startX, startY, { button: 'right' });
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: 'Process Step' }).click();
    await page.waitForTimeout(500);

    // Node 2: Hint at position 2 (to the right)
    await page.mouse.click(startX + 400, startY, { button: 'right' });
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: 'Hint' }).click();
    await page.waitForTimeout(500);

    // Node 3: Process Step at position 3 (below node 1)
    await page.mouse.click(startX, startY + 200, { button: 'right' });
    await page.waitForTimeout(200);
    await page.getByRole('menuitem', { name: 'Process Step' }).click();
    await page.waitForTimeout(500);

    // Verify we have 3 nodes
    const nodeCount = await page.locator('.react-flow__node').count();
    console.log(`Created ${nodeCount} nodes`);
    expect(nodeCount).toBe(3);

    // Check what step each node is assigned to
    const nodeSteps = await page.evaluate(() => {
      // @ts-expect-error - accessing React Flow internals
      const nodes = document.querySelectorAll('.react-flow__node');
      return Array.from(nodes).map(n => {
        const badge = n.querySelector('[class*="badge"]') || n.querySelector('span');
        return {
          id: n.getAttribute('data-id'),
          badgeText: badge?.textContent || 'no badge'
        };
      });
    });
    console.log('Node steps:', JSON.stringify(nodeSteps));

    // Connect node 1 to node 2 (process to hint)
    const nodes = page.locator('.react-flow__node');
    await connectNodes(page, nodes, 0, 1);
    await page.waitForTimeout(500);

    // Connect node 1 to node 3 (process to process below)
    await connectNodes(page, nodes, 0, 2);
    await page.waitForTimeout(500);

    // Verify edges
    const edgeCount = await page.locator('.react-flow__edge').count();
    console.log(`Created ${edgeCount} edges`);
    expect(edgeCount).toBe(2);

    // Take screenshot of editor mode
    await page.screenshot({ path: 'test-results/user-scenario-editor.png' });

    // Enter presentation mode
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Step 1
    await expect(page.locator('text=/Step 1 of/')).toBeVisible();
    let visibleNodes = await page.locator('.react-flow__node:visible').count();
    let visibleEdges = await page.locator('.react-flow__edge:visible').count();
    console.log(`Step 1: ${visibleNodes} nodes, ${visibleEdges} edges`);
    expect(visibleNodes).toBe(1);
    expect(visibleEdges).toBe(0);
    await page.screenshot({ path: 'test-results/user-scenario-step1.png' });

    // Step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=/Step 2 of/')).toBeVisible();

    // Count nodes and edges in DOM
    visibleNodes = await page.locator('.react-flow__node').count();
    visibleEdges = await page.locator('.react-flow__edge').count();
    console.log(`Step 2: ${visibleNodes} nodes, ${visibleEdges} edges`);

    await page.screenshot({ path: 'test-results/user-scenario-step2.png' });

    // At step 2, node 1 (step 1) and node 2 (step 2) should be visible
    // Edge from node 1 to node 2 should be visible
    // But edge from node 1 to node 3 should NOT be visible (node 3 is step 3)
    expect(visibleNodes).toBe(2);
    expect(visibleEdges).toBe(1); // Only the edge to the visible hint node

    // Step 3
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    await expect(page.locator('text=/Step 3 of/')).toBeVisible();
    visibleNodes = await page.locator('.react-flow__node:visible').count();
    visibleEdges = await page.locator('.react-flow__edge:visible').count();
    console.log(`Step 3: ${visibleNodes} nodes, ${visibleEdges} edges`);
    expect(visibleNodes).toBe(3); // All 3 nodes
    expect(visibleEdges).toBe(2); // Both edges
    await page.screenshot({ path: 'test-results/user-scenario-step3.png' });
  });
});

async function connectNodes(page: Page, nodes: Locator, fromIndex: number, toIndex: number) {
  const fromNode = nodes.nth(fromIndex);
  const toNode = nodes.nth(toIndex);

  const fromBox = await fromNode.boundingBox();
  const toBox = await toNode.boundingBox();

  if (fromBox && toBox) {
    // Drag from bottom of source to top of target
    const startX = fromBox.x + fromBox.width / 2;
    const startY = fromBox.y + fromBox.height;
    const endX = toBox.x + toBox.width / 2;
    const endY = toBox.y;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
  }
}
