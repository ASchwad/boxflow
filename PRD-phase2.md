# React Flow Visualization Stepper - Phase 2 PRD

## Overview
Phase 2 adds a visual editor for creating and editing process flows, plus fixes layout and rendering issues from Phase 1.

**Design Decision:** Editor is the default home view. Presentation is a "playback" mode accessed via a "Present" button (like PowerPoint/Keynote).

---

## Part A: Bug Fixes

### BUG-001: Fix Node Overlapping
**Problem:** Nodes overlap each other when displayed, making content unreadable.

**Acceptance Criteria:**
- [ ] Review and adjust node positions in sample-flow.json to prevent overlap
- [ ] Ensure adequate spacing between all nodes (minimum 100px gap)
- [ ] Hint nodes positioned to the right of related process nodes

---

### BUG-002: Fix Image Node Not Rendering
**Problem:** Image nodes show empty dashed box instead of the actual image.

**Acceptance Criteria:**
- [ ] Images load and display correctly from URLs
- [ ] Add loading state (spinner or skeleton) while image loads
- [ ] Add error state with fallback placeholder if image fails to load
- [ ] Test with real image URLs

---

## Part B: Editor Mode (Default View)

### US-011: Editor as Default Home View
**As a** user
**I want to** land in Editor mode when I open the app
**So that** I can immediately start creating or editing my flow

**Acceptance Criteria:**
- [ ] App opens in Editor mode by default
- [ ] All nodes visible on canvas (no step-based hiding)
- [ ] Header shows flow title (editable) + "Present" button + "Export" button
- [ ] Left sidebar shows node palette for adding new nodes
- [ ] Stepper controls NOT visible in Editor mode
- [ ] Nodes are draggable and selectable

---

### US-012: Node Palette Sidebar
**As a** user
**I want to** see available node types in a sidebar
**So that** I can add new nodes to my flow

**Acceptance Criteria:**
- [ ] Left sidebar with node type options: Process Step, Hint, Image
- [ ] Each option shows icon and label
- [ ] Drag node type from sidebar onto canvas to create
- [ ] Or click node type, then click on canvas to place
- [ ] New node gets default content ("New Step", "New Hint", etc.)
- [ ] New node assigned to step = highest existing step + 1

---

### US-012b: Right-Click Context Menu to Add Nodes
**As a** user
**I want to** right-click on the canvas to add a node at that position
**So that** I can quickly add nodes exactly where I want them

**Acceptance Criteria:**
- [ ] Right-click on empty canvas area shows context menu
- [ ] Context menu options: "Add Process Step", "Add Hint", "Add Image"
- [ ] Selecting an option creates node at the click position
- [ ] New node gets default content
- [ ] New node assigned to step = highest existing step + 1
- [ ] Context menu closes after selection or clicking elsewhere
- [ ] Menu styled consistently with app (shadcn dropdown)

---

### US-013: Drag Nodes to Reposition
**As a** user
**I want to** drag nodes to reposition them on the canvas
**So that** I can arrange my flow layout

**Acceptance Criteria:**
- [ ] Nodes are draggable in Editor mode
- [ ] Node position updates in real-time while dragging
- [ ] Position persists after releasing
- [ ] Visual feedback on drag (slight shadow/lift effect)

---

### US-014: Create Edge Connections
**As a** user
**I want to** connect nodes by dragging between handles
**So that** I can define the flow relationships

**Acceptance Criteria:**
- [ ] Drag from source handle to target handle creates edge
- [ ] Visual feedback while dragging (line follows cursor)
- [ ] Edge appears with animated dashed style
- [ ] Cannot create duplicate edges between same nodes
- [ ] Cannot connect node to itself

---

### US-015: Select and Delete Nodes/Edges
**As a** user
**I want to** delete nodes and edges I don't need
**So that** I can remove mistakes or unwanted elements

**Acceptance Criteria:**
- [ ] Click to select node or edge (visual selection highlight)
- [ ] Press Delete or Backspace to remove selected item
- [ ] Deleting a node also removes its connected edges
- [ ] Multi-select with Shift+Click or drag selection box
- [ ] Delete multiple selected items at once

---

### US-016: Edit Node Content
**As a** user
**I want to** edit node content by clicking on it
**So that** I can customize the information displayed

**Acceptance Criteria:**
- [ ] Double-click node opens edit panel (right sidebar or modal)
- [ ] ProcessStep node: Edit title, description, reveal step
- [ ] Hint node: Edit content text, toggle code formatting, reveal step
- [ ] Image node: Edit image URL, alt text, caption, width, reveal step
- [ ] "Save" button applies changes, "Cancel" discards
- [ ] Changes reflect immediately on canvas after save

---

### US-017: Edit Flow Title and Subtitle
**As a** user
**I want to** edit the flow title and subtitle
**So that** I can name and describe my presentation

**Acceptance Criteria:**
- [ ] Click on title in header to edit inline
- [ ] Click on subtitle to edit inline
- [ ] Press Enter or click outside to save
- [ ] Press Escape to cancel edit

---

## Part C: Presentation Mode

### US-018: Enter Presentation Mode
**As a** user
**I want to** click "Present" to start my presentation
**So that** I can walk through my flow step-by-step

**Acceptance Criteria:**
- [ ] "Present" button in header (with play icon ▶)
- [ ] Clicking "Present" enters Presentation mode
- [ ] Presentation starts at Step 1
- [ ] Sidebar hidden, clean fullscreen-like view
- [ ] Stepper controls appear at bottom (Previous, Step X of Y, Next, Reset)
- [ ] Auto-focus enabled (viewport centers on current step nodes)
- [ ] Keyboard navigation works (Arrow keys, Space, Home, End)

---

### US-019: Exit Presentation Mode
**As a** user
**I want to** exit presentation and return to the editor
**So that** I can continue editing my flow

**Acceptance Criteria:**
- [ ] "Exit" button (X) visible in top-right during presentation
- [ ] Press Escape key to exit presentation
- [ ] Returns to Editor mode with full flow visible
- [ ] Any position/zoom changes during presentation don't affect editor view

---

## Part D: Persistence

### US-020: Export Flow to JSON
**As a** user
**I want to** export my flow as a JSON file
**So that** I can save and share my work

**Acceptance Criteria:**
- [ ] "Export" button in header (download icon)
- [ ] Downloads flow as .json file
- [ ] Filename based on title: "my-flow-title.json"
- [ ] JSON matches FlowConfig schema exactly

---

### US-021: Import Flow from JSON
**As a** user
**I want to** import a flow from a JSON file
**So that** I can load previously saved work

**Acceptance Criteria:**
- [ ] "Import" button or drag-drop zone
- [ ] File picker to select .json file
- [ ] Validates JSON structure before loading
- [ ] Shows error toast if invalid JSON
- [ ] Replaces current flow with imported data
- [ ] Prompts "Unsaved changes will be lost" if current flow modified

---

### US-022: Auto-Save to Local Storage
**As a** user
**I want to** have my flow auto-saved locally
**So that** I don't lose work if I close the browser

**Acceptance Criteria:**
- [ ] Flow auto-saves to localStorage on every change (debounced 1s)
- [ ] Auto-loads from localStorage on app start (if exists)
- [ ] "New Flow" button starts fresh flow (clears localStorage)
- [ ] Visual indicator: "All changes saved" or "Saving..."

---

## UI Layout

### Editor Mode (Default)
```
┌──────────────────────────────────────────────────────────────┐
│  [+] My Flow Title              [Import] [Export] [▶ Present]│
│      Click to edit subtitle                                  │
├────────┬─────────────────────────────────────────────────────┤
│ NODES  │                                                     │
│        │     ┌─────────┐         ┌─────────┐                │
│ □ Step │     │ Step 1  │─────────│ Step 2  │                │
│        │     │ ①       │         │ ②       │                │
│ □ Hint │     └─────────┘         └─────────┘                │
│        │                              │                      │
│ □ Image│                         ┌────┴────┐                │
│        │                         │  Hint   │                │
│        │                         │  ②      │                │
│        │                         └─────────┘                │
├────────┴─────────────────────────────────────────────────────┤
│ All changes saved                              [Zoom] [Fit]  │
└──────────────────────────────────────────────────────────────┘

① ② = Step number badges on nodes
```

### Presentation Mode
```
┌──────────────────────────────────────────────────────────────┐
│  My Flow Title                                        [✕]   │
│  Click to edit subtitle                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    ┌─────────────┐                          │
│                    │   Step 1    │                          │
│                    │ You write   │                          │
│                    │ a PRD       │                          │
│                    └─────────────┘                          │
│                                                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│         [◀ Previous]   Step 1 of 4   [Next ▶]   [↺]        │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Phase 2A: Bug Fixes (Do First)
1. BUG-001: Fix node overlapping
2. BUG-002: Fix image node rendering

### Phase 2B: Editor Foundation
3. US-011: Editor as default home view
4. US-013: Drag nodes to reposition
5. US-014: Create edge connections
6. US-015: Select and delete nodes/edges

### Phase 2C: Node Creation & Editing
7. US-012: Node palette sidebar
8. US-012b: Right-click context menu to add nodes
9. US-016: Edit node content
10. US-017: Edit flow title/subtitle

### Phase 2D: Presentation Mode
11. US-018: Enter presentation mode
12. US-019: Exit presentation mode

### Phase 2E: Persistence
13. US-020: Export to JSON
14. US-021: Import from JSON
15. US-022: Auto-save to localStorage

---

## Out of Scope (Phase 2)
- Undo/redo history
- Copy/paste nodes
- Multi-user collaboration
- Cloud storage
- Templates library
- Presentation recording

---

## Success Metrics
- All Phase 1 bugs resolved
- User can create complete flow without editing JSON
- Flows persist across browser sessions
- Seamless transition between Editor and Presentation modes
