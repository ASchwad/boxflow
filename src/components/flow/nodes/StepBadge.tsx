import { useState, useEffect, type MouseEvent } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useFlowEditorContext } from '@/contexts/FlowEditorContext';

interface StepBadgeProps {
  step: number;
  nodeId?: string;
  className?: string;
}

export function StepBadge({ step, nodeId, className = '' }: StepBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStep, setLocalStep] = useState(step);
  const { updateNodeStep, isEditorMode } = useFlowEditorContext();

  // Sync local step with prop when it changes
  useEffect(() => {
    setLocalStep(step);
  }, [step]);

  // Generate color based on step number (blue to purple gradient)
  const hue = 220 + (step - 1) * 20; // Start at blue (220), shift toward purple
  const saturation = 70;
  const lightness = 50;

  const handleStepChange = (newStep: number) => {
    const validStep = Math.max(1, newStep);
    setLocalStep(validStep);

    if (nodeId && isEditorMode) {
      updateNodeStep(nodeId, validStep);
    }
  };

  const handleClick = (e: MouseEvent) => {
    // Only allow click in editor mode
    if (nodeId && isEditorMode) {
      e.stopPropagation();
      setLocalStep(step);
      setIsOpen(true);
    }
  };

  const canEdit = nodeId && isEditorMode;

  const badgeContent = (
    <div
      className={`step-badge absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md z-10 ${canEdit ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${className}`}
      style={{
        backgroundColor: `hsl(${Math.min(hue, 280)}, ${saturation}%, ${lightness}%)`,
      }}
      title={canEdit ? `Step ${step} - Click to change` : `Reveals at Step ${step}`}
      onClick={handleClick}
    >
      {step}
    </div>
  );

  // If not editable, just render the badge without popover
  if (!canEdit) {
    return badgeContent;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {badgeContent}
      </PopoverTrigger>
      <PopoverContent className="w-32 p-2" align="end" side="top">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground text-center">
            Reveal at Step
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleStepChange(localStep - 1)}
              disabled={localStep <= 1}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={1}
              value={localStep}
              onChange={(e) => handleStepChange(parseInt(e.target.value) || 1)}
              className="h-7 w-12 text-center text-sm px-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleStepChange(localStep + 1)}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
