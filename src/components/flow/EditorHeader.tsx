import { Button } from '@/components/ui/button';
import { Play, Download, Upload } from 'lucide-react';
import type { FlowMeta } from '@/types/flow';

interface EditorHeaderProps {
  meta: FlowMeta;
  onPresent: () => void;
  onExport: () => void;
  onImport: () => void;
}

export function EditorHeader({ meta, onPresent, onExport, onImport }: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        <Button size="sm" onClick={onPresent}>
          <Play className="h-4 w-4 mr-1" />
          Present
        </Button>
      </div>
    </header>
  );
}
