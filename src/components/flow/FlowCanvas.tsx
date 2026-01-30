import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface FlowCanvasProps {
  title: string;
  subtitle?: string;
}

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
          nodes={[]}
          edges={[]}
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
