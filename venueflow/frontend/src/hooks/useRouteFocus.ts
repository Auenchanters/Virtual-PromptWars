import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Moves focus to the element with the given id every time the pathname
 * changes. Required for screen-reader users on SPA route transitions —
 * without it, focus stays on the previous page's link and the new page's
 * heading is never announced (WCAG 2.4.3 Focus Order).
 */
export function useRouteFocus(targetId: string = 'main-content'): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.focus({ preventScroll: false });
  }, [pathname, targetId]);
}
