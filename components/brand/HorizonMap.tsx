import React, { useState } from 'react';
import { FUNCTION_READINGS, isFunctionCode } from '../../data/function-readings';
import { FunctionEmblem } from './FunctionEmblem';

export type StackPosition = 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';

export interface HorizonMapItem {
  code: string;
  position: StackPosition;
  /** Share of mapped energy, 0–100. Draws the bar; omitted for examples. */
  score?: number;
}

const ROLE: Record<StackPosition, { label: string; plain: string }> = {
  dominant: { label: 'Dominant', plain: 'Leads' },
  auxiliary: { label: 'Auxiliary', plain: 'Supports' },
  tertiary: { label: 'Tertiary', plain: 'Developing' },
  inferior: { label: 'Inferior', plain: 'Growth edge' },
};

// Each column is one axis of the stack: the dominant stands over its
// opposite, the inferior; the auxiliary over its opposite, the tertiary.
const AXES: Array<[StackPosition, StackPosition]> = [
  ['dominant', 'inferior'],
  ['auxiliary', 'tertiary'],
];

const EXAMPLE: HorizonMapItem[] = [
  { code: 'Ti', position: 'dominant', score: 36 },
  { code: 'Ne', position: 'auxiliary', score: 29 },
  { code: 'Si', position: 'tertiary', score: 20 },
  { code: 'Fe', position: 'inferior', score: 15 },
];

export const HorizonMap: React.FC<{
  items?: HorizonMapItem[];
  illustrative?: boolean;
  /** Visible heading for the map; also its accessible name. */
  label?: string;
  className?: string;
}> = ({ items = EXAMPLE, illustrative = false, label, className = '' }) => {
  const [selected, setSelected] = useState<StackPosition>('dominant');
  const byPosition = Object.fromEntries(items.map((item) => [item.position, item])) as Partial<Record<StackPosition, HorizonMapItem>>;
  const maxScore = Math.max(1, ...items.map((item) => item.score ?? 0));
  const active = byPosition[selected] ?? items[0];
  const reading = active && isFunctionCode(active.code) ? FUNCTION_READINGS[active.code] : null;
  const name = label ?? (illustrative ? 'Example function stack' : 'Your function stack');

  const cell = (position: StackPosition, half: 'above' | 'below') => {
    const item = byPosition[position];
    if (!item) return <div className={`hmap-cell is-${half}`} />;
    const fullName = isFunctionCode(item.code) ? FUNCTION_READINGS[item.code].name : item.code;
    const height = item.score !== undefined ? Math.max(0.12, item.score / maxScore) : 1;
    return (
      <button
        type="button"
        className={`hmap-cell is-${half} is-${position}${selected === position ? ' is-selected' : ''}`}
        aria-pressed={selected === position}
        aria-label={`${ROLE[position].label}: ${fullName}${item.score !== undefined ? `, ${item.score}% of mapped energy` : ''}`}
        onClick={() => setSelected(position)}
        style={{ '--bar': height } as React.CSSProperties}
      >
        <span className="hmap-bar" aria-hidden="true" />
        <span className="hmap-text" aria-hidden="true">
          <span className="hmap-role">{ROLE[position].label}</span>
          <span className="hmap-code">
            <FunctionEmblem code={item.code} className="hmap-glyph" />
            {item.code}
          </span>
          <span className="hmap-name">{fullName}</span>
          {item.score !== undefined && <span className="hmap-score">{item.score}%</span>}
        </span>
      </button>
    );
  };

  return (
    <figure className={`hmap ${className}`.trim()} aria-label={name}>
      <div className="hmap-field" role="group" aria-label={`${name}: select a function to read about it`}>
        <div className="hmap-day">
          {AXES.map(([top]) => <React.Fragment key={top}>{cell(top, 'above')}</React.Fragment>)}
        </div>
        <div className="hmap-line" aria-hidden="true" />
        <div className="hmap-night">
          {AXES.map(([, bottom]) => <React.Fragment key={bottom}>{cell(bottom, 'below')}</React.Fragment>)}
        </div>
      </div>
      {reading && active && (
        <div className="hmap-reading" aria-live="polite" aria-atomic="true">
          <p className="hmap-reading-role">{ROLE[active.position].label} · {reading.name}</p>
          <p className="hmap-reading-verb">{reading.verb}.</p>
          <p className="hmap-reading-body">
            {active.position === 'inferior' ? `${reading.description} ${reading.belowTheLine}` : reading.description}
          </p>
        </div>
      )}
      {illustrative && (
        <figcaption className="hmap-note">Illustrative example. Your map comes from your own answers.</figcaption>
      )}
    </figure>
  );
};

/** Static, compact horizon for share cards and summaries (no interaction). */
export const HorizonCard: React.FC<{
  items: Array<Pick<HorizonMapItem, 'code' | 'position'>>;
  className?: string;
}> = ({ items, className = '' }) => {
  const byPosition = Object.fromEntries(items.map((item) => [item.position, item.code])) as Partial<Record<StackPosition, string>>;
  return (
    <div className={`hcard ${className}`.trim()} aria-hidden="true">
      <div className="hcard-day">
        <span className="hcard-code is-dominant">{byPosition.dominant}</span>
        <span className="hcard-code">{byPosition.auxiliary}</span>
      </div>
      <div className="hcard-line" />
      <div className="hcard-night">
        <span className="hcard-code is-inferior">{byPosition.inferior}</span>
        <span className="hcard-code">{byPosition.tertiary}</span>
      </div>
    </div>
  );
};
