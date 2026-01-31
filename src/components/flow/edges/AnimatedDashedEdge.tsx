import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { LineStyle, EdgeAnimation, MarkerType as CustomMarkerType } from '@/types/flow';

// Generate marker ID based on type and color
function getMarkerId(markerType: CustomMarkerType | undefined, color: string, position: 'start' | 'end'): string | undefined {
  if (!markerType || markerType === 'none') return undefined;
  // Create a color-safe ID by replacing # with empty string
  const colorId = color.replace('#', '');
  return `${markerType}-${colorId}-${position}`;
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

// Render an arrow marker definition
function ArrowMarker({
  id,
  color,
  filled
}: {
  id: string;
  color: string;
  filled: boolean;
}) {
  return (
    <marker
      id={id}
      markerWidth="12.5"
      markerHeight="12.5"
      viewBox="-10 -10 20 20"
      markerUnits="strokeWidth"
      orient="auto-start-reverse"
      refX="0"
      refY="0"
    >
      <polyline
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        fill={filled ? color : 'none'}
        points="-5,-4 0,0 -5,4"
      />
    </marker>
  );
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
  const markerStartType = data?.markerStart as CustomMarkerType | undefined;
  const markerEndType = (data?.markerEnd as CustomMarkerType | undefined) || 'arrowClosed';

  // Get the actual display color (selected overrides)
  const displayColor = selected ? '#3b82f6' : strokeColor;

  // Generate marker IDs
  const markerStartId = getMarkerId(markerStartType, displayColor, 'start');
  const markerEndId = getMarkerId(markerEndType, displayColor, 'end');

  // Compute CSS class for animation
  const animationClass = animation === 'none' ? '' : 'animated-edge';

  return (
    <>
      {/* Define markers for this edge */}
      <defs>
        {markerStartId && markerStartType === 'arrow' && (
          <ArrowMarker id={markerStartId} color={displayColor} filled={false} />
        )}
        {markerStartId && markerStartType === 'arrowClosed' && (
          <ArrowMarker id={markerStartId} color={displayColor} filled={true} />
        )}
        {markerEndId && markerEndType === 'arrow' && (
          <ArrowMarker id={markerEndId} color={displayColor} filled={false} />
        )}
        {markerEndId && markerEndType === 'arrowClosed' && (
          <ArrowMarker id={markerEndId} color={displayColor} filled={true} />
        )}
      </defs>
      <BaseEdge
        id={id}
        path={edgePath}
        markerStart={markerStartId ? `url(#${markerStartId})` : undefined}
        markerEnd={markerEndId ? `url(#${markerEndId})` : undefined}
        style={{
          ...style,
          strokeWidth: selected ? strokeWidth + 1 : strokeWidth,
          stroke: displayColor,
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
