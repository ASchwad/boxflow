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
  goToEnd: () => void;
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

  // FILTER nodes - only return nodes that should be visible at current step
  const visibleNodes = useMemo(() => {
    const result = nodes
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

    return result;
  }, [nodes, currentStep]);

  // Only return edges that connect two visible nodes
  const visibleEdges = useMemo(() => {
    // Build set of visible node IDs directly from nodes (source of truth)
    const visibleNodeIds = new Set<string>();
    nodes.forEach((node) => {
      const revealAt = node.data?.revealAtStep ?? 1;
      if (revealAt <= currentStep) {
        visibleNodeIds.add(node.id);
      }
    });

    // Filter - only return edges where both source and target are visible
    return edges.filter((edge) => {
      const sourceVisible = visibleNodeIds.has(edge.source);
      const targetVisible = visibleNodeIds.has(edge.target);

      if (!sourceVisible || !targetVisible) {
        return false;
      }

      // If edge has explicit revealAtStep, also check that
      const edgeRevealAt = edge.data?.revealAtStep;
      if (edgeRevealAt !== undefined) {
        return edgeRevealAt <= currentStep;
      }

      return true;
    });
  }, [nodes, edges, currentStep]);

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

  const goToEnd = useCallback(() => {
    setCurrentStep(totalSteps);
  }, [totalSteps]);

  return {
    currentStep,
    totalSteps,
    visibleNodes,
    visibleEdges,
    next,
    previous,
    reset,
    goToStep,
    goToEnd,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
