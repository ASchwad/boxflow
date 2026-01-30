import { useEffect } from 'react';

interface UseKeyboardNavigationOptions {
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onGoToEnd: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onReset,
  onGoToEnd,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
        case ' ': // Space
          event.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious();
          break;
        case 'Home':
          event.preventDefault();
          onReset();
          break;
        case 'End':
          event.preventDefault();
          onGoToEnd();
          break;
        case 'Escape':
          // Could be used for exiting fullscreen or other actions
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrevious, onReset, onGoToEnd, enabled]);
}
