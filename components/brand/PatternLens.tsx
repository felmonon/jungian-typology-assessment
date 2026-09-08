import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { FunctionEmblem } from './FunctionEmblem';

const readings: Record<string, { name: string; verb: string; description: string }> = {
  Ti: { name: 'Introverted Thinking', verb: 'Find the logic', description: 'Look for an explanation that holds together. Compare this tendency with how you actually make decisions.' },
  Te: { name: 'Extraverted Thinking', verb: 'Make it work', description: 'Organize what is outside you into an effective plan. Notice when a clear outcome helps you move forward.' },
  Ni: { name: 'Introverted Intuition', verb: 'See the thread', description: 'Follow the underlying meaning in what you notice. Check your interpretation against new information.' },
  Ne: { name: 'Extraverted Intuition', verb: 'Open possibilities', description: 'Connect ideas and explore what else could be. Notice which possibilities deserve a closer look.' },
  Si: { name: 'Introverted Sensation', verb: 'Draw on experience', description: 'Compare the present with an inner sense of what is familiar. Notice how experience shapes your expectations.' },
  Se: { name: 'Extraverted Sensation', verb: 'Meet the moment', description: 'Engage with what is happening around you. Notice the concrete details that invite a response.' },
  Fi: { name: 'Introverted Feeling', verb: 'Know what matters', description: 'Check a choice against your own values. Reflect on what feels personally important and why.' },
  Fe: { name: 'Extraverted Feeling', verb: 'Find connection', description: 'Attend to the emotional space between people. Notice how you respond to shared needs and expectations.' },
};
const example = [{ code: 'Ti', role: 'Leading' }, { code: 'Ne', role: 'Supporting' }, { code: 'Si', role: 'Developing' }, { code: 'Fe', role: 'Growth edge' }];
export const PatternLens: React.FC<{ items?: Array<{ code: string; role: string }>; illustrative?: boolean }> = ({ items = example, illustrative = false }) => {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, items.length - 1);
  const active = items[index];
  const reading = readings[active?.code] || readings.Ti;
  return <div className="pattern-lens">
    <div className="pattern-lens-heading">
      <span>
        {illustrative ? 'Explore an example' : 'Your suggested stack'}
      </span>
      <span>Select a function ↓</span>
    </div>
    <div className="pattern-lens-field" role="group" aria-label={illustrative ? 'Illustrative function pattern' : 'Explore your function stack'}>
      <div className="pattern-lens-orbit" aria-hidden="true" />
      <div className="pattern-lens-center" aria-hidden="true">
        <span>A pattern.</span>
        <span>Room to grow.</span>
      </div>
      {items.map((item, i) => <button type="button" key={item.code} className={`pattern-node pattern-node-${i} ${index === i ? 'is-selected' : ''}`} aria-pressed={index === i} aria-label={`${item.role}: ${readings[item.code]?.name || item.code}`} onClick={() => setSelected(i)}>
        <FunctionEmblem code={item.code} />
        <span className="pattern-node-code">
          {item.code}
        </span>
        <span className="pattern-node-role">
          {item.role}
        </span>
      </button>)}
    </div>
    <div className="pattern-lens-reading" aria-live="polite" aria-atomic="true">
      <div>
        <p>{active?.role} · {reading.name}</p>
        <h3>{reading.verb}.</h3>
      </div>
      <ArrowUpRight aria-hidden="true" />
      <p>
        {reading.description}
      </p>
    </div>
    {illustrative && <p className="pattern-lens-note">Illustrative example. Your map comes from your own answers.</p>}
  </div>;
};
