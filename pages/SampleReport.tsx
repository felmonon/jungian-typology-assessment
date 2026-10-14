import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REPORT_SAMPLE_EXCERPTS as excerpts } from '../data/report-sample';
import { useActiveSection } from '../hooks/useActiveSection';
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
  const activeSection = useActiveSection(excerpts.map(section => `sample-${section.id}`));
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
    <div className="sr">
      <header className="wrap sr-head">
        <h1 className="sr-title">
          From a function map
          <br />
          to moments you recognize.
        </h1>
        <p className="sr-lead">
          Read four illustrative excerpts below. Your paid report contains ten
          AI-generated sections based on your own assessment result.
        </p>
        <p className="sr-example">
          <span className="sr-example-codes">
            Ti · Ne · Si · Fe
          </span>
          <span>
            Fictional example · Not your personal result
          </span>
        </p>
      </header>
      <div className="wrap reader sr-reader">
        <details className="sr-jump lg:hidden">
          <summary>Explore the four sample chapters</summary>
          <ol>
            {excerpts.map(section => <li key={section.id}>
              <a href={`#sample-${section.id}`}>
                {section.category}
              </a>
            </li>)}
          </ol>
        </details>
        <nav
          aria-label="Sample report contents"
          className="reader-nav hidden lg:block"
        >
          <p className="reader-nav-title">In this sample</p>
          <ol className="reader-toc">
            {excerpts.map((section) => (
              <li key={section.id}>
                <a
                  href={`#sample-${section.id}`}
                  aria-current={activeSection === `sample-${section.id}` ? "location" : undefined}
                >
                  {section.category}
                </a>
              </li>
            ))}
          </ol>
          <div className="sr-buy">
            <p className="sr-buy-price">
              {price}
              <span>once · CAD</span>
            </p>
            <p className="sr-buy-text">Ten AI-generated sections based on your result, plus the Function Stack in Depth PDF guide.</p>
            <Button variant="accent" className="mt-4 w-full" onClick={continueToReport}>
              {hasResults ? 'Get my Insight report' : 'Start with my free map'}
            </Button>
            <p className="sr-buy-fine">Free map first. No subscription.<br />7-day refund policy.</p>
          </div>
          <p className="sr-buy-fine sr-buy-note">
            Educational self-reflection. This is a format example, not a
            diagnosis or a customer testimonial.
          </p>
        </nav>
        <div>
          <div className="reader-page">
            <div className="reader-folio">
              <span>Illustrative Insight sample</span>
              <span>Ti · Ne · Si · Fe</span>
            </div>
            {excerpts.map((section) => (
              <article
                key={section.id}
                id={`sample-${section.id}`}
                className="reader-section"
              >
                <p className="reader-count">
                  {section.category}
                </p>
                <h2>
                  {section.title}
                </h2>
                <div className="sr-paras">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="reader-body">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="report-sample-practice sr-practice">
                  <strong>
                    Try this
                  </strong>
                  <p>
                    {section.practice}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <section className="sr-close on-night">
            <h2 className="sr-close-title">
              What could your map help you notice?
            </h2>
            <p className="sr-close-text">
              Insight includes ten sections: overview, function dynamics,
              archetypes, stress, relationships, work, individuation, shadow,
              growth, and dream reflection. The Function Stack in Depth PDF
              guide is also included.
            </p>
            <Button
              variant="accent"
              size="lg"
              className="mt-6 w-full sm:w-auto"
              onClick={continueToReport}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {hasResults
                ? `Get Insight — ${price}`
                : 'Start with my free map'}
            </Button>
            <p className="sr-close-fine">
              {price} once · CAD · No subscription · 7-day refund policy
            </p>
          </section>
          <Link
            to={hasResults ? '/results' : '/pricing'}
            className="text-link mt-6"
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
