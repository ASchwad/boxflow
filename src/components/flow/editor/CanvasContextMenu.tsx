import { useCallback, useState, useEffect, type MouseEvent } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, MessageSquare, Image } from 'lucide-react';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  flowPosition: { x: number; y: number };
}

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
  disabled?: boolean;
}

export function CanvasContextMenu({
  children,
  onAddNode,
  screenToFlowPosition,
  disabled = false,
}: CanvasContextMenuProps) {
  const [menu, setMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    flowPosition: { x: 0, y: 0 },
  });

  const handleContextMenu = useCallback(
    (event: MouseEvent) => {
      if (disabled) return;

      // Only show menu for clicks on the canvas background (not on nodes)
      const target = event.target as HTMLElement;
      const isCanvasBackground =
        target.classList.contains('react-flow__pane') ||
        target.classList.contains('react-flow__background');

      if (!isCanvasBackground) return;

      event.preventDefault();

      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        flowPosition: flowPos,
      });
    },
    [disabled, screenToFlowPosition]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      onAddNode(type, menu.flowPosition);
      setMenu((prev) => ({ ...prev, isOpen: false }));
    },
    [onAddNode, menu.flowPosition]
  );

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

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}

      <DropdownMenu open={menu.isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: 'fixed',
              left: menu.position.x,
              top: menu.position.y,
              width: 1,
              height: 1,
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Add Node
          </div>
          <DropdownMenuItem onClick={() => handleAddNode('processStep')}>
            <FileText className="h-4 w-4 mr-2" />
            Process Step
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddNode('hint')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Hint
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddNode('image')}>
            <Image className="h-4 w-4 mr-2" />
            Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
