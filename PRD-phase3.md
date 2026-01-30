# React Flow Visualization Stepper - Phase 3 PRD

## Overview

Phase 3 fixes critical issues with the presentation mode and step-based reveal system discovered during user testing and automated investigation.

---

## Problem Analysis

### Issue 1: Viewport Jumping/Zooming Between Steps (HIGH SEVERITY)

**Symptom:** When stepping through a presentation, the viewport dramatically changes zoom and position, making nodes appear to "jump around."

**Root Cause:** The code calls `fitView({ nodes: stepper.visibleNodes })` on EVERY step change. This recalculates the viewport to fit only the currently visible nodes.

**Evidence from Testing:**

- Step 1→2: Complete viewport shift, zooms in on single node
- Step 2→3: Pulls way back to show multiple nodes
- Step 3→4: Shifts again with different zoom

**Imosct:** Disorienting experience, users lose spatial context of the flow.

---

### Issue 2: No Visual Step Indicators in Editor Mode (HIGH SEVERITY)

**Symptom:** Users cannot see which step each node belongs to without opening the properties panel for each node individually.

**Root Cause:** No step badges or visual indicators are rendered on nodes in editor mode.

**Impact:**

- Impossible to verify presentation sequence at a glance
- Cannot tell if steps are sequential or have gaps
- Users must double-click each node to discover its step

---

### Issue 3: First Node Gets Step 2, Not Step 1

**Symptom:** First node added to empty canvas starts at step 2.

**Root Cause:** `getMaxStep()` returns 1 even with no nodes, so first new node gets `1 + 1 = 2`.

**Impact:** Step 1 shows nothing; user must click "Next" just to see the first node.

---

### Issue 4: Every New Node Gets Unique Step

**Symptom:** User creates 3 connected nodes, but they appear one at a time across 3 steps.

**Root Cause:** `addNode()` always assigns `getMaxStep() + 1` to new nodes.

**Impact:** Simple 3-node flow requires clicking through 3 steps.

---

### Issue 5: Click-to-Add from Palette Doesn't Work (MEDIUM)

**Symptom:** Clicking node types in the left palette does nothing. Only drag-drop and right-click work.

**Evidence:** Screenshots show clicking "Process Step" in palette has zero effect.

**Impact:** Users expect click-to-add to work; the palette looks interactive but isn't.

---

### Issue 6: "New" Button Doesn't Clear Canvas (BUG)

**Symptom:** Clicking "New" button doesn't clear existing nodes.

**Root Cause:** Bug in the New Flow handler - localStorage is cleared but canvas not reset properly.

**Impact:** Users cannot start fresh easily for testing or creating new flows.

---

### Issue 7: Users Can't Predict What Comes Next

**Symptom:** During presentation, users have no way to know which node will appear next or how many steps remain beyond the counter.

**Root Cause:** No preview, timeline, or visual indication of upcoming content.

**Impact:** Presenting feels like navigating blindly.

---

## User Stories

### Phase 3A: Critical Fixes

#### US-023: Fix First Node Step Assignment

**As a** user creating a new flow
**I want** the first node to start at step 1
**So that** step 1 actually shows something

**Acceptance Criteria:**

- [ ] First node added to empty canvas gets `revealAtStep: 1`
- [ ] Subsequent nodes continue with `maxStep + 1`
- [ ] If canvas has existing nodes, behavior unchanged

---

#### US-024: Display Step Badges on Nodes (Editor Mode)

**As a** user editing a flow
**I want** to see which step each node belongs to
**So that** I can understand the presentation order at a glance

**Acceptance Criteria:**

- [ ] Each node shows a badge with step number (e.g., "1", "2", "3")
- [ ] Badge appears in top-right corner of node
- [ ] Badge only visible in editor mode, hidden in presentation mode
- [ ] Badge styled distinctly (colored circle with number)
- [ ] Clicking badge opens quick step picker (see US-025)

**Design:**

```
┌─────────────────────────[2]┐  ← Badge
│ Step Title                 │
│                            │
│ Description text here      │
└────────────────────────────┘
```

---

#### US-025: Stable Viewport in Presentation Mode

**As a** presenter
**I want** the viewport to remain stable between steps
**So that** the presentation feels smooth and professional

**Acceptance Criteria:**

- [ ] When entering presentation mode, `fitView()` is called ONCE to fit ALL nodes
- [ ] Subsequent step changes do NOT call `fitView()`
- [ ] Nodes appear/disappear in place without viewport changes
- [ ] Optional: Smooth pan to newly revealed node if it's off-screen (user setting)
- [ ] Viewport only changes if user manually zooms/pans

**Technical Change:**

```typescript
// BEFORE (every step):
useEffect(() => {
  if (editor.mode === "presentation") {
    fitView({ nodes: stepper.visibleNodes }); // BAD: recalculates every step
  }
}, [stepper.currentStep]);

// AFTER (once on enter):
useEffect(() => {
  if (editor.mode === "presentation") {
    fitView({ nodes: editor.nodes }); // GOOD: fit ALL nodes once
  }
}, [editor.mode]); // Only when mode changes, not on step change
```

---

#### BUG-003: Fix "New" Button Not Clearing Canvas

**Problem:** Clicking "New" doesn't actually clear the canvas.

**Acceptance Criteria:**

- [ ] "New" button clears all nodes from canvas
- [ ] "New" button clears all edges
- [ ] Title resets to "Untitled Flow"
- [ ] localStorage is cleared
- [ ] Canvas shows empty state after clicking "New"

---

### Phase 3B: UX Improvements

#### US-026: Click-to-Add from Node Palette

**As a** user
**I want** to click a node type in the palette to add it to the canvas
**So that** I don't have to use drag-drop or right-click

**Acceptance Criteria:**

- [ ] Clicking "Process Step" in palette adds node to center of visible canvas
- [ ] Clicking "Hint" adds hint node to center
- [ ] Clicking "Image" adds image node to center
- [ ] New nodes offset slightly if multiple added (don't stack exactly)
- [ ] Visual feedback on click (button press effect)

---

#### US-027: Quick Step Picker

**As a** user
**I want** to quickly change a node's step by clicking its badge
**So that** I don't have to open the full properties panel

**Acceptance Criteria:**

- [ ] Clicking step badge on node opens popover/dropdown
- [ ] Shows list of available steps (1 to maxStep)
- [ ] Option to create "New Step" (maxStep + 1)
- [ ] Selecting a step updates node immediately
- [ ] Popover closes after selection

**Design:**

```
     Click badge ↓
┌────────────────────────[2]┐
│ Step Title         ┌──────┴─────┐
│                    │ Step 1     │
│ Description        │ Step 2  ●  │ ← Current
└────────────────────│ Step 3     │
                     │ + New Step │
                     └────────────┘
```

---

#### US-028: Batch Step Assignment

**As a** user
**I want** to set the same step for multiple selected nodes
**So that** they appear together in the presentation

**Acceptance Criteria:**

- [ ] Select multiple nodes (Shift+click or drag selection)
- [ ] Right-click shows "Set Step →" submenu
- [ ] Submenu lists available steps + "New Step"
- [ ] All selected nodes get assigned to chosen step
- [ ] Toast: "3 nodes set to Step 2"

---

#### US-029: Normalize Step Numbers

**As a** user
**I want** to remove gaps in step numbers
**So that** the presentation flows sequentially (1, 2, 3 not 1, 3, 7)

**Acceptance Criteria:**

- [ ] Button in header or context menu: "Normalize Steps"
- [ ] Renumbers all steps to be sequential starting from 1
- [ ] Preserves relative order
- [ ] Example: Steps 1, 3, 7 become 1, 2, 3
- [ ] Toast: "Steps normalized: 7 → 3 steps"

---

### Phase 3C: Advanced Features

#### US-030: Step Timeline/Progress Indicator

**As a** user
**I want** to see an overview of all steps
**So that** I can understand and navigate the presentation structure

**Acceptance Criteria:**

- [ ] In presentation mode: Show step dots/thumbnails at bottom
- [ ] Clicking a dot jumps to that step
- [ ] Current step highlighted
- [ ] In editor mode: Optional panel showing step breakdown
- [ ] Shows which nodes are in each step

**Design (Presentation Mode):**

```
┌────────────────────────────────────────┐
│                                        │
│         [Presentation Content]         │
│                                        │
├────────────────────────────────────────┤
│  ● ○ ○ ○    Step 1 of 4    [◀][▶]     │
│  ↑                                     │
│  Step dots (clickable)                 │
└────────────────────────────────────────┘
```

---

#### US-031: Default Step for New Nodes Setting

**As a** user
**I want** to choose how new nodes get their step number
**So that** I can work more efficiently

**Acceptance Criteria:**

- [ ] Setting in preferences or header dropdown
- [ ] Options:
  - "Auto-increment" (current behavior: maxStep + 1)
  - "Same as last" (new node gets same step as last added/selected)
  - "Always Step 1" (all new nodes start at step 1)
- [ ] Default: "Same as last" for easier grouping

---

## UI Mockups

### Step Badge on Node

```
┌────────────────────────────[●2]┐
│                                │
│   📄 Process Step Title        │
│                                │
│   Description text goes here   │
│                                │
└────────────────────────────────┘

Badge: Circular, colored background, white text
Position: Top-right corner, overlapping border slightly
Size: ~24px diameter
```

### Quick Step Picker

```
        ┌───────────────┐
        │ Reveal at...  │
        ├───────────────┤
        │ ○ Step 1      │
        │ ● Step 2      │  ← Current (highlighted)
        │ ○ Step 3      │
        ├───────────────┤
        │ + New Step    │
        │ = Same as #1  │  ← Same as last selected
        └───────────────┘
```

### Presentation Step Dots

```
┌──────────────────────────────────────────────┐
│                                              │
│            [Presentation Content]            │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│    ●───○───○───○        Step 1 of 4          │
│    ↑                                         │
│    Current step                              │
│                                              │
│         [◀ Prev]  [Next ▶]  [↺ Reset]       │
└──────────────────────────────────────────────┘
```

---

## Implementation Priority

### Phase 3A: Critical (Do First)

1. **BUG-003**: Fix "New" button not clearing canvas (5 min)
2. **US-023**: Fix first node step assignment (5 min)
3. **US-025**: Stable viewport in presentation mode (15 min)
4. **US-024**: Display step badges on nodes (30 min)

### Phase 3B: UX Improvements

5. **US-026**: Click-to-add from node palette (15 min)
6. **US-027**: Quick step picker (30 min)
7. **US-028**: Batch step assignment (20 min)
8. **US-029**: Normalize step numbers (15 min)

### Phase 3C: Advanced Features

9. **US-030**: Step timeline/progress indicator (45 min)
10. **US-031**: Default step for new nodes setting (20 min)

---

## Testing Approach

### Test with Simple Flows

Create test scenarios with minimal complexity:

1. Empty canvas → Add 3 nodes vertically → Connect → Present
2. Add 5 nodes, all at Step 1 → Present (should show all at once)
3. Add nodes at steps 1, 1, 2, 2, 3 → Present (verify grouping)

### Viewport Stability Test

1. Enter presentation at Step 1
2. Note viewport position/zoom
3. Advance through all steps
4. Verify viewport doesn't change (or changes minimally)

---

## Success Metrics

- Users can see step numbers on all nodes without clicking
- Presentation mode viewport stays stable (no dramatic zoom changes)
- Click-to-add works from palette
- "New" button actually creates empty canvas
- Users report feeling "in control" of the presentation

---

## Out of Scope (Phase 3)

- Step animations/transitions beyond fade-in
- Presenter notes per step
- Remote presentation controls
- Step timing/auto-advance
- Undo/redo for step changes
