import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Clock } from 'lucide-react';

interface StepperControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onGoToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function StepperControls({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onReset,
  onGoToStep,
  isFirstStep,
  isLastStep,
}: StepperControlsProps) {
  // Presentation timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate array of step numbers
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 z-10">
      {/* Step Progress Dots */}
      <div className="flex items-center gap-1 max-w-[300px] overflow-x-auto pb-1">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <button
              onClick={() => onGoToStep(step)}
              className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                step === currentStep
                  ? 'bg-blue-600 scale-110'
                  : step < currentStep
                  ? 'bg-blue-300'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Go to step ${step}`}
              aria-label={`Go to step ${step}`}
            />
            {index < steps.length - 1 && (
              <div
                className={`w-3 h-0.5 mx-0.5 ${
                  step < currentStep ? 'bg-blue-300' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3">
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

        {/* Timer */}
        <div className="flex items-center gap-1 text-xs text-gray-500 ml-2 pl-2 border-l border-gray-200">
          <Clock className="h-3 w-3" />
          <span className="font-mono">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
