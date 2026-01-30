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
import { StepperControls } from './controls/StepperControls';
import { useFlowStepper } from '@/hooks/useFlowStepper';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import {
  type FlowConfig,
  configToStepperNodes,
  configToStepperEdges,
} from '@/types/flow';

// Import sample flow configuration
import sampleFlowConfig from '@/data/sample-flow.json';

interface FlowCanvasProps {
  config?: FlowConfig;
}

// Inner component that uses useReactFlow hook
function FlowCanvasInner({ config = sampleFlowConfig as FlowConfig }: FlowCanvasProps) {
  const { fitView } = useReactFlow();

  // Convert config to stepper format
  const nodes = configToStepperNodes(config.nodes);
  const edges = configToStepperEdges(config.edges);

  const {
    currentStep,
    totalSteps,
    visibleNodes,
    visibleEdges,
    next,
    previous,
    reset,
    goToEnd,
    isFirstStep,
    isLastStep,
  } = useFlowStepper({ nodes, edges });

  // Auto-focus on visible nodes when step changes
  const focusOnVisibleNodes = useCallback(() => {
    if (config.settings?.autoFocus !== false) {
      // Small delay to let the nodes render
      setTimeout(() => {
        fitView({
          padding: 0.2,
          duration: config.settings?.animationDuration ?? 300,
          nodes: visibleNodes,
        });
      }, 50);
    }
  }, [fitView, visibleNodes, config.settings]);

  // Focus whenever the current step changes
  useEffect(() => {
    focusOnVisibleNodes();
  }, [currentStep, focusOnVisibleNodes]);

  // Enable keyboard navigation
  useKeyboardNavigation({
    onNext: next,
    onPrevious: previous,
    onReset: reset,
    onGoToEnd: goToEnd,
  });

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="text-center py-6 border-b border-border bg-background">
        <h1 className="text-2xl font-semibold text-foreground">{config.meta.title}</h1>
        {config.meta.subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{config.meta.subtitle}</p>
        )}
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: false }}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls position="bottom-left" />
          <MiniMap position="bottom-right" />
        </ReactFlow>

        {/* Stepper Controls */}
        <StepperControls
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={next}
          onPrevious={previous}
          onReset={reset}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      </div>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
