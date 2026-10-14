import React from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export const PersonalReportReader: React.FC<{
  sections: Array<{ key: string; title: string; body: string }>;
  functionCodes: string[];
}> = ({ sections, functionCodes }) => {
  const active = useActiveSection(sections.map(section => `report-${section.key}`), { topOffset: 148 });
  return <div className="studio-reader">
    <nav aria-label="Your report contents">
      <p className="journey-eyebrow mb-3">In this report</p>
      <label className="block text-xs text-jung-secondary lg:hidden">Jump to a chapter<select aria-label="Jump to a report chapter" className="mt-2 min-h-12 w-full rounded-xl border border-jung-border bg-white px-3 text-sm text-jung-dark" value={active || `report-${sections[0]?.key}`} onChange={event => { window.location.hash = event.target.value; }}>
        {sections.map((section, index) => <option key={section.key} value={`report-${section.key}`}>{String(index + 1).padStart(2, "0")} · {section.title}</option>)}
      </select></label>
      <ol className="hidden lg:block">
        {sections.map((section, index) => <li key={section.key}>
          <a href={`#report-${section.key}`} aria-current={active === `report-${section.key}` ? 'location' : undefined}>
            <span>
              {String(index + 1).padStart(2, '0')}
            </span>
            {section.title}
          </a>
        </li>)}
      </ol>
    </nav>
    <div className="studio-reader-page">
      <div className="report-sample-folio">
        <span>TYPEJUNG / YOUR REPORT</span>
        <span>
          {functionCodes.join(' · ')}
        </span>
      </div>
      {sections.map((section, index) => <article key={section.key} id={`report-${section.key}`}>
        <p className="journey-eyebrow">{String(index + 1).padStart(2, '0')} / Your pattern in practice</p>
        <h3>
          {section.title}
        </h3>
        <p>
          {section.body}
        </p>
      </article>)}
    </div>
  </div>;
};
