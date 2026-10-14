import React from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';

export const PersonalReportReader: React.FC<{
  sections: Array<{ key: string; title: string; body: string }>;
  functionCodes: string[];
}> = ({ sections, functionCodes }) => {
  const active = useActiveSection(sections.map(section => `report-${section.key}`), { topOffset: 148 });
  return <div className="reader">
    <nav aria-label="Your report contents" className="reader-nav">
      <p className="reader-nav-title">In this report</p>
      <label className="reader-jump lg:hidden">Jump to a chapter<select aria-label="Jump to a report chapter" className="input-premium mt-2" value={active || `report-${sections[0]?.key}`} onChange={event => { window.location.hash = event.target.value; }}>
        {sections.map((section) => <option key={section.key} value={`report-${section.key}`}>{section.title}</option>)}
      </select></label>
      <ol className="reader-toc hidden lg:block">
        {sections.map((section) => <li key={section.key}>
          <a href={`#report-${section.key}`} aria-current={active === `report-${section.key}` ? 'location' : undefined}>
            {section.title}
          </a>
        </li>)}
      </ol>
    </nav>
    <div className="reader-page">
      <div className="reader-folio">
        <span>Your TypeJung report</span>
        <span>
          {functionCodes.join(' · ')}
        </span>
      </div>
      {sections.map((section, index) => <article key={section.key} id={`report-${section.key}`} className="reader-section">
        <p className="reader-count">Part {index + 1} of {sections.length}</p>
        <h3>
          {section.title}
        </h3>
        <p className="reader-body">
          {section.body}
        </p>
      </article>)}
    </div>
  </div>;
};
