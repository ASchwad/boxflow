import { useState } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { StepBadge } from './StepBadge';

export interface ImageNodeData extends Record<string, unknown> {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  revealAtStep?: number;
}

export type ImageNodeType = Node<ImageNodeData, 'image'>;

export function ImageNode({ id, data }: NodeProps<ImageNodeType>) {
  const { src, alt = 'Image', caption, width = 300, height } = data;
  const step = (data.revealAtStep as number) ?? 1;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Step Badge (hidden in presentation mode via CSS) */}
      <StepBadge step={step} nodeId={id} />
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

      {/* Image container */}
      <div
        style={{ width, height: height || 'auto', minHeight: 80 }}
        className="relative flex items-center justify-center bg-gray-50"
      >
        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">Failed to load</span>
          </div>
        )}

        {/* Image */}
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{ width: '100%', height: height || 'auto' }}
          className={`object-contain ${isLoading || hasError ? 'invisible' : 'visible'}`}
        />
      </div>

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
