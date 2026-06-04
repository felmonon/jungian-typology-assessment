import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Check, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EMAIL_CAPTURE_OFFER } from '../data/discount';
import { EMAIL_OFFER_PRICES, PRICING } from '../data/pricing';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';

const reportSections = [
  {
    label: 'Free result',
    title: 'Core function-stack map',
    body: 'The free result shows all 8 function scores, the likely dominant-inferior axis, and a short synthesis so you can decide whether the map feels accurate.',
    included: ['Energy distribution', 'Dominant-inferior axis', 'Reliability signal'],
  },
  {
    label: 'Insight',
    title: 'Developmental edge report',
    body: 'Insight turns the free map into a deeper read on the inferior function, stress pressure, relationship triggers, and practical reflection prompts.',
    included: ['Stress pattern map', 'Relationship trigger interpretation', 'Somatic practice guidance'],
  },
  {
    label: 'Mastery',
    title: 'AI Type Guide and practice path',
    body: 'Mastery adds follow-up coaching support, a practice roadmap, and ongoing questions grounded in the result you already saw.',
    included: ['AI Type Guide', 'Individuation roadmap', 'Practice library'],
  },
];

const samplePrompts = [
  'Where does my dominant function help me stay clear, and where does it over-control?',
  'What would inferior-function stress look like in work conflict?',
  'Give me one grounded practice for noticing this pattern this week.',
];

export const SampleReport: React.FC = () => {
  const navigate = useNavigate();

  useSEO(PAGE_SEO.sampleReport);

  useEffect(() => {
    trackEvent('sample_report_viewed', { source: 'sample_report_page' });
  }, []);

  const goToAssessment = (location: string) => {
    AnalyticsEvents.ctaClicked('start_assessment', location, {
      buttonText: 'Start free assessment',
      destination: '/assessment',
    });
    navigate('/assessment');
  };

  return (
    <div className="min-h-screen bg-jung-base">
      <section className="section-rule py-12 lg:py-16">
        <div className="editorial-container grid gap-10 lg:grid-cols-[0.82fr_1fr] lg:items-end">
          <div>
            <p className="text-label">Sample paid report</p>
            <h1 className="mt-4 text-display text-5xl text-jung-dark sm:text-6xl">
              See what paid depth adds before checkout.
            </h1>
            <p className="mt-5 text-body-lg text-jung-secondary">
              This fictional sample shows the structure, tone, and upgrade value. Take the free assessment first; the paid report only matters after your own map feels useful.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" size="lg" onClick={() => goToAssessment('sample_report_hero')} rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start free assessment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  AnalyticsEvents.ctaClicked('compare_pricing', 'sample_report_hero', {
                    buttonText: 'Compare pricing',
                    destination: '/pricing',
                  });
                  navigate('/pricing');
                }}
              >
                Compare pricing
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-lg bg-jung-accent-light px-3 py-1.5 text-xs font-semibold text-jung-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              One-time CAD upgrades
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                <p className="text-sm font-semibold text-jung-dark">Insight</p>
                <p className="mt-2 text-3xl font-semibold text-jung-dark">{PRICING.insight.price}</p>
                <p className="mt-1 text-xs text-jung-muted">{EMAIL_OFFER_PRICES.insight} with {EMAIL_CAPTURE_OFFER.code}</p>
              </div>
              <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                <p className="text-sm font-semibold text-jung-dark">Mastery</p>
                <p className="mt-2 text-3xl font-semibold text-jung-dark">{PRICING.mastery.price}</p>
                <p className="mt-1 text-xs text-jung-muted">{EMAIL_OFFER_PRICES.mastery} with {EMAIL_CAPTURE_OFFER.code}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-jung-secondary">
              No subscription. Stripe handles payment. Promotion codes are applied before payment is confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="editorial-container py-14">
        <div className="mb-8 max-w-2xl">
          <p className="text-label">Report structure</p>
          <h2 className="mt-3 text-heading text-4xl text-jung-dark">Free map first, paid interpretation after.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {reportSections.map((section) => (
            <article key={section.title} className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-jung-accent-light px-3 py-1.5 text-xs font-semibold text-jung-accent">
                <FileText className="h-3.5 w-3.5" />
                {section.label}
              </div>
              <h3 className="mt-5 text-heading text-2xl text-jung-dark">{section.title}</h3>
              <p className="mt-3 text-sm leading-6 text-jung-secondary">{section.body}</p>
              <ul className="mt-5 grid gap-3">
                {section.included.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-jung-secondary">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-jung-border bg-jung-surface py-14">
        <div className="editorial-container grid gap-8 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div>
            <p className="text-label">Mastery preview</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">Example AI Type Guide questions.</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">
              Mastery is for people who want to keep working with the result after the first read. The guide should respond to your map, not give generic type advice.
            </p>
          </div>
          <div className="grid gap-3">
            {samplePrompts.map((prompt) => (
              <div key={prompt} className="rounded-lg border border-jung-border bg-jung-base p-4">
                <div className="flex gap-3">
                  <Bot className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                  <p className="text-sm leading-6 text-jung-secondary">{prompt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container py-14">
        <div className="rounded-lg border border-jung-border bg-jung-dark p-8 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-white/60">
                <Sparkles className="h-4 w-4" />
                Result first
              </p>
              <h2 className="mt-3 text-heading text-4xl text-white">Take the free map before comparing paid tiers.</h2>
              <p className="mt-4 max-w-2xl text-white/70">
                The upgrade decision should be based on your own result, not a promise on a pricing page.
              </p>
            </div>
            <Button variant="inverted" size="lg" onClick={() => goToAssessment('sample_report_final_cta')} rightIcon={<ArrowRight className="h-5 w-5" />}>
              Start free assessment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
