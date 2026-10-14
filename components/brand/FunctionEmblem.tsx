import React from 'react';

// The function compass. Every glyph is the same diamond, drawn on Jung's
// cross: thinking at the top, feeling at the bottom, sensation on the left,
// intuition on the right. An introverted function fills its point inside the
// diamond; an extraverted one points outward from it. A dominant and its
// inferior are always mirror images (Ti ↔ Fe, Ni ↔ Se, …).
// Shape encodes only the function's name, never a score.

type Point = 'top' | 'bottom' | 'left' | 'right';

const pointByChannel: Record<string, Point> = { T: 'top', F: 'bottom', S: 'left', N: 'right' };

// Diamond with vertices at 32±18. Inner caps fill the corner; outer arrows sit
// beyond it with a small gap.
const inner: Record<Point, string> = {
  top: 'M32 14L41 23H23Z',
  bottom: 'M32 50L41 41H23Z',
  left: 'M14 32L23 23V41Z',
  right: 'M50 32L41 23V41Z',
};

const outer: Record<Point, string> = {
  top: 'M32 2L40 11H24Z',
  bottom: 'M32 62L40 53H24Z',
  left: 'M2 32L11 24V40Z',
  right: 'M62 32L53 24V40Z',
};

export const FunctionEmblem: React.FC<{ code: string; className?: string }> = ({ code, className = '' }) => {
  const point = pointByChannel[code?.[0]?.toUpperCase()] ?? 'top';
  const introverted = code?.[1]?.toLowerCase() !== 'e';
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <path d="M32 14L50 32L32 50L14 32Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="miter" />
      <path d={introverted ? inner[point] : outer[point]} fill="currentColor" />
    </svg>
  );
};
