# React Flow Visualization Stepper - Phase 3.1 PRD

## Overview
Phase 3.1 addresses critical presentation mode bugs that persist after Phase 3, plus remaining features from the Phase 3 backlog.

---

## Critical Bugs (MUST FIX)

### BUG-004: Edges Still Showing When Target Node Not Visible (CRITICAL)

**Symptom:** At Step 2 of 3, only 1 node is visible but an edge is shown going down to nowhere.

**Screenshot Evidence:**
- "Step 2 of 3" displayed
- Only one node ("New Step") visible
- Dashed edge extending below the node with no target node visible

**Expected Behavior:** Edge should ONLY appear when BOTH connected nodes are on screen.

**Root Cause Analysis:**
The `visibleEdges` filter in `useFlowStepper.ts` checks `visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)`, but either:
1. `visibleNodeIds` is being populated incorrectly
2. The edge source/target IDs don't match node IDs
3. The filtering logic has a timing/state issue

**Acceptance Criteria:**
- [ ] At Step 1: Show node 1 ONLY, zero edges
- [ ] At Step 2: Show nodes 1+2, edge between them appears
- [ ] At Step 3: Show nodes 1+2+3, all edges visible
- [ ] NO dangling edges ever visible in presentation mode

---

### BUG-005: Step 3 Node Not Showing at Step 3 (CRITICAL)

**Symptom:** With 3 nodes at steps 1, 2, 3:
- Step 1 of 3: Shows node 1 ✓
- Step 2 of 3: Shows node 1 only (node 2 not showing!)
- Step 3 of 3: Shows nodes 1 and 2 (node 3 not showing!)

**Expected Behavior:**
- Step 1: Node 1
- Step 2: Nodes 1, 2
- Step 3: Nodes 1, 2, 3

**Root Cause Hypothesis:**
The step assignment when adding nodes might be off. If nodes are created with steps 1, 2, 3 but the presentation shows "Step 2 of 3" with only node 1, then either:
1. Node 2 has `revealAtStep: 3` instead of 2
2. The filter `revealAtStep <= currentStep` isn't working correctly
3. State sync issue between editor and stepper

**Acceptance Criteria:**
- [ ] With 3 sequential nodes, all 3 are visible by step 3
- [ ] Step badge in editor matches actual reveal step
- [ ] totalSteps calculation matches actual max step

**Investigation Required:**
1. Add console logging to verify actual `revealAtStep` values on each node
2. Verify `visibleNodes` filter is using correct comparison
3. Check if step values match between editor view (badges) and stepper

---

### BUG-006: Node 1 Shows at Step 1 (Confirm Correct Behavior)

**Current Behavior:** First node created gets `revealAtStep: 1`

**Question:** Should node 1 show immediately at step 1, or should step 1 be empty (revealing node 1 on step 2)?

**Proposed Behavior (User Preference):**
- Node 1 visible at Step 1 (already works, just confirm)
- This means 3 nodes = 3 steps, all visible by end

---

## UX Improvements

### US-032: Viewport Reposition When Adding Nodes (Editor Mode)

**As a** user adding nodes
**I want** the canvas to pan/zoom to include newly added nodes
**So that** I can immediately see what I created

**Acceptance Criteria:**
- [ ] When adding a node via palette click, canvas pans to show the new node
- [ ] When adding via drag-drop, no automatic pan (user placed it)
- [ ] When adding via context menu, canvas pans to show new node
- [ ] Smooth animation (300ms transition)
- [ ] Only in editor mode, not presentation mode

**Technical Approach:**
```typescript
// After adding node via click
const handlePaletteAdd = (type: string) => {
  const position = getViewportCenter();
  editor.addNode(type, position);
  // Pan to new node
  setTimeout(() => {
    fitView({ nodes: [newNode], padding: 0.5, duration: 300 });
  }, 50);
};
```

---

### US-028: Batch Step Assignment (From Phase 3)

**As a** user
**I want** to set the same step for multiple selected nodes
**So that** they appear together in the presentation

**Acceptance Criteria:**
- [ ] Select multiple nodes (Shift+click or drag selection)
- [ ] Right-click shows "Set Step" submenu
- [ ] Submenu lists steps 1 through maxStep + "New Step"
- [ ] All selected nodes assigned to chosen step
- [ ] Toast: "3 nodes set to Step 2"

---

### US-029: Normalize Step Numbers (From Phase 3)

**As a** user
**I want** to remove gaps in step numbers
**So that** the presentation flows sequentially (1, 2, 3 not 1, 3, 7)

**Acceptance Criteria:**
- [ ] Button in header dropdown: "Normalize Steps"
- [ ] Renumbers all steps to be sequential starting from 1
- [ ] Preserves relative order
- [ ] Example: Steps 1, 3, 7 become 1, 2, 3
- [ ] Toast: "Steps normalized: 7 → 3 steps"

---

### US-030: Step Timeline/Progress Indicator (From Phase 3)

**As a** presenter
**I want** to see step progress dots
**So that** I can navigate and see how far along I am

**Acceptance Criteria:**
- [ ] Show clickable step dots below stepper controls
- [ ] Current step highlighted
- [ ] Clicking a dot jumps to that step
- [ ] Works with any number of steps (scrollable if many)

**Design:**
```
┌──────────────────────────────────────────────┐
│            [Presentation Content]            │
├──────────────────────────────────────────────┤
│    ●───○───○       Step 1 of 3               │
│    ↑                                         │
│    Current (clickable)                       │
│         [◀ Prev]  [Next ▶]  [↺]             │
└──────────────────────────────────────────────┘
```

---

### US-031: Default Step for New Nodes Setting (From Phase 3)

**As a** user
**I want** to choose how new nodes get their step number
**So that** I can work more efficiently

**Acceptance Criteria:**
- [ ] Dropdown in editor header or settings
- [ ] Options:
  - "Auto-increment" (default: maxStep + 1)
  - "Same as last" (same step as last added node)
  - "Always Step 1"
- [ ] Persisted in localStorage

---

## Implementation Priority

### Phase 3.1A: Critical Bug Fixes (DO FIRST)
1. **BUG-004**: Fix edges showing without target node visible
2. **BUG-005**: Fix step 3 node not showing at step 3
3. **US-032**: Viewport reposition when adding nodes

### Phase 3.1B: Remaining Features
4. **US-028**: Batch step assignment
5. **US-029**: Normalize step numbers
6. **US-030**: Step timeline/progress dots
7. **US-031**: Default step setting

---

## Debug Plan for BUG-004 and BUG-005

### Step 1: Add Debug Logging
```typescript
// In useFlowStepper.ts - visibleNodes filter
console.log('=== Step Change ===');
console.log('currentStep:', currentStep);
nodes.forEach(n => {
  console.log(`Node ${n.id}: revealAtStep=${n.data?.revealAtStep}`);
});
console.log('visibleNodes:', visibleNodes.map(n => n.id));

// In visibleEdges filter
console.log('visibleNodeIds:', [...visibleNodeIds]);
edges.forEach(e => {
  const srcVisible = visibleNodeIds.has(e.source);
  const tgtVisible = visibleNodeIds.has(e.target);
  console.log(`Edge ${e.id}: src=${e.source}(${srcVisible}) -> tgt=${e.target}(${tgtVisible})`);
});
```

### Step 2: Verify Node Data in Editor
- Check that step badges show correct values
- Verify node.data.revealAtStep matches badge display

### Step 3: Test with Fresh Canvas
1. Click "New" to clear
2. Add exactly 3 Process Step nodes
3. Verify badges show 1, 2, 3
4. Connect them
5. Enter presentation
6. Step through and verify node visibility

---

## Success Metrics
- Zero dangling edges in presentation mode
- All nodes visible by their assigned step
- Step badges match actual reveal behavior
- Canvas repositions smoothly when adding nodes via click

---

## Out of Scope
- Animation customization
- Step timing/auto-advance
- Presenter notes
- Remote presentation
