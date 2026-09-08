import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PatternLens } from '../components/brand/PatternLens';
import { FunctionEmblem } from '../components/brand/FunctionEmblem';
import { ReportSamplePreview } from '../components/results/ReportSamplePreview';
import { Button } from '../components/ui/Button';
import { discountedPriceLabel } from '../data/discount';
import { PRICING } from '../data/pricing';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';

const insightPrice = discountedPriceLabel(PRICING.insight.amount);
const guides = [
  [
    '/jungian-cognitive-functions-test',
    'Jungian cognitive functions test',
    'How the assessment works',
  ],
  [
    '/cognitive-function-test',
    'Cognitive function test',
    'Understand the eight functions',
  ],
  [
    '/inferior-function-test',
    'Your inferior function',
    'Explore patterns under stress',
  ],
  [
    '/mbti-test-alternative',
    'When your MBTI keeps changing',
    'A different way to read your result',
  ],
  [
    '/best-cognitive-functions-test',
    'Compare cognitive function tests',
    'Choose a useful starting point',
  ],
  ['/guides', 'The TypeJung library', 'Type comparisons and practical guides'],
];
const faqs = [
  [
    'What will I get for free?',
    'The full 42-question assessment, your function-stack map, the dominant–inferior pattern, and an introductory interpretation. No account or payment is required to see your result.',
  ],
  [
    'What if I get a different result from another test?',
    'Use the differences as questions to explore. TypeJung combines answers about everyday behavior, stress, body cues, and attention direction. The result is a working interpretation of your answers, and may change with your context.',
  ],
  [
    'Does this measure eight functions independently?',
    'The assessment scores four function channels and attention direction, then derives a map showing all eight function-attitudes. The eight displayed values are not eight independent psychological measurements. You can inspect the method before you start.',
  ],
  [
    'Do I have to buy the report?',
    `No. Your core map is free. The optional Insight report is ${insightPrice}, paid once, and adds ten AI-generated interpretation sections. You can read an illustrative sample first. TypeJung is for educational self-reflection, not diagnosis.`,
  ],
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  useSEO(PAGE_SEO.home);
  useEffect(() => {
    trackEvent('home_wedge_viewed', {
      source: 'home',
      promise: 'mbti_alternative_function_stack',
      version: '2026_09_pattern_studio',
    });
  }, []);
  const start = (source: string) => {
    const destination = pathWithSource('/assessment', source);
    trackEvent('assessment_start_intent', {
      source,
      promise: 'mbti_alternative_function_stack',
    });
    AnalyticsEvents.ctaClicked('start_assessment', source, {
      buttonText: 'Find my pattern',
      destination,
    });
    navigate(destination);
  };

  return (
    <div className="journey-home">
      <section className="studio-hero lab-container">
        <div className="studio-hero-copy">
          <p className="studio-kicker"><span /> A little more self-understanding</p>
          <h1>You’re more<br />than <span>four letters.</span></h1>
          <p className="studio-hero-description">Your type keeps changing. Your everyday patterns can tell you more. Explore how you think, connect, and respond to stress with a free function map.</p>
          <div className="studio-hero-actions">
            <Button variant="accent" size="lg" onClick={() => start('home_hero')} rightIcon={<ArrowRight className="h-4 w-4" />}>Find my pattern</Button>
            <a href="#how-it-works">How it works <span aria-hidden="true">↓</span></a>
          </div>
          <p className="studio-reassurance"><Check size={15} /> Free results. No signup. No card.</p>
          <div className="studio-time">
            <Clock3 size={15} />
            <span>42 questions · 20–25 minutes<br /><small>Take your time. Your progress saves as you go.</small></span>
          </div>
        </div>
        <div id="example-map" className="studio-hero-art">
          <PatternLens illustrative />
        </div>
      </section>
      <section id="how-it-works" className="studio-steps lab-container">
        <div className="studio-section-intro">
          <p className="journey-eyebrow">A clear path from here</p>
          <h2>Get curious. Get your map.<br />Make it useful.</h2>
          <Link to="/methodology">See how the assessment works <ArrowUpRight size={16} /></Link>
        </div>
        <ol>
          {[
            ['01', 'Start with everyday life.', 'Answer 42 questions about decisions, attention, and stress. Choose what sounds like you—there’s no theory to learn.', 'Answer at your own pace'],
            ['02', 'Meet your pattern.', 'Get your free map, all eight functions, and an introductory interpretation. Explore what feels familiar and what surprises you.', 'Your complete core map is free'],
            ['03', 'Choose your next step.', `Keep exploring your map, or add an Insight report for ${insightPrice} to reflect on relationships, work, and growth.`, 'The report is always optional'],
          ].map(([n, title, body, note]) => <li key={n}>
            <span className="studio-step-number">
              {n}
            </span>
            <h3>
              {title}
            </h3>
            <p>
              {body}
            </p>
            <span className="studio-step-note">
              <Check size={14} />
              {note}
            </span>
          </li>)}
        </ol>
      </section>
      <section className="studio-functions lab-container">
        <div>
          <p className="journey-eyebrow">The ideas behind your map</p>
          <h2>Eight ways to meet the world.</h2>
          <p>Thinking, feeling, sensing, and intuition—each directed inward or outward.</p>
        </div>
        <div className="studio-function-list">
          {['Ti', 'Te', 'Ni', 'Ne', 'Si', 'Se', 'Fi', 'Fe'].map(code => <a key={code} href={`/functions/${code.toLowerCase()}`} aria-label={`Learn about ${code}`}>
            <FunctionEmblem code={code} />
            <span>
              {code}
            </span>
          </a>)}
        </div>
      </section>
      <section id="pricing" className="studio-home-report">
        <div className="lab-container grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <p className="journey-eyebrow">Optional depth · Insight report</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Turn a little insight<br />into something useful.</h2>
            <p className="mt-5 mb-7 max-w-lg text-base leading-7 text-jung-secondary">Explore an example before you decide. Insight connects your pattern to the moments that matter: stress, relationships, work, and growth.</p>
            <ReportSamplePreview onExplore={topic => trackEvent('home_report_sample_explored', { topic, source: 'home_paid_preview' })} />
          </div>
          <div className="studio-insight-card">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Insight</span>
              <FileText className="h-5 w-5 text-jung-accent" />
            </div>
            <p className="mt-4 font-display text-6xl font-semibold tracking-tight">
              {insightPrice}
              <span className="ml-3 font-sans text-sm text-jung-muted">
                one time · CAD
              </span>
            </p>
            <p className="mt-2 text-xs text-jung-muted">
              Current offer · {PRICING.insight.price} regular price
            </p>
            <ul className="my-6 space-y-3">
              {[
                'Ten personalized interpretation sections',
                'Stress and recovery reflections',
                'Relationship, work, and growth prompts',
                'The Function Stack in Depth guide (PDF)',
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-6 text-jung-secondary"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              variant="accent"
              className="w-full"
              onClick={() => start('home_pricing_insight')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start with my free map
            </Button>
            <p className="mt-4 text-center text-xs leading-5 text-jung-muted">
              No subscription. 7-day refund policy.
            </p>
            <Link
              to="/pricing"
              className="mt-2 flex min-h-11 items-center justify-center text-xs font-semibold text-jung-accent underline underline-offset-4"
            >
              Compare all options
            </Link>
            <Link to={pathWithSource('/sample-report', 'home_paid_preview')} className="mt-2 flex min-h-11 items-center justify-center text-xs font-semibold text-jung-accent underline underline-offset-4">Read the full illustrative sample</Link>
          </div>
        </div>
      </section>
      <section className="lab-container py-16 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="journey-eyebrow">Follow your curiosity</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              A little context can help.
            </h2>
          </div>
          <Link
            to="/learn"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-jung-accent"
          >
            Learn the theory <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-x-10 md:grid-cols-2">
          {guides.map(([href, title, subtitle]) => (
            <a
              key={href}
              href={href}
              className="group flex items-center justify-between gap-4 border-t border-jung-border py-5"
              onClick={() =>
                trackEvent('home_seo_path_clicked', {
                  source: 'home_search_paths',
                  destination: href,
                  title,
                })
              }
            >
              <div>
                <h3 className="font-display text-xl group-hover:text-jung-accent">
                  {title}
                </h3>
                <p className="mt-1 text-xs text-jung-muted">
                  {subtitle}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-jung-accent" />
            </a>
          ))}
        </div>
        <details className="mt-5 border-t border-jung-border pt-3">
          <summary className="cursor-pointer py-3 text-sm font-medium text-jung-secondary">
            Browse all eight functions and sixteen types
          </summary>
          <div className="flex flex-wrap gap-2 py-4">
            {['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'].map((code) => (
              <a
                key={code}
                href={`/functions/${code.toLowerCase()}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-jung-border px-4 text-sm hover:bg-jung-accent-light"
              >
                {code}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pb-4">
            {[
              'INTJ',
              'INTP',
              'ENTJ',
              'ENTP',
              'INFJ',
              'INFP',
              'ENFJ',
              'ENFP',
              'ISTJ',
              'ISFJ',
              'ESTJ',
              'ESFJ',
              'ISTP',
              'ISFP',
              'ESTP',
              'ESFP',
            ].map((code) => (
              <a
                key={code}
                href={`/types/${code.toLowerCase()}`}
                className="inline-flex min-h-11 items-center rounded-lg border border-jung-border px-4 text-sm hover:bg-jung-accent-light"
              >
                {code}
              </a>
            ))}
          </div>
        </details>
      </section>
      <section className="border-y border-jung-border-light bg-jung-surface">
        <div className="lab-container grid gap-8 py-14 md:py-20 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
          <div>
            <p className="journey-eyebrow">Before you begin</p>
            <h2 className="mt-4 font-display text-4xl">
              A few fair questions.
            </h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group border-b border-jung-border first:border-t"
              >
                <summary className="cursor-pointer py-5 text-base font-medium text-jung-dark">
                  {question}
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-7 text-jung-secondary">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="studio-final-cta lab-container">
        <p className="journey-eyebrow">Your next step</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          A clearer view of you starts here.
        </h2>
        <Button
          variant="accent"
          size="lg"
          className="mt-7"
          onClick={() => start('home_final_cta')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Find my pattern
        </Button>
        <p className="mt-4 text-xs text-jung-muted">
          42 questions. Your core map is free.
        </p>
      </section>
    </div>
  );
};
