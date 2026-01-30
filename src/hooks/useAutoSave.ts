import { useEffect, useRef, useState, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { FlowConfig, FlowMeta } from '@/types/flow';

const STORAGE_KEY = 'react-flow-visualization-stepper-autosave';
const DEBOUNCE_MS = 1000;

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface UseAutoSaveOptions {
  nodes: Node[];
  edges: Edge[];
  meta: FlowMeta;
  getConfig: () => FlowConfig;
  loadConfig: (config: FlowConfig) => void;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSaved: Date | null;
  clearSaved: () => void;
  hasStoredData: boolean;
}

export function useAutoSave({
  nodes,
  edges,
  meta,
  getConfig,
  loadConfig,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const isLoadingRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as FlowConfig;
        if (config.meta?.title && Array.isArray(config.nodes)) {
          isLoadingRef.current = true;
          loadConfig(config);
          setHasStoredData(true);
          setLastSaved(new Date());
          // Reset loading flag after a short delay
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 100);
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }

    isInitializedRef.current = true;
  }, [enabled, loadConfig]);

  // Save to localStorage when data changes (debounced)
  useEffect(() => {
    // Skip if not initialized yet or currently loading
    if (!enabled || !isInitializedRef.current || isLoadingRef.current) return;

    setStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const config = getConfig();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        setStatus('saved');
        setLastSaved(new Date());
        setHasStoredData(true);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        setStatus('unsaved');
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, nodes, edges, meta, getConfig]);

  // Clear stored data
  const clearSaved = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasStoredData(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, []);

  return {
    status,
    lastSaved,
    clearSaved,
    hasStoredData,
  };
}

// Helper to check if there's stored data without loading it
export function hasStoredFlow(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
