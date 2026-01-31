import { useEffect, useState, useMemo } from 'react';
import type { Node } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Image, X } from 'lucide-react';
import { useFlowEditorContext } from '@/contexts/FlowEditorContext';

interface NodePropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
  onSave: (nodeId: string, data: Record<string, unknown>) => void;
}

const PANEL_WIDTH = 320;

export function NodePropertiesPanel({
  node,
  onClose,
  onSave,
}: NodePropertiesPanelProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const { maxStep } = useFlowEditorContext();

  // Reset form data when node changes
  useEffect(() => {
    if (node) {
      // Ensure revealAtStep always has a valid value
      setFormData({
        ...node.data,
        revealAtStep: (node.data?.revealAtStep as number) || 1,
      });
    }
  }, [node]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && node) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [node, onClose]);

  // Generate valid step options: 1 to maxStep+1 (to allow creating next step)
  const stepOptions = useMemo(() => {
    const max = Math.max(maxStep, 1);
    return Array.from({ length: max + 1 }, (_, i) => i + 1);
  }, [maxStep]);

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, formData);
    onClose();
  };

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getIcon = () => {
    switch (node.type) {
      case 'processStep':
        return <FileText className="h-4 w-4" />;
      case 'hint':
        return <MessageSquare className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (node.type) {
      case 'processStep':
        return 'Edit Process Step';
      case 'hint':
        return 'Edit Hint';
      case 'image':
        return 'Edit Image';
      default:
        return 'Edit Node';
    }
  };

  return (
    <div
      className="fixed top-20 right-4 z-50 animate-in fade-in-0 slide-in-from-right-4 duration-200"
      style={{ width: PANEL_WIDTH }}
    >
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              {getIcon()}
              {getTitle()}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Make changes to this node. Click save when done.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Common: Reveal at Step */}
          <div className="space-y-1.5">
            <Label htmlFor="revealAtStep" className="text-xs">Reveal at Step</Label>
            <Select
              value={((formData.revealAtStep as number) || 1).toString()}
              onValueChange={(value) => updateField('revealAtStep', parseInt(value))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stepOptions.map((stepNum) => (
                  <SelectItem key={stepNum} value={stepNum.toString()}>
                    Step {stepNum}
                    {stepNum === maxStep + 1 && ' (new)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Process Step Fields */}
          {node.type === 'processStep' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">Title</Label>
                <Input
                  id="title"
                  className="h-8 text-sm"
                  value={(formData.title as string) || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Step title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={(formData.description as string) || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Step description"
                />
              </div>
            </>
          )}

          {/* Hint Fields */}
          {node.type === 'hint' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-xs">Content</Label>
                <textarea
                  id="content"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  value={(formData.content as string) || ''}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Hint content"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isCode" className="text-xs">Code Format</Label>
                  <p className="text-xs text-muted-foreground">
                    Display as monospace
                  </p>
                </div>
                <Switch
                  id="isCode"
                  checked={(formData.isCode as boolean) || false}
                  onCheckedChange={(checked) => updateField('isCode', checked)}
                />
              </div>
            </>
          )}

          {/* Image Fields */}
          {node.type === 'image' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="src" className="text-xs">Image URL</Label>
                <Input
                  id="src"
                  type="url"
                  className="h-8 text-sm"
                  value={(formData.src as string) || ''}
                  onChange={(e) => updateField('src', e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="alt" className="text-xs">Alt Text</Label>
                <Input
                  id="alt"
                  className="h-8 text-sm"
                  value={(formData.alt as string) || ''}
                  onChange={(e) => updateField('alt', e.target.value)}
                  placeholder="Image description"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="caption" className="text-xs">Caption</Label>
                <Input
                  id="caption"
                  className="h-8 text-sm"
                  value={(formData.caption as string) || ''}
                  onChange={(e) => updateField('caption', e.target.value)}
                  placeholder="Image caption"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="width" className="text-xs">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  className="h-8 text-sm"
                  min={50}
                  max={800}
                  value={(formData.width as number) || 200}
                  onChange={(e) => updateField('width', parseInt(e.target.value) || 200)}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
