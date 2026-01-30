import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export interface ImageNodeData extends Record<string, unknown> {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export type ImageNodeType = Node<ImageNodeData, 'image'>;

export function ImageNode({ data }: NodeProps<ImageNodeType>) {
  const { src, alt = 'Image', caption, width = 300, height } = data;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
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

      {/* Image */}
      <img
        src={src}
        alt={alt}
        style={{ width, height: height || 'auto' }}
        className="object-contain"
      />

      {/* Caption */}
      {caption && (
        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-600 text-center">{caption}</p>
        </div>
      )}

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
