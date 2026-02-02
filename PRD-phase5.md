# React Flow Visualization Stepper - Phase 5 PRD

## Overview

Phase 5 focuses on **UX improvements** and **edge customization** to enhance the editing experience and give users more control over the visual appearance of their flow diagrams.

---

## Features

### US-040: Floating Node Editor Overlay

**As a** user editing a node
**I want** the edit panel to appear as a floating overlay next to the selected node
**So that** I can see my changes in context without the panel obscuring the canvas

**Current Behavior:** Edit panel slides in from the right side as a Sheet component, taking up the full height of the screen.

**Desired Behavior:** Edit panel appears as a floating card/popover positioned adjacent to the node being edited.

**Acceptance Criteria:**
- [ ] Double-clicking a node opens a floating overlay panel
- [ ] Overlay is positioned to the right of the node (preferred) or left if no space
- [ ] Overlay follows the node if the user drags the node while editing
- [ ] Overlay repositions if it would go off-screen (smart positioning)
- [ ] Click outside the overlay or press Escape closes it
- [ ] Overlay has the same fields as current panel (title, description, step, etc.)
- [ ] Max width of overlay is ~320px to keep it compact
- [ ] Overlay has subtle shadow and border for visual separation from canvas

**Technical Notes:**
- Use absolute positioning based on node coordinates from React Flow
- Convert node position to screen coordinates using `getViewport()` and node dimensions
- Consider using a portal to render outside the React Flow container

---

### US-041: Smart Step Selector

**As a** user assigning steps to nodes
**I want** the step selector to only show valid step options
**So that** I don't accidentally create gaps in my step sequence

**Current Behavior:** Step selector allows any positive integer, including steps that create gaps (e.g., selecting step 5 when max existing step is 2).

**Desired Behavior:** Step selector dropdown shows steps 1 through (current max step + 1), allowing users to either assign to existing steps or create the next sequential step.

**Acceptance Criteria:**
- [ ] Step dropdown shows options from 1 to `maxExistingStep + 1`
- [ ] If current flow has steps 1, 2, 3 → dropdown shows 1, 2, 3, 4
- [ ] If no nodes exist → dropdown shows only 1
- [ ] When a node is deleted and a step becomes empty, normalize remaining steps
- [ ] Step selector updates dynamically when nodes are added/removed
- [ ] Current node's step is pre-selected in the dropdown
- [ ] Works in both the overlay panel and the step badge popover

**Example Scenarios:**
| Current Steps | Dropdown Options | Reason |
|--------------|------------------|--------|
| [1, 2, 3] | 1, 2, 3, 4 | Can assign to existing or create step 4 |
| [1, 3] | 1, 2, 3, 4 | Gap at 2, can fill it or extend |
| [2, 3] | 1, 2, 3, 4 | Can create step 1 at start |
| [] | 1 | No nodes, first must be step 1 |

**Technical Notes:**
- Calculate `maxStep` from `Math.max(...nodes.map(n => n.data.revealAtStep ?? 1))`
- Step normalization should run when nodes are deleted (already exists, verify)

---

### US-042: Edge Editing Panel

**As a** user customizing my flow diagram
**I want** to edit edge properties (arrow type, line style, animation)
**So that** I can create visually distinct connections

**Acceptance Criteria:**
- [ ] Clicking an edge selects it and opens an edge editor overlay
- [ ] Edge editor allows configuring:
  - **Arrow Type (Marker End):** None, Arrow, ArrowClosed, Diamond
  - **Arrow Start (Marker Start):** None, Arrow, ArrowClosed, Diamond
  - **Line Style:** Solid, Dashed, Dotted
  - **Animation:** None, Flow (animated dash), Pulse
  - **Stroke Color:** Color picker or preset colors
  - **Stroke Width:** 1px, 2px, 3px, 4px
- [ ] Changes apply immediately (live preview)
- [ ] Edge settings persist when saving the flow
- [ ] Default new edges use: Dashed line, no arrows, animated flow

**Edge Configuration Schema:**
```typescript
interface FlowEdgeConfig {
  id: string;
  source: string;
  target: string;
  type: 'custom'; // Use custom edge for all configurability
  data: {
    revealAtStep?: number;
    markerStart?: 'none' | 'arrow' | 'arrowClosed' | 'diamond';
    markerEnd?: 'none' | 'arrow' | 'arrowClosed' | 'diamond';
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    animation?: 'none' | 'flow' | 'pulse';
    strokeColor?: string;
    strokeWidth?: number;
  };
}
```

---

### US-043: Configurable Edge Handle Positions

**As a** user connecting nodes
**I want** to specify which side of each node the edge connects from/to
**So that** my diagram layout looks clean regardless of node positions

**Current Behavior:** When drawing an edge, it visually connects from the handle you drag from, but after releasing, the edge always renders from source's bottom handle to target's top handle.

**Desired Behavior:** Edge remembers which handles were used and renders accordingly.

**Acceptance Criteria:**
- [ ] When creating an edge by dragging from a handle, the connection remembers:
  - Source handle position (top/bottom/left/right)
  - Target handle position (top/bottom/left/right)
- [ ] Edge renders using the actual handles that were connected
- [ ] Edge editor panel shows handle positions and allows changing them
- [ ] Handle position options: Top, Bottom, Left, Right
- [ ] Changing handle position immediately updates the edge path
- [ ] Handle positions persist when saving the flow

**Technical Notes:**
- React Flow edges support `sourceHandle` and `targetHandle` properties
- Handle IDs on nodes should be set to their position: `top`, `bottom`, `left`, `right`
- Update `onConnect` callback to capture handle positions from connection params

---

### US-044: Auto-Fit Viewport in Presentation Mode

**As a** presenter
**I want** the viewport to automatically adjust to show newly revealed nodes
**So that** my audience can see the new content without manual zooming/panning

**Current Behavior:** Viewport stays fixed during presentation, which means nodes revealed at later steps might be off-screen.

**Desired Behavior:** When advancing steps, if new nodes would be outside the current viewport, smoothly animate the viewport to include them.

**Acceptance Criteria:**
- [ ] When advancing to a new step, check if new nodes are within viewport
- [ ] If any new node is outside viewport, animate viewport to fit all visible nodes
- [ ] Animation should be smooth (duration ~300-500ms)
- [ ] Maintain reasonable padding around nodes (50-100px)
- [ ] Only zoom out if necessary, prefer panning if nodes are close
- [ ] When going backwards, also adjust viewport if previously-visible nodes are now the "extent"
- [ ] Add toggle in presentation controls: "Auto-fit viewport" (default: ON)
- [ ] Manual user zoom/pan should not be overridden until next step change

**Technical Notes:**
- Use `fitView` with `nodes` filter for visible nodes
- Use `fitView({ padding: 0.1, duration: 400, nodes: visibleNodeIds })`
- React Flow's `fitView` accepts animation duration parameter

---

## Implementation Priority

### Phase 5A: Core UX Improvements (HIGH)
1. **US-041:** Smart Step Selector - prevents user confusion
2. **US-040:** Floating Node Editor Overlay - better editing experience
3. **US-047:** Select All Nodes (Cmd+A) - basic expected behavior

### Phase 5B: Node Operations (HIGH)
4. **US-045:** Copy/Paste Nodes - essential workflow
5. **US-046:** Option/Alt+Drag to Duplicate - power user feature

### Phase 5C: Edge Customization (MEDIUM)
6. **US-042:** Edge Editing Panel - visual customization
7. **US-043:** Configurable Edge Handle Positions - layout control

### Phase 5D: Layout & Presentation (MEDIUM)
8. **US-048:** Auto-Layout Feature - diagram organization
9. **US-044:** Auto-Fit Viewport - better presentation experience

---

## Technical Considerations

### Floating Overlay Positioning

```typescript
// Calculate overlay position based on node position
const getOverlayPosition = (node: Node, viewport: Viewport, containerRect: DOMRect) => {
  const nodeScreenX = node.position.x * viewport.zoom + viewport.x;
  const nodeScreenY = node.position.y * viewport.zoom + viewport.y;
  const nodeWidth = (node.width ?? 200) * viewport.zoom;

  // Default: position to the right of the node
  let left = nodeScreenX + nodeWidth + 16; // 16px gap

  // If would overflow right, position to the left
  const overlayWidth = 320;
  if (left + overlayWidth > containerRect.width) {
    left = nodeScreenX - overlayWidth - 16;
  }

  return { left, top: nodeScreenY };
};
```

### Edge Handle ID Convention

```typescript
// Update handle components with explicit IDs
<Handle type="source" position={Position.Top} id="top" />
<Handle type="source" position={Position.Bottom} id="bottom" />
<Handle type="source" position={Position.Left} id="left" />
<Handle type="source" position={Position.Right} id="right" />
<Handle type="target" position={Position.Top} id="top" />
<Handle type="target" position={Position.Bottom} id="bottom" />
<Handle type="target" position={Position.Left} id="left" />
<Handle type="target" position={Position.Right} id="right" />
```

### Custom Edge Component

```typescript
// Enhanced edge with configurable styling
const CustomEdge = ({ data, ...props }) => {
  const strokeDasharray = {
    solid: 'none',
    dashed: '5 5',
    dotted: '2 2',
  }[data.lineStyle ?? 'dashed'];

  const animation = data.animation === 'flow'
    ? 'dashdraw 0.5s linear infinite'
    : 'none';

  return (
    <BaseEdge
      {...props}
      style={{
        stroke: data.strokeColor ?? '#94a3b8',
        strokeWidth: data.strokeWidth ?? 2,
        strokeDasharray,
        animation,
      }}
      markerStart={data.markerStart}
      markerEnd={data.markerEnd}
    />
  );
};
```

---

## Testing Requirements

### US-040 Tests
- [ ] Overlay appears adjacent to double-clicked node
- [ ] Overlay repositions when node is near edge of screen
- [ ] Overlay closes on Escape key
- [ ] Overlay closes on click outside
- [ ] Changes made in overlay are saved

### US-041 Tests
- [ ] Dropdown shows correct range based on existing steps
- [ ] Selecting step 4 when max is 3 creates step 4
- [ ] Cannot select step 5 when max is 3 (option not available)
- [ ] Step options update after adding/removing nodes

### US-042 Tests
- [ ] Clicking edge opens edge editor
- [ ] Changing arrow type updates edge immediately
- [ ] Changing line style updates edge immediately
- [ ] Settings persist after page reload

### US-043 Tests
- [ ] Dragging from left handle to right handle preserves positions
- [ ] Edge renders using correct handles
- [ ] Changing handle in editor updates edge path

### US-044 Tests
- [ ] Viewport adjusts when revealing off-screen nodes
- [ ] Viewport animation is smooth
- [ ] Toggle can disable auto-fit behavior
- [ ] Manual zoom is respected until step change

### US-045 Tests
- [ ] Cmd+C copies selected nodes to internal clipboard
- [ ] Cmd+V pastes nodes with offset position
- [ ] Pasted nodes have new unique IDs
- [ ] Multiple nodes with connecting edges are copied together
- [ ] Pasted nodes are automatically selected

### US-046 Tests
- [ ] Option+drag creates a duplicate node
- [ ] Original node remains in original position
- [ ] Duplicate gets new unique ID
- [ ] Works with multiple selected nodes
- [ ] Without Option key, normal drag behavior

### US-047 Tests
- [ ] Cmd+A selects all nodes
- [ ] Works only in editor mode
- [ ] Selected nodes can be deleted together
- [ ] Clicking canvas deselects all

### US-048 Tests
- [ ] Auto-layout button is accessible
- [ ] Layout respects step ordering
- [ ] Nodes are evenly spaced after layout
- [ ] Edges remain connected after layout
- [ ] Different layout directions work correctly

---

### US-045: Copy/Paste Nodes

**As a** user building a flow diagram
**I want** to copy and paste nodes
**So that** I can quickly duplicate similar content

**Acceptance Criteria:**
- [ ] `Cmd+C` / `Ctrl+C` copies selected node(s) to clipboard
- [ ] `Cmd+V` / `Ctrl+V` pastes copied node(s) with offset position (+20px x/y)
- [ ] Copied nodes get new unique IDs
- [ ] Pasted nodes are automatically selected
- [ ] Copy/paste works with multiple selected nodes
- [ ] Edges between copied nodes are also duplicated
- [ ] Pasted nodes get assigned to next available step (or same step as original, configurable)

**Technical Notes:**
- Store copied nodes in component state or context (not system clipboard for complex data)
- Generate new IDs using `crypto.randomUUID()` or similar

---

### US-046: Option/Alt+Drag to Duplicate

**As a** user
**I want** to hold Option (Mac) or Alt (Windows) while dragging a node to duplicate it
**So that** I can quickly create copies like in Excalidraw

**Acceptance Criteria:**
- [ ] Holding Option/Alt while starting a drag creates a duplicate
- [ ] Original node stays in place
- [ ] Duplicate follows the cursor during drag
- [ ] Duplicate gets a new unique ID
- [ ] Duplicate is selected after dropping
- [ ] Works with single node selection
- [ ] Works with multiple selected nodes (duplicates all)
- [ ] Visual indicator shows duplication mode (cursor change or ghost effect)

**Technical Notes:**
- Hook into `onNodeDragStart` and check for `event.altKey`
- Create duplicate nodes before drag completes
- May need custom drag handling

---

### US-047: Select All Nodes (Cmd+A)

**As a** user
**I want** to press Cmd+A to select all nodes
**So that** I can perform batch operations quickly

**Acceptance Criteria:**
- [ ] `Cmd+A` / `Ctrl+A` selects all nodes on the canvas
- [ ] Works in editor mode only (not presentation mode)
- [ ] Selected nodes are visually highlighted
- [ ] After select-all, can perform batch operations (delete, set step, copy)
- [ ] Pressing Cmd+A again or clicking empty canvas deselects all

**Technical Notes:**
- Use `useKeyPress` or event listener for keyboard shortcut
- Update React Flow's selection state via `setNodes` with `selected: true`

---

### US-048: Auto-Layout Feature

**As a** user with many nodes
**I want** to automatically arrange nodes in a clean layout
**So that** I don't have to manually position each node

**Acceptance Criteria:**
- [ ] "Auto Layout" button in toolbar/menu
- [ ] Offers layout direction options: Top-to-Bottom, Left-to-Right
- [ ] Respects step ordering (step 1 nodes first, then step 2, etc.)
- [ ] Maintains edge connections after layout
- [ ] Provides reasonable spacing between nodes (100-150px)
- [ ] Layout animates nodes to new positions (optional, can be instant)
- [ ] Undo-able (or confirm dialog before applying)

**Layout Algorithm Options:**
1. **Hierarchical/Tree:** Based on edge connections, root nodes at top
2. **Step-Based Grid:** Group nodes by step, arrange in columns/rows
3. **Force-Directed:** Physics-based layout (may be overkill)

**Recommended: Step-Based Hierarchical**
- Step 1 nodes in first row/column
- Step 2 nodes in second row/column
- Within each step, arrange based on connections

**Technical Notes:**
- Consider using `dagre` or `elkjs` library for layout algorithms
- React Flow has examples with dagre integration
- Apply new positions via `setNodes` with updated `position` values

**Example Layout (Top-to-Bottom):**
```
        [Step 1 Node A]
              |
    ┌─────────┴─────────┐
    ▼                   ▼
[Step 2 Node B]   [Step 2 Node C]
    |
    ▼
[Step 3 Node D]
```

---

## Out of Scope (Phase 5)

- Edge labels/annotations
- Curved edge paths (bezier)
- Edge routing around nodes
- Animation timing configuration
- Node grouping/containers
- Undo/redo functionality
- Cross-application clipboard (copy to other apps)

---

## Success Metrics

- [ ] All 9 user stories implemented and tested
- [ ] No regression in existing functionality
- [ ] Floating overlay feels responsive and well-positioned
- [ ] Edge customization is intuitive
- [ ] Copy/paste and duplicate workflows feel natural
- [ ] Auto-layout produces clean, readable diagrams
- [ ] Presentation auto-fit works smoothly

---

## Files to Modify/Create

| File | Changes |
|------|---------|
| `src/components/flow/editor/NodePropertiesPanel.tsx` | Replace Sheet with floating overlay |
| `src/components/flow/editor/EdgePropertiesPanel.tsx` | **NEW** - Edge editing overlay |
| `src/components/flow/nodes/StepBadge.tsx` | Update step options logic |
| `src/components/flow/nodes/*.tsx` | Add handle IDs |
| `src/components/flow/edges/CustomEdge.tsx` | **NEW** - Configurable edge component |
| `src/components/flow/FlowCanvas.tsx` | Keyboard shortcuts (Cmd+A, Cmd+C, Cmd+V), Alt+drag |
| `src/components/flow/editor/Toolbar.tsx` | Auto-layout button |
| `src/hooks/useFlowEditor.ts` | Handle position capture, edge data, copy/paste logic |
| `src/hooks/useFlowStepper.ts` | Auto-fit viewport logic |
| `src/hooks/useAutoLayout.ts` | **NEW** - Layout algorithm using dagre |
| `src/hooks/useClipboard.ts` | **NEW** - Copy/paste node management |
| `src/types/flow.ts` | Extended edge configuration types |
| `src/contexts/FlowEditorContext.tsx` | Edge editing state, clipboard state |

---

## Dependencies to Add

```bash
# For auto-layout functionality
npm install dagre @types/dagre
```
