import { useCallback, useState, useEffect, type MouseEvent } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Hash, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
}

interface NodeContextMenuProps {
  selectedNodeIds: string[];
  maxStep: number;
  onSetStep: (nodeIds: string[], step: number) => void;
  onDeleteNodes: (nodeIds: string[]) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function NodeContextMenu({
  selectedNodeIds,
  maxStep,
  onSetStep,
  onDeleteNodes,
  disabled = false,
  children,
}: NodeContextMenuProps) {
  const [menu, setMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
  });

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      if (disabled) return;

      // Check if right-clicked on a selected node
      const target = event.target as HTMLElement;
      const nodeElement = target.closest('.react-flow__node');

      if (!nodeElement) return;

      // Check if this node is in the selection
      const nodeId = nodeElement.getAttribute('data-id');
      if (!nodeId || !selectedNodeIds.includes(nodeId)) return;

      // Only show if multiple nodes are selected
      if (selectedNodeIds.length < 2) return;

      event.preventDefault();
      event.stopPropagation();

      setMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    [disabled, selectedNodeIds]
  );

  const handleSetStep = useCallback(
    (step: number) => {
      onSetStep(selectedNodeIds, step);
      const count = selectedNodeIds.length;
      toast.success(`${count} nodes set to Step ${step}`);
      setMenu((prev) => ({ ...prev, isOpen: false }));
    },
    [selectedNodeIds, onSetStep]
  );

  const handleDelete = useCallback(() => {
    onDeleteNodes(selectedNodeIds);
    setMenu((prev) => ({ ...prev, isOpen: false }));
  }, [selectedNodeIds, onDeleteNodes]);

  const handleClose = useCallback(() => {
    setMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Close menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Generate step options: 1 through maxStep + "New Step"
  const stepOptions = Array.from({ length: maxStep }, (_, i) => i + 1);
  const newStep = maxStep + 1;

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}

      <DropdownMenu open={menu.isOpen} onOpenChange={(open) => !open && handleClose()}>
        <div
          style={{
            position: 'fixed',
            left: menu.position.x,
            top: menu.position.y,
            width: 1,
            height: 1,
          }}
        />
        <DropdownMenuContent
          align="start"
          className="w-48"
          style={{
            position: 'fixed',
            left: menu.position.x,
            top: menu.position.y,
          }}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {selectedNodeIds.length} nodes selected
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Hash className="h-4 w-4 mr-2" />
              Set Step
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {stepOptions.map((step) => (
                <DropdownMenuItem key={step} onClick={() => handleSetStep(step)}>
                  Step {step}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSetStep(newStep)}>
                <Plus className="h-4 w-4 mr-2" />
                New Step ({newStep})
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedNodeIds.length} nodes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
