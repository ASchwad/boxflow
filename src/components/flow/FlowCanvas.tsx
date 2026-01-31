import { useEffect, useCallback, useRef, useState, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  SelectionMode,
  type Node,
  type NodeMouseHandler,
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
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { useFlowStepper } from '@/hooks/useFlowStepper';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { FlowEditorProvider } from '@/contexts/FlowEditorContext';
import type { FlowConfig } from '@/types/flow';
import { toast } from 'sonner';

import sampleFlowConfig from '@/data/sample-flow.json';

interface FlowCanvasProps {
  initialConfig?: FlowConfig;
}

function FlowCanvasInner({ initialConfig = sampleFlowConfig as FlowConfig }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition, getViewport } = useReactFlow();
  const [editingNode, setEditingNode] = useState<Node | null>(null);
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

  // Stepper for presentation mode
  const stepper = useFlowStepper({
    nodes: editor.nodes.map((n) => ({
      ...n,
      data: { ...n.data, revealAtStep: (n.data?.revealAtStep as number) ?? 1 },
    })) as any,
    edges: editor.edges as any,
  });

  // Reset stepper and fit viewport when entering presentation mode
  useEffect(() => {
    if (editor.mode === 'presentation') {
      // Reset to step 1 when entering presentation
      stepper.reset();

      // Fit to ALL nodes (not just visible), so viewport stays stable during presentation
      setTimeout(() => {
        fitView({
          padding: 0.3,
          duration: 400,
          nodes: editor.nodes, // All nodes, not just visible
        });
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.mode, fitView]); // Only trigger on mode change, NOT on step change

  // Keyboard navigation (only in presentation mode)
  useKeyboardNavigation({
    onNext: stepper.next,
    onPrevious: stepper.previous,
    onReset: stepper.reset,
    onGoToEnd: stepper.goToEnd,
    enabled: editor.mode === 'presentation',
  });

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
  }, [editor.mode, editor.exitPresentation, showKeyboardHelp]);

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

  // Handle node double-click for editing
  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setEditingNode(node);
    },
    []
  );

  // Handle node property changes
  const handleNodePropertiesSave = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      editor.updateNode(nodeId, data);
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

  // Normalize steps handler
  const handleNormalizeSteps = useCallback(() => {
    const { oldMax, newMax } = editor.normalizeSteps();
    if (oldMax === newMax) {
      toast.info('Steps are already normalized');
    } else {
      toast.success(`Steps normalized: ${oldMax} → ${newMax} steps`);
    }
  }, [editor]);

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
          onNormalizeSteps={handleNormalizeSteps}
          saveStatus={autoSave.status}
          stepAssignmentMode={editor.stepAssignmentMode}
          onStepAssignmentModeChange={editor.setStepAssignmentMode}
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
                  onNodeDoubleClick={isPresentation ? undefined : handleNodeDoubleClick}
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
