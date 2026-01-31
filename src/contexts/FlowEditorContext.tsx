import { createContext, useContext, type ReactNode } from 'react';

interface FlowEditorContextValue {
  updateNodeStep: (nodeId: string, step: number) => void;
  isEditorMode: boolean;
  maxStep: number;
}

const FlowEditorContext = createContext<FlowEditorContextValue | null>(null);

interface FlowEditorProviderProps {
  children: ReactNode;
  updateNodeStep: (nodeId: string, step: number) => void;
  isEditorMode: boolean;
  maxStep: number;
}

export function FlowEditorProvider({
  children,
  updateNodeStep,
  isEditorMode,
  maxStep,
}: FlowEditorProviderProps) {
  return (
    <FlowEditorContext.Provider value={{ updateNodeStep, isEditorMode, maxStep }}>
      {children}
    </FlowEditorContext.Provider>
  );
}

export function useFlowEditorContext() {
  const context = useContext(FlowEditorContext);
  if (!context) {
    // Return a no-op version for when context isn't available
    return {
      updateNodeStep: () => {},
      isEditorMode: false,
      maxStep: 1,
    };
  }
  return context;
}
