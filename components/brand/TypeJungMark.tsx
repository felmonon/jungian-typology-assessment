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

const functionNodes = [
  { x: 50, y: 10, r: 3.3 },
  { x: 78, y: 22, r: 2.4 },
  { x: 90, y: 50, r: 2.8 },
  { x: 78, y: 78, r: 2.2 },
  { x: 50, y: 90, r: 3.3 },
  { x: 22, y: 78, r: 2.4 },
  { x: 10, y: 50, r: 2.8 },
  { x: 22, y: 22, r: 2.2 },
];

export const TypeJungMark: React.FC<TypeJungMarkProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size]} shrink-0`}
        role="img"
        aria-label="TypeJung function-stack map mark"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="38" className="stroke-jung-border" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="22" className="stroke-jung-border/70" strokeWidth="0.9" strokeDasharray="3 4" />
        <path d="M22 78L78 22" className="stroke-jung-accent" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50 10V90M10 50H90" className="stroke-jung-border/60" strokeWidth="0.8" strokeLinecap="round" />
        <circle cx="50" cy="50" r="5" className="fill-jung-surface stroke-jung-accent" strokeWidth="1.4" />
        {functionNodes.map((node, index) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={index === 1 ? 4 : index === 5 ? 3.2 : node.r}
            className={
              index === 1
                ? 'fill-jung-accent'
                : index === 5
                  ? 'fill-jung-tension'
                  : 'fill-jung-dark'
            }
          />
        ))}
        <path
          d="M70 18L82 18L82 30"
          className="stroke-jung-accent"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M30 82L18 82L18 70"
          className="stroke-jung-tension"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span className="font-display text-lg leading-none text-jung-dark tracking-normal">
          TypeJung
        </span>
      )}
    </div>
  );
};
