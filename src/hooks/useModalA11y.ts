import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard/focus behaviour every modal needs: Escape closes it, focus moves
 * inside when it opens and back to the trigger when it closes, and Tab cycles
 * within the dialog instead of escaping to the page underneath.
 *
 * Attach the returned ref to the dialog container (give it tabIndex={-1} so it
 * can take focus itself when it has no focusable children, e.g. mid-spin).
 */
export function useModalA11y<T extends HTMLElement>(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<T>(null);
  // Read through a ref so a new onClose identity on every parent render doesn't
  // re-run the effect (which would re-focus the first element on each keystroke).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const getFocusable = () =>
      Array.from(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    // Defer so the focus lands after the open animation has mounted the content.
    const focusTimer = setTimeout(() => {
      const target = getFocusable()[0] ?? containerRef.current;
      target?.focus({ preventScroll: true });
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const outside = !containerRef.current?.contains(active);
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  return containerRef;
}
