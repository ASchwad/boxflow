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

  let screenshotCounter = 1;

  // Setup screenshot function on window
  await page.exposeFunction('takeScreenshot', async (name) => {
    const filename = name || `screenshot-${screenshotCounter.toString().padStart(2, '0')}.jpg`;
    const filepath = path.join(screenshotDir, filename);
    await page.screenshot({
      path: filepath,
      type: 'jpeg',
      quality: 90
    });
    console.log(`Screenshot saved: ${filename}`);
    screenshotCounter++;
    return filepath;
  });

  // Setup viewport info function
  await page.exposeFunction('getViewportInfo', async () => {
    const info = await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      const visibleNodes = Array.from(document.querySelectorAll('.react-flow__node')).filter(node => {
        const opacity = window.getComputedStyle(node).opacity;
        const display = window.getComputedStyle(node).display;
        return opacity !== '0' && display !== 'none';
      }).length;

      const allNodes = document.querySelectorAll('.react-flow__node').length;

      if (viewport) {
        const transform = viewport.style.transform;
        const match = transform.match(/translate\(([^,]+),([^)]+)\) scale\(([^)]+)\)/);
        if (match) {
          return {
            translateX: match[1],
            translateY: match[2],
            scale: match[3],
            visibleNodes,
            totalNodes: allNodes,
            fullTransform: transform
          };
        }
      }
      return { error: 'viewport not found', visibleNodes, totalNodes: allNodes };
    });
    console.log('Viewport info:', JSON.stringify(info, null, 2));
    return info;
  });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Inject helper into browser console
  await page.evaluate(() => {
    console.log('%c=== Test Helper Loaded ===', 'color: green; font-size: 16px; font-weight: bold');
    console.log('%cCommands:', 'color: blue; font-weight: bold');
    console.log('  window.shot("filename.jpg") - Take a screenshot');
    console.log('  window.viewport() - Get viewport info');
    console.log('  window.analyzeNodes() - Get node information');
    console.log('');

    window.shot = (name) => window.takeScreenshot(name);
    window.viewport = () => window.getViewportInfo();
    window.analyzeNodes = () => {
      const nodes = Array.from(document.querySelectorAll('.react-flow__node'));
      return nodes.map((node, idx) => {
        const style = window.getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return {
          index: idx,
          opacity: style.opacity,
          display: style.display,
          visible: style.opacity !== '0' && style.display !== 'none',
          position: { x: rect.x, y: rect.y },
          size: { width: rect.width, height: rect.height }
        };
      });
    };
  });

  console.log('\n=== Browser opened and test helpers loaded ===');
  console.log('The browser window is ready for manual testing.');
  console.log('\nIn the browser console, you can use:');
  console.log('  shot("filename.jpg") - Take a screenshot');
  console.log('  viewport() - Get viewport info');
  console.log('  analyzeNodes() - Get node info');
  console.log('\nBrowser will stay open for 30 minutes.');
  console.log('Press Ctrl+C to close when done.\n');

  // Keep alive for 30 minutes
  await page.waitForTimeout(1800000);

  await browser.close();
})();
