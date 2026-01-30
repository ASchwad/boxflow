import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export interface HintNodeData extends Record<string, unknown> {
  content: string;
  isCode?: boolean;
}

export type HintNodeType = Node<HintNodeData, 'hint'>;

export function HintNode({ data }: NodeProps<HintNodeType>) {
  return (
    <div className="min-w-[200px] max-w-[400px] bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg px-4 py-3">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />

      {/* Content */}
      <div>
        {data.isCode ? (
          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
            <code>{data.content}</code>
          </pre>
        ) : (
          <p className="text-sm text-gray-600">{data.content}</p>
        )}
      </div>

      {/* Source handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
    </div>
  );
}
