import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export interface ProcessStepNodeData extends Record<string, unknown> {
  title: string;
  description?: string;
}

export type ProcessStepNodeType = Node<ProcessStepNodeData, 'processStep'>;

export function ProcessStepNode({ data }: NodeProps<ProcessStepNodeType>) {
  return (
    <div className="min-w-[200px] max-w-[300px] bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3 shadow-sm">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
      />

      {/* Content */}
      <div className="text-center">
        <h3 className="font-semibold text-gray-800 text-sm">{data.title}</h3>
        {data.description && (
          <p className="text-xs text-gray-500 mt-1">{data.description}</p>
        )}
      </div>

      {/* Source handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
      />
    </div>
  );
}
