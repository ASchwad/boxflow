import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Download, Upload, Pencil } from 'lucide-react';
import type { FlowMeta } from '@/types/flow';

interface EditorHeaderProps {
  meta: FlowMeta;
  onMetaChange: (updates: Partial<FlowMeta>) => void;
  onPresent: () => void;
  onExport: () => void;
  onImport: () => void;
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

export function EditorHeader({
  meta,
  onMetaChange,
  onPresent,
  onExport,
  onImport,
}: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-foreground">
          <EditableText
            value={meta.title}
            onChange={(title) => onMetaChange({ title })}
            placeholder="Untitled Flow"
            inputClassName="text-xl font-semibold"
          />
        </h1>
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
