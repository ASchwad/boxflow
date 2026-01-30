import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import type { ProcessStepNodeType } from './nodes';

interface FlowCanvasProps {
  title: string;
  subtitle?: string;
}

// Sample nodes for demonstration
const sampleNodes: ProcessStepNodeType[] = [
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
          edges={[]}
          nodeTypes={nodeTypes}
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
