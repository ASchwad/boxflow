import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface StepperControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepperControls({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onReset,
  isFirstStep,
  isLastStep,
}: StepperControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-sm text-gray-600 min-w-[80px] text-center">
        Step {currentStep} of {totalSteps}
      </span>

      <Button
        variant="default"
        size="sm"
        onClick={onNext}
        disabled={isLastStep}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={isFirstStep}
        title="Reset"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}
