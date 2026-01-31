import { test, expect, type Page } from '@playwright/test';

/**
 * Presentation Mode Acceptance Tests
 *
 * AT-001: Node visibility at each step
 * AT-002: Viewport stability across steps
 * AT-005: Edge visibility - edges only when BOTH nodes visible
 */

test.describe('Presentation Mode - Node & Edge Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Clear canvas and create fresh test flow
    await clearCanvas(page);
    await createThreeConnectedNodes(page);
  });

  test('AT-001a: Step 1 shows only node 1 with ZERO edges', async ({ page }) => {
    // Enter presentation mode
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Verify step counter shows "Step 1 of ..."
    await expect(page.locator('text=/Step 1 of \\d+/')).toBeVisible();

    // Count visible nodes - should be exactly 1
    const visibleNodes = await page.locator('.react-flow__node:visible').count();
    expect(visibleNodes).toBe(1);

    // CRITICAL: Count visible edges - should be ZERO at step 1
    const visibleEdges = await page.locator('.react-flow__edge:visible').count();
    expect(visibleEdges).toBe(0);

    await page.screenshot({ path: 'test-results/step-1.png' });
  });

  test('AT-001b: Step 2 shows nodes 1 and 2 with 1 edge', async ({ page }) => {
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Advance to step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Verify step counter
    await expect(page.locator('text=/Step 2 of \\d+/')).toBeVisible();

    // Should have 2 nodes visible
    const visibleNodes = await page.locator('.react-flow__node:visible').count();
    expect(visibleNodes).toBe(2);

    // Should have at least 1 edge visible (connecting nodes 1 and 2)
    const visibleEdges = await page.locator('.react-flow__edge:visible').count();
    expect(visibleEdges).toBeGreaterThanOrEqual(1);

    await page.screenshot({ path: 'test-results/step-2.png' });
  });

  test('AT-001c: Step 3 shows all 3 nodes and 2 edges', async ({ page }) => {
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Advance to step 3
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Verify step counter
    await expect(page.locator('text=/Step 3 of \\d+/')).toBeVisible();

    // Should have all 3 nodes visible
    const visibleNodes = await page.locator('.react-flow__node:visible').count();
    expect(visibleNodes).toBeGreaterThanOrEqual(3);

    // Should have 2 edges visible
    const visibleEdges = await page.locator('.react-flow__edge:visible').count();
    expect(visibleEdges).toBeGreaterThanOrEqual(2);

    await page.screenshot({ path: 'test-results/step-3.png' });
  });
});

test.describe('AT-002: Viewport Stability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await clearCanvas(page);
    await createThreeConnectedNodes(page);
  });

  test('Viewport should remain stable when advancing steps', async ({ page }) => {
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Get viewport at step 1
    const viewportStep1 = await getViewportTransform(page);

    // Advance to step 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    const viewportStep2 = await getViewportTransform(page);

    // Advance to step 3
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    const viewportStep3 = await getViewportTransform(page);

    // Viewport should be the same (or very close) across all steps
    // Allow small tolerance for floating point
    expect(Math.abs(viewportStep1.x - viewportStep2.x)).toBeLessThan(5);
    expect(Math.abs(viewportStep1.y - viewportStep2.y)).toBeLessThan(5);
    expect(Math.abs(viewportStep1.zoom - viewportStep2.zoom)).toBeLessThan(0.1);

    expect(Math.abs(viewportStep2.x - viewportStep3.x)).toBeLessThan(5);
    expect(Math.abs(viewportStep2.y - viewportStep3.y)).toBeLessThan(5);
    expect(Math.abs(viewportStep2.zoom - viewportStep3.zoom)).toBeLessThan(0.1);
  });
});

test.describe('AT-005: Edge Visibility Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await clearCanvas(page);
    await createThreeConnectedNodes(page);
  });

  test('Edges should NEVER show when target node is hidden', async ({ page }) => {
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // At each step, verify all visible edges connect visible nodes
    for (let step = 1; step <= 3; step++) {
      const visibleNodeIds = await getVisibleNodeIds(page);
      const visibleEdgeConnections = await getVisibleEdgeConnections(page);

      console.log(`Step ${step}: Nodes=${visibleNodeIds.length}, Edges=${visibleEdgeConnections.length}`);

      // For every visible edge, both source and target must be visible
      for (const edge of visibleEdgeConnections) {
        expect(
          visibleNodeIds.includes(edge.source),
          `Edge source ${edge.source} should be visible at step ${step}`
        ).toBeTruthy();
        expect(
          visibleNodeIds.includes(edge.target),
          `Edge target ${edge.target} should be visible at step ${step}`
        ).toBeTruthy();
      }

      if (step < 3) {
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(300);
      }
    }
  });
});

test.describe('AT-004: Step Progress Dots Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await clearCanvas(page);
    await createThreeConnectedNodes(page);
  });

  test('Clicking step dots should jump to that step', async ({ page }) => {
    await page.click('button:has-text("Present")');
    await page.waitForTimeout(500);

    // Verify at step 1
    await expect(page.locator('text=/Step 1 of \\d+/')).toBeVisible();

    // Click on the step dots (they should be small rounded buttons)
    const stepDots = page.locator('button.rounded-full');
    const dotCount = await stepDots.count();
    expect(dotCount).toBeGreaterThanOrEqual(3);

    // Click the 3rd dot (index 2)
    await stepDots.nth(2).click();
    await page.waitForTimeout(300);

    // Should now be at step 3
    await expect(page.locator('text=/Step 3 of \\d+/')).toBeVisible();

    // Click the 1st dot to go back
    await stepDots.nth(0).click();
    await page.waitForTimeout(300);

    // Should be back at step 1
    await expect(page.locator('text=/Step 1 of \\d+/')).toBeVisible();
  });
});

// ============ Helper Functions ============

async function clearCanvas(page: Page): Promise<void> {
  // Set up dialog handler BEFORE clicking
  page.on('dialog', async dialog => {
    console.log('Dialog appeared:', dialog.message());
    await dialog.accept();
  });

  // Click New button
  const newButton = page.locator('button:has-text("New")');
  if (await newButton.isVisible()) {
    await newButton.click();
    // Wait for dialog to be handled and canvas to clear
    await page.waitForTimeout(1000);
  }

  // Verify canvas is cleared by checking for no nodes or waiting
  await page.waitForTimeout(500);
}

async function createThreeConnectedNodes(page: Page): Promise<void> {
  // Get the canvas bounds
  const canvasWrapper = page.locator('.react-flow');
  const canvasBounds = await canvasWrapper.boundingBox();

  if (!canvasBounds) {
    throw new Error('Could not find canvas');
  }

  // Calculate positions spread across the canvas
  const startX = canvasBounds.x + 300; // A bit off center
  const startY = canvasBounds.y + 100;

  // Add nodes at 3 different vertical positions via context menu
  const positions = [
    { x: startX, y: startY },
    { x: startX, y: startY + 200 },
    { x: startX, y: startY + 400 },
  ];

  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];

    // Right-click on canvas at position (page coordinates)
    await page.mouse.click(pos.x, pos.y, { button: 'right' });
    await page.waitForTimeout(300);

    // Click "Process Step" in context menu
    const menuItem = page.getByRole('menuitem', { name: 'Process Step' });
    if (await menuItem.isVisible()) {
      await menuItem.click();
      await page.waitForTimeout(500);
    } else {
      console.log(`Menu item not visible at position ${i}`);
    }
  }

  // Get the nodes
  const nodes = page.locator('.react-flow__node');
  const nodeCount = await nodes.count();
  console.log(`Created ${nodeCount} nodes`);
  expect(nodeCount).toBeGreaterThanOrEqual(3);

  // Connect nodes using the connection handles
  await connectNodes(page, 0, 1);
  await page.waitForTimeout(500);

  await connectNodes(page, 1, 2);
  await page.waitForTimeout(500);

  // Verify edges were created
  const edgeCount = await page.locator('.react-flow__edge').count();
  console.log(`Created ${edgeCount} edges`);
}

async function connectNodes(page: Page, fromIndex: number, toIndex: number): Promise<void> {
  const nodes = page.locator('.react-flow__node');

  const fromNode = nodes.nth(fromIndex);
  const toNode = nodes.nth(toIndex);

  const fromBox = await fromNode.boundingBox();
  const toBox = await toNode.boundingBox();

  if (fromBox && toBox) {
    // Start from bottom of source node (output handle)
    const startX = fromBox.x + fromBox.width / 2;
    const startY = fromBox.y + fromBox.height;

    // End at top of target node (input handle)
    const endX = toBox.x + toBox.width / 2;
    const endY = toBox.y;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 10 });
    await page.mouse.up();
  }
}

async function getViewportTransform(page: Page): Promise<{ x: number; y: number; zoom: number }> {
  // Get viewport from React Flow's transform style
  const viewport = await page.evaluate(() => {
    const viewportElement = document.querySelector('.react-flow__viewport');
    if (viewportElement) {
      const transform = window.getComputedStyle(viewportElement).transform;
      // Parse matrix transform: matrix(zoom, 0, 0, zoom, x, y)
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (matrix) {
        const values = matrix[1].split(',').map(v => parseFloat(v.trim()));
        return {
          zoom: values[0] || 1,
          x: values[4] || 0,
          y: values[5] || 0,
        };
      }
    }
    return { x: 0, y: 0, zoom: 1 };
  });
  return viewport;
}

async function getVisibleNodeIds(page: Page): Promise<string[]> {
  return await page.evaluate(() => {
    const nodes = document.querySelectorAll('.react-flow__node:not([style*="display: none"])');
    return Array.from(nodes).map(n => n.getAttribute('data-id') || '').filter(Boolean);
  });
}

async function getVisibleEdgeConnections(page: Page): Promise<{ source: string; target: string }[]> {
  return await page.evaluate(() => {
    const edges = document.querySelectorAll('.react-flow__edge:not([style*="display: none"])');
    return Array.from(edges).map(e => {
      const id = e.id || '';
      // Edge IDs are typically formatted as "e-source-target"
      const parts = id.split('-');
      if (parts.length >= 3) {
        return {
          source: parts.slice(1, -1).join('-'), // Handle node IDs with dashes
          target: parts[parts.length - 1],
        };
      }
      return { source: '', target: '' };
    }).filter(e => e.source && e.target);
  });
}
