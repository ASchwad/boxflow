import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('=== Starting Presentation Mode Investigation ===\n');

  try {
    // Navigate
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await delay(1000);

    // Take initial screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'test-00-initial-state.jpg'),
      type: 'jpeg',
      quality: 90,
      fullPage: false
    });
    console.log('   Screenshot: test-00-initial-state.jpg\n');

    // Since there's already a flow, let's just work with it instead of creating new
    console.log('2. Using existing flow (skipping "New" to preserve existing test data)\n');

    console.log('3. Entering presentation mode...');
    await page.click('button:has-text("Present")');
    await delay(1500);

    // Helper function to capture viewport and node data
    async function captureState(stepNum) {
      const state = await page.evaluate(() => {
        const viewport = document.querySelector('.react-flow__viewport');
        let viewportData = { error: 'not found' };

        if (viewport) {
          const transform = viewport.style.transform;
          const match = transform.match(/translate\(([^,]+),([^)]+)\) scale\(([^)]+)\)/);
          if (match) {
            viewportData = {
              translateX: match[1],
              translateY: match[2],
              scale: parseFloat(match[3]),
              fullTransform: transform
            };
          }
        }

        // Get node visibility
        const nodes = Array.from(document.querySelectorAll('.react-flow__node'));
        const nodeData = nodes.map((node, idx) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          const isVisible = style.opacity !== '0' && style.display !== 'none';

          // Get node text content
          const titleEl = node.querySelector('.text-base');
          const descEl = node.querySelector('.text-sm');

          return {
            index: idx,
            opacity: style.opacity,
            display: style.display,
            visible: isVisible,
            position: { x: Math.round(rect.x), y: Math.round(rect.y) },
            size: { width: Math.round(rect.width), height: Math.round(rect.height) },
            title: titleEl ? titleEl.textContent.trim() : '',
            description: descEl ? descEl.textContent.trim() : ''
          };
        });

        // Get current step indicator
        const stepIndicator = document.querySelector('[class*="step"]');

        return {
          viewport: viewportData,
          nodes: nodeData,
          visibleCount: nodeData.filter(n => n.visible).length,
          totalCount: nodeData.length
        };
      });

      console.log(`   Step ${stepNum}:`);
      console.log(`     Viewport scale: ${state.viewport.scale}`);
      console.log(`     Viewport translate: ${state.viewport.translateX}, ${state.viewport.translateY}`);
      console.log(`     Visible nodes: ${state.visibleCount}/${state.totalCount}`);

      state.nodes.forEach(node => {
        if (node.visible) {
          console.log(`       - Node ${node.index}: "${node.title}" at (${node.position.x}, ${node.position.y})`);
        }
      });

      return state;
    }

    // Capture state at each presentation step
    const allStates = [];
    let stepNum = 1;
    let canContinue = true;

    while (canContinue && stepNum <= 10) {  // Max 10 steps to prevent infinite loop
      console.log(`\n4.${stepNum} Capturing presentation step ${stepNum}...`);

      const state = await captureState(stepNum);
      allStates.push({ step: stepNum, ...state });

      await page.screenshot({
        path: path.join(screenshotDir, `test-presentation-step-${stepNum.toString().padStart(2, '0')}.jpg`),
        type: 'jpeg',
        quality: 90,
        fullPage: false
      });
      console.log(`   Screenshot: test-presentation-step-${stepNum.toString().padStart(2, '0')}.jpg`);

      // Check if Next button is enabled
      const nextButton = page.locator('button:has-text("Next")');
      const isEnabled = await nextButton.isEnabled().catch(() => false);

      if (isEnabled) {
        await nextButton.click();
        await delay(1000);  // Wait for transition
        stepNum++;
      } else {
        console.log(`   Next button disabled - reached end at step ${stepNum}`);
        canContinue = false;
      }
    }

    console.log('\n5. Exiting presentation mode...');
    await page.keyboard.press('Escape');
    await delay(500);

    await page.screenshot({
      path: path.join(screenshotDir, 'test-after-presentation.jpg'),
      type: 'jpeg',
      quality: 90,
      fullPage: false
    });
    console.log('   Screenshot: test-after-presentation.jpg\n');

    // Check node step assignments
    console.log('6. Checking node "Reveal at Step" properties...');
    const nodes = await page.locator('.react-flow__node').all();
    const nodeStepData = [];

    for (let i = 0; i < Math.min(nodes.length, 5); i++) {
      console.log(`   Checking node ${i}...`);
      await nodes[i].dblclick();
      await delay(800);

      const stepInfo = await page.evaluate(() => {
        const stepInput = document.querySelector('input[type="number"]');
        const labels = Array.from(document.querySelectorAll('label'));
        const stepLabel = labels.find(l => l.textContent.includes('Reveal at Step'));

        return {
          stepValue: stepInput ? stepInput.value : 'not found',
          labelText: stepLabel ? stepLabel.textContent : 'not found'
        };
      });

      console.log(`     Node ${i}: Reveal at Step = ${stepInfo.stepValue}`);
      nodeStepData.push({ nodeIndex: i, ...stepInfo });

      await page.screenshot({
        path: path.join(screenshotDir, `test-node-${i}-properties.jpg`),
        type: 'jpeg',
        quality: 90,
        fullPage: false
      });

      // Close by clicking outside
      await page.mouse.click(50, 500);
      await delay(300);
    }

    // Save comprehensive report
    const report = {
      testDate: new Date().toISOString(),
      summary: {
        totalSteps: allStates.length,
        totalNodes: nodeStepData.length,
      },
      presentationSteps: allStates,
      nodeAssignments: nodeStepData,
      analysis: {
        viewportChanges: allStates.map((s, idx) => ({
          step: s.step,
          scale: s.viewport.scale,
          translateX: s.viewport.translateX,
          translateY: s.viewport.translateY,
          visibleNodes: s.visibleCount,
          scaleChangedFromPrevious: idx > 0 ? s.viewport.scale !== allStates[idx - 1].viewport.scale : false,
          positionChangedFromPrevious: idx > 0 ?
            (s.viewport.translateX !== allStates[idx - 1].viewport.translateX ||
             s.viewport.translateY !== allStates[idx - 1].viewport.translateY) : false
        }))
      }
    };

    fs.writeFileSync(
      path.join(screenshotDir, 'presentation-investigation-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n=== SUMMARY ===');
    console.log(`Total presentation steps: ${allStates.length}`);
    console.log(`Nodes checked: ${nodeStepData.length}`);
    console.log('\nViewport changes detected:');
    report.analysis.viewportChanges.forEach(change => {
      if (change.scaleChangedFromPrevious || change.positionChangedFromPrevious) {
        console.log(`  Step ${change.step}: Scale=${change.scale}, Position changed=${change.positionChangedFromPrevious}`);
      }
    });

    console.log('\nNode step assignments:');
    nodeStepData.forEach(node => {
      console.log(`  Node ${node.nodeIndex}: Reveal at Step ${node.stepValue}`);
    });

    console.log('\nFull report saved to: presentation-investigation-report.json');
    console.log('All screenshots saved to:', screenshotDir);
    console.log('\n=== Test Complete ===\n');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({
      path: path.join(screenshotDir, 'test-error.jpg'),
      type: 'jpeg',
      quality: 90
    });
  }

  await delay(2000);
  await browser.close();
})();
