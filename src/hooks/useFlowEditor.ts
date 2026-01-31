import { useState, useCallback, useRef } from 'react';
import { useNodesState, useEdgesState, type Node, type Edge } from '@xyflow/react';
import type { FlowConfig, FlowMeta } from '@/types/flow';

export type StepAssignmentMode = 'auto-increment' | 'same-as-last' | 'always-1';

const STEP_MODE_STORAGE_KEY = 'flow-editor-step-mode';

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

  // Step operations
  normalizeSteps: () => { oldMax: number; newMax: number };
  stepAssignmentMode: StepAssignmentMode;
  setStepAssignmentMode: (mode: StepAssignmentMode) => void;

  // Config operations
  getConfig: () => FlowConfig;
  loadConfig: (config: FlowConfig) => void;
}

export function useFlowEditor({ initialConfig }: UseFlowEditorOptions): UseFlowEditorReturn {
  const [mode, setMode] = useState<'editor' | 'presentation'>('editor');
  const [meta, setMeta] = useState<FlowMeta>(initialConfig.meta);

  // Step assignment mode with localStorage persistence
  const [stepAssignmentMode, setStepAssignmentModeState] = useState<StepAssignmentMode>(() => {
    try {
      const stored = localStorage.getItem(STEP_MODE_STORAGE_KEY);
      if (stored && ['auto-increment', 'same-as-last', 'always-1'].includes(stored)) {
        return stored as StepAssignmentMode;
      }
    } catch {}
    return 'auto-increment';
  });

  // Track last added step for "same-as-last" mode
  const lastAddedStepRef = useRef<number>(1);

  const setStepAssignmentMode = useCallback((newMode: StepAssignmentMode) => {
    setStepAssignmentModeState(newMode);
    try {
      localStorage.setItem(STEP_MODE_STORAGE_KEY, newMode);
    } catch {}
  }, []);

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
        // Calculate step based on assignment mode
        let newStep: number;

        if (stepAssignmentMode === 'always-1') {
          newStep = 1;
        } else if (stepAssignmentMode === 'same-as-last') {
          newStep = lastAddedStepRef.current;
        } else {
          // 'auto-increment' (default)
          const maxStep = nds.length === 0
            ? 0
            : nds.reduce((max, node) => {
                const step = (node.data?.revealAtStep as number) ?? 1;
                return Math.max(max, step);
              }, 1);
          newStep = maxStep === 0 ? 1 : maxStep + 1;
        }

        // Track this step for "same-as-last" mode
        lastAddedStepRef.current = newStep;

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

        return [...nds, newNode];
      });
    },
    [setNodes, stepAssignmentMode]
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
      type: edge.type || 'animatedDashed',
    }));

    // Replace nodes and edges completely
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  // Normalize steps to be sequential (1, 3, 7 becomes 1, 2, 3)
  const normalizeSteps = useCallback(() => {
    let result = { oldMax: 0, newMax: 0 };

    setNodes((nds) => {
      if (nds.length === 0) return nds;

      // Get all unique steps and sort them
      const uniqueSteps = [...new Set(
        nds.map((n) => (n.data?.revealAtStep as number) ?? 1)
      )].sort((a, b) => a - b);

      result.oldMax = uniqueSteps[uniqueSteps.length - 1];
      result.newMax = uniqueSteps.length;

      // Create mapping from old step to new step
      const stepMapping = new Map<number, number>();
      uniqueSteps.forEach((oldStep, index) => {
        stepMapping.set(oldStep, index + 1);
      });

      // Update all nodes with new step numbers
      return nds.map((node) => {
        const oldStep = (node.data?.revealAtStep as number) ?? 1;
        const newStep = stepMapping.get(oldStep) ?? 1;
        return {
          ...node,
          data: { ...node.data, revealAtStep: newStep },
        };
      });
    });

    return result;
  }, [setNodes]);

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
    normalizeSteps,
    stepAssignmentMode,
    setStepAssignmentMode,
    getConfig,
    loadConfig,
  };
}
