import { createContext, useContext, type ReactNode } from 'react';

interface FlowEditorContextValue {
  updateNodeStep: (nodeId: string, step: number) => void;
  isEditorMode: boolean;
}

const FlowEditorContext = createContext<FlowEditorContextValue | null>(null);

interface FlowEditorProviderProps {
  children: ReactNode;
  updateNodeStep: (nodeId: string, step: number) => void;
  isEditorMode: boolean;
}

export function FlowEditorProvider({
  children,
  updateNodeStep,
  isEditorMode,
}: FlowEditorProviderProps) {
  return (
    <FlowEditorContext.Provider value={{ updateNodeStep, isEditorMode }}>
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
    };
  }
  return context;
}
