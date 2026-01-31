import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Play, Download, Upload, Pencil, FilePlus, Check, Loader2, MoreHorizontal, ListOrdered, Settings2 } from 'lucide-react';
import type { FlowMeta } from '@/types/flow';
import type { SaveStatus } from '@/hooks/useAutoSave';
import type { StepAssignmentMode } from '@/hooks/useFlowEditor';

interface EditorHeaderProps {
  meta: FlowMeta;
  onMetaChange: (updates: Partial<FlowMeta>) => void;
  onPresent: () => void;
  onExport: () => void;
  onImport: () => void;
  onNewFlow: () => void;
  onNormalizeSteps: () => void;
  saveStatus: SaveStatus;
  stepAssignmentMode: StepAssignmentMode;
  onStepAssignmentModeChange: (mode: StepAssignmentMode) => void;
}

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

function EditableText({
  value,
  onChange,
  placeholder = 'Click to edit',
  className = '',
  inputClassName = '',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  }, [editValue, value, onChange]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b-2 border-primary outline-none ${inputClassName}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-accent/50 px-1 -mx-1 rounded transition-colors group inline-flex items-center gap-1 ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-green-500" />
        All changes saved
      </span>
    );
  }

  return (
    <span className="text-xs text-amber-500">
      Unsaved changes
    </span>
  );
}

const stepModeLabels: Record<StepAssignmentMode, string> = {
  'auto-increment': 'Auto-increment (next step)',
  'same-as-last': 'Same as last added',
  'always-1': 'Always Step 1',
};

export function EditorHeader({
  meta,
  onMetaChange,
  onPresent,
  onExport,
  onImport,
  onNewFlow,
  onNormalizeSteps,
  saveStatus,
  stepAssignmentMode,
  onStepAssignmentModeChange,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground">
            <EditableText
              value={meta.title}
              onChange={(title) => onMetaChange({ title })}
              placeholder="Untitled Flow"
              inputClassName="text-xl font-semibold"
            />
          </h1>
          <SaveStatusIndicator status={saveStatus} />
        </div>
        <p className="text-sm text-muted-foreground">
          <EditableText
            value={meta.subtitle || ''}
            onChange={(subtitle) => onMetaChange({ subtitle })}
            placeholder="Add a subtitle..."
            inputClassName="text-sm"
          />
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onNewFlow}>
          <FilePlus className="h-4 w-4 mr-1" />
          New
        </Button>
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>

        {/* Tools dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNormalizeSteps}>
              <ListOrdered className="h-4 w-4 mr-2" />
              Normalize Steps
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings2 className="h-4 w-4 mr-2" />
                New Node Step
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={stepAssignmentMode}
                  onValueChange={(value) => onStepAssignmentModeChange(value as StepAssignmentMode)}
                >
                  <DropdownMenuRadioItem value="auto-increment">
                    {stepModeLabels['auto-increment']}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="same-as-last">
                    {stepModeLabels['same-as-last']}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="always-1">
                    {stepModeLabels['always-1']}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={onPresent}>
          <Play className="h-4 w-4 mr-1" />
          Present
        </Button>
      </div>
    </header>
  );
}
