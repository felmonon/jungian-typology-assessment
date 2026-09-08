import { ArrowRight, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REPORT_SAMPLE_EXCERPTS as excerpts } from '../data/report-sample';
import { FunctionStackArtwork } from '../components/brand/FunctionStackArtwork';
import { Button } from '../components/ui/Button';
import { discountedPriceLabel } from '../data/discount';
import { PRICING } from '../data/pricing';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { isDepthAssessmentResult } from '../utils/depthScoring';



export const SampleReport: React.FC = () => {
  const navigate = useNavigate();
  const [hasResults] = useState(() => {
    try {
      return isDepthAssessmentResult(
        JSON.parse(
          localStorage.getItem('jungian_assessment_results') || 'null',
        ),
      );
    } catch {
      return false;
    }
  });
  const price = discountedPriceLabel(PRICING.insight.amount);
  useSEO(PAGE_SEO.sampleReport);
  useEffect(() => {
    trackEvent('sample_report_viewed', {
      has_local_results: hasResults,
      version: '2026_09_clarity',
    });
  }, [hasResults]);
  const continueToReport = () => {
    const source = 'sample_report';
    writeUpgradeIntent('insight', source);
    const destination = pathWithSource(
      hasResults ? '/checkout/insight' : '/assessment',
      source,
      { tier: 'insight' },
    );
    AnalyticsEvents.ctaClicked('get_insight_report', source, {
      destination,
      tier: 'insight',
    });
    if (hasResults) {
      AnalyticsEvents.upgradeClicked(source, 'insight');
      trackEvent('sample_report_checkout_clicked', { tier: 'insight', source });
    }
    navigate(destination);
  };
  return (
    <div className="lab-container py-10 sm:py-16">
      <header className="mx-auto max-w-3xl">
        <p className="journey-eyebrow">Inside an Insight report</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
          A map becomes useful
          <br />
          <span className="font-normal italic text-jung-accent">
            when you can live with it.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-jung-secondary">
          Read four illustrative excerpts below. Your paid report contains ten
          AI-generated sections based on your own assessment result.
        </p>
        <div className="mt-8 max-w-xl"><FunctionStackArtwork compact /></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-jung-border py-4">
          <span className="font-display text-xl text-jung-accent">
            Ti · Ne · Si · Fe
          </span>
          <span className="text-xs text-jung-muted">
            Fictional example · Not your personal result
          </span>
        </div>
      </header>
      <div className="mx-auto mt-10 grid max-w-5xl items-start gap-10 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <nav
          aria-label="Sample report contents"
          className="rounded-xl bg-jung-surface-alt p-5 lg:sticky lg:top-28"
        >
          <p className="journey-eyebrow">In this sample</p>
          <ol className="mt-3">
            {excerpts.map((section) => (
              <li key={section.id}>
                <a
                  href={`#sample-${section.id}`}
                  className="flex min-h-11 items-center gap-3 text-xs leading-5 text-jung-secondary hover:text-jung-accent"
                >
                  <span className="font-mono text-jung-gold">
                    {section.number}
                  </span>
                  {section.category}
                </a>
              </li>
            ))}
          </ol>
          <div className="mt-5 border-t border-jung-border pt-5">
            <p className="font-display text-3xl">{price}<span className="ml-2 font-sans text-xs text-jung-muted">once · CAD</span></p>
            <p className="mt-2 text-xs leading-6 text-jung-secondary">Ten AI-generated sections based on your result, plus the Function Stack in Depth PDF guide.</p>
            <Button variant="accent" className="mt-4 w-full" onClick={continueToReport}>{hasResults ? 'Get my Insight report' : 'Start with my free map'}</Button>
            <p className="mt-3 text-[11px] leading-6 text-jung-muted">Free map first. No subscription.<br />7-day refund policy.</p>
          </div>
          <p className="mt-4 border-t border-jung-border pt-4 text-xs leading-6 text-jung-muted">
            Educational self-reflection. This is a format example, not a
            diagnosis or a customer testimonial.
          </p>
        </nav>
        <div>
          {excerpts.map((section) => (
            <article
              key={section.id}
              id={`sample-${section.id}`}
              className="mb-12 scroll-mt-28 border-b border-jung-border pb-12"
            >
              <p className="journey-eyebrow">
                {section.number} / {section.category}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-8 text-jung-secondary"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-6 rounded-xl border-l-2 border-jung-accent bg-jung-accent-light p-5">
                <h3 className="text-xs font-semibold text-jung-accent">
                  Try this
                </h3>
                <p className="mt-2 text-sm leading-7 text-jung-secondary">
                  {section.practice}
                </p>
              </div>
            </article>
          ))}
          <section className="rounded-2xl bg-jung-accent p-6 text-white sm:p-8">
            <FileText className="h-5 w-5 text-white/70" />
            <h2 className="mt-4 font-display text-3xl">
              What could your map help you notice?
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/80">
              Insight includes ten sections: overview, function dynamics,
              archetypes, stress, relationships, work, individuation, shadow,
              growth, and dream reflection. The Function Stack in Depth PDF
              guide is also included.
            </p>
            <Button
              variant="inverted"
              className="mt-6"
              onClick={continueToReport}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {hasResults
                ? `Get my Insight report — ${price}`
                : 'Start with my free map'}
            </Button>
            <p className="mt-4 text-xs leading-6 text-white/70">
              {price} once · CAD · No subscription · 7-day refund policy
            </p>
          </section>
          <Link
            to={hasResults ? '/results' : '/pricing'}
            className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-jung-accent underline underline-offset-4"
          >
            {hasResults
              ? 'Return to my free result'
              : 'Compare pricing options'}
          </Link>
        </div>
      </div>
    </div>
  );
};
