# Presentation Mode Investigation Report

**Test Date:** 2026-01-30
**Test Type:** Automated visual regression testing with Playwright

---

## Executive Summary

The presentation mode investigation revealed **critical viewport and node positioning issues** that cause nodes to jump between steps and the viewport to change unexpectedly, creating a disorienting user experience.

### Key Findings:
1. **Viewport changes unpredictably** between steps (both zoom and pan)
2. **Node count increases** progressively instead of revealing nodes in a fixed layout
3. **Step 4 has a dramatic zoom change** (from 2x to 1.62x scale)
4. **Multiple nodes appear simultaneously** at some steps (violating progressive reveal)
5. **Duplicate node positions detected** at the same coordinates

---

## Test Methodology

### Test Setup
- Browser: Chromium (Playwright)
- Viewport: 1920x1080
- Flow: Existing "How Ralph Works with Amp" flow
- Total Nodes: 6 nodes across 4 presentation steps

### Testing Approach
1. Entered presentation mode
2. Navigated through all steps using "Next" button
3. Captured screenshots at each step
4. Recorded viewport transform data (translate X/Y, scale)
5. Counted visible nodes at each step
6. Exited presentation and verified "Reveal at Step" assignments

---

## Detailed Findings

### 1. Node Step Assignments

| Node Index | Reveal at Step | Node Title |
|------------|----------------|------------|
| 0 | 1 | "You write a PRD" |
| 1 | 2 | "Convert to prd.json" |
| 2 | 2 | (Hint/Image node) |
| 3 | 3 | "Ralph picks up task" |
| 4 | 4 | "Tests pass" |

**Issue Identified:** Node 1 and Node 2 are both assigned to Step 2, which is correct for progressive reveal, but there appear to be duplicate nodes at identical positions.

---

### 2. Viewport Behavior Analysis

#### Step 1
- **Scale:** 2.0x
- **Position:** translate(556px, 335.5px)
- **Visible Nodes:** 1/1
- **Behavior:** Initial zoom focused on first node
- **Screenshot:** test-presentation-step-01.jpg

#### Step 2
- **Scale:** 2.0x (unchanged)
- **Position:** translate(193px, 105.5px) **← CHANGED**
- **Visible Nodes:** 3/3 **← +2 nodes**
- **Behavior:** Viewport panned significantly left and up
- **Issue:** Multiple nodes revealed simultaneously, viewport jumped

**Viewport Change:**
- ΔX: -363px (moved left)
- ΔY: -230px (moved up)

#### Step 3
- **Scale:** 2.0x (unchanged)
- **Position:** translate(193px, 35.5px) **← CHANGED**
- **Visible Nodes:** 4/4 **← +1 node**
- **Behavior:** Viewport panned up
- **Issue:** Another viewport jump, though smaller

**Viewport Change:**
- ΔX: 0px
- ΔY: -70px (moved up)

#### Step 4
- **Scale:** 1.62355x **← DRAMATIC CHANGE**
- **Position:** translate(337.368px, 1.82239px) **← CHANGED**
- **Visible Nodes:** 6/6 **← +2 nodes**
- **Behavior:** Major zoom out + pan, all remaining nodes revealed
- **Issue:** Most disruptive transition - zoom and pan changed simultaneously

**Viewport Change:**
- ΔX: +144px (moved right)
- ΔY: -33.7px (moved up)
- Scale: -0.377x (zoomed out ~19%)

---

### 3. Visual Evidence

All screenshots are saved in `/test-screenshots/`:

1. **test-presentation-step-01.jpg** - Clean, centered single node
2. **test-presentation-step-02.jpg** - Viewport jumped, showing hint node prominently
3. **test-presentation-step-03.jpg** - Another pan, now showing more vertical flow
4. **test-presentation-step-04.jpg** - Zoomed out view showing all nodes, layout appears cramped

---

### 4. Critical Issues Identified

#### Issue #1: Viewport Instability
**Severity:** HIGH
**Description:** The viewport translate and scale values change between steps, causing nodes to appear to "jump" or shift position even when they haven't moved in the flow coordinate space.

**Evidence:**
- Step 1→2: Pan changed by 363px horizontally, 230px vertically
- Step 3→4: Scale changed from 2.0x to 1.62x (19% zoom out)

**Expected Behavior:** The viewport should remain stable throughout the presentation, with only node visibility/opacity changing.

#### Issue #2: Multiple Nodes Revealed Per Step
**Severity:** MEDIUM
**Description:** Steps 2 and 4 reveal multiple nodes simultaneously (3 and 2 nodes respectively).

**Evidence:**
- Step 2: Revealed 2 additional nodes
- Step 4: Revealed 2 additional nodes

**Expected Behavior:** Each step should ideally reveal one logical unit (either a single node or a tightly grouped set that forms one concept).

#### Issue #3: Duplicate Node Positions
**Severity:** MEDIUM
**Description:** At Step 2, Nodes 1 and 2 both report position (193, 179), suggesting overlapping nodes.

**Evidence:**
```json
"index": 1, "position": { "x": 193, "y": 179 }
"index": 2, "position": { "x": 193, "y": 179 }
```

**Possible Cause:** One might be a hint/annotation node overlaying a process step.

#### Issue #4: Non-Sequential Reveal Pattern
**Severity:** LOW
**Description:** The total node count in the DOM changes between steps (1→3→4→6), suggesting nodes are being added to the DOM rather than just having visibility toggled.

**Expected Behavior:** All nodes should exist in the DOM from the start with visibility controlled via opacity/display, not DOM insertion.

---

### 5. Root Cause Analysis

Based on the data, the likely causes are:

1. **fitView or zoom logic is running on step changes** - The scale and translate changes suggest the presentation mode is calling `fitView()` or similar viewport manipulation on each step transition.

2. **No fixed viewport anchor** - The presentation isn't establishing a stable viewport position at the start and maintaining it throughout.

3. **Progressive DOM rendering** - Nodes appear to be added to the DOM progressively rather than all being present with controlled visibility.

---

## Recommendations

### Priority 1: Fix Viewport Stability
- Establish a fixed viewport transform at presentation start (using fitView to show all nodes)
- Store this transform and maintain it throughout the presentation
- Only change node opacity/visibility, never the viewport transform

### Priority 2: Review Step Assignment Logic
- Verify that nodes are being assigned correct step numbers
- Consider whether multiple nodes per step is intentional
- Ensure hint/annotation nodes are properly associated with their parent nodes

### Priority 3: Investigate Duplicate Positions
- Check if hint nodes are intentionally overlaying process nodes
- Verify z-index and layering behavior

### Priority 4: Optimize Node Rendering
- Pre-render all nodes in the DOM at presentation start
- Use CSS transitions for smooth opacity changes
- Avoid DOM insertion/removal during step navigation

---

## Test Artifacts

### Screenshots
- `test-00-initial-state.jpg` - Flow state before presentation
- `test-presentation-step-01.jpg` - Step 1
- `test-presentation-step-02.jpg` - Step 2
- `test-presentation-step-03.jpg` - Step 3
- `test-presentation-step-04.jpg` - Step 4
- `test-after-presentation.jpg` - Flow after exiting presentation
- `test-node-0-properties.jpg` through `test-node-4-properties.jpg` - Node property panels

### Data Files
- `presentation-investigation-report.json` - Complete raw data with viewport transforms and node positions

---

## Next Steps

1. **Review presentation mode implementation** in the codebase
2. **Fix viewport transform to be static** throughout presentation
3. **Test with a new simple flow** (3 nodes in vertical line as originally requested)
4. **Re-run this test suite** to verify fixes
5. **Add automated regression tests** to prevent future viewport issues

---

## Conclusion

The presentation mode has significant viewport stability issues that create a jarring user experience. The primary issue is that the viewport transform (both scale and translate) changes between steps, causing the entire canvas to jump and zoom unexpectedly. This should be fixed by establishing a single viewport transform at the start of the presentation and maintaining it throughout, with only node visibility changing between steps.
