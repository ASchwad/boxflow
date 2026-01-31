import { useEffect, useCallback, useRef, useState, useMemo, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnSelectionChangeFunc,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { EditorHeader } from './EditorHeader';
import { PresentationHeader } from './PresentationHeader';
import { StepperControls } from './controls/StepperControls';
import { NodePalette } from './editor/NodePalette';
import { CanvasContextMenu } from './editor/CanvasContextMenu';
import { NodeContextMenu } from './editor/NodeContextMenu';
import { NodePropertiesPanel } from './editor/NodePropertiesPanel';
import { EdgePropertiesPanel } from './editor/EdgePropertiesPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { useFlowStepper } from '@/hooks/useFlowStepper';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAutoLayout, type LayoutDirection } from '@/hooks/useAutoLayout';
import { FlowEditorProvider } from '@/contexts/FlowEditorContext';
import type { FlowConfig } from '@/types/flow';
import { toast } from 'sonner';

import sampleFlowConfig from '@/data/sample-flow.json';

interface FlowCanvasProps {
  initialConfig?: FlowConfig;
}

// Clipboard state for copy/paste (stored outside component to persist across re-renders)
let clipboard: { nodes: Node[]; edges: { id: string; source: string; target: string; type?: string }[] } | null = null;

function FlowCanvasInner({ initialConfig = sampleFlowConfig as FlowConfig }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition, getViewport } = useReactFlow();
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const editor = useFlowEditor({ initialConfig });

  // Auto-save to localStorage
  const autoSave = useAutoSave({
    nodes: editor.nodes,
    edges: editor.edges,
    meta: editor.meta,
    getConfig: editor.getConfig,
    loadConfig: editor.loadConfig,
  });

  // Auto-layout functionality
  const { applyLayout } = useAutoLayout({
    nodes: editor.nodes,
    edges: editor.edges,
    setNodes: editor.setNodes,
  });

  // Handle auto-layout with toast notification
  const handleAutoLayout = useCallback(
    (direction: LayoutDirection) => {
      applyLayout(direction);
      toast.success(`Layout applied: ${direction === 'TB' ? 'Top to Bottom' : 'Left to Right'}`);
      // Fit view after layout
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 50);
    },
    [applyLayout, fitView]
  );

  // Handle click-to-add from palette (adds node at viewport center)
  const handlePaletteAdd = useCallback(
    (type: string) => {
      if (!reactFlowWrapper.current) return;

      const { x, y, zoom } = getViewport();
      const rect = reactFlowWrapper.current.getBoundingClientRect();

      // Calculate center of viewport in flow coordinates
      const centerX = (-x + rect.width / 2) / zoom;
      const centerY = (-y + rect.height / 2) / zoom;

      editor.addNode(type, { x: centerX, y: centerY });

      // Smooth pan to ensure new node is visible (US-032)
      setTimeout(() => {
        // Fit view to include all nodes with focus on the area where node was added
        fitView({
          padding: 0.3,
          duration: 300,
          maxZoom: zoom, // Don't zoom in more than current zoom
        });
      }, 50);
    },
    [getViewport, editor, fitView]
  );

  // Handle drop from palette
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      editor.addNode(type, position);
      // No fitView for drag-drop - user placed it where they wanted (US-032)
    },
    [screenToFlowPosition, editor]
  );

  // Handle context menu add with viewport reposition (US-032)
  const handleContextMenuAdd = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const currentZoom = getViewport().zoom;
      editor.addNode(type, position);

      // Smooth pan to ensure new node is visible
      setTimeout(() => {
        fitView({
          padding: 0.3,
          duration: 300,
          maxZoom: currentZoom, // Don't zoom in more than current zoom
        });
      }, 50);
    },
    [editor, fitView, getViewport]
  );

  // Prepare nodes for stepper - ensure revealAtStep is always defined
  const stepperNodes = useMemo(() =>
    editor.nodes.map((n) => ({
      ...n,
      data: { ...n.data, revealAtStep: (n.data?.revealAtStep as number) ?? 1 },
    })),
    [editor.nodes]
  );

  // Stepper for presentation mode
  const stepper = useFlowStepper({
    nodes: stepperNodes,
    edges: editor.edges,
  });

  // Reset stepper and fit viewport when entering presentation mode
  useEffect(() => {
    if (editor.mode === 'presentation') {
      // Close any open editing panels
      setEditingNode(null);
      setEditingEdge(null);

      // Reset to step 1 when entering presentation
      stepper.reset();

      // Fit to ALL nodes so viewport stays stable during presentation
      setTimeout(() => {
        fitView({
          padding: 0.3,
          duration: 400,
          nodes: editor.nodes,
        });
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.mode, fitView]); // Only trigger on mode change, NOT on step change

  // Auto-fit viewport when new nodes become visible in presentation mode
  useEffect(() => {
    if (editor.mode !== 'presentation') return;
    if (stepper.newlyVisibleNodeIds.length === 0) return;
    if (stepper.currentStep === 1) return; // Don't re-fit on step 1 (already done on enter)

    // Fit view to include all currently visible nodes
    setTimeout(() => {
      fitView({
        padding: 0.2,
        duration: 400,
        nodes: stepper.visibleNodes,
      });
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.mode, stepper.currentStep, stepper.newlyVisibleNodeIds.length]);

  // Keyboard navigation (only in presentation mode)
  useKeyboardNavigation({
    onNext: stepper.next,
    onPrevious: stepper.previous,
    onReset: stepper.reset,
    onGoToEnd: stepper.goToEnd,
    enabled: editor.mode === 'presentation',
  });

  // Select all nodes (Cmd+A / Ctrl+A)
  const handleSelectAll = useCallback(() => {
    if (editor.mode !== 'editor') return;

    editor.setNodes((nodes) =>
      nodes.map((node) => ({ ...node, selected: true }))
    );
  }, [editor]);

  // Copy selected nodes (Cmd+C / Ctrl+C)
  const handleCopy = useCallback(() => {
    if (editor.mode !== 'editor' || selectedNodeIds.length === 0) return;

    const selectedNodes = editor.nodes.filter((n) => selectedNodeIds.includes(n.id));
    const selectedNodeIdSet = new Set(selectedNodeIds);

    // Also copy edges that connect selected nodes
    const connectedEdges = editor.edges.filter(
      (e) => selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
    );

    clipboard = {
      nodes: selectedNodes.map((n) => ({ ...n })),
      edges: connectedEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      })),
    };

    toast.success(`Copied ${selectedNodes.length} node${selectedNodes.length > 1 ? 's' : ''}`);
  }, [editor.mode, editor.nodes, editor.edges, selectedNodeIds]);

  // Paste nodes (Cmd+V / Ctrl+V)
  const handlePaste = useCallback(() => {
    if (editor.mode !== 'editor' || !clipboard || clipboard.nodes.length === 0) return;

    const offset = { x: 50, y: 50 };
    const idMapping = new Map<string, string>();

    // Create new nodes with new IDs and offset positions
    const newNodes: Node[] = clipboard.nodes.map((node) => {
      const newId = `${node.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      idMapping.set(node.id, newId);

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
        selected: true, // Select pasted nodes
        data: { ...node.data },
      };
    });

    // Create new edges with updated source/target IDs
    const newEdges = clipboard.edges.map((edge) => ({
      id: `e-${idMapping.get(edge.source)}-${idMapping.get(edge.target)}`,
      source: idMapping.get(edge.source)!,
      target: idMapping.get(edge.target)!,
      type: edge.type || 'animatedDashed',
    }));

    // Deselect existing nodes and add new ones
    editor.setNodes((nodes) => [
      ...nodes.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);

    if (newEdges.length > 0) {
      editor.setEdges((edges) => [...edges, ...newEdges]);
    }

    // Update clipboard positions for next paste
    clipboard = {
      nodes: clipboard.nodes.map((n) => ({
        ...n,
        position: { x: n.position.x + offset.x, y: n.position.y + offset.y },
      })),
      edges: clipboard.edges,
    };

    toast.success(`Pasted ${newNodes.length} node${newNodes.length > 1 ? 's' : ''}`);
  }, [editor]);

  // Track if we're in alt-drag duplicate mode
  const altDragRef = useRef<{ originalPositions: Map<string, { x: number; y: number }>; duplicatedIds: Set<string> } | null>(null);

  // Handle node drag start - check for Alt key to duplicate
  const handleNodeDragStart = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (!event.altKey || editor.mode !== 'editor') {
        altDragRef.current = null;
        return;
      }

      // Get all selected nodes (or just the dragged node if not selected)
      const nodesToDuplicate = selectedNodeIds.includes(node.id)
        ? editor.nodes.filter((n) => selectedNodeIds.includes(n.id))
        : [node];

      const idMapping = new Map<string, string>();
      const originalPositions = new Map<string, { x: number; y: number }>();

      // Create duplicates at the same positions
      const newNodes: Node[] = nodesToDuplicate.map((n) => {
        const newId = `${n.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        idMapping.set(n.id, newId);
        originalPositions.set(n.id, { ...n.position });

        return {
          ...n,
          id: newId,
          position: { ...n.position },
          selected: false, // Duplicates are not selected
          data: { ...n.data },
        };
      });

      // Track duplicated node IDs
      altDragRef.current = {
        originalPositions,
        duplicatedIds: new Set(idMapping.values()),
      };

      // Add duplicates (they will stay in place while originals are dragged)
      editor.setNodes((nodes) => [...nodes, ...newNodes]);

      toast.success(`Duplicated ${nodesToDuplicate.length} node${nodesToDuplicate.length > 1 ? 's' : ''}`);
    },
    [editor, selectedNodeIds]
  );

  // Handle node drag stop - clear alt-drag state
  const handleNodeDragStop = useCallback(() => {
    // Just clear the ref - duplicates are already in place at original positions
    altDragRef.current = null;
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl+A to select all nodes (editor mode only)
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        if (editor.mode === 'editor') {
          e.preventDefault();
          handleSelectAll();
        }
        return;
      }

      // Cmd/Ctrl+C to copy selected nodes
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        if (editor.mode === 'editor' && selectedNodeIds.length > 0) {
          e.preventDefault();
          handleCopy();
        }
        return;
      }

      // Cmd/Ctrl+V to paste nodes
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        if (editor.mode === 'editor' && clipboard) {
          e.preventDefault();
          handlePaste();
        }
        return;
      }

      // "?" key shows keyboard shortcuts help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardHelp(prev => !prev);
        return;
      }

      // Escape to exit presentation or close help
      if (e.key === 'Escape') {
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        } else if (editor.mode === 'presentation') {
          editor.exitPresentation();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor.mode, editor.exitPresentation, showKeyboardHelp, handleSelectAll, handleCopy, handlePaste, selectedNodeIds]);

  // Handle deletion of selected nodes and edges
  const handleNodesDelete = useCallback(
    (deletedNodes: { id: string }[]) => {
      deletedNodes.forEach((node) => {
        editor.deleteNode(node.id);
      });
    },
    [editor]
  );

  const handleEdgesDelete = useCallback(
    (deletedEdges: { id: string }[]) => {
      deletedEdges.forEach((edge) => {
        editor.deleteEdge(edge.id);
      });
    },
    [editor]
  );

  // Handle node click for editing (single click to open panel)
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setEditingNode(node);
      setEditingEdge(null); // Close edge panel if open
      // Deselect edges when clicking on a node
      editor.setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
    },
    [editor]
  );

  // Handle pane click to close all panels and deselect edges
  const handlePaneClick = useCallback(() => {
    setEditingNode(null);
    setEditingEdge(null);
    // Deselect edges when clicking on empty canvas
    editor.setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  }, [editor]);

  // Handle edge click for editing
  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setEditingEdge(edge);
      setEditingNode(null); // Close node panel if open

      // Select this edge (deselect others)
      editor.setEdges((eds) =>
        eds.map((e) => ({ ...e, selected: e.id === edge.id }))
      );
      // Deselect nodes
      editor.setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    },
    [editor]
  );

  // Handle node property changes
  const handleNodePropertiesSave = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      editor.updateNode(nodeId, data);
    },
    [editor]
  );

  // Handle edge property changes
  const handleEdgePropertiesSave = useCallback(
    (edgeId: string, data: Record<string, unknown>) => {
      editor.updateEdge(edgeId, data);
    },
    [editor]
  );

  // Handle step changes from StepBadge
  const handleUpdateNodeStep = useCallback(
    (nodeId: string, step: number) => {
      editor.updateNode(nodeId, { revealAtStep: step });
    },
    [editor]
  );

  // Handle selection changes (for batch operations)
  const handleSelectionChange: OnSelectionChangeFunc = useCallback(({ nodes }) => {
    setSelectedNodeIds(nodes.map((n) => n.id));
  }, []);

  // Handle batch step assignment
  const handleBatchSetStep = useCallback(
    (nodeIds: string[], step: number) => {
      nodeIds.forEach((nodeId) => {
        editor.updateNode(nodeId, { revealAtStep: step });
      });
    },
    [editor]
  );

  // Handle batch delete nodes
  const handleBatchDeleteNodes = useCallback(
    (nodeIds: string[]) => {
      nodeIds.forEach((nodeId) => {
        editor.deleteNode(nodeId);
      });
      setSelectedNodeIds([]);
    },
    [editor]
  );

  // Export handler
  const handleExport = useCallback(() => {
    const config = editor.getConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.meta.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor]);

  // Import handler
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const config = JSON.parse(content) as FlowConfig;

          // Validate required fields
          if (!config.meta?.title) {
            throw new Error('Invalid flow: missing meta.title');
          }
          if (!Array.isArray(config.nodes)) {
            throw new Error('Invalid flow: missing nodes array');
          }
          if (!Array.isArray(config.edges)) {
            throw new Error('Invalid flow: missing edges array');
          }

          // Load the config
          editor.loadConfig(config);
          toast.success('Flow imported successfully', {
            description: `Loaded "${config.meta.title}" with ${config.nodes.length} nodes`,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          toast.error('Failed to import flow', {
            description: message,
          });
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
      };

      reader.readAsText(file);
    };

    input.click();
  }, [editor]);

  // New flow handler
  const handleNewFlow = useCallback(() => {
    if (confirm('Create a new flow? This will clear the current flow and saved data.')) {
      // Clear localStorage first
      autoSave.clearSaved();

      // Directly clear nodes and edges for immediate effect
      editor.setNodes([]);
      editor.setEdges([]);
      editor.updateMeta({
        title: 'Untitled Flow',
        subtitle: '',
        version: '1.0',
      });

      toast.success('New flow created');
    }
  }, [autoSave, editor]);

  const isPresentation = editor.mode === 'presentation';

  return (
    <div className={`h-screen w-full flex flex-col ${isPresentation ? 'presentation-mode' : 'editor-mode'}`}>
      {/* Header */}
      {isPresentation ? (
        <PresentationHeader meta={editor.meta} onExit={editor.exitPresentation} />
      ) : (
        <EditorHeader
          meta={editor.meta}
          onMetaChange={editor.updateMeta}
          onPresent={editor.enterPresentation}
          onExport={handleExport}
          onImport={handleImport}
          onNewFlow={handleNewFlow}
          onAutoLayout={handleAutoLayout}
          saveStatus={autoSave.status}
        />
      )}

      {/* Canvas */}
      <div className="flex-1 relative flex">
        {/* Node Palette (editor only) */}
        {!isPresentation && <NodePalette onAddNode={handlePaletteAdd} />}

        {/* Main canvas area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <FlowEditorProvider
            updateNodeStep={handleUpdateNodeStep}
            isEditorMode={!isPresentation}
            maxStep={editor.getMaxStep()}
          >
            <NodeContextMenu
              selectedNodeIds={selectedNodeIds}
              maxStep={editor.getMaxStep()}
              onSetStep={handleBatchSetStep}
              onDeleteNodes={handleBatchDeleteNodes}
              disabled={isPresentation}
            >
              <CanvasContextMenu
                onAddNode={handleContextMenuAdd}
                screenToFlowPosition={screenToFlowPosition}
                disabled={isPresentation}
              >
                <ReactFlow
                  nodes={isPresentation ? stepper.visibleNodes : editor.nodes}
                  edges={isPresentation ? stepper.visibleEdges : editor.edges}
                  onNodesChange={isPresentation ? undefined : editor.onNodesChange}
                  onEdgesChange={isPresentation ? undefined : editor.onEdgesChange}
                  onConnect={isPresentation ? undefined : editor.onConnect}
                  onNodesDelete={isPresentation ? undefined : handleNodesDelete}
                  onEdgesDelete={isPresentation ? undefined : handleEdgesDelete}
                  onNodeClick={isPresentation ? undefined : handleNodeClick}
                  onEdgeClick={isPresentation ? undefined : handleEdgeClick}
                  onPaneClick={isPresentation ? undefined : handlePaneClick}
                  onNodeDragStart={isPresentation ? undefined : handleNodeDragStart}
                  onNodeDragStop={isPresentation ? undefined : handleNodeDragStop}
                  onDragOver={isPresentation ? undefined : onDragOver}
                  onDrop={isPresentation ? undefined : onDrop}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  nodesDraggable={!isPresentation}
                  nodesConnectable={!isPresentation}
                  elementsSelectable={!isPresentation}
                  selectionMode={SelectionMode.Partial}
                  selectionOnDrag={!isPresentation}
                  deleteKeyCode={['Backspace', 'Delete']}
                  multiSelectionKeyCode="Shift"
                  onSelectionChange={isPresentation ? undefined : handleSelectionChange}
                  proOptions={{ hideAttribution: false }}
                >
                  <Background color="#e5e7eb" gap={20} />
                  <Controls position="bottom-left" />
                  {!isPresentation && <MiniMap position="bottom-right" />}
                </ReactFlow>
              </CanvasContextMenu>
            </NodeContextMenu>
          </FlowEditorProvider>

          {/* Stepper Controls (presentation only) */}
          {isPresentation && (
            <StepperControls
              currentStep={stepper.currentStep}
              totalSteps={stepper.totalSteps}
              onNext={stepper.next}
              onPrevious={stepper.previous}
              onReset={stepper.reset}
              onGoToStep={stepper.goToStep}
              isFirstStep={stepper.isFirstStep}
              isLastStep={stepper.isLastStep}
            />
          )}
        </div>
      </div>

      {/* Node Properties Panel (editor only) */}
      {!isPresentation && (
        <NodePropertiesPanel
          node={editingNode}
          onClose={() => setEditingNode(null)}
          onSave={handleNodePropertiesSave}
        />
      )}

      {/* Edge Properties Panel (editor only) */}
      {!isPresentation && (
        <EdgePropertiesPanel
          edge={editingEdge}
          onClose={() => {
            setEditingEdge(null);
            // Deselect the edge when closing the panel
            editor.setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
          }}
          onSave={handleEdgePropertiesSave}
          isEditorMode={!isPresentation}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        open={showKeyboardHelp}
        onOpenChange={setShowKeyboardHelp}
        mode={editor.mode}
      />
    </div>
  );
}

export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
