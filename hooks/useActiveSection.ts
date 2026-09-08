import { useEffect, useState } from 'react';

type ActiveSectionOptions = {
  /** Height of the sticky page navigation plus a small reading inset. */
  topOffset?: number;
};

/**
 * Tracks the section at the reading line without scrolling or moving focus.
 * Pass section IDs in page order, and include only sections currently rendered.
 * Fresh arrays with the same IDs do not reconnect the observer.
 */
export function useActiveSection(ids: readonly string[], { topOffset = 128 }: ActiveSectionOptions = {}): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const idsKey = JSON.stringify(ids);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const sectionIds = [...new Set<string>(JSON.parse(idsKey))];
    const elements = sectionIds.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
    const offset = Math.max(0, topOffset);
    let mounted = true;
    let frame: number | null = null;

    const update = () => {
      if (!mounted) return;
      const sections = elements.map((element) => ({ id: element.id, bounds: element.getBoundingClientRect() }))
        .filter(({ bounds }) => bounds.width > 0 || bounds.height > 0);
      if (sections.length === 0) {
        setActiveId(null);
        return;
      }

      // Keep the preceding section active through whitespace between sections.
      // At the document bottom, a short final section may never reach the line.
      let next = sections[0].id;
      for (const section of sections) {
        if (section.bounds.top <= offset) next = section.id;
      }
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight > window.innerHeight && window.scrollY + window.innerHeight >= documentHeight - 2) {
        const visible = sections.filter(({ bounds }) => bounds.top < window.innerHeight && bounds.bottom > offset);
        if (visible.length) next = visible[visible.length - 1].id;
      }
      setActiveId(next);
    };

    const scheduleUpdate = () => {
      if (frame !== null || !mounted) return;
      if (typeof window.requestAnimationFrame !== 'function') {
        update();
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        update();
      });
    };

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(update, { rootMargin: `-${offset}px 0px 0px 0px`, threshold: [0, 1] })
      : null;
    elements.forEach((element) => observer?.observe(element));
    update();
    // The observer catches visibility/layout changes. Scroll also catches a
    // heading crossing the reading line inside a very tall section, and works
    // as the fallback on browsers without IntersectionObserver.
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      mounted = false;
      observer?.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [idsKey, topOffset]);

  return activeId;
}
