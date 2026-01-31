import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFlowEditorContext } from '@/contexts/FlowEditorContext';

interface StepBadgeProps {
  step: number;
  nodeId?: string;
  className?: string;
}

export function StepBadge({ step, nodeId, className = '' }: StepBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localStep, setLocalStep] = useState(step);
  const { updateNodeStep, isEditorMode, maxStep } = useFlowEditorContext();

  // Sync local step with prop when it changes
  useEffect(() => {
    setLocalStep(step);
  }, [step]);

  // Generate color based on step number (blue to purple gradient)
  const hue = 220 + (step - 1) * 20; // Start at blue (220), shift toward purple
  const saturation = 70;
  const lightness = 50;

  // Generate valid step options: 1 to maxStep+1 (to allow creating next step)
  const stepOptions = useMemo(() => {
    const max = Math.max(maxStep, 1);
    return Array.from({ length: max + 1 }, (_, i) => i + 1);
  }, [maxStep]);

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
      <PopoverContent className="w-36 p-2" align="end" side="top">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground text-center">
            Reveal at Step
          </p>
          <Select
            value={localStep.toString()}
            onValueChange={(value) => handleStepChange(parseInt(value))}
          >
            <SelectTrigger className="h-8">
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
      </PopoverContent>
    </Popover>
  );
}
