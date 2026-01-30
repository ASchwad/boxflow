import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import type { FlowConfig, FlowMeta } from '@/types/flow';

interface UseFlowEditorOptions {
  initialConfig: FlowConfig;
}

interface UseFlowEditorReturn {
  // Mode
  mode: 'editor' | 'presentation';
  setMode: (mode: 'editor' | 'presentation') => void;
  enterPresentation: () => void;
  exitPresentation: () => void;

  // Meta
  meta: FlowMeta;
  updateMeta: (updates: Partial<FlowMeta>) => void;

  // Nodes & Edges (for editor)
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;

  // Node operations
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;

  // Edge operations
  onConnect: (connection: any) => void;
  deleteEdge: (edgeId: string) => void;

  // Get highest step number
  getMaxStep: () => number;

  // Export config
  getConfig: () => FlowConfig;
}

export function useFlowEditor({ initialConfig }: UseFlowEditorOptions): UseFlowEditorReturn {
  const [mode, setMode] = useState<'editor' | 'presentation'>('editor');
  const [meta, setMeta] = useState<FlowMeta>(initialConfig.meta);

  // Convert config nodes to React Flow format
  const initialNodes: Node[] = initialConfig.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: { ...node.data, revealAtStep: node.revealAtStep },
  }));

  const initialEdges: Edge[] = initialConfig.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: edge.type || 'animatedDashed',
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const enterPresentation = useCallback(() => setMode('presentation'), []);
  const exitPresentation = useCallback(() => setMode('editor'), []);

  const updateMeta = useCallback((updates: Partial<FlowMeta>) => {
    setMeta((prev) => ({ ...prev, ...updates }));
  }, []);

  const getMaxStep = useCallback(() => {
    return nodes.reduce((max, node) => {
      const step = (node.data?.revealAtStep as number) ?? 1;
      return Math.max(max, step);
    }, 1);
  }, [nodes]);

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const newStep = getMaxStep() + 1;
      const id = `${type}-${Date.now()}`;

      let data: any = { revealAtStep: newStep };
      switch (type) {
        case 'processStep':
          data = { ...data, title: 'New Step', description: 'Description here' };
          break;
        case 'hint':
          data = { ...data, content: 'Add your hint text here', isCode: false };
          break;
        case 'image':
          data = { ...data, src: '', caption: 'Image caption', width: 200 };
          break;
      }

      const newNode: Node = {
        id,
        type,
        position,
        data,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, getMaxStep]
  );

  const updateNode = useCallback(
    (nodeId: string, data: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        )
      );
    },
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    },
    [setNodes, setEdges]
  );

  const onConnect = useCallback(
    (connection: any) => {
      // Prevent duplicate edges
      const exists = edges.some(
        (e) => e.source === connection.source && e.target === connection.target
      );
      if (exists) return;

      // Prevent self-connections
      if (connection.source === connection.target) return;

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'animatedDashed',
      };

      setEdges((eds) => [...eds, newEdge]);
    },
    [edges, setEdges]
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  const getConfig = useCallback((): FlowConfig => {
    return {
      meta,
      nodes: nodes.map((node) => {
        const { revealAtStep, ...rest } = node.data as Record<string, unknown>;
        return {
          id: node.id,
          type: node.type as 'processStep' | 'hint' | 'image',
          position: node.position,
          revealAtStep: (revealAtStep as number) ?? 1,
          data: rest as any,
        };
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: (edge.type as 'animatedDashed' | 'default') || 'animatedDashed',
      })),
      settings: initialConfig.settings,
    };
  }, [meta, nodes, edges, initialConfig.settings]);

  return {
    mode,
    setMode,
    enterPresentation,
    exitPresentation,
    meta,
    updateMeta,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNode,
    updateNode,
    deleteNode,
    onConnect,
    deleteEdge,
    getMaxStep,
    getConfig,
  };
}
