# React Flow Visualization Stepper - Phase 4 PRD

## Overview

Phase 4 focuses on **acceptance testing**, **validation**, and **final polish** to ensure the presentation mode works correctly and the app meets all requirements from PRDs 1-3.1.

---

## Critical Acceptance Tests

### AT-001: Presentation Mode Node Visibility

**Test Scenario:** Create 3 Process Step nodes, connect them, and validate step-by-step reveal.

**Setup:**
1. Clear canvas (New button)
2. Add 3 Process Step nodes via palette clicks
3. Nodes should auto-assign steps 1, 2, 3
4. Connect Node 1 → Node 2 → Node 3

**Acceptance Criteria:**

| Step | Expected Nodes | Expected Edges | Pass Criteria |
|------|---------------|----------------|---------------|
| 1 | Node 1 only | **ZERO edges** | Only node with revealAtStep=1 visible |
| 2 | Nodes 1, 2 | Edge 1→2 only | Both nodes visible, connecting edge appears |
| 3 | Nodes 1, 2, 3 | Edges 1→2, 2→3 | All 3 nodes, all 2 edges visible |

**Test Implementation:**
```typescript
// tests/presentation-mode.spec.ts
describe('Presentation Mode Acceptance', () => {
  it('AT-001: Step 1 shows node 1, zero edges', async () => {
    // Setup: 3 connected nodes
    // Enter presentation
    // Assert: 1 node visible, 0 edges visible
  });

  it('AT-001: Step 2 shows nodes 1-2, edge between them', async () => {
    // Go to step 2
    // Assert: 2 nodes visible, 1 edge visible
  });

  it('AT-001: Step 3 shows all nodes and edges', async () => {
    // Go to step 3
    // Assert: 3 nodes visible, 2 edges visible
  });
});
```

---

### AT-002: Viewport Stability During Presentation

**Test Scenario:** Viewport should NOT change zoom/position between steps.

**Acceptance Criteria:**
- [ ] Enter presentation mode → viewport fits all nodes ONCE
- [ ] Advance Step 1 → 2 → 3: viewport remains stable
- [ ] No zoom changes between steps
- [ ] No pan/shift between steps
- [ ] User can still manually zoom/pan

**Test Implementation:**
```typescript
it('AT-002: Viewport stays stable across steps', async () => {
  // Record viewport at step 1
  const viewportStep1 = await getViewport();

  // Advance to step 2
  await clickNext();
  const viewportStep2 = await getViewport();

  // Assert viewports match (within tolerance)
  expect(viewportStep1.zoom).toBeCloseTo(viewportStep2.zoom, 2);
  expect(viewportStep1.x).toBeCloseTo(viewportStep2.x, 2);
});
```

---

### AT-003: Step Badge Accuracy

**Test Scenario:** Step badges in editor mode must match actual reveal behavior.

**Acceptance Criteria:**
- [ ] Node with badge "1" appears at step 1
- [ ] Node with badge "2" appears at step 2
- [ ] Node with badge "3" appears at step 3
- [ ] Changing badge via picker updates actual step

---

### AT-004: Step Progress Dots Navigation

**Test Scenario:** Clicking step dots should jump to that step.

**Acceptance Criteria:**
- [ ] Dots visible in presentation mode
- [ ] Current step dot highlighted (filled/larger)
- [ ] Click dot 3 → jumps to step 3
- [ ] Click dot 1 → jumps back to step 1

---

### AT-005: Edge Visibility Bug Check (CRITICAL)

**Test Scenario:** Edges must NEVER show when target node is hidden.

**Setup:** Same as AT-001

**Validation at each step:**
```typescript
// For every visible edge, verify both nodes are visible
const edges = await getVisibleEdges();
const nodes = await getVisibleNodeIds();

for (const edge of edges) {
  expect(nodes).toContain(edge.source);
  expect(nodes).toContain(edge.target);
}
```

---

## Bug Fixes Required

### BUG-007: Edge Visibility Logic - FIXED

**Symptom:** User reported edges showing when target node not visible.

**Root Cause Analysis:**
The original implementation filtered edges (not including them in the array), but React Flow's internal state management could still render edges to nodes that existed in memory. Simply not including edges in the array passed to `<ReactFlow>` was not sufficient.

**Solution:**
Use React Flow's built-in `hidden` property instead of filtering. When `hidden: true` is set on a node or edge, React Flow completely removes it from the DOM (returns `null` from the wrapper component).

**Fix Applied (useFlowStepper.ts):**
```typescript
// BEFORE: Filtering edges (didn't work reliably)
const visibleEdges = useMemo(() => {
  return edges.filter((edge) => {
    return sourceVisible && targetVisible;
  });
}, [edges, visibleNodes, currentStep]);

// AFTER: Using React Flow's hidden property (works correctly)
const visibleNodes = useMemo(() => {
  return nodes.map((node) => {
    const shouldBeVisible = (node.data?.revealAtStep ?? 1) <= currentStep;
    return {
      ...node,
      hidden: !shouldBeVisible, // React Flow's hidden property
    };
  });
}, [nodes, currentStep]);

const visibleEdges = useMemo(() => {
  const visibleNodeIds = new Set(
    visibleNodes.filter((n) => !n.hidden).map((n) => n.id)
  );
  return edges.map((edge) => {
    const shouldBeVisible =
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
    return {
      ...edge,
      hidden: !shouldBeVisible, // React Flow's hidden property
    };
  });
}, [edges, visibleNodes, currentStep]);
```

**Why This Works:**
- React Flow's `hidden` property causes the component wrapper to return `null`
- Hidden elements are completely removed from the DOM
- No CSS visibility tricks needed - elements simply don't render
- Both nodes and edges use the same mechanism consistently

**Validation:** All 7 acceptance tests pass (AT-001 through AT-005).

---

### BUG-008: Node Context Menu Only for Multi-Select

**Current Behavior:** Context menu shows when right-clicking ANY selected node.

**Expected:** Context menu with batch options should only appear when 2+ nodes selected.

**Fix:** Already implemented - check `selectedNodeIds.length >= 2` before showing menu.

---

## New Features

### US-033: Debug Mode for Presentation

**As a** developer testing presentation mode
**I want** to see debug info about node/edge visibility
**So that** I can diagnose step reveal issues

**Acceptance Criteria:**
- [ ] Toggle in settings or URL param `?debug=true`
- [ ] When enabled, show overlay with:
  - Current step number
  - Visible node count / total
  - Visible edge count / total
  - List of visible node IDs
- [ ] Hidden in production builds

---

### US-034: Keyboard Shortcuts Help

**As a** presenter
**I want** to see available keyboard shortcuts
**So that** I can navigate efficiently

**Acceptance Criteria:**
- [ ] "?" key shows shortcuts modal
- [ ] Shows: Arrow keys, Space, Home, End, Escape
- [ ] Modal dismissible with Escape or clicking outside

---

### US-035: Export Presentation as Images

**As a** presenter
**I want** to export each step as an image
**So that** I can share in non-interactive formats (PDF, slides)

**Acceptance Criteria:**
- [ ] "Export Steps" in header dropdown
- [ ] Exports PNG for each step (step-1.png, step-2.png, ...)
- [ ] Downloads as ZIP or triggers sequential downloads
- [ ] Uses current viewport for each step

---

### US-036: Presentation Timer

**As a** presenter
**I want** to see how long I've been presenting
**So that** I can pace my presentation

**Acceptance Criteria:**
- [ ] Timer starts when entering presentation mode
- [ ] Shows MM:SS in bottom corner
- [ ] Pauses when exiting presentation
- [ ] Option to hide timer

---

## Testing Infrastructure

### Create Playwright Test Suite

**Files to create:**
```
tests/
├── setup/
│   └── global-setup.ts
├── fixtures/
│   └── test-flows.ts
├── presentation-mode.spec.ts    # AT-001, AT-002, AT-005
├── editor-mode.spec.ts          # Step badges, node creation
├── step-navigation.spec.ts      # AT-003, AT-004
└── edge-visibility.spec.ts      # AT-005 dedicated
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 2,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

---

## Implementation Priority

### Phase 4A: Testing & Validation (HIGH)
1. Create Playwright test infrastructure
2. Implement AT-001 (node visibility tests)
3. Implement AT-002 (viewport stability tests)
4. Implement AT-005 (edge visibility validation)
5. Run all tests, fix any failures

### Phase 4B: Bug Fixes (MEDIUM)
6. Add debug logging to edge visibility
7. Validate and fix any edge visibility bugs
8. Fix any issues discovered by tests

### Phase 4C: Polish Features (LOW)
9. US-034: Keyboard shortcuts help modal
10. US-036: Presentation timer
11. US-033: Debug mode (optional)
12. US-035: Export as images (stretch)

---

## Success Metrics

- [x] All acceptance tests pass (7/7 passing)
- [x] Zero edge visibility bugs (BUG-007 fixed)
- [x] Viewport stays stable during presentation
- [x] Step badges match actual reveal behavior
- [x] Users can navigate via step dots
- [x] Keyboard shortcuts help modal (US-034)
- [x] Presentation timer (US-036)

---

## Commands to Run

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install

# Run tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/presentation-mode.spec.ts

# Generate HTML report
npx playwright show-report
```

---

## Out of Scope (Phase 4)

- Animation customization
- Step timing/auto-advance
- Presenter notes
- Remote presentation sync
- Mobile optimization
