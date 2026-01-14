import { useState, useEffect } from 'react';

/**
 * Hook that returns true if the media query matches
 * @param query - CSS media query string (e.g., '(min-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook that returns true if screen width is >= 768px (Tailwind's md breakpoint)
 */
export function useIsMobile(): boolean {
  return !useMediaQuery('(min-width: 768px)');
}

/**
 * Hook that returns true if screen width is >= 1024px (Tailwind's lg breakpoint)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook that returns true if screen width is between 768px and 1023px (tablet range)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook that returns true if screen width is < 1024px (mobile or tablet - should use compact layouts)
 */
export function useIsCompactView(): boolean {
  return !useMediaQuery('(min-width: 1024px)');
}
