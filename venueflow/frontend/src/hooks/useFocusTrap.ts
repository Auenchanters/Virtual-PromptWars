import { useEffect, RefObject } from 'react';

/**
 * Traps keyboard focus inside a container while it is open, and calls
 * `onEscape` when the Escape key is pressed. Required for WCAG 2.4.3
 * compliance on any modal dialog.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  active: boolean,
  onEscape: () => void
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onEscape();
        return;
      }
      if (event.key !== 'Tab') return;

      const candidates = container.querySelectorAll<HTMLElement>(
        'a[href], area[href], button, input, textarea, select, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      );
      const focusable: HTMLElement[] = [];
      candidates.forEach((el) => {
        if (el.hasAttribute('disabled')) return;
        if (el.getAttribute('aria-hidden') === 'true') return;
        if (el.tabIndex < 0) return;
        focusable.push(el);
      });
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, active, onEscape]);
}
