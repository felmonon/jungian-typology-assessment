import { useState, useEffect } from 'react';

export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Hook for animation preferences with safe fallbacks
export const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion();

  return {
    // Return 0 duration if reduced motion is preferred
    duration: prefersReducedMotion ? 0 : undefined,
    // Disable all animations
    shouldAnimate: !prefersReducedMotion,
    // CSS transition classes
    transitionClass: prefersReducedMotion ? '' : 'transition-all duration-300',
    // Transform classes
    hoverTransform: prefersReducedMotion ? '' : 'hover:-translate-y-0.5',
    // Animation delays (set to 0 if reduced motion)
    staggerDelay: (index: number) => prefersReducedMotion ? 0 : index * 100,
  };
};
