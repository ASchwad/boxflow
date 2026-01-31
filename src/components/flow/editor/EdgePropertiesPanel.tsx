import { useEffect, useState, useCallback } from 'react';
import type { Edge } from '@xyflow/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, X } from 'lucide-react';
import type { MarkerType, LineStyle, EdgeAnimation, HandlePosition } from '@/types/flow';

interface EdgePropertiesPanelProps {
  edge: Edge | null;
  onClose: () => void;
  onSave: (edgeId: string, data: Record<string, unknown>) => void;
}

const PANEL_WIDTH = 280;

const MARKER_OPTIONS: { value: MarkerType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'arrowClosed', label: 'Arrow (Filled)' },
];

const LINE_STYLE_OPTIONS: { value: LineStyle; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const ANIMATION_OPTIONS: { value: EdgeAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'flow', label: 'Flow' },
];

const HANDLE_OPTIONS: { value: HandlePosition; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const COLOR_OPTIONS = [
  { value: '#94a3b8', label: 'Gray' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
];

const STROKE_WIDTH_OPTIONS = [
  { value: 1, label: '1px' },
  { value: 2, label: '2px' },
  { value: 3, label: '3px' },
  { value: 4, label: '4px' },
];

export function EdgePropertiesPanel({
  edge,
  onClose,
  onSave,
}: EdgePropertiesPanelProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Reset form data when edge changes
  useEffect(() => {
    if (edge) {
      setFormData({
        sourceHandle: edge.sourceHandle || 'bottom',
        targetHandle: edge.targetHandle || 'top',
        markerStart: edge.data?.markerStart || 'none',
        markerEnd: edge.data?.markerEnd || 'none',
        lineStyle: edge.data?.lineStyle || 'dashed',
        animation: edge.data?.animation || 'flow',
        strokeColor: edge.data?.strokeColor || '#94a3b8',
        strokeWidth: edge.data?.strokeWidth || 2,
      });
    }
  }, [edge]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && edge) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [edge, onClose]);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  if (!edge) return null;

  const handleSave = () => {
    onSave(edge.id, formData);
    onClose();
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
              <Minus className="h-4 w-4" />
              Edit Edge
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
            Configure edge appearance and connection points.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Handle Positions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Source Handle</Label>
              <Select
                value={formData.sourceHandle as string}
                onValueChange={(value) => updateField('sourceHandle', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HANDLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Target Handle</Label>
              <Select
                value={formData.targetHandle as string}
                onValueChange={(value) => updateField('targetHandle', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HANDLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Markers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Start Marker</Label>
              <Select
                value={formData.markerStart as string}
                onValueChange={(value) => updateField('markerStart', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Marker</Label>
              <Select
                value={formData.markerEnd as string}
                onValueChange={(value) => updateField('markerEnd', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Style */}
          <div className="space-y-1.5">
            <Label className="text-xs">Line Style</Label>
            <Select
              value={formData.lineStyle as string}
              onValueChange={(value) => updateField('lineStyle', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LINE_STYLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animation */}
          <div className="space-y-1.5">
            <Label className="text-xs">Animation</Label>
            <Select
              value={formData.animation as string}
              onValueChange={(value) => updateField('animation', value)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField('strokeColor', opt.value)}
                  className={`w-7 h-7 rounded-md border-2 transition-all ${
                    formData.strokeColor === opt.value
                      ? 'border-primary scale-110'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                  style={{ backgroundColor: opt.value }}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="space-y-1.5">
            <Label className="text-xs">Stroke Width</Label>
            <Select
              value={(formData.strokeWidth as number)?.toString()}
              onValueChange={(value) => updateField('strokeWidth', parseInt(value))}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STROKE_WIDTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="flex-1">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
