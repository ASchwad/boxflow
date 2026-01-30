# Root Cause Analysis: Presentation Mode Viewport Jumping

**Date:** 2026-01-30
**Issue:** Viewport changes (zoom/pan) between presentation steps causing jarring user experience
**File:** `/src/components/flow/FlowCanvas.tsx`

---

## Root Cause Identified

**Lines 98-108 in FlowCanvas.tsx:**

```tsx
// Auto-focus in presentation mode
const focusOnVisibleNodes = useCallback(() => {
  if (editor.mode === 'presentation') {
    setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: 300,
        nodes: stepper.visibleNodes,  // ← PROBLEM: Only fits to visible nodes
      });
    }, 50);
  }
}, [fitView, stepper.visibleNodes, editor.mode]);
```

**Lines 110-114:**

```tsx
useEffect(() => {
  if (editor.mode === 'presentation') {
    focusOnVisibleNodes();  // ← Called on EVERY step change
  }
}, [stepper.currentStep, focusOnVisibleNodes, editor.mode]);
```

---

## The Problem

### What's Happening:
1. **On every step change**, the `useEffect` on line 110 triggers
2. This calls `focusOnVisibleNodes()` which calls `fitView()`
3. `fitView()` is passed **only the currently visible nodes** via `nodes: stepper.visibleNodes`
4. React Flow's `fitView()` calculates a viewport transform that fits ONLY those visible nodes
5. As different nodes become visible, the viewport recalculates to fit the new subset
6. This causes the viewport to zoom and pan to accommodate the changing set of visible nodes

### Why This Causes Jumping:

**Step 1:**
- Visible: 1 node ("You write a PRD")
- `fitView()` zooms to 2x and centers on this single node
- Result: `translate(556px, 335.5px) scale(2)`

**Step 2:**
- Visible: 3 nodes (added "Convert to prd.json" + hint)
- `fitView()` recalculates to fit all 3 nodes
- Nodes are in different positions, so viewport must pan
- Result: `translate(193px, 105.5px) scale(2)` ← Position jumped!

**Step 3:**
- Visible: 4 nodes (added "Ralph picks up task")
- `fitView()` recalculates to fit all 4 nodes
- Result: `translate(193px, 35.5px) scale(2)` ← Position jumped again!

**Step 4:**
- Visible: 6 nodes (all nodes revealed)
- `fitView()` must zoom out to fit everything
- Result: `translate(337.368px, 1.82239px) scale(1.62355)` ← Both zoom AND position changed!

---

## Evidence from Test Data

From `presentation-investigation-report.json`:

| Step | Scale | Translate X | Translate Y | Visible Nodes | Change |
|------|-------|-------------|-------------|---------------|---------|
| 1 | 2.0 | 556px | 335.5px | 1 | Initial |
| 2 | 2.0 | 193px | 105.5px | 3 | Pan -363px, -230px |
| 3 | 2.0 | 193px | 35.5px | 4 | Pan 0px, -70px |
| 4 | 1.62 | 337px | 1.8px | 6 | Zoom -19%, Pan +144px, -33px |

**Every single step transition causes a viewport change.**

---

## Expected Behavior

In a professional presentation tool (PowerPoint, Google Slides, Prezi), the viewport should:
1. **Establish a fixed frame at the start** that shows the entire presentation area
2. **Maintain that frame throughout** the presentation
3. **Only change element visibility/opacity** between slides/steps
4. **Never pan or zoom** unless explicitly triggered by the user

For this flow visualization stepper, the expected behavior should be:
1. When entering presentation mode, `fitView()` should be called **once** with **ALL nodes** (not just visible ones)
2. This establishes the viewport that shows the complete flow
3. As the user navigates steps, **only node opacity changes**, viewport stays fixed
4. The user sees nodes "appearing" in their correct positions within a stable frame

---

## The Fix

### Solution: Fit to ALL nodes once, then maintain viewport

**Change from:**
```tsx
// Current: Fit to visible nodes on every step
useEffect(() => {
  if (editor.mode === 'presentation') {
    focusOnVisibleNodes();  // Recalculates on each step
  }
}, [stepper.currentStep, focusOnVisibleNodes, editor.mode]);
```

**Change to:**
```tsx
// Fixed: Fit to ALL nodes only when entering presentation mode
useEffect(() => {
  if (editor.mode === 'presentation') {
    // Fit to ALL nodes once when entering presentation
    setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: 300,
        // Don't filter nodes - fit to ALL of them
      });
    }, 50);
  }
}, [editor.mode, fitView]);  // Only depend on mode, not currentStep
```

### Key Changes:
1. **Remove `nodes: stepper.visibleNodes`** - this tells fitView to fit ALL nodes, not just visible ones
2. **Remove dependency on `stepper.currentStep`** - prevents re-running on step changes
3. **Only depend on `editor.mode`** - runs once when entering presentation, not on every step
4. **Remove `focusOnVisibleNodes` function** - no longer needed

---

## Additional Considerations

### Zoom Controls
If users want to zoom in on specific parts during presentation:
- Let them use the existing zoom controls (they're visible in the screenshots)
- Or add explicit "Focus on this node" buttons
- But don't auto-zoom on step changes

### Animation
The current implementation has `duration: 300` which creates a 300ms animation. This should be:
- **Kept for initial presentation entry** (smooth transition from edit mode)
- **Removed for step transitions** since the viewport shouldn't change anyway

### Alternative: Progressive Zoom
If the design intent is to zoom in on each new node:
- This should be an **optional feature**, not default behavior
- Add a setting: "Auto-focus on new nodes"
- When enabled, smoothly pan/zoom to highlight the newly revealed node
- When disabled, maintain stable viewport (recommended default)

---

## Impact Assessment

### Before Fix:
- Viewport changes on every step transition
- Scale changes by up to 19% between steps
- Position jumps by hundreds of pixels
- Disorienting user experience
- Difficult to track node relationships

### After Fix:
- Viewport established once and remains stable
- All nodes visible in their final positions from the start
- Only opacity/visibility changes between steps
- Smooth, predictable user experience
- Easy to see how flow builds progressively

---

## Testing Recommendation

After implementing the fix:

1. **Manual Test:**
   - Enter presentation mode
   - Navigate through all steps
   - Verify viewport doesn't move or zoom
   - Verify nodes appear in correct positions

2. **Automated Test:**
   - Run `presentation-investigation.js` script again
   - Verify all steps have identical viewport transform
   - Verify only `visibleCount` changes, not scale or translate

3. **Visual Regression:**
   - Take screenshots at each step
   - Compare viewport stability
   - Ensure node positions remain consistent

---

## Files to Modify

1. **Primary:**
   - `/src/components/flow/FlowCanvas.tsx` (lines 98-114)

2. **Secondary (if needed):**
   - Remove or refactor `focusOnVisibleNodes` function
   - Update any tests that expect viewport changes

3. **Documentation:**
   - Update README with presentation mode behavior
   - Document the "fit all nodes" strategy

---

## Conclusion

The viewport jumping issue is caused by calling `fitView({ nodes: stepper.visibleNodes })` on every step change. This recalculates the viewport to fit only the currently visible nodes, causing continuous zoom and pan changes.

The fix is simple: call `fitView()` once without the `nodes` parameter when entering presentation mode, establishing a stable viewport that shows all nodes, then only change node visibility as the user navigates steps.

This will create a smooth, professional presentation experience where users can see the flow progressively build within a stable, predictable frame.
