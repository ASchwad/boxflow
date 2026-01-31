import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { StepBadge } from './StepBadge';

export interface HintNodeData extends Record<string, unknown> {
  content: string;
  isCode?: boolean;
  revealAtStep?: number;
}

export type HintNodeType = Node<HintNodeData, 'hint'>;

export function HintNode({ id, data }: NodeProps<HintNodeType>) {
  const step = (data.revealAtStep as number) ?? 1;

  return (
    <div className="relative min-w-[200px] max-w-[400px] bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg px-4 py-3">
      {/* Step Badge (hidden in presentation mode via CSS) */}
      <StepBadge step={step} nodeId={id} />

      {/* Connection handles - with IDs for edge configuration */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
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

      {/* Source handles - with IDs for edge configuration */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-purple-400 !w-2 !h-2 !border-2 !border-white"
      />
    </div>
  );
}
