import { ReactFlow, Background, Controls, MiniMap, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import type { ProcessStepNodeType, HintNodeType, ImageNodeType } from './nodes';

interface FlowCanvasProps {
  title: string;
  subtitle?: string;
}

// Sample nodes for demonstration
const sampleNodes: (ProcessStepNodeType | HintNodeType | ImageNodeType)[] = [
  {
    id: 'step-1',
    type: 'processStep',
    position: { x: 250, y: 100 },
    data: {
      title: 'You write a PRD',
      description: 'Define what you want to build',
    },
  },
  {
    id: 'step-2',
    type: 'processStep',
    position: { x: 300, y: 250 },
    data: {
      title: 'Convert to prd.json',
      description: 'Break into small user stories',
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
    },
  },
  {
    id: 'image-1',
    type: 'image',
    position: { x: 50, y: 350 },
    data: {
      src: 'https://placehold.co/200x120/e0e7ff/4f46e5?text=Screenshot',
      alt: 'Example screenshot',
      caption: 'Terminal output showing test results',
      width: 200,
    },
  },
];

// Sample edges connecting nodes
const sampleEdges: Edge[] = [
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
];

export function FlowCanvas({ title, subtitle }: FlowCanvasProps) {
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
          nodes={sampleNodes}
          edges={sampleEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: false }}
        >
          <Background color="#e5e7eb" gap={20} />
          <Controls position="bottom-left" />
          <MiniMap position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}
