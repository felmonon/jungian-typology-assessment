import React, { useId, useRef, useState } from 'react';
import { REPORT_SAMPLE_EXCERPTS } from '../../data/report-sample';
import { FunctionEmblem } from '../brand/FunctionEmblem';

const topics = [
  { id: 'stress', label: 'Stress', excerpt: REPORT_SAMPLE_EXCERPTS[1], code: 'Fe' },
  { id: 'relationships', label: 'Relationships', excerpt: REPORT_SAMPLE_EXCERPTS[2], code: 'Fe' },
  { id: 'work', label: 'Work', excerpt: REPORT_SAMPLE_EXCERPTS[0], code: 'Ti' },
] as const;

export const ReportSamplePreview: React.FC<{
  onExplore?: (topic: string) => void;
}> = ({ onExplore }) => {
  const id = useId();
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const topic = topics[active];
  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) tabs.current[index]?.focus();
    if (index !== active) onExplore?.(topics[index].id);
  };
  return (
    <div className="report-sample">
      <div className="report-sample-toolbar">
        <span>INSIDE THE REPORT</span><span>ILLUSTRATIVE SAMPLE</span>
      </div>
      <div className="report-sample-tabs" role="tablist" aria-label="Explore report topics">
        {topics.map((item, index) => (
          <button key={item.id} type="button" role="tab" id={`${id}-tab-${item.id}`} aria-selected={active === index} aria-controls={`${id}-panel-${item.id}`} tabIndex={active === index ? 0 : -1} ref={node => { tabs.current[index] = node; }}
            onClick={() => select(index)} onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (active + 1) % topics.length : event.key === 'ArrowLeft' ? (active + topics.length - 1) % topics.length : event.key === 'Home' ? 0 : event.key === 'End' ? topics.length - 1 : null;
              if (next !== null) { event.preventDefault(); select(next, true); }
            }}>
            {item.label}<span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <div className="report-sample-paper" role="tabpanel" id={`${id}-panel-${topic.id}`} aria-labelledby={`${id}-tab-${topic.id}`} tabIndex={0}>
        <div className="report-sample-folio"><span>TYPEJUNG / INSIGHT</span><span>Ti · Ne · Si · Fe</span></div>
        <div className="flex items-center justify-between gap-5 pt-6">
          <p className="journey-eyebrow">{topic.excerpt.number} / {topic.excerpt.category}</p>
          <FunctionEmblem code={topic.code} className="h-9 w-9 shrink-0 text-jung-accent" />
        </div>
        <h3 className="mt-4 max-w-lg font-display text-[30px] leading-[1.15] sm:text-4xl">{topic.excerpt.title}</h3>
        <p className="mt-5 text-sm leading-7 text-jung-secondary">{topic.excerpt.paragraphs[0]}</p>
        <div className="report-sample-practice">
          <span className="journey-eyebrow">A small thing to try</span>
          <p className="mt-2 text-sm leading-7 text-jung-secondary">{topic.excerpt.practice}</p>
        </div>
        <p className="report-sample-disclosure">Fictional Ti–Fe example, not your personal report. Your paid interpretation is AI-generated from your own assessment result.</p>
      </div>
    </div>
  );
};
