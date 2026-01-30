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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { EditorHeader } from './EditorHeader';
import { PresentationHeader } from './PresentationHeader';
import { StepperControls } from './controls/StepperControls';
import { NodePalette } from './editor/NodePalette';
import { CanvasContextMenu } from './editor/CanvasContextMenu';
import { NodePropertiesPanel } from './editor/NodePropertiesPanel';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { useFlowStepper } from '@/hooks/useFlowStepper';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import type { FlowConfig } from '@/types/flow';

import sampleFlowConfig from '@/data/sample-flow.json';

interface FlowCanvasProps {
  initialConfig?: FlowConfig;
}

function FlowCanvasInner({ initialConfig = sampleFlowConfig as FlowConfig }: FlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const editor = useFlowEditor({ initialConfig });

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
    },
    [screenToFlowPosition, editor]
  );

  // Stepper for presentation mode
  const stepper = useFlowStepper({
    nodes: editor.nodes.map((n) => ({
      ...n,
      data: { ...n.data, revealAtStep: (n.data?.revealAtStep as number) ?? 1 },
    })) as any,
    edges: editor.edges as any,
  });

  // Auto-focus in presentation mode
  const focusOnVisibleNodes = useCallback(() => {
    if (editor.mode === 'presentation') {
      setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: 300,
          nodes: stepper.visibleNodes,
        });
      }, 50);
    }
  }, [fitView, stepper.visibleNodes, editor.mode]);

  useEffect(() => {
    if (editor.mode === 'presentation') {
      focusOnVisibleNodes();
    }
  }, [stepper.currentStep, focusOnVisibleNodes, editor.mode]);

  // Keyboard navigation (only in presentation mode)
  useKeyboardNavigation({
    onNext: stepper.next,
    onPrevious: stepper.previous,
    onReset: stepper.reset,
    onGoToEnd: stepper.goToEnd,
    enabled: editor.mode === 'presentation',
  });

  // Escape to exit presentation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editor.mode === 'presentation') {
        editor.exitPresentation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor.mode, editor.exitPresentation]);

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

  // Import handler (placeholder for now)
  const handleImport = useCallback(() => {
    // TODO: Implement in US-021
    console.log('Import clicked');
  }, []);

  const isPresentation = editor.mode === 'presentation';

  return (
    <div className="h-screen w-full flex flex-col">
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
        />
      )}

      {/* Canvas */}
      <div className="flex-1 relative flex">
        {/* Node Palette (editor only) */}
        {!isPresentation && <NodePalette />}

        {/* Main canvas area */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <CanvasContextMenu
            onAddNode={editor.addNode}
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
              proOptions={{ hideAttribution: false }}
            >
              <Background color="#e5e7eb" gap={20} />
              <Controls position="bottom-left" />
              {!isPresentation && <MiniMap position="bottom-right" />}
            </ReactFlow>
          </CanvasContextMenu>

          {/* Stepper Controls (presentation only) */}
          {isPresentation && (
            <StepperControls
              currentStep={stepper.currentStep}
              totalSteps={stepper.totalSteps}
              onNext={stepper.next}
              onPrevious={stepper.previous}
              onReset={stepper.reset}
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
