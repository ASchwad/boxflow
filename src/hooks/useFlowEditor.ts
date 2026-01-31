import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge, type NodeChange, type EdgeChange, type Connection } from '@xyflow/react';
import type { FlowConfig, FlowMeta, FlowNodeConfig, ProcessStepNodeConfig, HintNodeConfig, ImageNodeConfig } from '@/types/flow';


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
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;

  // Node operations
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNode: (nodeId: string, data: Partial<ProcessStepNodeConfig['data'] | HintNodeConfig['data'] | ImageNodeConfig['data']> & { revealAtStep?: number }) => void;
  deleteNode: (nodeId: string) => void;

  // Edge operations
  onConnect: (connection: Connection) => void;
  updateEdge: (edgeId: string, data: { sourceHandle?: string; targetHandle?: string } & Record<string, unknown>) => void;
  deleteEdge: (edgeId: string) => void;

  // Get highest step number
  getMaxStep: () => number;

  // Config operations
  getConfig: () => FlowConfig;
  loadConfig: (config: FlowConfig) => void;
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
    if (nodes.length === 0) return 0; // Return 0 for empty canvas
    return nodes.reduce((max, node) => {
      const step = (node.data?.revealAtStep as number) ?? 1;
      return Math.max(max, step);
    }, 1);
  }, [nodes]);

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const id = `${type}-${Date.now()}`;

      setNodes((nds) => {
        // Auto-increment: new nodes get the next step number
        const maxStep = nds.length === 0
          ? 0
          : nds.reduce((max, node) => {
              const step = (node.data?.revealAtStep as number) ?? 1;
              return Math.max(max, step);
            }, 1);
        const newStep = maxStep === 0 ? 1 : maxStep + 1;

        let data: Record<string, unknown> = { revealAtStep: newStep };
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

        return [...nds, newNode];
      });
    },
    [setNodes]
  );

  const updateNode = useCallback(
    (nodeId: string, data: Partial<ProcessStepNodeConfig['data'] | HintNodeConfig['data'] | ImageNodeConfig['data']> & { revealAtStep?: number }) => {
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
    (connection: Connection) => {
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
        sourceHandle: connection.sourceHandle || 'bottom', // Default to bottom
        targetHandle: connection.targetHandle || 'top', // Default to top
        type: 'animatedDashed',
        data: {
          markerEnd: 'arrowClosed', // Default to arrow
          lineStyle: 'dashed',
          animation: 'flow',
          strokeColor: '#94a3b8',
          strokeWidth: 2,
        },
      };

      setEdges((eds) => [...eds, newEdge]);
    },
    [edges, setEdges]
  );

  const updateEdge = useCallback(
    (edgeId: string, data: { sourceHandle?: string; targetHandle?: string } & Record<string, unknown>) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                sourceHandle: data.sourceHandle ?? edge.sourceHandle,
                targetHandle: data.targetHandle ?? edge.targetHandle,
                data: { ...edge.data, ...data },
              }
            : edge
        )
      );
    },
    [setEdges]
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
          type: node.type,
          position: node.position,
          revealAtStep: (revealAtStep as number) ?? 1,
          data: rest,
        } as FlowNodeConfig;
      }),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: (edge.sourceHandle as 'top' | 'bottom' | 'left' | 'right') || 'bottom',
        targetHandle: (edge.targetHandle as 'top' | 'bottom' | 'left' | 'right') || 'top',
        type: (edge.type as 'animatedDashed' | 'default') || 'animatedDashed',
      })),
      settings: initialConfig.settings,
    };
  }, [meta, nodes, edges, initialConfig.settings]);

  const loadConfig = useCallback((config: FlowConfig) => {
    // Update meta
    setMeta(config.meta);

    // Convert config nodes to React Flow format (or empty array)
    const newNodes: Node[] = (config.nodes || []).map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { ...node.data, revealAtStep: node.revealAtStep },
    }));

    // Convert config edges to React Flow format (or empty array)
    const newEdges: Edge[] = (config.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || 'bottom',
      targetHandle: edge.targetHandle || 'top',
      type: edge.type || 'animatedDashed',
    }));

    // Replace nodes and edges completely
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

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
    updateEdge,
    deleteEdge,
    getMaxStep,
    getConfig,
    loadConfig,
  };
}
