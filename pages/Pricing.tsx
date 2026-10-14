import { ArrowRight, Check, Minus, ShieldCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReportSamplePreview } from '../components/results/ReportSamplePreview';
import { Button } from '../components/ui/Button';
import { discountedPriceLabel, EMAIL_CAPTURE_OFFER } from '../data/discount';
import { PRICING, type PaidTierId } from '../data/pricing';
import { SUPPORT_EMAIL } from '../data/support';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { isDepthAssessmentResult } from '../utils/depthScoring';

const COMPARISON_FEATURES = [
  {
    name: '42-question assessment and function map',
    free: true,
    insight: true,
    mastery: true,
  },
  {
    name: 'Ten personalized interpretation sections',
    free: false,
    insight: true,
    mastery: true,
  },
  {
    name: 'The Function Stack in Depth guide (PDF)',
    free: false,
    insight: true,
    mastery: true,
  },
  {
    name: 'AI Type Guide and practice tools',
    free: false,
    insight: false,
    mastery: true,
  },
  // prettier-ignore
  { name: 'Saved assessment history (account required)', free: true, insight: true, mastery: true },
];
const plans = [
  {
    id: 'free',
    name: 'Your free map',
    eyebrow: 'A place to begin',
    price: PRICING.free.price,
    description:
      'Find the pattern in your answers and see whether it resonates.',
    features: [
      'All 42 questions',
      'Function-stack map and growth edge',
      'Introductory interpretation',
      'No signup or card required',
    ],
  },
  {
    id: 'insight',
    name: 'Insight',
    eyebrow: 'Understand your result',
    price: discountedPriceLabel(PRICING.insight.amount),
    description: 'A personal report to connect the map to your everyday life.',
    features: [
      'Everything in your free map',
      'Ten AI-generated interpretation sections',
      'Stress, relationships, work, and growth',
      'The Function Stack in Depth guide (PDF)',
    ],
  },
] as const;

export const Pricing: React.FC = () => {
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
  useSEO(PAGE_SEO.pricing);
  useEffect(() => {
    trackEvent('pricing_page_viewed', {
      has_local_results: hasResults,
      version: '2026_09_clarity',
    });
  }, [hasResults]);
  const choose = (tier: 'free' | PaidTierId) => {
    const source = 'pricing_tier_card';
    if (tier !== 'free') writeUpgradeIntent(tier, source);
    const destination =
      tier === 'free'
        ? pathWithSource(hasResults ? '/results' : '/assessment', source)
        : pathWithSource(
          hasResults ? `/checkout/${tier}` : '/assessment',
          source,
          { tier },
        );
    AnalyticsEvents.ctaClicked(
      tier === 'free' ? 'start_assessment' : `unlock_${tier}`,
      source,
      { destination, tier },
    );
    if (tier !== 'free') AnalyticsEvents.upgradeClicked(source, tier);
    navigate(destination);
  };
  return (
    <div className="pr">
      <header className="wrap pr-head">
        <h1 className="pr-title">
          Start free.
          <br />
          Choose your depth.
        </h1>
        <p className="pr-lead">
          Read your result first. Add a deeper interpretation when you want to
          explore what it could mean in your life.
        </p>
      </header>
      <div className="wrap">
        {hasResults && (
          <div className="pr-saved">
            <span>Your map is saved on this device.</span>
            <Link
              to="/results"
              className="text-link"
            >
              Read my result <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
        <section
          id="plans"
          className="pr-plans scroll-mt-28"
        >
          {(hasResults ? [plans[1], plans[0]] : plans).map((plan) => (
            <article
              key={plan.id}
              className={`pr-plan ${plan.id === 'insight' ? 'is-paid on-night' : 'is-free'}`}
            >
              <h2 className="pr-plan-name">
                {plan.name}
              </h2>
              <p className="pr-plan-tag">
                {plan.eyebrow}
              </p>
              <p className="pr-plan-desc">
                {plan.description}
              </p>
              <p className="pr-plan-price">
                {plan.price}
                <span className="pr-plan-unit">
                  {plan.id === 'free' ? 'always free' : 'one time · CAD'}
                </span>
              </p>
              <p className="pr-plan-note">
                {plan.id === 'insight'
                  ? `Current offer · ${PRICING.insight.price} regular price`
                  : 'No payment needed to see your result'}
              </p>
              <ul className="list-diamond pr-plan-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button
                variant={plan.id === 'insight' ? 'accent' : 'primary'}
                size="lg"
                className="w-full"
                onClick={() => choose(plan.id)}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                {plan.id === 'free'
                  ? hasResults
                    ? 'Read my free map'
                    : 'Start free assessment'
                  : hasResults
                    ? `Get Insight — ${plan.price}`
                    : 'Start free, decide after'}
              </Button>
              {plan.id === 'insight' && (
                <Link
                  to={pathWithSource('/sample-report', 'pricing_paid_preview')}
                  className="pr-plan-sample on-night-link"
                >
                  Read the sample first
                </Link>
              )}
            </article>
          ))}
        </section>
        <section className="pr-mastery">
          <div>
            <h2 className="pr-mastery-name">
              Mastery{' '}
              <span className="pr-mastery-price">
                {discountedPriceLabel(PRICING.mastery.amount)} once
              </span>
            </h2>
            <p className="pr-mastery-text">
              Everything in Insight, plus the AI Type Guide, growth exercises, and
              an individuation roadmap. An account is required for guide access.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => choose('mastery')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Explore Mastery
          </Button>
        </section>
        <p className="pr-terms">
          <ShieldCheck className="h-4 w-4 flex-none" aria-hidden="true" />
          Payments in Canadian dollars. No subscription. 7-day refund policy.
        </p>
        <section className="pr-sample">
          <div>
            <h2 className="pr-h2">A report you can put into practice.</h2>
            <p className="pr-text">Explore a fictional example of the reading experience. Your free map is yours to keep; paid depth adds interpretation across ten sections.</p>
            <Button variant="accent" size="lg" className="mt-6" onClick={() => choose('insight')}>
              {hasResults ? `Get Insight — ${discountedPriceLabel(PRICING.insight.amount)}` : 'Start with my free map'}
            </Button>
            <p className="pr-fine">Insight: {discountedPriceLabel(PRICING.insight.amount)} once · CAD · 7-day refund</p>
            <Link to="/sample-report" className="text-link mt-2">Read all four sample excerpts</Link>
          </div>
          <ReportSamplePreview onExplore={topic => trackEvent('pricing_report_sample_explored', { topic, source: 'pricing_preview' })} />
        </section>
        <section id="compare" className="pr-compare scroll-mt-28">
          <details className="rs-how">
            <summary>
              Compare everything included
            </summary>
            <div className="pr-table-wrap">
              <table className="pr-table">
                <caption className="sr-only">
                  Features included in Free, Insight, and Mastery
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Included</th>
                    {['Free', 'Insight', 'Mastery'].map((tier) => (
                      <th key={tier} scope="col">
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature) => (
                    <tr key={feature.name}>
                      <th scope="row">
                        {feature.name}
                      </th>
                      {(['free', 'insight', 'mastery'] as const).map((tier) => (
                        <td key={tier}>
                          {feature[tier] ? (
                            <Check
                              aria-label="Included"
                              className="mx-auto h-5 w-5"
                            />
                          ) : (
                            <Minus
                              aria-label="Not included"
                              className="mx-auto h-5 w-5 text-jung-muted"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <section className="pr-faq">
          <h2 className="pr-h2">
            Good to know before you buy.
          </h2>
          <div className="faq-tiles">
            {[
              [
                'How is my report written?',
                'The paid report uses AI to interpret your assessment result across ten sections. It is an educational reflection tool. Read it critically and compare it with your own experience.',
              ],
              [
                'What happens after payment?',
                'Stripe confirms payment, then returns you to TypeJung to generate your report from the map saved in this browser. Use the purchase email when signing in to restore paid access. Keep your receipt.',
              ],
              [
                'Do I need a discount code?',
                `The ${EMAIL_CAPTURE_OFFER.code} offer is applied automatically. Insight is ${discountedPriceLabel(PRICING.insight.amount)} and Mastery is ${discountedPriceLabel(PRICING.mastery.amount)}. Review the final amount on Stripe before paying.`,
              ],
              [
                'What if the report is not useful?',
                `Email ${SUPPORT_EMAIL} within 7 days of purchase with your Stripe receipt to request a refund.`,
              ],
            ].map(([q, a]) => (
              <details key={q} className="faq-tile">
                <summary>
                  {q}
                </summary>
                <p>
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
        <p className="pr-debrief">
          Prefer a written second perspective from the founder?{' '}
          <Link
            to="/debrief"
            className="link-ink"
          >
            Read about the Personal Type Debrief
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
