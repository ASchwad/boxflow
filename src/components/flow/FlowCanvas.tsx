import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { StepperControls } from './controls/StepperControls';
import { useFlowStepper, type StepperNode, type StepperEdge } from '@/hooks/useFlowStepper';

interface FlowCanvasProps {
  title: string;
  subtitle?: string;
}

// Sample nodes for demonstration with step assignments
const sampleNodes: StepperNode[] = [
  {
    id: 'step-1',
    type: 'processStep',
    position: { x: 250, y: 100 },
    data: {
      title: 'You write a PRD',
      description: 'Define what you want to build',
      revealAtStep: 1,
    },
  },
  {
    id: 'step-2',
    type: 'processStep',
    position: { x: 300, y: 250 },
    data: {
      title: 'Convert to prd.json',
      description: 'Break into small user stories',
      revealAtStep: 2,
    },
  },
  {
    id: 'hint-1',
    type: 'hint',
    position: { x: 550, y: 220 },
    data: {
      content: `{
  "id": "US-001",
  "title": "Add priority field to database",
  "acceptanceCriteria": [
    "Add priority column to tasks table",
    "Generate and run migration",
    "Typecheck passes"
  ],
  "passes": false
}`,
      isCode: true,
      revealAtStep: 2,
    },
  },
  {
    id: 'step-3',
    type: 'processStep',
    position: { x: 350, y: 400 },
    data: {
      title: 'Ralph picks up task',
      description: 'AI agent starts working',
      revealAtStep: 3,
    },
  },
  {
    id: 'image-1',
    type: 'image',
    position: { x: 550, y: 380 },
    data: {
      src: 'https://placehold.co/200x120/e0e7ff/4f46e5?text=Terminal',
      alt: 'Terminal output',
      caption: 'Terminal output showing test results',
      width: 200,
      revealAtStep: 4,
    },
  },
  {
    id: 'step-4',
    type: 'processStep',
    position: { x: 400, y: 550 },
    data: {
      title: 'Tests pass',
      description: 'All acceptance criteria met',
      revealAtStep: 4,
    },
  },
];

// Sample edges connecting nodes
const sampleEdges: StepperEdge[] = [
  {
    id: 'e1-2',
    source: 'step-1',
    target: 'step-2',
    type: 'animatedDashed',
  },
  {
    id: 'e2-hint',
    source: 'step-2',
    target: 'hint-1',
    type: 'animatedDashed',
  },
  {
    id: 'e2-3',
    source: 'step-2',
    target: 'step-3',
    type: 'animatedDashed',
  },
  {
    id: 'e3-4',
    source: 'step-3',
    target: 'step-4',
    type: 'animatedDashed',
  },
  {
    id: 'e3-img',
    source: 'step-3',
    target: 'image-1',
    type: 'animatedDashed',
  },
];

export function FlowCanvas({ title, subtitle }: FlowCanvasProps) {
  const {
    currentStep,
    totalSteps,
    visibleNodes,
    visibleEdges,
    next,
    previous,
    reset,
    isFirstStep,
    isLastStep,
  } = useFlowStepper({ nodes: sampleNodes, edges: sampleEdges });

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <header className="text-center py-6 border-b border-border bg-background">
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
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
