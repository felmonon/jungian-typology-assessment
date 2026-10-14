import React from 'react';
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from './wordmarkPath';

type TypeJungMarkSize = 'xs' | 'sm' | 'md' | 'lg';
type TypeJungTone = 'color' | 'dark' | 'mono';

interface TypeJungMarkProps {
  className?: string;
  size?: TypeJungMarkSize;
  showLabel?: boolean;
  /** color: red over ink. dark: red over paper (for the night field). mono: currentColor. */
  tone?: TypeJungTone;
}

const sizeClasses: Record<TypeJungMarkSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-8 h-8',
  md: 'w-14 h-14',
  lg: 'w-28 h-28',
};

const toneColors: Record<TypeJungTone, { top: string; rest: string }> = {
  color: { top: 'var(--color-jung-accent)', rest: 'var(--color-jung-dark)' },
  dark: { top: 'var(--color-jung-accent)', rest: 'var(--color-night-ink)' },
  mono: { top: 'currentColor', rest: 'currentColor' },
};

// The reflection: a solid triangle on the horizon and its outline below.
// The same geometry as brand/build-identity.py and public/brand/*.svg.
export const ReflectionGlyph: React.FC<{
  className?: string;
  tone?: TypeJungTone;
  title?: string;
}> = ({ className = '', tone = 'color', title }) => {
  const colors = toneColors[tone];
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path fill={colors.top} d="M32 1L47 30H17Z" />
      <rect fill={colors.rest} x="6" y="30" width="52" height="4" />
      <path
        fill={colors.rest}
        fillRule="evenodd"
        d="M17 34H47L32 63ZM23.57 38L32 54.29L40.43 38Z"
      />
    </svg>
  );
};

export const Wordmark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox={WORDMARK_VIEWBOX}
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path fill="currentColor" d={WORDMARK_PATH} />
  </svg>
);

export const TypeJungMark: React.FC<TypeJungMarkProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
  tone = 'color',
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
    <ReflectionGlyph
      className={`${sizeClasses[size]} shrink-0`}
      tone={tone}
      title={showLabel ? undefined : 'TypeJung'}
    />
    {showLabel && (
      <>
        <Wordmark className="h-[1.05em] w-auto" />
        <span className="sr-only">TypeJung</span>
      </>
    )}
  </span>
);

/** Header lockup: mark plus outlined wordmark, sized by font-size. */
export const TypeJungLogo: React.FC<{ className?: string; tone?: TypeJungTone }> = ({
  className = '',
  tone = 'color',
}) => (
  <span className={`tj-logo ${className}`.trim()}>
    <ReflectionGlyph className="tj-logo-mark" tone={tone} />
    <Wordmark className="tj-logo-word" />
    <span className="sr-only">TypeJung</span>
  </span>
);
