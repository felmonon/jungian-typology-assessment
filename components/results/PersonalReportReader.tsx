import React from 'react';

export const PersonalReportReader: React.FC<{
  sections: Array<{ key: string; title: string; body: string }>;
  functionCodes: string[];
}> = ({ sections, functionCodes }) => (
<div className="grid items-start gap-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
                  <nav aria-label="Your report contents" className="rounded-xl bg-jung-accent-light p-5 lg:sticky lg:top-28">
                    <p className="journey-eyebrow">Your report, in depth</p>
                    <ol className="mt-3">{sections.map((section, index) => <li key={section.key}><a href={`#report-${section.key}`} className="flex min-h-11 items-center gap-3 py-2 text-xs leading-5 text-jung-secondary hover:text-jung-accent"><span className="font-mono text-jung-gold">{String(index + 1).padStart(2, '0')}</span>{section.title}</a></li>)}</ol>
                  </nav>
                  <div className="min-w-0 rounded-xl border border-jung-border bg-jung-base p-5 sm:p-8">
                    <div className="report-sample-folio"><span>TYPEJUNG / YOUR REPORT</span><span>{functionCodes.join(' · ')}</span></div>
                    {sections.map((section, index) => (
                      <article key={section.key} id={`report-${section.key}`} className="mx-auto max-w-prose scroll-mt-28 border-b border-jung-border py-8 last:border-0">
                        <p className="journey-eyebrow">{String(index + 1).padStart(2, '0')} / Your pattern in practice</p>
                        <h3 className="mt-3 font-display text-3xl leading-tight text-jung-dark">{section.title}</h3>
                        <p className="mt-5 whitespace-pre-line text-base leading-8 text-jung-secondary">{section.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
);
