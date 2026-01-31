import { useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import dagre from 'dagre';

export type LayoutDirection = 'TB' | 'LR'; // Top-to-Bottom or Left-to-Right

interface UseAutoLayoutOptions {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

interface UseAutoLayoutReturn {
  applyLayout: (direction?: LayoutDirection) => void;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 100;
const NODE_SPACING_X = 100;
const NODE_SPACING_Y = 80;

export function useAutoLayout({
  nodes,
  edges,
  setNodes,
}: UseAutoLayoutOptions): UseAutoLayoutReturn {
  const applyLayout = useCallback(
    (direction: LayoutDirection = 'TB') => {
      if (nodes.length === 0) return;

      const dagreGraph = new dagre.graphlib.Graph();
      dagreGraph.setDefaultEdgeLabel(() => ({}));

      const isHorizontal = direction === 'LR';
      dagreGraph.setGraph({
        rankdir: direction,
        nodesep: isHorizontal ? NODE_SPACING_Y : NODE_SPACING_X,
        ranksep: isHorizontal ? NODE_SPACING_X : NODE_SPACING_Y,
        marginx: 50,
        marginy: 50,
      });

      // Add nodes to dagre graph
      // Group by step for better layout
      const nodesByStep = new Map<number, Node[]>();
      nodes.forEach((node) => {
        const step = (node.data?.revealAtStep as number) ?? 1;
        if (!nodesByStep.has(step)) {
          nodesByStep.set(step, []);
        }
        nodesByStep.get(step)!.push(node);
      });

      // Add nodes with dimensions
      nodes.forEach((node) => {
        const width = node.measured?.width ?? NODE_WIDTH;
        const height = node.measured?.height ?? NODE_HEIGHT;
        dagreGraph.setNode(node.id, { width, height });
      });

      // Add edges
      edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
      });

      // Calculate layout
      dagre.layout(dagreGraph);

      // Apply new positions
      setNodes((nds) =>
        nds.map((node) => {
          const nodeWithPosition = dagreGraph.node(node.id);
          if (!nodeWithPosition) return node;

          const width = node.measured?.width ?? NODE_WIDTH;
          const height = node.measured?.height ?? NODE_HEIGHT;

          return {
            ...node,
            position: {
              // dagre returns center position, convert to top-left
              x: nodeWithPosition.x - width / 2,
              y: nodeWithPosition.y - height / 2,
            },
          };
        })
      );
    },
    [nodes, edges, setNodes]
  );

  return { applyLayout };
}
