import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'editor' | 'presentation';
}

const presentationShortcuts = [
  { keys: ['→', 'Space'], description: 'Next step' },
  { keys: ['←'], description: 'Previous step' },
  { keys: ['Home'], description: 'Go to first step' },
  { keys: ['End'], description: 'Go to last step' },
  { keys: ['Esc'], description: 'Exit presentation' },
  { keys: ['?'], description: 'Show this help' },
];

const editorShortcuts = [
  { keys: ['Backspace', 'Delete'], description: 'Delete selected nodes/edges' },
  { keys: ['Shift + Click'], description: 'Multi-select nodes' },
  { keys: ['Ctrl/Cmd + A'], description: 'Select all' },
  { keys: ['Right-click'], description: 'Context menu' },
  { keys: ['?'], description: 'Show this help' },
];

function ShortcutKey({ keyName }: { keyName: string }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
      {keyName}
    </kbd>
  );
}

export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  mode,
}: KeyboardShortcutsHelpProps) {
  const shortcuts = mode === 'presentation' ? presentationShortcuts : editorShortcuts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {mode === 'presentation' ? 'Presentation Mode' : 'Editor Mode'}
          </p>
          <div className="grid gap-2">
            {shortcuts.map(({ keys, description }) => (
              <div
                key={description}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-foreground">{description}</span>
                <div className="flex items-center gap-1">
                  {keys.map((key, idx) => (
                    <span key={key} className="flex items-center gap-1">
                      <ShortcutKey keyName={key} />
                      {idx < keys.length - 1 && (
                        <span className="text-xs text-muted-foreground">or</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Press <ShortcutKey keyName="?" /> or <ShortcutKey keyName="Esc" /> to close
        </p>
      </DialogContent>
    </Dialog>
  );
}
