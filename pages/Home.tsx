import { ArrowRight, ArrowUpRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FunctionEmblem } from '../components/brand/FunctionEmblem';
import { HorizonMap } from '../components/brand/HorizonMap';
import { ManyIntoOne } from '../components/home/ManyIntoOne';
import { ReflectionPicker } from '../components/home/ReflectionPicker';
import { ReportSamplePreview } from '../components/results/ReportSamplePreview';
import { FUNCTION_READINGS, type FunctionCode } from '../data/function-readings';
import { discountedPriceLabel } from '../data/discount';
import { PRICING } from '../data/pricing';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';

const insightPrice = discountedPriceLabel(PRICING.insight.amount);
const masteryPrice = discountedPriceLabel(PRICING.mastery.amount);

const guides = [
  ['/jungian-cognitive-functions-test', 'Jungian cognitive functions test', 'How the assessment works'],
  ['/cognitive-function-test', 'Cognitive function test', 'Understand the eight functions'],
  ['/inferior-function-test', 'Your inferior function', 'Explore patterns under stress'],
  ['/mbti-test-alternative', 'When your MBTI keeps changing', 'A different way to read your result'],
  ['/best-cognitive-functions-test', 'Compare cognitive function tests', 'Choose a useful starting point'],
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
  [
    'Is this a diagnosis or a clinical test?',
    'No. TypeJung is an educational tool for self-reflection. It does not diagnose anything, and its result is a starting point to compare with your own experience.',
  ],
];

const plans = [
  {
    id: 'free',
    name: 'Free map',
    price: 'CA$0',
    period: 'always free',
    body: 'All 42 questions, your function stack, all eight function values, the dominant–inferior axis, a consistency signal and a short first read. No signup or card.',
  },
  {
    id: 'insight',
    name: 'Insight',
    price: insightPrice,
    period: 'once · CAD',
    body: `Everything in the free map, plus ten AI-generated sections on stress, relationships, work and growth, and the Function Stack in Depth guide (PDF). ${PRICING.insight.price} regular price.`,
  },
  {
    id: 'mastery',
    name: 'Mastery',
    price: masteryPrice,
    period: 'once · CAD',
    body: `Everything in Insight, plus the AI Type Guide, growth exercises and an individuation roadmap. An account is required for guide access. ${PRICING.mastery.price} regular price.`,
  },
] as const;

type PlanId = (typeof plans)[number]['id'];

const PlanIndex: React.FC<{ onStart: (source: string) => void }> = ({ onStart }) => {
  const [selected, setSelected] = useState<PlanId>('insight');
  const plan = plans.find((item) => item.id === selected) ?? plans[1];
  return (
    <div className="plan-index">
      <div className="plan-names" role="tablist" aria-label="Choose a plan">
        {plans.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`plan-tab-${item.id}`}
            aria-selected={selected === item.id}
            aria-controls="plan-stage"
            className="plan-name"
            onClick={() => setSelected(item.id)}
            onFocus={() => setSelected(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="plan-stage" id="plan-stage" role="tabpanel" aria-labelledby={`plan-tab-${plan.id}`}>
        <p className="plan-price" key={plan.id}>
          {plan.price}
          <span>{plan.period}</span>
        </p>
        <p className="plan-body">{plan.body}</p>
        <button
          type="button"
          className="btn btn-paper"
          onClick={() => onStart(plan.id === 'free' ? 'home_pricing_free' : `home_pricing_${plan.id}`)}
        >
          Start with my free map
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="plan-note">
          {plan.id === 'free'
            ? 'Your result appears as soon as you finish.'
            : 'You see your free map first. The report is optional, one payment, 7-day refund policy.'}
        </p>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  useSEO(PAGE_SEO.home);
  useEffect(() => {
    trackEvent('home_wedge_viewed', {
      source: 'home',
      promise: 'mbti_alternative_function_stack',
      version: '2026_10_reflection',
    });
  }, []);
  const start = (source: string) => {
    const destination = pathWithSource('/assessment', source);
    trackEvent('assessment_start_intent', {
      source,
      promise: 'mbti_alternative_function_stack',
    });
    AnalyticsEvents.ctaClicked('start_assessment', source, {
      buttonText: 'Get my free map',
      destination,
    });
    navigate(destination);
  };

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <ReflectionPicker>
          <h1 id="home-title" className="display">
            See the pattern under your type.
          </h1>
          <p className="lead home-hero-lead">
            Your MBTI result keeps changing? Map all eight cognitive
            functions, your function stack, and the dominant–inferior
            tension that shows up under stress. Free, before you buy
            anything.
          </p>
          <div className="home-hero-actions">
            <button type="button" className="btn btn-accent btn-lg" onClick={() => start('home_hero')}>
              Get my free map
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <a href="#how-it-works" className="text-link">
              How it works
            </a>
          </div>
          <p className="home-hero-facts">
            42 questions · 20–25 minutes · No signup, no card. Your progress
            saves as you go.
          </p>
        </ReflectionPicker>
      </section>

      <section className="home-free" aria-labelledby="free-title">
        <div className="wrap home-free-grid">
          <div className="home-free-plate">
            <HorizonMap illustrative label="Example map" />
          </div>
          <div className="home-free-copy">
            <h2 id="free-title" className="head">The free map is the whole map.</h2>
            <p className="body-text">
              Your result is complete before any upgrade. It shows where your
              answers put each function, and how the stack fits together.
            </p>
            <ul className="list-diamond">
              <li>Your four-function stack, from dominant to inferior</li>
              <li>Values for all eight function-attitudes</li>
              <li>The dominant–inferior axis and your growth edge</li>
              <li>An answer-consistency signal and a short first read</li>
            </ul>
            <div className="home-free-actions">
              <button type="button" className="btn btn-ink" onClick={() => start('home_free_map')}>
                Get my free map
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link to="/methodology" className="btn btn-quiet">
                See how it is scored
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="home-how" aria-labelledby="how-title">
        <div className="wrap">
          <div className="home-how-head">
            <h2 id="how-title" className="head">42 questions.<br />One map.</h2>
            <p className="body-text">
              The questions are about ordinary life, not theory. Each answer
              points toward one of four functions; stress, body and attention
              questions check the result from different sides.
            </p>
          </div>
          <ManyIntoOne />
          <div className="home-how-cols">
            <div>
              <h3>Answer</h3>
              <p>Twenty everyday situations, ten about stress, six about body cues and six about where your attention goes. “None of these” is always allowed.</p>
            </div>
            <div>
              <h3>Score</h3>
              <p>Answers add energy to thinking, feeling, sensation or intuition. Attention questions set the direction, inward or outward.</p>
            </div>
            <div>
              <h3>Read</h3>
              <p>Your map puts the strongest function above the line and its opposite below it, with every value visible to inspect.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="home-depth on-night" aria-labelledby="depth-title">
        <div className="horizon-band" aria-hidden="true" />
        <div className="wrap home-depth-grid">
          <div className="home-depth-intro">
            <h2 id="depth-title" className="head">Below the line, if you want it.</h2>
            <p className="body-text">
              The optional report reads your own map in the places it matters:
              stress, relationships, work and growth. Read a sample before you
              decide.
            </p>
          </div>
          <div className="home-depth-sample">
            <ReportSamplePreview onExplore={(topic) => trackEvent('home_report_sample_explored', { topic, source: 'home_paid_preview' })} />
            <Link to={pathWithSource('/sample-report', 'home_paid_preview')} className="text-link on-night-link">
              Read the full illustrative sample
            </Link>
          </div>
          <div className="home-depth-plans">
            <PlanIndex onStart={start} />
            <Link to="/pricing" className="text-link on-night-link">
              Compare all options
            </Link>
          </div>
        </div>
      </section>

      <section className="home-compass" aria-labelledby="compass-title">
        <div className="wrap home-compass-grid">
          <div>
            <h2 id="compass-title" className="head">Eight functions on one compass.</h2>
            <p className="body-text">
              Thinking sits opposite feeling, sensation opposite intuition.
              A filled point is the inward version; an arrow is the outward
              one. Your dominant and inferior are always mirror images.
            </p>
            <Link to="/learn" className="text-link">
              Learn the theory
            </Link>
          </div>
          <ul className="compass-list">
            {(['Ti', 'Te', 'Fi', 'Fe', 'Si', 'Se', 'Ni', 'Ne'] as FunctionCode[]).map((code) => (
              <li key={code}>
                <a href={`/functions/${code.toLowerCase()}`}>
                  <FunctionEmblem code={code} className="compass-glyph" />
                  <span className="compass-code">{code}</span>
                  <span className="compass-name">{FUNCTION_READINGS[code].name}</span>
                  <span className="compass-verb">{FUNCTION_READINGS[code].verb}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="home-guides" aria-labelledby="guides-title">
        <div className="wrap">
          <h2 id="guides-title" className="head">Read before you start.</h2>
          <div className="guide-list">
            {guides.map(([href, title, subtitle]) => (
              <a
                key={href}
                href={href}
                className="guide-link"
                onClick={() =>
                  trackEvent('home_seo_path_clicked', {
                    source: 'home_search_paths',
                    destination: href,
                    title,
                  })
                }
              >
                <span>
                  <span className="guide-title">{title}</span>
                  <span className="guide-sub">{subtitle}</span>
                </span>
                <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
          <details className="home-browse">
            <summary>Browse all eight functions and sixteen types</summary>
            <div className="chip-row">
              {['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'].map((code) => (
                <a key={code} href={`/functions/${code.toLowerCase()}`} className="chip">
                  {code}
                </a>
              ))}
            </div>
            <div className="chip-row">
              {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((code) => (
                <a key={code} href={`/types/${code.toLowerCase()}`} className="chip">
                  {code}
                </a>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section className="home-faq" aria-labelledby="faq-title">
        <div className="wrap home-faq-grid">
          <h2 id="faq-title" className="head home-faq-title">Fair questions.</h2>
          <div className="faq-tiles">
            {faqs.map(([question, answer]) => (
              <details key={question} name="home-faq" className="faq-tile">
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="home-close" aria-labelledby="close-title">
        <div className="wrap home-close-row">
          <h2 id="close-title" className="display-2">Start with the free map.</h2>
          <div className="home-close-action">
            <button type="button" className="btn btn-accent btn-lg" onClick={() => start('home_final_cta')}>
              Get my free map
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <p>42 questions. Your core map is free.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
