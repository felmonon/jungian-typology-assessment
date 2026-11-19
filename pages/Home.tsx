import { ArrowRight, ArrowUpRight, Check, Clock3 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { depthQuestions, type FunctionChannel } from '../data/depthAssessment';
import { PRICING } from '../data/pricing';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';

// Bumped whenever the homepage structure changes, so funnel_events rows can be
// split by layout when comparing homepage landing to assessment_completed.
export const HOME_LAYOUT_VERSION = '2026_11_aha_first';

const TOTAL_QUESTIONS = depthQuestions.length;
const layerCount = (layer: string) => depthQuestions.filter((question) => question.layer === layer).length;

// The micro-demo uses a real question from the assessment, word for word.
const DEMO_QUESTION_ID = 'inferior_01';
const demoQuestion = depthQuestions.find((question) => question.id === DEMO_QUESTION_ID)!;
const demoQuestionNumber = depthQuestions.findIndex((question) => question.id === DEMO_QUESTION_ID) + 1;

const channelName: Record<FunctionChannel, string> = {
  thinking: 'Thinking',
  feeling: 'Feeling',
  sensation: 'Sensation',
  intuition: 'Intuition',
};
const oppositeChannel: Record<FunctionChannel, FunctionChannel> = {
  thinking: 'feeling',
  feeling: 'thinking',
  sensation: 'intuition',
  intuition: 'sensation',
};

const demoReadout = (option: (typeof demoQuestion.options)[number]) => {
  if (!option.inferior) {
    return {
      title: 'That is a useful answer too.',
      body: 'Every question has this option. Choosing it never forces a label; several of them simply lower your reliability score, so the map tells you where its evidence is thin.',
    };
  }
  const inferior = channelName[option.inferior];
  const lead = channelName[oppositeChannel[option.inferior]];
  return {
    title: `That reaction is linked to ${inferior} under pressure.`,
    body: `In Jung’s model, the function that takes over when you are depleted is often the least developed one, and it usually sits opposite the one you lean on most. Here that points toward ${lead} as a possible lead. One answer is a clue, not a result: the full map weighs it against ${TOTAL_QUESTIONS - 1} others.`,
  };
};

const sampleStack = [
  { role: 'Dominant', code: 'Ti', name: 'Introverted Thinking' },
  { role: 'Auxiliary', code: 'Ne', name: 'Extraverted Intuition' },
  { role: 'Tertiary', code: 'Si', name: 'Introverted Sensation' },
  { role: 'Inferior', code: 'Fe', name: 'Extraverted Feeling' },
];
const sampleScores: Array<[string, number]> = [
  ['Ti', 82], ['Ne', 71], ['Si', 58], ['Te', 52], ['Ni', 47], ['Fi', 40], ['Se', 33], ['Fe', 28],
];

const layers = [
  {
    layer: 'behavioral',
    title: 'Behavioral scenarios',
    body: 'What you notice and act on first in ordinary decisions. No Jungian vocabulary needed.',
  },
  {
    layer: 'inferior',
    title: 'Inferior-function signals',
    note: 'weighted 1.35×',
    body: 'How you react when stressed or cornered. Your least developed function often points most clearly to your dominant one.',
  },
  {
    layer: 'somatic',
    title: 'Body cues',
    body: 'Where tension and energy show up physically, which can catch patterns your self-image skips over.',
  },
  {
    layer: 'attitude',
    title: 'Attitude questions',
    body: 'Introversion and extraversion as Jung defined them: the direction of your attention, not whether you are shy.',
  },
];

const libraryCards = [
  {
    href: '/jung/inferior-function',
    title: 'The inferior function',
    body: 'Why your least developed function takes the wheel under stress, and what that says about your strengths.',
    cta: 'Read · about 5 min',
  },
  {
    href: '/jung/introversion-and-extraversion',
    title: 'Introversion and extraversion',
    body: 'Jung’s actual idea is about the direction of interest. It has nothing to do with shyness or social skill.',
    cta: 'Read · about 5 min',
  },
  {
    href: '/jung/quotes',
    title: 'Did Jung really say that?',
    body: 'Quotes checked against published sources and cited to the work, plus the popular lines he never wrote.',
    cta: 'Browse the quotes',
  },
];

const guides = [
  ['/jungian-cognitive-functions-test', 'Jungian cognitive functions test'],
  ['/cognitive-function-test', 'Cognitive function test'],
  ['/inferior-function-test', 'Inferior function test'],
  ['/mbti-test-alternative', 'When your MBTI keeps changing'],
  ['/best-cognitive-functions-test', 'Compare cognitive function tests'],
  ['/guides', 'All guides'],
];

const faqs = [
  [
    'What will I get for free?',
    `The full ${TOTAL_QUESTIONS}-question assessment, your function-stack map with all eight function-attitudes, the dominant–inferior pattern, a reliability score, and an introductory interpretation. No account or payment is required to see your result.`,
  ],
  [
    'What if I get a different result from another test?',
    'Use the differences as questions to explore. TypeJung combines answers about everyday behavior, stress, body cues, and attention direction. The result is a working interpretation of your answers, and it may change with your context.',
  ],
  [
    'Does this measure eight functions independently?',
    'The assessment scores four function channels and attention direction, then derives a map showing all eight function-attitudes. The eight displayed values are not eight independent psychological measurements. You can inspect the method before you start.',
  ],
  [
    'Is TypeJung connected to Jung’s estate or a Jungian institute?',
    'No. TypeJung is an independent project. The assessment is built on Jung’s published typology, and the Jung Library cites his works directly so you can check what he wrote. It is educational, and it is not therapy or analysis.',
  ],
];

const SampleMapCard: React.FC = () => (
  <div className="rounded-[28px] bg-[#edeefa] p-5 sm:p-6">
    <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#585b7c]">
      <span>Sample free map</span>
      <span className="font-medium normal-case tracking-normal">Illustrative data</span>
    </div>
    <div className="mt-4 rounded-2xl bg-jung-surface p-5">
      <p className="text-xs text-jung-muted">Suggested stack</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-jung-dark">Ti · Ne · Si · Fe</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {sampleStack.map((item) => (
          <div key={item.code} className="flex items-baseline gap-2">
            <dt className={item.role === 'Inferior' ? 'w-16 shrink-0 text-jung-tension' : 'w-16 shrink-0 text-jung-muted'}>{item.role}</dt>
            <dd className="font-semibold text-jung-dark">{item.code} <span className="font-normal text-jung-secondary">{item.name.split(' ')[1]}</span></dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 grid grid-cols-4 items-end gap-x-2 gap-y-3 sm:grid-cols-8" aria-label="Sample scores for all eight functions">
        {sampleScores.map(([code, score]) => (
          <div key={code} className="flex flex-col items-center gap-1">
            <div className="flex h-16 w-full items-end rounded-md bg-jung-accent-light">
              <div className={code === 'Fe' ? 'w-full rounded-md bg-jung-tension/70' : 'w-full rounded-md bg-jung-accent'} style={{ height: `${score}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-jung-secondary">{code}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-jung-surface p-4">
        <p className="text-xs text-jung-muted">Attitude</p>
        <p className="mt-1 text-sm font-semibold text-jung-dark">64% I · 36% E</p>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-jung-accent-light">
          <span className="bg-jung-accent" style={{ width: '64%' }} />
        </div>
      </div>
      <div className="rounded-2xl bg-jung-surface p-4">
        <p className="text-xs text-jung-muted">Reliability</p>
        <p className="mt-1 text-sm font-semibold text-jung-dark">84 · High</p>
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-jung-accent-light">
          <span className="bg-jung-accent" style={{ width: '84%' }} />
        </div>
      </div>
    </div>
    <div className="mt-3 rounded-2xl bg-jung-surface p-4">
      <p className="text-xs text-jung-tension">Stress edge · inferior Fe</p>
      <p className="mt-1 text-sm leading-6 text-jung-secondary">
        Under strain, this pattern can tip into sudden sensitivity about whether people value you.
      </p>
    </div>
    <p className="mt-3 text-[11px] text-[#585b7c]">Illustrative example. Your map comes from your own answers.</p>
  </div>
);

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const demoRef = useRef<HTMLElement | null>(null);
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);
  useSEO(PAGE_SEO.home);

  useEffect(() => {
    trackEvent('home_wedge_viewed', {
      source: 'home',
      promise: 'mbti_alternative_function_stack',
      version: HOME_LAYOUT_VERSION,
    });
  }, []);

  // Denominator for the micro-demo click rate: visitors who actually saw it.
  useEffect(() => {
    const node = demoRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        trackEvent('home_demo_viewed', { version: HOME_LAYOUT_VERSION, question_id: DEMO_QUESTION_ID });
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const start = (source: string, buttonText: string) => {
    const destination = pathWithSource('/assessment', source);
    trackEvent('home_cta_clicked', {
      cta: source,
      destination: '/assessment',
      version: HOME_LAYOUT_VERSION,
      demo_answered: Boolean(demoAnswer),
    });
    trackEvent('assessment_start_intent', {
      source,
      promise: 'mbti_alternative_function_stack',
    });
    AnalyticsEvents.ctaClicked('start_assessment', source, { buttonText, destination });
    navigate(destination);
  };

  const answerDemo = (optionId: string) => {
    const firstAnswer = demoAnswer === null;
    setDemoAnswer(optionId);
    trackEvent('home_demo_answered', {
      version: HOME_LAYOUT_VERSION,
      question_id: DEMO_QUESTION_ID,
      option: optionId,
      first_answer: firstAnswer,
    });
  };

  const tryOneFirst = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    trackEvent('home_cta_clicked', { cta: 'home_hero_try_one', destination: '#try-a-question', version: HOME_LAYOUT_VERSION });
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    demoRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const trackLibrary = (destination: string, title: string) =>
    trackEvent('home_library_path_clicked', { source: 'home_library', destination, title, version: HOME_LAYOUT_VERSION });

  const selectedOption = demoQuestion.options.find((option) => option.id === demoAnswer);
  const readout = selectedOption ? demoReadout(selectedOption) : null;

  return (
    <div className="journey-home">
      {/* 1. Hero: the hook and what the free map actually shows */}
      <section className="studio-hero lab-container">
        <div className="studio-hero-copy">
          <p className="studio-kicker"><span /> Jungian function-stack assessment</p>
          <h1 className="!text-[clamp(40px,4.6vw,62px)] !leading-[1.06] !tracking-[-0.045em]">Your MBTI result keeps changing. <span>Map the pattern underneath it.</span></h1>
          <p className="studio-hero-description">
            Four-letter quizzes squeeze how you think into a label that shifts with your mood. TypeJung maps all eight
            cognitive functions, your dominant–inferior stress axis, and how consistent your answers were. Free, with no
            account required.
          </p>
          <div className="studio-hero-actions">
            <Button variant="accent" size="lg" onClick={() => start('home_hero', 'Start my free map')} rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start my free map
            </Button>
            <a href="#try-a-question" onClick={tryOneFirst}>Try one question first <span aria-hidden="true">↓</span></a>
          </div>
          <p className="studio-reassurance"><Check size={15} /> Free full map. No email or card needed to see your results.</p>
          <div className="studio-time">
            <Clock3 size={15} />
            <span>{TOTAL_QUESTIONS} questions · 20–25 minutes<br /><small>Your progress saves in this browser as you go.</small></span>
          </div>
        </div>
        <div className="studio-hero-art">
          <SampleMapCard />
        </div>
      </section>

      {/* 2. Micro-demo: one real question and an educational readout */}
      <section
        id="try-a-question"
        ref={demoRef}
        className="scroll-mt-24 border-t border-jung-border bg-jung-surface"
        aria-labelledby="home-demo-title"
      >
        <div className="lab-container py-16 md:py-20">
          <div className="mx-auto max-w-[720px]">
            <p className="journey-eyebrow">Try one question</p>
            <h2 id="home-demo-title" className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              No &ldquo;I enjoy parties: strongly agree&rdquo; sliders.
            </h2>
            <p className="mt-4 text-base leading-7 text-jung-secondary">
              Many tests measure how you would like to behave. TypeJung asks about everyday scenarios, stress reactions,
              and body cues. Pick one answer to see how it is read.
            </p>
            <div className="mt-8 rounded-2xl border border-jung-border bg-jung-base p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-jung-muted">
                Question {demoQuestionNumber} of {TOTAL_QUESTIONS} · Stress and reactive patterns
              </p>
              <p className="mt-3 font-display text-xl leading-snug text-jung-dark sm:text-2xl">{demoQuestion.prompt}</p>
              <div className="mt-5 grid gap-2" role="group" aria-label="Sample answers">
                {demoQuestion.options.map((option) => {
                  const selected = option.id === demoAnswer;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => answerDemo(option.id)}
                      className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition ${
                        selected
                          ? 'border-jung-accent bg-jung-accent-light text-jung-dark'
                          : 'border-jung-border bg-jung-surface text-jung-secondary hover:border-jung-accent-muted'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div aria-live="polite">
                {readout && (
                  <div className="mt-6 border-t border-jung-border pt-5">
                    <p className="font-semibold text-jung-dark">{readout.title}</p>
                    <p className="mt-2 text-sm leading-7 text-jung-secondary">{readout.body}</p>
                    <Button
                      variant="accent"
                      className="mt-5"
                      onClick={() => start('home_demo', 'Continue to the full map')}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Continue to all {TOTAL_QUESTIONS} questions
                    </Button>
                    <p className="mt-3 text-xs text-jung-muted">
                      You will meet this question again as number {demoQuestionNumber}. For reflection only, not a diagnosis.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why the test takes 20 minutes */}
      <section id="how-it-works" className="lab-container py-16 md:py-20" aria-labelledby="home-layers-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="journey-eyebrow">Why {TOTAL_QUESTIONS} questions</p>
            <h2 id="home-layers-title" className="mt-4 font-display text-3xl leading-tight sm:text-4xl">
              Four layers of evidence, not one mood check.
            </h2>
          </div>
          <Link to="/methodology" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-jung-accent">
            Read the method <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map((item) => (
            <div key={item.layer} className="rounded-2xl border border-jung-border bg-jung-surface p-5">
              <p className="font-display text-4xl font-semibold tracking-tight text-jung-accent">{layerCount(item.layer)}</p>
              <h3 className="mt-2 font-semibold text-jung-dark">{item.title}</h3>
              {item.note && <p className="mt-1 text-xs font-semibold text-jung-tension">{item.note}</p>}
              <p className="mt-2 text-sm leading-6 text-jung-secondary">{item.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-7 text-jung-secondary">
          <strong className="text-jung-dark">When the layers disagree, the result says so.</strong> Your map includes a
          reliability score from 25 to 96 and notes on where your answers pulled in different directions.
        </p>
      </section>

      {/* 4. Free map vs optional report, at list prices */}
      <section id="pricing" className="border-y border-jung-border-light bg-jung-surface" aria-labelledby="home-offer-title">
        <div className="lab-container py-16 md:py-20">
          <p className="journey-eyebrow">What is free, and what is not</p>
          <h2 id="home-offer-title" className="mt-4 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            See your full map free. Pay only if you want the deeper read.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-jung-border bg-jung-base p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">Free map</h3>
                <span className="font-display text-2xl font-semibold">{PRICING.free.price}</span>
              </div>
              <ul className="mt-5 space-y-3">
                {[
                  'Scores for all eight function-attitudes',
                  'Your four-function stack and introversion–extraversion balance',
                  'The dominant–inferior stress axis and a reliability score',
                  'An introductory interpretation of your pattern',
                  'No account, email or card required',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-jung-secondary">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />{item}
                  </li>
                ))}
              </ul>
              <Button
                variant="accent"
                className="mt-6 w-full"
                onClick={() => start('home_offer_free', 'Start my free map')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Start my free map
              </Button>
            </div>
            <div className="rounded-2xl border border-jung-border bg-jung-base p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl">Insight report</h3>
                <span className="font-display text-2xl font-semibold">
                  {PRICING.insight.price} <span className="font-sans text-xs font-normal text-jung-muted">once</span>
                </span>
              </div>
              <p className="mt-2 text-xs text-jung-muted">Optional. Decide after you see your map.</p>
              <ul className="mt-5 space-y-3">
                {[
                  'Ten interpretation sections written for your result',
                  'Stress and recovery reflections',
                  'Relationship, work, and growth prompts',
                  'The Function Stack in Depth guide (PDF)',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-jung-secondary">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />{item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-5 text-jung-muted">
                Mastery ({PRICING.mastery.price} once) adds the AI Type Guide, growth exercises and an individuation
                roadmap. No subscription. 7-day refund policy.
              </p>
              <Link
                to={pathWithSource('/sample-report', 'home_offer')}
                onClick={() => trackEvent('home_cta_clicked', { cta: 'home_offer_sample', destination: '/sample-report', version: HOME_LAYOUT_VERSION })}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-jung-accent"
              >
                Read a full sample report <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Library ramp for visitors not ready for 20 minutes */}
      <section className="lab-container py-16 md:py-20" aria-labelledby="home-library-title">
        <p className="journey-eyebrow">The Jung Library</p>
        <h2 id="home-library-title" className="mt-4 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
          Not ready for 20 minutes? Start with one short idea.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-jung-secondary">
          Jung in plain words, with his own words quoted and an exact source for each.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {libraryCards.map((card) => (
            <a
              key={card.href}
              href={card.href}
              onClick={() => trackLibrary(card.href, card.title)}
              className="group flex flex-col rounded-2xl border border-jung-border bg-jung-surface p-5 transition hover:border-jung-accent-muted"
            >
              <h3 className="font-display text-xl group-hover:text-jung-accent">{card.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-jung-secondary">{card.body}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-jung-accent">
                {card.cta} <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
        <a
          href="/jung"
          onClick={() => trackLibrary('/jung', 'Explore the full Jung Library')}
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-jung-accent"
        >
          Explore the full Jung Library <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      <section className="border-y border-jung-border-light bg-jung-surface">
        <div className="lab-container grid gap-8 py-14 md:py-20 lg:grid-cols-[0.7fr_1fr] lg:gap-20">
          <div>
            <p className="journey-eyebrow">Before you begin</p>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl">A few fair questions.</h2>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question} className="group border-b border-jung-border first:border-t">
                <summary className="cursor-pointer py-5 text-base font-medium text-jung-dark">{question}</summary>
                <p className="max-w-2xl pb-5 text-sm leading-7 text-jung-secondary">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Final CTA with honest expectations */}
      <section className="studio-final-cta lab-container">
        <p className="journey-eyebrow">Your next step</p>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
          See how your eight functions pull against each other.
        </h2>
        <ul className="mx-auto mt-6 grid max-w-3xl gap-3 text-left text-sm leading-6 text-jung-secondary sm:grid-cols-3">
          {[
            'Progress saves in this browser, so you can pause and come back.',
            'Every question has a “none of these fits” option.',
            'Educational self-reflection, never a clinical diagnosis or a fixed “true type”.',
          ].map((item) => (
            <li key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-jung-accent" />{item}</li>
          ))}
        </ul>
        <Button
          variant="accent"
          size="lg"
          className="mt-8"
          onClick={() => start('home_final_cta', 'Start the free map')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Start the free {TOTAL_QUESTIONS}-question map
        </Button>
      </section>

      {/* Guide links kept for crawlers and searchers, out of the main path */}
      <nav aria-label="Guides" className="lab-container border-t border-jung-border-light py-8 text-xs text-jung-muted">
        <p className="journey-eyebrow mb-2">Guides</p>
        <div className="flex flex-wrap gap-x-5">
          {guides.map(([href, title]) => (
            <a key={href} href={href} className="inline-flex min-h-11 items-center hover:text-jung-accent">{title}</a>
          ))}
        </div>
        <details className="mt-2">
          <summary className="cursor-pointer py-3">Browse all eight functions and sixteen types</summary>
          <div className="flex flex-wrap gap-x-4">
            {['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'].map((code) => (
              <a key={code} href={`/functions/${code.toLowerCase()}`} className="inline-flex min-h-11 items-center hover:text-jung-accent">{code}</a>
            ))}
            {['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'].map((code) => (
              <a key={code} href={`/types/${code.toLowerCase()}`} className="inline-flex min-h-11 items-center hover:text-jung-accent">{code}</a>
            ))}
          </div>
        </details>
      </nav>
    </div>
  );
};
