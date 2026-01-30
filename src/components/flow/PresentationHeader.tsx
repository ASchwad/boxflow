import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { FlowMeta } from '@/types/flow';

interface PresentationHeaderProps {
  meta: FlowMeta;
  onExit: () => void;
}

export function PresentationHeader({ meta, onExit }: PresentationHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onExit} className="absolute right-4">
        <X className="h-5 w-5" />
      </Button>
    </header>
  );
}
