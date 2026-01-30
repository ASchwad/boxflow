# React Flow Visualization Stepper - Product Requirements Document

## Overview
A graph and process flow visualization tool built on React Flow that enables step-by-step presentation of connected process flows. Think of it as a more interactive, beautiful alternative to Excalidraw for presenting workflows and processes.

## Vision
Create an elegant presentation tool where users can walk through complex processes step-by-step, with each step revealing nodes progressively along with supporting hints, annotations, and images.

---

## User Stories

### US-001: View Process Flow Canvas
**As a** presenter
**I want to** see a clean canvas with a title and subtitle
**So that** I can present a named process flow to my audience

**Acceptance Criteria:**
- [ ] Canvas displays with configurable title at the top
- [ ] Subtitle/description appears below the title
- [ ] Canvas has a clean, minimal white/light background
- [ ] React Flow attribution visible in corner

---

### US-002: Display Process Step Nodes
**As a** presenter
**I want to** see process steps as visually distinct boxes
**So that** each step in my workflow is clearly identifiable

**Acceptance Criteria:**
- [ ] Process step nodes have solid border styling
- [ ] Each node displays a title (bold/prominent)
- [ ] Each node displays a description/subtitle below the title
- [ ] Nodes have a light blue/branded background color
- [ ] Nodes have rounded corners for modern aesthetic
- [ ] Connection handles visible on node edges (top, bottom, left, right)

---

### US-003: Display Hint/Annotation Nodes
**As a** presenter
**I want to** show hints, remarks, and supplementary information
**So that** I can provide additional context without cluttering the main flow

**Acceptance Criteria:**
- [ ] Hint nodes have dashed border styling (distinct from process nodes)
- [ ] Hint nodes have a subtle purple/different tinted background
- [ ] Hint nodes can contain formatted text (including code blocks)
- [ ] Hint nodes are visually secondary to main process nodes
- [ ] Hint nodes support markdown or rich text content

---

### US-004: Display Image Nodes
**As a** presenter
**I want to** include images in my process flow
**So that** I can show screenshots, diagrams, or visual examples

**Acceptance Criteria:**
- [ ] Image nodes can display embedded images
- [ ] Images scale appropriately within node bounds
- [ ] Image nodes have optional caption/title
- [ ] Supports common image formats (PNG, JPG, SVG, GIF)

---

### US-005: Animated Edge Connections
**As a** presenter
**I want to** see animated dashed edges between nodes
**So that** the flow direction is clear and visually engaging

**Acceptance Criteria:**
- [ ] Edges render as dashed lines
- [ ] Edges have subtle animation (flowing dots/dashes)
- [ ] Edges connect from source handle to target handle
- [ ] Edge paths are smooth (bezier or step curves)
- [ ] Edges support different colors/styles per connection type

---

### US-006: Step-by-Step Presentation Mode
**As a** presenter
**I want to** reveal nodes one step at a time
**So that** I can walk my audience through the process progressively

**Acceptance Criteria:**
- [ ] "Next" button advances to reveal the next step
- [ ] "Previous" button goes back to hide the last revealed step
- [ ] Step counter shows "Step X of Y" (e.g., "Step 2 of 10")
- [ ] "Reset" button returns to initial state (step 0 or step 1)
- [ ] Nodes fade in smoothly when revealed
- [ ] Edges animate in when their connected nodes are both visible
- [ ] Hidden nodes are not rendered (not just transparent)

---

### US-007: Zoom and Pan Controls
**As a** presenter
**I want to** zoom in/out and pan around the canvas
**So that** I can focus on specific areas or show the full picture

**Acceptance Criteria:**
- [ ] Zoom in (+) button increases zoom level
- [ ] Zoom out (-) button decreases zoom level
- [ ] Fit-to-screen/fullscreen button available
- [ ] Mouse scroll wheel zooms in/out
- [ ] Click and drag pans the canvas
- [ ] Zoom controls positioned on left side of canvas

---

### US-008: Keyboard Navigation
**As a** presenter
**I want to** use keyboard shortcuts for navigation
**So that** I can present smoothly without clicking buttons

**Acceptance Criteria:**
- [ ] Right arrow / Space advances to next step
- [ ] Left arrow goes to previous step
- [ ] Home key resets to beginning
- [ ] End key jumps to final step
- [ ] Escape exits fullscreen (if applicable)

---

### US-009: Auto-Focus on Current Step
**As a** presenter
**I want to** have the viewport auto-center on newly revealed nodes
**So that** the audience always sees the relevant content

**Acceptance Criteria:**
- [ ] When advancing steps, viewport smoothly pans to center new node(s)
- [ ] Zoom level adjusts if needed to fit new content
- [ ] Animation is smooth (not jarring)
- [ ] Option to disable auto-focus if desired

---

### US-010: Define Flow via JSON Configuration
**As a** developer/content creator
**I want to** define the flow structure via a JSON file
**So that** I can easily create and modify presentations

**Acceptance Criteria:**
- [ ] Flow data loaded from JSON configuration
- [ ] JSON schema supports nodes (type, position, content)
- [ ] JSON schema supports edges (source, target, style)
- [ ] JSON schema supports step ordering (which step reveals which nodes)
- [ ] JSON schema supports metadata (title, subtitle, settings)
- [ ] Invalid JSON shows helpful error messages

---

## Node Types Summary

| Node Type | Border | Background | Use Case |
|-----------|--------|------------|----------|
| Process Step | Solid | Light blue | Main workflow steps |
| Hint/Annotation | Dashed | Light purple | Supplementary info, code examples |
| Image | Solid/None | Transparent | Screenshots, diagrams |

---

## Technical Architecture

### Tech Stack
- **Framework**: React + TypeScript
- **Flow Library**: React Flow (xyflow)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Build Tool**: Vite

### Key Components
```
src/
├── components/
│   ├── flow/
│   │   ├── Canvas.tsx           # Main React Flow wrapper
│   │   ├── nodes/
│   │   │   ├── ProcessStepNode.tsx
│   │   │   ├── HintNode.tsx
│   │   │   └── ImageNode.tsx
│   │   ├── edges/
│   │   │   └── AnimatedDashedEdge.tsx
│   │   └── controls/
│   │       └── StepperControls.tsx
│   └── ui/                      # shadcn components
├── hooks/
│   ├── useFlowStepper.ts        # Step state management
│   └── useKeyboardNavigation.ts
├── types/
│   └── flow.ts                  # TypeScript interfaces
├── data/
│   └── sample-flow.json         # Example flow definition
└── lib/
    └── flow-utils.ts            # Helper functions
```

---

## Implementation Tasks

### Phase 1: Project Setup & Basic Canvas
- [ ] **T-001**: Initialize React project from boilerplate
- [ ] **T-002**: Install and configure React Flow
- [ ] **T-003**: Create basic Canvas component with React Flow
- [ ] **T-004**: Add title/subtitle header component
- [ ] **T-005**: Configure Tailwind and base styling

### Phase 2: Custom Node Types
- [ ] **T-006**: Create ProcessStepNode component
- [ ] **T-007**: Create HintNode component with dashed border
- [ ] **T-008**: Create ImageNode component
- [ ] **T-009**: Register custom node types with React Flow
- [ ] **T-010**: Style nodes according to design specs

### Phase 3: Edge Styling
- [ ] **T-011**: Create AnimatedDashedEdge component
- [ ] **T-012**: Add CSS animation for flowing dashes
- [ ] **T-013**: Configure edge routing (bezier/smooth step)

### Phase 4: Stepper Functionality
- [ ] **T-014**: Create useFlowStepper hook for state management
- [ ] **T-015**: Implement step-based node visibility logic
- [ ] **T-016**: Create StepperControls component (Previous/Next/Reset)
- [ ] **T-017**: Add step counter display
- [ ] **T-018**: Implement fade-in animation for revealed nodes

### Phase 5: Navigation & UX
- [ ] **T-019**: Add keyboard navigation hook
- [ ] **T-020**: Implement auto-focus/pan to current step
- [ ] **T-021**: Add zoom controls (+/-/fit)
- [ ] **T-022**: Smooth viewport transitions

### Phase 6: Data & Configuration
- [ ] **T-023**: Define TypeScript types for flow configuration
- [ ] **T-024**: Create JSON schema for flow definition
- [ ] **T-025**: Build sample flow JSON (demo data)
- [ ] **T-026**: Implement flow data loading

### Phase 7: Polish & Demo
- [ ] **T-027**: Final styling refinements
- [ ] **T-028**: Create compelling demo flow
- [ ] **T-029**: Add error boundaries and loading states
- [ ] **T-030**: Documentation and README

---

## JSON Schema (Draft)

```json
{
  "meta": {
    "title": "How Ralph Works with Amp",
    "subtitle": "Autonomous AI agent loop for completing PRDs",
    "version": "1.0"
  },
  "nodes": [
    {
      "id": "step-1",
      "type": "processStep",
      "position": { "x": 250, "y": 150 },
      "data": {
        "title": "You write a PRD",
        "description": "Define what you want to build"
      },
      "revealAtStep": 1
    },
    {
      "id": "step-2",
      "type": "processStep",
      "position": { "x": 350, "y": 300 },
      "data": {
        "title": "Convert to prd.json",
        "description": "Break into small user stories"
      },
      "revealAtStep": 2
    },
    {
      "id": "hint-1",
      "type": "hint",
      "position": { "x": 600, "y": 280 },
      "data": {
        "content": "{\n  \"id\": \"US-001\",\n  \"title\": \"Add priority field\",\n  ...\n}"
      },
      "revealAtStep": 2
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "step-1",
      "target": "step-2",
      "animated": true,
      "style": "dashed"
    }
  ],
  "settings": {
    "autoFocus": true,
    "animationDuration": 300
  }
}
```

---

## Development Workflow Requirements

### Testing
- **UI Validation**: After implementing UI changes, use the UI Validator agent (Playwright MCP) to take screenshots and verify the implementation visually
- Run UI validation before considering any user story complete

### Version Control
- **Commit after each user story**: Create a git commit after completing each user story
- Use conventional commit format: `feat(scope): description`
- Example: `feat(nodes): implement ProcessStepNode component`

---

## Success Metrics
- Smooth step transitions (< 300ms animation)
- Intuitive keyboard navigation
- Clean, professional visual design
- Easy to create new flows via JSON
- Works on modern browsers (Chrome, Firefox, Safari, Edge)

---

## Out of Scope (v1)
- Flow editor/builder UI
- Saving/exporting flows
- Collaborative editing
- Mobile-specific optimizations
- Dark mode (can add later)
- Custom theming

---

## References
- [React Flow Documentation](https://reactflow.dev/)
- [React Flow GitHub](https://github.com/xyflow/xyflow)
- [shadcn/ui](https://ui.shadcn.com/)
