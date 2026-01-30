import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { EditorHeader } from './EditorHeader';
import { PresentationHeader } from './PresentationHeader';
import { StepperControls } from './controls/StepperControls';
import { useFlowEditor } from '@/hooks/useFlowEditor';
import { useFlowStepper } from '@/hooks/useFlowStepper';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import type { FlowConfig } from '@/types/flow';

import sampleFlowConfig from '@/data/sample-flow.json';

interface FlowCanvasProps {
  initialConfig?: FlowConfig;
}

function FlowCanvasInner({ initialConfig = sampleFlowConfig as FlowConfig }: FlowCanvasProps) {
  const { fitView } = useReactFlow();

  const editor = useFlowEditor({ initialConfig });

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
          onPresent={editor.enterPresentation}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}

      {/* Canvas */}
      <div className="flex-1 relative flex">
        {/* Main canvas area */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={isPresentation ? stepper.visibleNodes : editor.nodes}
            edges={isPresentation ? stepper.visibleEdges : editor.edges}
            onNodesChange={isPresentation ? undefined : editor.onNodesChange}
            onEdgesChange={isPresentation ? undefined : editor.onEdgesChange}
            onConnect={isPresentation ? undefined : editor.onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            nodesDraggable={!isPresentation}
            nodesConnectable={!isPresentation}
            elementsSelectable={!isPresentation}
            proOptions={{ hideAttribution: false }}
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls position="bottom-left" />
            {!isPresentation && <MiniMap position="bottom-right" />}
          </ReactFlow>

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
