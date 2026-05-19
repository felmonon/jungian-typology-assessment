import React, { useId } from 'react';

type Fn = { name: string; label: string; value: number };

interface FunctionRadialProps {
  data: Fn[];
  size?: number;
  showLabels?: boolean;
}

export const FunctionRadial: React.FC<FunctionRadialProps> = ({
  data,
  size = 320,
  showLabels = true,
}) => {
  const id = useId();
  const cx = size / 2;
  const cy = size / 2;
  const rMax = size * 0.38;
  const ringSteps = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => (-90 + (i * 360) / data.length) * (Math.PI / 180);

  const pt = (i: number, v: number): readonly [number, number] => {
    const a = angleFor(i);
    const r = rMax * (v / 100);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  };

  const polyPoints = data.map((d, i) => pt(i, d.value).join(',')).join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto"
      role="img"
      aria-label="Cognitive function profile"
    >
      <defs>
        <radialGradient id={`fill-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-jung-accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-jung-accent)" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {ringSteps.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={rMax * s}
          fill="none"
          stroke="var(--color-jung-border)"
          strokeWidth={i === ringSteps.length - 1 ? 1 : 0.5}
          strokeDasharray={i === ringSteps.length - 1 ? 'none' : '2 3'}
          opacity={0.7}
        />
      ))}

      {data.map((_, i) => {
        const a = angleFor(i);
        const x2 = cx + Math.cos(a) * rMax;
        const y2 = cy + Math.sin(a) * rMax;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="var(--color-jung-border)"
            strokeWidth={0.5}
            opacity={0.55}
          />
        );
      })}

      <polygon
        points={polyPoints}
        fill={`url(#fill-${id})`}
        stroke="var(--color-jung-accent)"
        strokeWidth={1.25}
        strokeLinejoin="round"
      />

      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return (
          <circle
            key={d.name}
            cx={x}
            cy={y}
            r={2.5}
            fill="var(--color-jung-accent)"
            stroke="var(--color-jung-base)"
            strokeWidth={1.5}
          />
        );
      })}

      {showLabels &&
        data.map((d, i) => {
          const a = angleFor(i);
          const lr = rMax + 22;
          const x = cx + Math.cos(a) * lr;
          const y = cy + Math.sin(a) * lr;
          return (
            <g key={`label-${d.name}`}>
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-display)"
                fontSize="14"
                fontStyle="italic"
                fill="var(--color-jung-dark)"
              >
                {d.name}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize="9"
                fill="var(--color-jung-muted)"
                letterSpacing="0.05em"
              >
                {d.value}
              </text>
            </g>
          );
        })}
    </svg>
  );
};
