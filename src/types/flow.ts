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

export interface FlowEdgeConfig {
  id: string;
  source: string;
  target: string;
  type?: 'animatedDashed' | 'default';
  revealAtStep?: number;
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
    type: edge.type || 'animatedDashed',
    data: edge.revealAtStep ? { revealAtStep: edge.revealAtStep } : undefined,
  }));
}
