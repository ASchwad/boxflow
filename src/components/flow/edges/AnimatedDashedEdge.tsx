import { BaseEdge, getSmoothStepPath, type EdgeProps, MarkerType } from '@xyflow/react';
import type { LineStyle, EdgeAnimation, MarkerType as CustomMarkerType } from '@/types/flow';

// Convert our marker type to React Flow marker type
function getMarker(markerType: CustomMarkerType | undefined): string | undefined {
  if (!markerType || markerType === 'none') return undefined;
  if (markerType === 'arrow') return `url(#${MarkerType.Arrow})`;
  if (markerType === 'arrowClosed') return `url(#${MarkerType.ArrowClosed})`;
  return undefined;
}

// Convert line style to strokeDasharray
function getStrokeDasharray(lineStyle: LineStyle | undefined): string | undefined {
  switch (lineStyle) {
    case 'solid':
      return undefined;
    case 'dotted':
      return '2 4';
    case 'dashed':
    default:
      return '5 5';
  }
}

export function AnimatedDashedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
  selected,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 10,
  });

  // Get styling from edge data or use defaults
  const strokeColor = (data?.strokeColor as string) || '#94a3b8';
  const strokeWidth = (data?.strokeWidth as number) || 2;
  const lineStyle = data?.lineStyle as LineStyle | undefined;
  const animation = data?.animation as EdgeAnimation | undefined;

  // Override markers if specified in data
  const finalMarkerEnd = getMarker(data?.markerEnd as CustomMarkerType) || markerEnd;
  const finalMarkerStart = getMarker(data?.markerStart as CustomMarkerType) || markerStart;

  // Compute CSS class for animation
  const animationClass = animation === 'none' ? '' : 'animated-edge';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={finalMarkerEnd}
        markerStart={finalMarkerStart}
        style={{
          ...style,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          stroke: selected ? '#3b82f6' : strokeColor,
          strokeDasharray: getStrokeDasharray(lineStyle),
        }}
        className={animationClass}
      />
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        style={{ cursor: 'pointer' }}
      />
    </>
  );
}
