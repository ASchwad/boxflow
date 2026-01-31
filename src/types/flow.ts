// Flow Configuration Types

export interface FlowMeta {
  title: string;
  subtitle?: string;
  version?: string;
}

export interface FlowNodeBase {
  id: string;
  position: { x: number; y: number };
  revealAtStep: number;
}

export interface ProcessStepNodeConfig extends FlowNodeBase {
  type: 'processStep';
  data: {
    title: string;
    description?: string;
  };
}

export interface HintNodeConfig extends FlowNodeBase {
  type: 'hint';
  data: {
    content: string;
    isCode?: boolean;
  };
}

export interface ImageNodeConfig extends FlowNodeBase {
  type: 'image';
  data: {
    src: string;
    alt?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

export type FlowNodeConfig = ProcessStepNodeConfig | HintNodeConfig | ImageNodeConfig;

export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';
export type MarkerType = 'none' | 'arrow' | 'arrowClosed';
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type EdgeAnimation = 'none' | 'flow';

export interface FlowEdgeConfig {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  type?: 'animatedDashed' | 'default' | 'custom';
  revealAtStep?: number;
  // Edge styling options
  markerStart?: MarkerType;
  markerEnd?: MarkerType;
  lineStyle?: LineStyle;
  animation?: EdgeAnimation;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface FlowSettings {
  autoFocus?: boolean;
  animationDuration?: number;
}

export interface FlowConfig {
  meta: FlowMeta;
  nodes: FlowNodeConfig[];
  edges: FlowEdgeConfig[];
  settings?: FlowSettings;
}

// Helper to convert config nodes to StepperNodes
export function configToStepperNodes(nodes: FlowNodeConfig[]) {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      revealAtStep: node.revealAtStep,
    },
  }));
}

// Helper to convert config edges to StepperEdges
export function configToStepperEdges(edges: FlowEdgeConfig[]) {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || 'bottom',
    targetHandle: edge.targetHandle || 'top',
    type: edge.type || 'animatedDashed',
    data: edge.revealAtStep ? { revealAtStep: edge.revealAtStep } : undefined,
  }));
}
