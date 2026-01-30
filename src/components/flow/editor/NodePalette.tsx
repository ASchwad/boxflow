import type { DragEvent } from 'react';
import { FileText, MessageSquare, Image } from 'lucide-react';

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

export function NodePalette() {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
          className="flex items-center gap-3 p-2 rounded-md border border-border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
        >
          <div className="p-1.5 rounded bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{label}</p>
            <p className="text-xs text-muted-foreground truncate">{description}</p>
          </div>
        </div>
      ))}

      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Drag to canvas or right-click to add
        </p>
      </div>
    </div>
  );
}
