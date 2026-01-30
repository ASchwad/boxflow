import { useState, useCallback, useMemo } from 'react';
import type { Node, Edge } from '@xyflow/react';

export interface StepperNode extends Node {
  data: Node['data'] & {
    revealAtStep?: number;
  };
}

export interface StepperEdge extends Edge {
  data?: {
    revealAtStep?: number;
  };
}

interface UseFlowStepperOptions {
  nodes: StepperNode[];
  edges: StepperEdge[];
}

interface UseFlowStepperReturn {
  currentStep: number;
  totalSteps: number;
  visibleNodes: StepperNode[];
  visibleEdges: StepperEdge[];
  next: () => void;
  previous: () => void;
  reset: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function useFlowStepper({
  nodes,
  edges,
}: UseFlowStepperOptions): UseFlowStepperReturn {
  // Calculate total steps from nodes
  const totalSteps = useMemo(() => {
    const maxStep = nodes.reduce((max, node) => {
      const step = node.data?.revealAtStep ?? 1;
      return Math.max(max, step);
    }, 1);
    return maxStep;
  }, [nodes]);

  const [currentStep, setCurrentStep] = useState(1);

  // Filter visible nodes based on current step
  const visibleNodes = useMemo(() => {
    return nodes
      .filter((node) => {
        const revealAt = node.data?.revealAtStep ?? 1;
        return revealAt <= currentStep;
      })
      .map((node) => ({
        ...node,
        // Add animation class for newly revealed nodes
        className: `${node.className || ''} ${
          (node.data?.revealAtStep ?? 1) === currentStep ? 'animate-fade-in' : ''
        }`.trim(),
      }));
  }, [nodes, currentStep]);

  // Filter visible edges - only show if both source and target are visible
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
    return edges.filter((edge) => {
      const edgeRevealAt = edge.data?.revealAtStep;
      // If edge has explicit revealAtStep, check it
      if (edgeRevealAt !== undefined) {
        return edgeRevealAt <= currentStep;
      }
      // Otherwise, show edge only if both nodes are visible
      return visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target);
    });
  }, [edges, visibleNodes, currentStep]);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  }, [totalSteps]);

  const previous = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(1);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
    },
    [totalSteps]
  );

  return {
    currentStep,
    totalSteps,
    visibleNodes,
    visibleEdges,
    next,
    previous,
    reset,
    goToStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
