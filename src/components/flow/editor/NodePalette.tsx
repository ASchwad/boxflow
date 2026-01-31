import type { DragEvent, MouseEvent } from 'react';
import { FileText, MessageSquare, Image, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const nodeTypeOptions = [
  {
    type: 'processStep',
    label: 'Process Step',
    icon: FileText,
    description: 'Main workflow step',
  },
  {
    type: 'hint',
    label: 'Hint',
    icon: MessageSquare,
    description: 'Annotation or note',
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    description: 'Visual content',
  },
];

interface NodePaletteProps {
  onAddNode?: (type: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (_event: MouseEvent, nodeType: string) => {
    // Prevent triggering drag on click
    if (onAddNode) {
      onAddNode(nodeType);
    }
  };

  return (
    <div className="w-48 border-r border-border bg-background p-3 flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Nodes
      </h3>

      {nodeTypeOptions.map(({ type, label, icon: Icon, description }) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => onDragStart(e, type)}
          className="flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:bg-accent transition-colors group"
        >
          <div
            className="flex items-center gap-3 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
          >
            <div className="p-1.5 rounded bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{label}</p>
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => handleClick(e, type)}
            title={`Add ${label} to canvas`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Drag or click + to add
        </p>
      </div>
    </div>
  );
}
