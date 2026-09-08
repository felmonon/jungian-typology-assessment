import { useCallback, useEffect, useRef, useState } from 'react';

type OfferImpressionOptions = {
  impressionKey: string | null;
  enabled?: boolean;
  onImpression: () => void;
};

// A small viewport inset avoids counting an offer that only touches the bottom
// edge. Unlike a percentage-of-card threshold, this also works for tall mobile
// offers that can never fit entirely inside the viewport.
const VIEWPORT_INSET = 48;

export function useOfferImpression<T extends HTMLElement = HTMLElement>({
  impressionKey,
  enabled = true,
  onImpression,
}: OfferImpressionOptions): (node: T | null) => void {
  const [element, setElement] = useState<T | null>(null);
  const seenKeys = useRef(new Set<string>());
  const onImpressionRef = useRef(onImpression);
  onImpressionRef.current = onImpression;
  const offerRef = useCallback((node: T | null) => setElement(node), []);

  useEffect(() => {
    if (!element || !enabled || !impressionKey || seenKeys.current.has(impressionKey)) return;

    let active = true;
    let intersects = false;
    let observer: IntersectionObserver | undefined;
    const reportIfVisible = () => {
      if (!active || !intersects || document.visibilityState === 'hidden' || seenKeys.current.has(impressionKey)) return;
      if (element.closest('[hidden], [inert], [aria-hidden="true"]')) return;
      seenKeys.current.add(impressionKey);
      observer?.disconnect();
      onImpressionRef.current();
    };

    const checkBounds = () => {
      const bounds = element.getBoundingClientRect();
      intersects = bounds.width > 0 && bounds.height > 0
        && bounds.bottom > VIEWPORT_INSET
        && bounds.top < window.innerHeight - VIEWPORT_INSET
        && bounds.right > 0 && bounds.left < window.innerWidth;
      reportIfVisible();
    };

    const handleVisibility = () => {
      if (observer) reportIfVisible();
      else checkBounds();
    };

    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        const entry = entries.find((candidate) => candidate.target === element);
        if (!entry) return;
        intersects = entry.isIntersecting;
        reportIfVisible();
      }, { rootMargin: `-${VIEWPORT_INSET}px 0px -${VIEWPORT_INSET}px 0px`, threshold: 0 });
      observer.observe(element);
    } else {
      // Older browsers still require real viewport exposure; mounting is never
      // used as a substitute for an impression.
      checkBounds();
      window.addEventListener('scroll', checkBounds, { passive: true });
      window.addEventListener('resize', checkBounds);
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener('scroll', checkBounds);
      window.removeEventListener('resize', checkBounds);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [element, enabled, impressionKey]);

  return offerRef;
}
