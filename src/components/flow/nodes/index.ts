import { ProcessStepNode } from './ProcessStepNode';
import { HintNode } from './HintNode';

export const nodeTypes = {
  processStep: ProcessStepNode,
  hint: HintNode,
};

export { ProcessStepNode, HintNode };
export type { ProcessStepNodeData, ProcessStepNodeType } from './ProcessStepNode';
export type { HintNodeData, HintNodeType } from './HintNode';
