import { useEffect, useState } from 'react';
import type { Node } from '@xyflow/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, MessageSquare, Image } from 'lucide-react';

interface NodePropertiesPanelProps {
  node: Node | null;
  onClose: () => void;
  onSave: (nodeId: string, data: Record<string, unknown>) => void;
}

export function NodePropertiesPanel({
  node,
  onClose,
  onSave,
}: NodePropertiesPanelProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Reset form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({ ...node.data });
    }
  }, [node]);

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
        return <FileText className="h-5 w-5" />;
      case 'hint':
        return <MessageSquare className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
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
    <Sheet open={!!node} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </SheetTitle>
          <SheetDescription>
            Make changes to this node. Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Common: Reveal at Step */}
          <div className="space-y-2">
            <Label htmlFor="revealAtStep">Reveal at Step</Label>
            <Input
              id="revealAtStep"
              type="number"
              min={1}
              value={(formData.revealAtStep as number) || 1}
              onChange={(e) => updateField('revealAtStep', parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              The step number when this node becomes visible
            </p>
          </div>

          {/* Process Step Fields */}
          {node.type === 'processStep' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={(formData.title as string) || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Step title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  value={(formData.content as string) || ''}
                  onChange={(e) => updateField('content', e.target.value)}
                  placeholder="Hint content"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isCode">Code Format</Label>
                  <p className="text-xs text-muted-foreground">
                    Display as monospace code
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
              <div className="space-y-2">
                <Label htmlFor="src">Image URL</Label>
                <Input
                  id="src"
                  type="url"
                  value={(formData.src as string) || ''}
                  onChange={(e) => updateField('src', e.target.value)}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={(formData.alt as string) || ''}
                  onChange={(e) => updateField('alt', e.target.value)}
                  placeholder="Image description for accessibility"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={(formData.caption as string) || ''}
                  onChange={(e) => updateField('caption', e.target.value)}
                  placeholder="Image caption"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={50}
                  max={800}
                  value={(formData.width as number) || 200}
                  onChange={(e) => updateField('width', parseInt(e.target.value) || 200)}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
