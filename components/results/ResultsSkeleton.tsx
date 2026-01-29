import React from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const SkeletonBlock: React.FC<{ 
  className?: string; 
  delay?: number;
  reducedMotion: boolean;
}> = ({ className = '', delay = 0, reducedMotion }) => (
  <div
    className={`
      bg-jung-border/50 rounded-lg
      ${reducedMotion ? '' : 'animate-pulse'}
      ${className}
    `}
    style={{ animationDelay: reducedMotion ? '0ms' : `${delay}ms` }}
    aria-hidden="true"
  />
);

export const ResultsSkeleton: React.FC = () => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="editorial-container py-12 md:py-16" role="status" aria-label="Loading results">
      <div className="bg-jung-surface p-6 md:p-8 rounded-2xl space-y-8">
        
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <SkeletonBlock className="h-8 w-64 mx-auto" delay={0} reducedMotion={reducedMotion} />
          <SkeletonBlock className="h-4 w-48 mx-auto" delay={100} reducedMotion={reducedMotion} />
          <div className="flex justify-center gap-2 pt-2">
            <SkeletonBlock className="h-6 w-16 rounded-full" delay={200} reducedMotion={reducedMotion} />
            <SkeletonBlock className="h-6 w-16 rounded-full" delay={250} reducedMotion={reducedMotion} />
          </div>
        </div>

        {/* Chart Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Radar Chart Placeholder */}
          <div className="card-elevated p-6 md:p-8">
            <SkeletonBlock className="h-4 w-40 mx-auto mb-6" delay={300} reducedMotion={reducedMotion} />
            <div className="aspect-square max-w-[400px] mx-auto relative">
              {/* Radar chart shape skeleton */}
              <svg viewBox="0 0 240 240" className="w-full h-full">
                {/* Outer octagon */}
                <polygon
                  points="120,30 190,60 210,120 190,180 120,210 50,180 30,120 50,60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-jung-border/70"
                />
                {/* Middle octagon */}
                <polygon
                  points="120,60 175,80 190,120 175,160 120,180 65,160 50,120 65,80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-jung-border/50"
                />
                {/* Inner octagon */}
                <polygon
                  points="120,90 160,105 170,120 160,135 120,150 80,135 70,120 80,105"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-jung-border/30"
                />
                {/* Animated scanning line */}
                {!reducedMotion && (
                  <line
                    x1="120"
                    y1="120"
                    x2="120"
                    y2="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-jung-accent/30"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 120 120"
                      to="360 120 120"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </svg>
              {/* Center loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-12 h-12 border-4 border-jung-border border-t-jung-accent rounded-full ${reducedMotion ? '' : 'animate-spin'}`} />
              </div>
            </div>
          </div>

          {/* Stats Panel Placeholder */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Attitude Card */}
            <div className="bg-jung-surface p-6 rounded-xl border-l-4 border-jung-border">
              <SkeletonBlock className="h-6 w-48 mb-2" delay={400} reducedMotion={reducedMotion} />
              <SkeletonBlock className="h-4 w-full" delay={450} reducedMotion={reducedMotion} />
            </div>

            {/* Stack Card */}
            <div className="card-elevated p-6">
              <SkeletonBlock className="h-5 w-32 mb-4" delay={500} reducedMotion={reducedMotion} />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-jung-border/50 last:border-0">
                    <SkeletonBlock className="h-4 w-24" delay={500 + i * 50} reducedMotion={reducedMotion} />
                    <SkeletonBlock className="h-4 w-12" delay={500 + i * 50} reducedMotion={reducedMotion} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Skeleton */}
        <div className="space-y-4">
          <SkeletonBlock className="h-6 w-48" delay={700} reducedMotion={reducedMotion} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card-elevated p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <SkeletonBlock className="h-5 w-10" delay={700 + i * 30} reducedMotion={reducedMotion} />
                  <SkeletonBlock className="h-4 w-12" delay={700 + i * 30} reducedMotion={reducedMotion} />
                </div>
                <SkeletonBlock className="h-2 w-full rounded-full" delay={700 + i * 30} reducedMotion={reducedMotion} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Skeleton */}
        <div className="bg-jung-surface-alt rounded-lg border border-jung-border p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <SkeletonBlock className="h-12 w-12 rounded-xl" delay={900} reducedMotion={reducedMotion} />
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-48" delay={950} reducedMotion={reducedMotion} />
              <SkeletonBlock className="h-4 w-64" delay={1000} reducedMotion={reducedMotion} />
            </div>
          </div>
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-full" delay={1050} reducedMotion={reducedMotion} />
            <SkeletonBlock className="h-4 w-11/12" delay={1100} reducedMotion={reducedMotion} />
            <SkeletonBlock className="h-4 w-4/5" delay={1150} reducedMotion={reducedMotion} />
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center text-jung-muted">
          <p className="font-serif text-sm animate-pulse">
            Analyzing your cognitive function profile...
          </p>
          <p className="text-xs mt-1 opacity-70">
            This may take a moment
          </p>
        </div>
      </div>
    </div>
  );
};

// Mini skeleton for smaller components
export const MiniSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  const reducedMotion = useReducedMotion();
  
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-jung-border/50 rounded h-4 ${reducedMotion ? '' : 'animate-pulse'}`}
          style={{ 
            width: `${100 - (i % 3) * 15}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reducedMotion = useReducedMotion();
  
  return (
    <div className={`card-elevated p-6 space-y-4 ${className}`} aria-hidden="true">
      <SkeletonBlock className="h-6 w-3/4" delay={0} reducedMotion={reducedMotion} />
      <SkeletonBlock className="h-4 w-full" delay={100} reducedMotion={reducedMotion} />
      <SkeletonBlock className="h-4 w-5/6" delay={200} reducedMotion={reducedMotion} />
    </div>
  );
};
