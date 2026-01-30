import { ProcessStepNode } from './ProcessStepNode';
import { HintNode } from './HintNode';
import { ImageNode } from './ImageNode';

export const nodeTypes = {
  processStep: ProcessStepNode,
  hint: HintNode,
  image: ImageNode,
};

export { ProcessStepNode, HintNode, ImageNode };
export type { ProcessStepNodeData, ProcessStepNodeType } from './ProcessStepNode';
export type { HintNodeData, HintNodeType } from './HintNode';
export type { ImageNodeData, ImageNodeType } from './ImageNode';
