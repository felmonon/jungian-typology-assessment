import React from 'react';
import { buildResultStressPreview } from '../../lib/result-stress-preview';
import type { DepthAssessmentResult } from '../../utils/depthScoring';

export function ResultStressPreview({ results }: { results: DepthAssessmentResult }) {
  const preview = buildResultStressPreview(results);
  if (!preview) return (
    <div className="rounded-2xl border border-jung-border bg-white p-6">
      <p className="journey-eyebrow">Your free reflection</p>
      <h3 className="mt-3 font-display text-2xl">Start with what you can recognize.</h3>
      <p className="mt-3 text-sm leading-7 text-jung-secondary">There isn’t a matching stress-situation answer in this saved result to quote. Your function map is still available. Read the illustrative sample to see the report’s approach before deciding.</p>
    </div>
  );

  return (
    <article className="rounded-2xl border border-jung-border bg-white p-6 sm:p-8">
      <p className="journey-eyebrow">From your answers · Free reflection</p>
      <h3 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{preview.title}</h3>
      <p className="mt-4 text-sm leading-7 text-jung-secondary">{preview.body}</p>
      <p className="mt-5 text-xs font-semibold text-jung-muted">One answer you chose</p>
      <blockquote className="mt-2 border-l-2 border-jung-accent pl-3 text-sm font-medium leading-6 text-jung-dark">“{preview.answer}”</blockquote>
      <details className="mt-4 rounded-xl border border-jung-border bg-jung-base p-4">
        <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-jung-dark">Why this reflection?</summary>
        <p className="mt-3 text-xs leading-6 text-jung-muted">You were asked: {preview.question}</p>
        <p className="mt-3 text-xs leading-6 text-jung-secondary">{preview.evidence}</p>
      </details>
      <div className="mt-5 border-t border-jung-border pt-5">
        <p className="journey-eyebrow">One thing to try</p>
        <p className="mt-2 text-sm leading-7 text-jung-dark">{preview.practice}</p>
      </div>
      <p className="mt-4 text-xs leading-6 text-jung-muted">{preview.caveat}</p>
    </article>
  );
}
