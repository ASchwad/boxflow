import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { Toaster } from '@/components/ui/sonner';

function App() {
  // FlowCanvas loads from sample-flow.json by default
  // You can also pass a custom config prop: <FlowCanvas config={myConfig} />
  return (
    <>
      <FlowCanvas />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
