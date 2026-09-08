import React from 'react';

type TypeJungMarkSize = 'xs' | 'sm' | 'md' | 'lg';

interface TypeJungMarkProps {
  className?: string;
  size?: TypeJungMarkSize;
  showLabel?: boolean;
}

const sizeClasses: Record<TypeJungMarkSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-32 h-32',
};

// One canonical vector keeps the app, shared results, and exported assets in sync.
// Four folded pairs frame an open center; the facets do not encode result scores.
export const TypeJungMark: React.FC<TypeJungMarkProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => (
  <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
    <img
      src="/logo.svg?v=folded-compass-1"
      className={`${sizeClasses[size]} shrink-0`}
      width={96}
      height={96}
      alt="TypeJung folded compass"
    />
    {showLabel && <span className="studio-wordmark font-display text-lg leading-none text-jung-dark">TypeJung</span>}
  </div>
);
