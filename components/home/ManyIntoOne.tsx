import React from 'react';

// 42 answers become one map. Each small diamond is one real question,
// coloured by its layer (20 everyday, 10 stress, 6 body, 6 attention):
// scattered on the left, pressed into a ribbon in the middle, sorted into
// the four layers on the right.
const LAYERS = [
  { label: 'Everyday life', count: 20 },
  { label: 'Under stress', count: 10 },
  { label: 'Body cues', count: 6 },
  { label: 'Attention', count: 6 },
];
const TOTAL = 42;
const ROW_X = 610;

// Deterministic scatter so the drawing never jumps between renders.
const rand = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const layerOf = (index: number) => {
  let edge = 0;
  for (let layer = 0; layer < LAYERS.length; layer += 1) {
    edge += LAYERS[layer].count;
    if (index < edge) return layer;
  }
  return LAYERS.length - 1;
};

const Diamond: React.FC<{ x: number; y: number; s: number; className: string }> = ({ x, y, s, className }) => (
  <path className={className} d={`M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`} />
);

export const ManyIntoOne: React.FC = () => {
  const s = 7;
  const scattered = Array.from({ length: TOTAL }, (_, i) => ({
    x: 18 + rand(i + 1) * 250,
    y: 26 + rand(i + 101) * 196,
    layer: layerOf(i),
  }));
  // Ribbon: 3 rows x 14 columns, ordered by question number.
  const ribbon = Array.from({ length: TOTAL }, (_, i) => ({
    x: 330 + Math.floor(i / 3) * 17,
    y: 108 + (i % 3) * 17,
    layer: layerOf(i),
  }));
  // Sorted rows, one per layer.
  const rows = LAYERS.flatMap((layer, row) =>
    Array.from({ length: layer.count }, (_, j) => ({
      x: ROW_X + j * 16,
      y: 52 + row * 48,
      layer: row,
    })),
  );

  // Vertical version for phones: scatter on top, ribbon, then sorted rows.
  const vScattered = scattered.map((d, i) => ({ x: 14 + rand(i + 7) * 300, y: 14 + rand(i + 301) * 170, layer: d.layer }));
  const vRibbon = Array.from({ length: TOTAL }, (_, i) => ({ x: 52 + (i % 14) * 17, y: 232 + Math.floor(i / 14) * 17, layer: layerOf(i) }));
  const vRows = LAYERS.flatMap((layer, row) =>
    Array.from({ length: layer.count }, (_, j) => ({
      x: 14 + (j % 10) * 17,
      y: 344 + row * 64 + Math.floor(j / 10) * 17,
      layer: row,
    })),
  );

  return (
    <figure className="many">
      <svg className="many-wide" viewBox="0 0 1160 250" aria-hidden="true" focusable="false">
        {scattered.map((d, i) => <Diamond key={`s${i}`} x={d.x} y={d.y} s={s} className={`many-d many-soft-${d.layer}`} />)}
        {ribbon.map((d, i) => <Diamond key={`r${i}`} x={d.x} y={d.y} s={s} className={`many-d many-mid-${d.layer}`} />)}
        {rows.map((d, i) => <Diamond key={`o${i}`} x={d.x} y={d.y} s={s} className="many-d many-final" />)}
        {LAYERS.map((layer, row) => (
          <text key={layer.label} x={ROW_X + layer.count * 16 + 10} y={52 + row * 48 + 5} className="many-label">
            {layer.label} · {layer.count}
          </text>
        ))}
      </svg>
      <svg className="many-tall" viewBox="0 0 330 600" aria-hidden="true" focusable="false">
        {vScattered.map((d, i) => <Diamond key={`vs${i}`} x={d.x} y={d.y} s={s} className={`many-d many-soft-${d.layer}`} />)}
        {vRibbon.map((d, i) => <Diamond key={`vr${i}`} x={d.x} y={d.y} s={s} className={`many-d many-mid-${d.layer}`} />)}
        {vRows.map((d, i) => <Diamond key={`vo${i}`} x={d.x} y={d.y} s={s} className="many-d many-final" />)}
        {LAYERS.map((layer, row) => (
          <text key={layer.label} x={190} y={344 + row * 64 + 5} className="many-label">
            {layer.label} · {layer.count}
          </text>
        ))}
      </svg>
      <figcaption className="sr-only">
        The 42 questions: 20 about everyday life, 10 about stress, 6 about body cues and 6 about attention, combined into one map.
      </figcaption>
    </figure>
  );
};
