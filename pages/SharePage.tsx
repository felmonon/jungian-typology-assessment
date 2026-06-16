import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { FUNCTION_DESCRIPTIONS } from '../data/questions';
import { ATTITUDE_LABELS, FUNCTION_LABELS } from '../data/depthAssessment';
import { Button } from '../components/ui/Button';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';
import { extractDepthResult } from '../utils/depthCompatibility';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { pathWithSource } from '../lib/acquisition-source';
import { useSEO } from '../hooks/useSEO';

const SHARED_RESULT_CAMPAIGN = 'shared_result_compare';

const cleanShareParam = (value: string | null | undefined): string | undefined => {
  if (!value) return undefined;
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return cleaned || undefined;
};

const buildSharedResultHref = (
  path: string,
  source: string,
  slug: string | undefined,
  search: string,
) => {
  const params = new URLSearchParams(search);

  return pathWithSource(path, source, {
    ref: 'shared_result',
    utm_campaign: cleanShareParam(params.get('utm_campaign')) || SHARED_RESULT_CAMPAIGN,
    shared_result: cleanShareParam(slug),
    parent_source: cleanShareParam(params.get('source')),
  });
};

const trackSharedResultCta = (ctaName: string, buttonText: string, destination: string, sharedSlug?: string) => {
  AnalyticsEvents.ctaClicked(ctaName, 'shared_result_page', {
    buttonText,
    destination,
  });
  trackEvent('shared_result_cta_clicked', {
    cta_name: ctaName,
    destination,
    shared_result: cleanShareParam(sharedSlug) || 'unknown',
  });
};

const SharedResultStickyCta: React.FC<{ assessmentHref: string; sharedSlug?: string }> = ({ assessmentHref, sharedSlug }) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-jung-border bg-jung-surface/95 shadow-[0_-12px_32px_rgba(41,28,18,0.14)] backdrop-blur lg:hidden">
    <div className="mx-auto grid max-w-screen-sm grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-jung-dark">Compare your own map</p>
        <p className="mt-0.5 text-xs leading-4 text-jung-muted">Free, no card, 42 questions.</p>
      </div>
      <Link
        to={assessmentHref}
        onClick={() => trackSharedResultCta('shared_result_sticky_start_assessment', 'Start free', assessmentHref, sharedSlug)}
      >
        <Button variant="accent" size="sm" className="flex-none" rightIcon={<ArrowRight className="h-4 w-4" />}>
          Start free
        </Button>
      </Link>
    </div>
  </div>
);

const ComparisonPrompt: React.FC<{
  sharedLabel: string;
  sharedDetail: string;
  ctaName: string;
  assessmentHref: string;
  sharedSlug?: string;
}> = ({ sharedLabel, sharedDetail, ctaName, assessmentHref, sharedSlug }) => (
  <section className="mt-8 rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div>
        <p className="text-label">Compare maps</p>
        <h2 className="mt-2 text-2xl font-semibold text-jung-dark">Put your pattern beside this one.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-jung-secondary">
          This shared result gives you one side of the comparison. Take the free assessment to see your own dominant channel, developmental edge, and answer consistency before any paid report.
        </p>
      </div>
      <Link
        to={assessmentHref}
        onClick={() => trackSharedResultCta(ctaName, 'Compare my free result', assessmentHref, sharedSlug)}
      >
        <Button variant="accent" size="lg" className="w-full min-h-[48px]" rightIcon={<ArrowRight className="h-5 w-5" />}>
          Compare my free result
        </Button>
      </Link>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
      <div className="rounded-lg border border-jung-border bg-jung-base p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">Their map</p>
        <p className="mt-3 text-xl font-semibold text-jung-dark">{sharedLabel}</p>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">{sharedDetail}</p>
      </div>
      <div className="hidden items-center justify-center text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted sm:flex">
        versus
      </div>
      <div className="rounded-lg border border-dashed border-jung-accent-muted bg-jung-accent-light/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-accent">Your map</p>
        <p className="mt-3 text-xl font-semibold text-jung-dark">Unknown until you answer</p>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          See whether your energy concentrates in the same channel, its opposite, or a different axis entirely.
        </p>
      </div>
    </div>
  </section>
);

const SharedDepthHero: React.FC<{
  sharedLabel: string;
  sharedDetail: string;
  assessmentHref: string;
  sampleHref: string;
  sharedSlug?: string;
}> = ({ sharedLabel, sharedDetail, assessmentHref, sampleHref, sharedSlug }) => (
  <section className="mb-8 overflow-hidden rounded-lg border border-jung-border bg-jung-dark text-white shadow-xl">
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <img src="/logo.svg" alt="TypeJung" className="h-10 w-10 rounded-lg bg-white/10 p-1" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
            Someone shared their function-stack map
          </span>
        </div>
        <h1 className="mt-6 max-w-3xl text-display text-4xl text-white sm:text-6xl">
          Their map is only half the comparison.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
          This result leads with {sharedLabel}. Take the same free 42-question assessment to see whether your own map shares the axis, flips it, or points somewhere else.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {['Free first', 'No card needed', 'All 8 functions mapped'].map((item) => (
            <span key={item} className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/75">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <Link
            to={assessmentHref}
            onClick={() => trackSharedResultCta('shared_depth_hero_start_assessment', 'Compare my free map', assessmentHref, sharedSlug)}
          >
            <Button variant="inverted" size="lg" className="w-full min-h-[52px]" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Compare my free map
            </Button>
          </Link>
          <Link
            to={sampleHref}
            onClick={() => trackSharedResultCta('shared_depth_hero_view_sample_report', 'View sample report', sampleHref, sharedSlug)}
          >
            <Button variant="secondary" size="lg" className="w-full min-h-[52px]" leftIcon={<FileText className="h-5 w-5" />}>
              View sample report
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/10 p-6 sm:p-7 lg:border-l lg:border-t-0">
        <div className="rounded-lg border border-white/15 bg-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/50">Their map</p>
          <p className="mt-3 text-2xl font-semibold text-white">{sharedLabel}</p>
          <p className="mt-2 text-sm leading-6 text-white/60">{sharedDetail}</p>
        </div>
        <div className="my-4 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
          versus
        </div>
        <div className="rounded-lg border border-dashed border-jung-accent-muted bg-jung-accent-light p-4 text-jung-dark">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-jung-accent">Your map</p>
          <p className="mt-3 text-2xl font-semibold">Unknown until you answer</p>
          <p className="mt-2 text-sm leading-6 text-jung-secondary">
            Your result may match this axis, invert it, or reveal a completely different dominant-inferior pattern.
          </p>
        </div>
      </div>
    </div>
  </section>
);

interface SharedResult {
  id: string;
  scores: Array<{ function: string; score: number }>;
  stack: {
    dominant: { function: string; score: number };
    auxiliary: { function: string; score: number };
    tertiary: { function: string; score: number };
    inferior: { function: string; score: number };
    depthResult?: unknown;
  };
  attitudeScore: string;
  isUndifferentiated: string;
  createdAt: string;
}

export const SharePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const assessmentHref = useMemo(
    () => buildSharedResultHref('/assessment', 'shared_result_cta', slug, location.search),
    [location.search, slug],
  );
  const sampleHref = useMemo(
    () => buildSharedResultHref('/sample-report', 'shared_result_sample', slug, location.search),
    [location.search, slug],
  );

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/share/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('This shared result was not found.');
          } else {
            setError('Failed to load the shared result.');
          }
          return;
        }
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError('Failed to load the shared result.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResult();
    }
  }, [slug]);

  useEffect(() => {
    if (!result) return;

    trackEvent('shared_result_viewed', {
      result_type: extractDepthResult(result) ? 'depth_energy_map' : 'legacy_profile',
    });
  }, [result]);

  const depthResult = result ? extractDepthResult(result) : null;
  const sharedTitle = depthResult
    ? `${ATTITUDE_LABELS[depthResult.attitude.dominant]} ${FUNCTION_LABELS[depthResult.dominant]} Shared TypeJung Map`
    : result
      ? `${result.stack.dominant.function} Shared TypeJung Result`
      : 'Shared TypeJung Result';

  useSEO({
    title: `${sharedTitle} | TypeJung`,
    description: 'A shared TypeJung result. Take the free Jungian cognitive functions assessment to compare your own function-stack map.',
    type: 'article',
    url: slug ? `/share/${slug}` : '/share',
    noIndex: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-surface px-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-jung-accent mx-auto mb-4" />
          <p className="text-jung-secondary text-sm md:text-base">Loading shared result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-jung-surface px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-jung-accent/10 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl font-serif text-jung-accent">ψ</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-3">Result Not Found</h1>
          <p className="text-jung-secondary mb-6 text-sm md:text-base">{error || 'This shared result could not be found.'}</p>
          <Link to={assessmentHref} onClick={() => trackSharedResultCta('missing_shared_result_start_assessment', 'Take Your Own Assessment', assessmentHref, slug)}>
            <Button className="w-full sm:w-auto min-h-[48px]">Take Your Own Assessment</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (depthResult) {
    const sharedLabel = `${ATTITUDE_LABELS[depthResult.attitude.dominant]} ${FUNCTION_LABELS[depthResult.dominant]}`;
    const sharedDetail = `${FUNCTION_LABELS[depthResult.inferior]} is shown as the developmental edge with ${depthResult.reliability.score}% answer consistency.`;

    return (
      <div className="editorial-container pb-28 pt-8 md:py-12 lg:pb-12">
        <SharedDepthHero
          sharedLabel={sharedLabel}
          sharedDetail={sharedDetail}
          assessmentHref={assessmentHref}
          sampleHref={sampleHref}
          sharedSlug={slug}
        />

        <div className="rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
          <p className="text-label">Shared result details</p>
          <h2 className="mt-2 text-heading text-3xl text-jung-dark">{sharedLabel}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-jung-secondary">
            {depthResult.narrative.energyMap}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.75fr]">
          <div className="card-elevated rounded-lg p-6">
            <p className="text-label">Energy distribution</p>
            <div className="mt-6 space-y-5">
              {depthResult.energy.map((item) => (
                <div key={item.channel}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-jung-dark">{item.label}</span>
                    <span className="font-mono text-sm text-jung-muted">{item.score}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                    <div className="h-full rounded-full bg-jung-accent" style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated rounded-lg p-6">
            <p className="text-label">Developmental edge</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">
              {FUNCTION_LABELS[depthResult.inferior]} asks for development
            </h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">
              {depthResult.narrative.developmentalEdge}
            </p>
            <div className="mt-6 rounded-lg bg-jung-accent-light px-4 py-3 text-sm font-semibold text-jung-accent">
              {depthResult.reliability.score}% answer consistency
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-jung-border bg-jung-surface p-6 md:p-10 text-center">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-3">
            Build your own function-stack map
          </h2>
          <p className="text-jung-secondary mb-6 max-w-xl mx-auto text-sm md:text-base">
            Take the 42-question assessment to map which functions lead, support, and tighten under stress.
          </p>
          <Link to={assessmentHref} onClick={() => trackSharedResultCta('shared_depth_bottom_start_assessment', 'Take your own assessment', assessmentHref, slug)}>
            <Button variant="accent" size="lg" className="w-full sm:w-auto min-h-[48px]">
              Take your own assessment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <SharedResultStickyCta assessmentHref={assessmentHref} sharedSlug={slug} />
      </div>
    );
  }

  const dominantFunc = result.stack.dominant.function;
  const funcDescription = FUNCTION_DESCRIPTIONS[dominantFunc];
  const chartData = result.scores.map(s => ({
    subject: s.function,
    A: s.score,
    fullMark: 100,
  }));

  return (
    <div className="editorial-container pb-28 pt-8 md:py-12 lg:pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.svg" alt="TypeJung" className="w-10 h-10" />
          <span className="text-xs md:text-sm font-data font-bold tracking-widest uppercase text-jung-secondary">
            TypeJung Shared Result
          </span>
        </div>
        <p className="text-jung-muted text-sm md:text-base">Someone shared their psychological type profile with you</p>
      </div>

      <section className="mb-8 rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-label">Shared result</p>
            <h2 className="mt-2 text-2xl font-semibold text-jung-dark">
              Want your own map beside this one?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-jung-secondary">
              This shared profile shows one person&apos;s function pattern. Take the free TypeJung assessment to compare your own cognitive-function stack and see whether the result feels accurate.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[23rem]">
            <Link to={assessmentHref} onClick={() => trackSharedResultCta('shared_legacy_start_assessment', 'Take my free assessment', assessmentHref, slug)}>
              <Button variant="accent" size="lg" className="w-full min-h-[48px]">
                Take my free assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to={sampleHref} onClick={() => trackSharedResultCta('shared_legacy_view_sample_report', 'View sample report', sampleHref, slug)}>
              <Button variant="outline" size="lg" className="w-full min-h-[48px]">
                <FileText className="mr-2 h-5 w-5" />
                View sample report
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero card */}
      <div className="bg-jung-dark text-white p-6 md:p-10 rounded-2xl mb-8 shadow-xl">
        <div className="text-center">
          <p className="text-xs md:text-sm uppercase tracking-widest opacity-70 mb-3 font-data">Dominant Function</p>
          <h1 className="text-2xl md:text-4xl font-serif font-bold mb-3">
            {funcDescription?.title || dominantFunc} ({dominantFunc})
          </h1>
          <p className="text-base md:text-xl opacity-90 italic max-w-2xl mx-auto font-serif">
            "{funcDescription?.quote}"
          </p>
        </div>
      </div>

      <ComparisonPrompt
        sharedLabel={`${funcDescription?.title || dominantFunc} (${dominantFunc})`}
        sharedDetail={`This shared profile leads with ${dominantFunc}. Your own map may share the same lead, invert the axis, or point somewhere else.`}
        ctaName="shared_legacy_comparison_start_assessment"
        assessmentHref={assessmentHref}
        sharedSlug={slug}
      />

      {/* Content grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Radar chart */}
        <div className="card-elevated p-6 rounded-2xl">
          <h3 className="text-sm md:text-base font-data font-bold text-jung-secondary mb-4 tracking-widest uppercase text-center">
            Function-Attitude Energy
          </h3>
          <div className="w-full h-[280px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#D8D5CE" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#1B1B3A', fontSize: 11, fontWeight: 'bold' }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#1F7A67"
                  strokeWidth={2}
                  fill="#1F7A67"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Function stack */}
        <div className="flex flex-col justify-center">
          <div className="card-elevated p-6 rounded-2xl mb-5">
            <h3 className="text-base md:text-lg font-serif font-bold text-jung-dark mb-4">Function Stack</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-accent text-sm md:text-base font-serif">1. Dominant</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.dominant.function}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-secondary text-sm md:text-base font-serif">2. Auxiliary</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.auxiliary.function}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-jung-border">
                <span className="font-medium text-jung-muted text-sm md:text-base font-serif">3. Tertiary</span>
                <span className="font-serif font-bold text-base md:text-lg">{result.stack.tertiary.function}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="font-medium text-jung-muted/70 text-sm md:text-base font-serif">4. Inferior</span>
                <span className="font-serif font-bold text-base md:text-lg text-jung-muted">{result.stack.inferior.function}</span>
              </div>
            </div>
          </div>

          <p className="text-xs md:text-sm text-jung-muted italic text-center font-serif">
            {funcDescription?.desc?.slice(0, 200)}...
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-jung-surface rounded-2xl p-6 md:p-10 text-center border border-jung-border">
        <h2 className="text-xl md:text-2xl font-serif font-bold text-jung-dark mb-3">
          Discover Your Own Psychological Type
        </h2>
        <p className="text-jung-secondary mb-6 max-w-xl mx-auto text-sm md:text-base">
          Take the TypeJung assessment to uncover your dominant cognitive functions and receive a personalized analysis based on Carl Jung's theory of psychological types.
        </p>
        <Link to={assessmentHref} onClick={() => trackSharedResultCta('shared_legacy_bottom_start_assessment', 'Take Your Own Assessment', assessmentHref, slug)}>
          <Button variant="accent" size="lg" className="w-full sm:w-auto min-h-[48px]">
            Take Your Own Assessment <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-jung-muted mt-8 pt-6 border-t border-jung-border">
        <p>Based on the typological work of Carl Gustav Jung (Psychological Types, CW Vol. 6)</p>
      </div>
      <SharedResultStickyCta assessmentHref={assessmentHref} sharedSlug={slug} />
    </div>
  );
};
