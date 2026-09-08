import React from 'react';
import { FunctionEmblem } from './FunctionEmblem';

const EXAMPLE_FUNCTION_STACK = [
  { code: 'Ti', role: 'Lead', label: 'Find the logic' },
  { code: 'Ne', role: 'Support', label: 'Explore possibilities' },
  { code: 'Si', role: 'Balance', label: 'Draw on experience' },
  { code: 'Fe', role: 'Growth', label: 'Connect with others' },
];

export const FunctionStackArtwork: React.FC<{
  items?: Array<{ code: string; role: string; label?: string }>;
  compact?: boolean;
}> = ({ items = EXAMPLE_FUNCTION_STACK, compact = false }) => (
  <div className={`function-artwork ${compact ? 'function-artwork--compact' : ''}`}>
    {items.map((item, index) => (
      <div key={`${item.role}-${item.code}`} className={`function-tile function-tile--${index % 4}`}>
        <div className="function-tile-top"><span>{compact ? ({ Dominant: 'Lead', Auxiliary: 'Support', Tertiary: 'Balance', Inferior: 'Growth' } as Record<string, string>)[item.role] || item.role : item.role}</span><span>0{index + 1}</span></div>
        <FunctionEmblem code={item.code} className="function-tile-mark" />
        <div className="function-tile-bottom"><span className="function-tile-code">{item.code}</span>{item.label && <span className="function-tile-label">{item.label}</span>}</div>
      </div>
    ))}
  </div>
);
