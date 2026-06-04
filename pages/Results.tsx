import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, ChevronDown, Crown, Download, FileText, Link2, Loader2, Lock, LogIn, RefreshCcw, Save, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { OfferCodeCallout } from '../components/OfferCodeCallout';
import { Button } from '../components/ui/Button';
import { EMAIL_CAPTURE_OFFER } from '../data/discount';
import { ATTITUDE_LABELS, AttitudeDirection, FUNCTION_LABELS, FunctionChannel, depthLayerMeta } from '../data/depthAssessment';
import { EMAIL_OFFER_PRICES, PRICING, type PaidTierId } from '../data/pricing';
import { useAiAnalysis, type PremiumAnalysis } from '../hooks/use-ai-analysis';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import { AnalyticsEvents } from '../lib/analytics';
import { depthResultToLegacyAnalysisInput, type LegacyFunctionScore } from '../utils/depthCompatibility';
import { DepthAssessmentResult, isDepthAssessmentResult } from '../utils/depthScoring';

const RESULTS_KEY = 'jungian_assessment_results';
const LIFECYCLE_EMAIL_ENDPOINT = '/api/lifecycle-email';
const RESULT_READY_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_result_ready_';
const UPGRADE_EMAIL_DUE_PREFIX = 'typejung_lifecycle_email_upgrade_due_';
const UPGRADE_EMAIL_ATTEMPT_PREFIX = 'typejung_lifecycle_email_upgrade_';
const UPGRADE_EMAIL_DELAY_MS = 36 * 60 * 60 * 1000;

const upgradeOptions: Array<{
  tier: PaidTierId;
  label: string;
  description: string;
  features: string[];
  preview: string;
}> = [
  {
    tier: 'insight',
    label: 'Insight',
    description: 'Best when you want your full personal ranking and deeper interpretation after the free map feels accurate.',
    features: ['Full 8-function ranking', 'Stress pattern analysis', 'Practice guidance'],
    preview: 'Unlocks the complete ordered function profile, confidence signal, inferior-function edge, and usable next steps.',
  },
  {
    tier: 'mastery',
    label: 'Mastery',
    description: 'Best when you want the full report plus ongoing AI coaching and exercises.',
    features: ['Everything in Insight', 'AI Type Coach', 'Practice roadmap'],
    preview: 'Adds coach questions, tailored exercises, and a roadmap for working with the ranking over time.',
  },
];

type ResultsState =
  | { status: 'loading' }
  | { status: 'no-results' }
  | { status: 'legacy' }
  | { status: 'ready'; results: DepthAssessmentResult };

const positionLabels = {
  dominant: 'Dominant',
  auxiliary: 'Auxiliary',
  tertiary: 'Tertiary',
  inferior: 'Inferior',
} as const;

const axisCopy: Record<FunctionChannel, string> = {
  thinking: 'Thinking holds the most conscious energy here. Feeling is the opposite pole and the likely site of value, attachment, shame, or relational development.',
  feeling: 'Feeling holds the most conscious energy here. Thinking is the opposite pole and the likely site of clarity, precision, judgment, or intellectual development.',
  sensation: 'Sensation holds the most conscious energy here. Intuition is the opposite pole and the likely site of meaning, possibility, dread, or symbolic development.',
  intuition: 'Intuition holds the most conscious energy here. Sensation is the opposite pole and the likely site of embodiment, limits, appetite, and concrete follow-through.',
};

const functionAttentionPreview: Record<FunctionChannel, { title: string; body: string }> = {
  thinking: {
    title: 'How Thinking shapes attention',
    body: 'A higher Thinking score means the assessment saw you orient through criteria, structure, definitions, and logical leverage. A lower score usually means this channel becomes more charged when pressure rises.',
  },
  feeling: {
    title: 'How Feeling shapes attention',
    body: 'A higher Feeling score means you tend to notice value, relational impact, emotional tone, and what matters to people. A lower score can show where worth, approval, or attachment becomes harder to hold cleanly.',
  },
  sensation: {
    title: 'How Sensation shapes attention',
    body: 'A higher Sensation score means concrete details, body cues, timing, comfort, and what is directly present carry more weight. A lower score can mark the body and practical follow-through as a stress doorway.',
  },
  intuition: {
    title: 'How Intuition shapes attention',
    body: 'A higher Intuition score means pattern, future implication, symbolism, and hidden direction organize your read of a situation. A lower score can make possibility, dread, or meaning feel more primitive under stress.',
  },
};

const functionCodeByChannel: Record<FunctionChannel, Record<AttitudeDirection, string>> = {
  thinking: {
    introverted: 'Ti',
    extraverted: 'Te',
  },
  feeling: {
    introverted: 'Fi',
    extraverted: 'Fe',
  },
  sensation: {
    introverted: 'Si',
    extraverted: 'Se',
  },
  intuition: {
    introverted: 'Ni',
    extraverted: 'Ne',
  },
};

const getFunctionCode = (channel: FunctionChannel, attitude: AttitudeDirection) =>
  functionCodeByChannel[channel]?.[attitude] ?? 'unknown';

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Recently completed';
  }
};

const getResultAgeMinutes = (completedAt: string): number => {
  const completedAtTime = Date.parse(completedAt);
  if (!Number.isFinite(completedAtTime)) return 0;
  return Math.max(0, Math.round((Date.now() - completedAtTime) / 60000));
};

const getPositionFunctionCode = (
  results: DepthAssessmentResult,
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior',
): string | undefined => {
  const item = results.hierarchy.find((entry) => entry.position === position);
  return item ? getFunctionCode(item.channel, item.attitude) : undefined;
};

type FunctionCode = LegacyFunctionScore['function'];

const functionVisualMeta: Record<FunctionCode, { label: string; family: string; colorVar: string }> = {
  Te: { label: 'External structure', family: 'Thinking', colorVar: 'var(--color-function-thinking)' },
  Ti: { label: 'Internal logic', family: 'Thinking', colorVar: 'var(--color-function-thinking)' },
  Fe: { label: 'Relational field', family: 'Feeling', colorVar: 'var(--color-function-feeling)' },
  Fi: { label: 'Personal value', family: 'Feeling', colorVar: 'var(--color-function-feeling)' },
  Se: { label: 'Present contact', family: 'Sensation', colorVar: 'var(--color-function-sensation)' },
  Si: { label: 'Memory and stability', family: 'Sensation', colorVar: 'var(--color-function-sensation)' },
  Ne: { label: 'Possibility field', family: 'Intuition', colorVar: 'var(--color-function-intuition)' },
  Ni: { label: 'Long-range pattern', family: 'Intuition', colorVar: 'var(--color-function-intuition)' },
};

const radarOrder: FunctionCode[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

const getScore = (scores: LegacyFunctionScore[], code: FunctionCode) =>
  scores.find((score) => score.function === code)?.score ?? 0;

const averageCodes = (scores: LegacyFunctionScore[], codes: FunctionCode[]) =>
  Math.round(codes.reduce((sum, code) => sum + getScore(scores, code), 0) / codes.length);

const readResults = (): ResultsState => {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return { status: 'no-results' };
    const parsed = JSON.parse(raw);
    if (isDepthAssessmentResult(parsed)) return { status: 'ready', results: parsed };
    return { status: 'legacy' };
  } catch {
    return { status: 'no-results' };
  }
};

const postLifecycleEmail = async (body: Record<string, unknown>) => {
  try {
    const response = await fetch(LIFECYCLE_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);
    return response.ok && !!data && (data.sent === true || data.skipped === true);
  } catch {
    return false;
  }
};

const FunctionRadar: React.FC<{
  scores: LegacyFunctionScore[];
  dominantCode?: string;
  inferiorCode?: string;
}> = ({ scores, dominantCode, inferiorCode }) => {
  const id = useId();
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const rMax = size * 0.34;
  const ringSteps = [0.25, 0.5, 0.75, 1];
  const values = radarOrder.map((code) => ({
    code,
    score: getScore(scores, code),
    ...functionVisualMeta[code],
  }));

  const angleFor = (index: number) => (-90 + (index * 360) / values.length) * (Math.PI / 180);
  const pointFor = (index: number, score: number) => {
    const angle = angleFor(index);
    const radius = rMax * (score / 100);
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius] as const;
  };

  const polygonPoints = values.map((item, index) => pointFor(index, item.score).join(',')).join(' ');

  return (
    <div className="rounded-lg border border-white/10 bg-dark-base p-5 text-white shadow-xl sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/45">8-function signature</p>
          <h2 className="mt-2 text-heading text-3xl text-white">Your cognitive shape</h2>
        </div>
        <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/55">
          Animated map
        </span>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-[24rem]"
        role="img"
        aria-label="Eight function radar chart"
      >
        <defs>
          <radialGradient id={`radar-fill-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-jung-accent-muted)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-jung-accent)" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {ringSteps.map((step, index) => (
          <circle
            key={step}
            cx={cx}
            cy={cy}
            r={rMax * step}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={index === ringSteps.length - 1 ? 1 : 0.5}
            strokeDasharray={index === ringSteps.length - 1 ? 'none' : '2 4'}
          />
        ))}

        {values.map((_, index) => {
          const angle = angleFor(index);
          const x2 = cx + Math.cos(angle) * rMax;
          const y2 = cy + Math.sin(angle) * rMax;
          return (
            <line
              key={index}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth={0.5}
            />
          );
        })}

        <motion.polygon
          points={polygonPoints}
          fill={`url(#radar-fill-${id})`}
          stroke="var(--color-jung-accent-muted)"
          strokeWidth={1.35}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
        />

        {values.map((item, index) => {
          const [x, y] = pointFor(index, item.score);
          const angle = angleFor(index);
          const labelRadius = rMax + 28;
          const labelX = cx + Math.cos(angle) * labelRadius;
          const labelY = cy + Math.sin(angle) * labelRadius;
          const isDominant = item.code === dominantCode;
          const isInferior = item.code === inferiorCode;

          return (
            <g key={item.code}>
              <circle
                cx={x}
                cy={y}
                r={isDominant ? 4.5 : 3.25}
                fill={item.colorVar}
                stroke="var(--color-dark-base)"
                strokeWidth={2}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-display)"
                fontSize="15"
                fill={isInferior ? 'var(--color-jung-subtle)' : 'white'}
              >
                {item.code}
              </text>
              <text
                x={labelX}
                y={labelY + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-mono)"
                fontSize="9"
                fill="rgba(255,255,255,0.48)"
              >
                {item.score}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {values.map((item) => (
          <div key={item.code} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{item.code}</span>
              <span className="font-mono text-xs text-white/55">{item.score}%</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-white/45">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuadAxisMatrix: React.FC<{ scores: LegacyFunctionScore[] }> = ({ scores }) => {
  const axes = [
    {
      label: 'Judging functions',
      left: 'Thinking',
      right: 'Feeling',
      leftCodes: ['Te', 'Ti'] as FunctionCode[],
      rightCodes: ['Fe', 'Fi'] as FunctionCode[],
      leftColor: 'var(--color-function-thinking)',
      rightColor: 'var(--color-function-feeling)',
      copy: 'How you decide, evaluate, and create standards under pressure.',
    },
    {
      label: 'Perceiving functions',
      left: 'Sensing',
      right: 'Intuition',
      leftCodes: ['Se', 'Si'] as FunctionCode[],
      rightCodes: ['Ne', 'Ni'] as FunctionCode[],
      leftColor: 'var(--color-function-sensation)',
      rightColor: 'var(--color-function-intuition)',
      copy: 'How you gather reality, pattern, possibility, and bodily evidence.',
    },
  ];

  return (
    <div className="rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
      <div className="mb-6">
        <p className="text-label">Quad-axis matrix</p>
        <h2 className="mt-2 text-heading text-3xl text-jung-dark">Where the psyche splits its work.</h2>
        <p className="mt-3 text-sm leading-6 text-jung-secondary">
          TypeJung groups the eight scores into Jung's two core axes so the internal friction is easier to read.
        </p>
      </div>

      <div className="grid gap-4">
        {axes.map((axis) => {
          const leftScore = averageCodes(scores, axis.leftCodes);
          const rightScore = averageCodes(scores, axis.rightCodes);
          const total = Math.max(1, leftScore + rightScore);
          const leftWidth = Math.round((leftScore / total) * 100);
          const rightWidth = 100 - leftWidth;
          const lead = leftScore >= rightScore ? axis.left : axis.right;

          return (
            <div key={axis.label} className="rounded-lg border border-jung-border bg-jung-base p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-jung-dark">{axis.label}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-secondary">{axis.copy}</p>
                </div>
                <span className="rounded-lg bg-jung-surface px-2.5 py-1 text-xs font-semibold text-jung-muted">
                  {lead} lead
                </span>
              </div>

              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="w-20 text-right">
                  <p className="text-sm font-semibold text-jung-dark">{axis.left}</p>
                  <p className="font-mono text-xs text-jung-muted">{leftScore}%</p>
                </div>
                <div className="flex h-4 overflow-hidden rounded-full bg-jung-border-light">
                  <div
                    className="h-full"
                    style={{ width: `${leftWidth}%`, backgroundColor: axis.leftColor }}
                  />
                  <div
                    className="h-full"
                    style={{ width: `${rightWidth}%`, backgroundColor: axis.rightColor }}
                  />
                </div>
                <div className="w-20">
                  <p className="text-sm font-semibold text-jung-dark">{axis.right}</p>
                  <p className="font-mono text-xs text-jung-muted">{rightScore}%</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[...axis.leftCodes, ...axis.rightCodes].map((code) => (
                  <div key={code} className="flex items-center justify-between rounded-lg border border-jung-border bg-jung-surface px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: functionVisualMeta[code].colorVar }}
                      />
                      <span className="text-sm font-semibold text-jung-dark">{code}</span>
                      <span className="hidden text-xs text-jung-muted sm:inline">{functionVisualMeta[code].label}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-jung-muted">{getScore(scores, code)}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EnergyBars: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => {
  const [activeChannel, setActiveChannel] = useState<FunctionChannel>(results.dominant);
  const activeEnergy = results.energy.find((item) => item.channel === activeChannel) ?? results.energy[0];
  const activePreview = functionAttentionPreview[activeEnergy.channel];

  return (
    <div className="card-premium p-6 sm:p-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label">Energy distribution</p>
          <h2 className="mt-2 text-heading text-3xl text-jung-dark">Your energy map</h2>
          <p className="mt-2 text-sm leading-6 text-jung-secondary">Tap a function bar to see how that score shapes attention.</p>
        </div>
        <div className="rounded-lg bg-jung-accent-light px-3 py-2 text-sm font-semibold text-jung-accent">
          {results.reliability.score}% consistency
        </div>
      </div>

      <div className="space-y-4">
        {results.energy.map((item) => {
          const isDominant = item.channel === results.dominant;
          const isInferior = item.channel === results.inferior;
          const isActive = item.channel === activeChannel;

          return (
            <button
              key={item.channel}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveChannel(item.channel)}
              onFocus={() => setActiveChannel(item.channel)}
              onMouseEnter={() => setActiveChannel(item.channel)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                isActive
                  ? 'border-jung-accent-muted bg-jung-accent-light/70 shadow-sm'
                  : 'border-transparent hover:border-jung-border hover:bg-jung-surface-alt'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-semibold text-jung-dark">{item.label}</span>
                  {isDominant && <span className="rounded-lg bg-jung-accent px-2 py-1 text-[11px] font-semibold text-white">Dominant</span>}
                  {isInferior && <span className="rounded-lg border border-jung-border px-2 py-1 text-[11px] font-semibold text-jung-muted">Inferior</span>}
                </div>
                <span className="font-mono text-sm font-semibold text-jung-muted">{item.score}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full rounded-full ${isInferior ? 'bg-jung-accent-muted' : 'bg-jung-accent'}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      <motion.div
        key={activeEnergy.channel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="mt-5 rounded-lg border border-jung-border bg-jung-base p-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-jung-dark">{activePreview.title}</p>
            <p className="mt-2 text-sm leading-6 text-jung-secondary">{activePreview.body}</p>
          </div>
          <span className="rounded-lg bg-jung-surface px-2.5 py-1 text-xs font-semibold text-jung-muted">{activeEnergy.score}%</span>
        </div>
      </motion.div>
    </div>
  );
};

const Hierarchy: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => (
  <div className="grid gap-4 lg:grid-cols-4">
    {results.hierarchy.map((item) => (
      <div key={item.position} className={`rounded-lg border p-5 ${item.position === 'dominant' ? 'border-jung-accent-muted bg-jung-accent-light/70' : 'border-jung-border bg-jung-surface'}`}>
        <p className="text-sm font-semibold text-jung-muted">{positionLabels[item.position]}</p>
        <h3 className="mt-3 text-2xl font-semibold text-jung-dark">{item.label}</h3>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          {ATTITUDE_LABELS[item.attitude]} channel, {item.score}% of mapped energy.
        </p>
      </div>
    ))}
  </div>
);

const SignalGrid: React.FC<{ results: DepthAssessmentResult }> = ({ results }) => {
  const signals = useMemo(() => ([
    ['behavioral', results.layerSignals.behavioral ? FUNCTION_LABELS[results.layerSignals.behavioral as FunctionChannel] : 'Mixed'],
    ['inferior', results.layerSignals.inferior ? FUNCTION_LABELS[results.layerSignals.inferior as FunctionChannel] : FUNCTION_LABELS[results.inferior]],
    ['somatic', results.layerSignals.somatic ? FUNCTION_LABELS[results.layerSignals.somatic as FunctionChannel] : 'Mixed'],
    ['attitude', ATTITUDE_LABELS[results.attitude.dominant]],
  ] as const), [results]);

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {signals.map(([layer, value]) => {
        const meta = depthLayerMeta[layer as keyof typeof depthLayerMeta];
        return (
          <div key={layer} className="rounded-lg border border-jung-border bg-jung-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">{meta.shortLabel}</p>
            <p className="mt-2 text-lg font-semibold text-jung-dark">{value}</p>
          </div>
        );
      })}
    </div>
  );
};

const TensionAxis: React.FC<{
  results: DepthAssessmentResult;
  dominantLabel: string;
  inferiorLabel: string;
}> = ({ results, dominantLabel, inferiorLabel }) => {
  const dominant = results.hierarchy.find((item) => item.position === 'dominant');
  const inferior = results.hierarchy.find((item) => item.position === 'inferior');
  const dominantCode = dominant ? getFunctionCode(dominant.channel, dominant.attitude) : getFunctionCode(results.dominant, results.attitude.dominant);
  const inferiorCode = inferior ? getFunctionCode(inferior.channel, inferior.attitude) : getFunctionCode(results.inferior, results.attitude.dominant === 'introverted' ? 'extraverted' : 'introverted');
  const dominantScore = dominant?.score ?? results.energy.find((item) => item.channel === results.dominant)?.score ?? 0;
  const inferiorScore = inferior?.score ?? results.energy.find((item) => item.channel === results.inferior)?.score ?? 0;

  return (
    <section className="mt-8 rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-center">
        <div>
          <p className="text-label">Dominant-inferior tension</p>
          <h2 className="mt-3 text-heading text-3xl text-jung-dark">The stress edge other tests flatten.</h2>
          <p className="mt-4 text-sm leading-7 text-jung-secondary">
            {axisCopy[results.dominant]}
          </p>
          <p className="mt-3 text-sm leading-7 text-jung-secondary">
            The paid report turns this line into specific stress triggers, relationship patterns, and practice steps.
          </p>
        </div>

        <div className="rounded-lg border border-jung-border bg-jung-base p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="rounded-lg border border-jung-accent-muted bg-jung-accent-light p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-accent">Conscious lead</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold text-jung-dark">{dominantCode}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-secondary">{dominantLabel}</p>
                </div>
                <p className="font-mono text-lg font-semibold text-jung-dark">{dominantScore}%</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-jung-border-light">
                <div className="h-full rounded-full bg-jung-accent" style={{ width: `${Math.max(8, dominantScore)}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-center sm:flex-col">
              <div className="h-px w-full bg-jung-border sm:h-16 sm:w-px" />
              <span className="mx-3 whitespace-nowrap rounded-lg border border-jung-border bg-jung-surface px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-jung-muted sm:mx-0 sm:my-3">
                Tension line
              </span>
              <div className="h-px w-full bg-jung-border sm:h-16 sm:w-px" />
            </div>

            <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">Developmental edge</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-semibold text-jung-dark">{inferiorCode}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-secondary">{inferiorLabel}</p>
                </div>
                <p className="font-mono text-lg font-semibold text-jung-dark">{inferiorScore}%</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-jung-border-light">
                <div className="h-full rounded-full bg-jung-accent-muted" style={{ width: `${Math.max(8, inferiorScore)}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PersonalRanking: React.FC<{ scores: LegacyFunctionScore[]; locked?: boolean }> = ({ scores, locked = false }) => {
  const ranking = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="grid gap-3">
      {ranking.map((score, index) => {
        const hidden = locked && index > 0;
        return (
          <div key={score.function} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-jung-border bg-jung-base p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jung-surface text-sm font-semibold text-jung-dark">
              #{index + 1}
            </div>
            <div className={hidden ? 'select-none blur-[3px]' : ''}>
              <p className="font-semibold text-jung-dark">{score.function}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-jung-border-light">
                <div className="h-full rounded-full bg-jung-accent" style={{ width: `${Math.max(6, score.score)}%` }} />
              </div>
            </div>
            <div className={`text-right ${hidden ? 'select-none blur-[3px]' : ''}`}>
              <p className="font-mono text-sm font-semibold text-jung-dark">{score.score}%</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-jung-muted">
                {index === 0 ? 'Lead' : index < 4 ? 'Stack' : 'Shadow'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

type PaidPreviewAnalyticsContext = {
  dominantFunction?: string;
  inferiorFunction?: string;
  resultAgeMinutes: number;
};

const lockedModuleCopy = (
  dominantLabel: string,
  inferiorLabel: string,
  results: DepthAssessmentResult,
) => [
  {
    id: 'stress_pattern',
    title: 'Stress pattern',
    eyebrow: 'Insight module',
    body: `How ${dominantLabel} can tighten into ${inferiorLabel} under pressure, with early signals and repair moves to watch.`,
    preview: results.narrative.complexVulnerability,
  },
  {
    id: 'relationship_trigger',
    title: 'Relationship trigger',
    eyebrow: 'Insight module',
    body: `Where the ${dominantLabel} to ${inferiorLabel} axis may show up in conflict, approval pressure, distance, or over-explaining.`,
    preview: 'The full report turns this axis into plain-language relationship patterns and self-observation prompts.',
  },
  {
    id: 'practice_plan',
    title: 'Practice plan',
    eyebrow: 'Insight module',
    body: `A practical starting sequence for working with ${inferiorLabel} without turning the result into a fixed identity label.`,
    preview: results.narrative.practice,
  },
];

const LockedPaidModuleCard: React.FC<{
  module: ReturnType<typeof lockedModuleCopy>[number];
  analytics: PaidPreviewAnalyticsContext;
}> = ({ module, analytics }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded) {
      AnalyticsEvents.paidReportModuleExpanded({
        module: module.id,
        tier: 'insight',
        location: 'results_locked_paid_module',
        dominantFunction: analytics.dominantFunction,
        inferiorFunction: analytics.inferiorFunction,
        resultAgeMinutes: analytics.resultAgeMinutes,
      });
    }
  };

  return (
    <article className="rounded-lg border border-jung-border bg-jung-base p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-jung-accent">
            <FileText className="h-3.5 w-3.5" />
            {module.eyebrow}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-jung-dark">{module.title}</h3>
        </div>
        <span className="rounded-lg bg-jung-surface px-2.5 py-1 text-xs font-semibold text-jung-muted">Locked</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-jung-secondary">{module.body}</p>
      <button
        type="button"
        onClick={toggleExpanded}
        className="mt-4 flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-jung-border bg-jung-surface px-3 text-left text-xs font-semibold text-jung-dark transition hover:border-jung-accent-muted hover:bg-jung-accent-light focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jung-base"
      >
        Preview locked section
        <ChevronDown className={`h-4 w-4 text-jung-accent transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-3 rounded-lg border border-jung-border bg-jung-surface p-3">
          <p className="select-none text-xs leading-5 text-jung-secondary blur-[2px]">
            {module.preview}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-jung-accent">
            <Lock className="h-3.5 w-3.5" />
            Unlock Insight to read this section clearly.
          </p>
        </div>
      )}
    </article>
  );
};

const BlurredPremiumTeaser: React.FC<{
  dominantLabel: string;
  inferiorLabel: string;
  onUnlockInsight: () => void;
}> = ({ dominantLabel, inferiorLabel, onUnlockInsight }) => (
  <div className="relative overflow-hidden rounded-lg border border-jung-border bg-jung-base">
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-jung-base/78 p-5 backdrop-blur-[2px]">
      <div className="max-w-md rounded-lg border border-jung-accent-muted bg-jung-surface p-5 text-center shadow-xl">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-jung-dark">Your stress map is ready.</h3>
        <p className="mt-2 text-sm leading-6 text-jung-secondary">
          Unlock the specific {dominantLabel} to {inferiorLabel} triggers, repair cues, and practice sequence.
        </p>
        <Button
          variant="accent"
          className="mt-4 w-full"
          onClick={onUnlockInsight}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Unlock stress map - {PRICING.insight.price}
        </Button>
      </div>
    </div>

    <div className="select-none p-5 blur-[4px]">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Inferior-function stress pattern map', 'Early warning signs, what tightens first, and what restores range.'],
          ['Somatic practice guidance', 'Body-based grounding sequence matched to the weak edge.'],
          ['Relationship trigger translation', 'How the axis appears in conflict, approval pressure, and repair.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-jung-border bg-jung-surface p-4">
            <p className="text-sm font-semibold text-jung-dark">{title}</p>
            <p className="mt-3 text-xs leading-5 text-jung-secondary">{body}</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded-full bg-jung-accent" />
              <div className="h-2 w-4/5 rounded-full bg-jung-border" />
              <div className="h-2 w-2/3 rounded-full bg-jung-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContextualPlanComparison: React.FC<{
  dominantLabel: string;
  inferiorLabel: string;
  onUnlockInsight: () => void;
  onUnlockMastery: () => void;
}> = ({ dominantLabel, inferiorLabel, onUnlockInsight, onUnlockMastery }) => {
  const plans = [
    {
      id: 'free',
      label: 'Free map',
      price: PRICING.free.price,
      body: `Shows the visible ${dominantLabel} to ${inferiorLabel} axis and your energy distribution.`,
      cta: 'Current view',
      action: undefined,
    },
    {
      id: 'insight',
      label: 'Insight',
      price: `${PRICING.insight.price} one-time`,
      offer: `${EMAIL_OFFER_PRICES.insight} with ${EMAIL_CAPTURE_OFFER.code}`,
      body: 'Explains why the stress edge activates, what it looks like in relationships, and how to work with it.',
      cta: 'Unlock Insight',
      action: onUnlockInsight,
    },
    {
      id: 'mastery',
      label: 'Mastery',
      price: `${PRICING.mastery.price} one-time`,
      offer: `${EMAIL_OFFER_PRICES.mastery} with ${EMAIL_CAPTURE_OFFER.code}`,
      body: 'Adds the full report plus the AI Type Coach for follow-up questions and practice integration.',
      cta: 'Add AI coach',
      action: onUnlockMastery,
    },
  ];

  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-lg border p-4 ${
            plan.id === 'insight'
              ? 'border-jung-accent-muted bg-jung-accent-light/70'
              : 'border-jung-border bg-jung-base'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-jung-dark">{plan.label}</p>
              <p className="mt-1 text-xs font-semibold text-jung-accent">{plan.price}</p>
              {'offer' in plan && plan.offer && <p className="mt-1 text-[11px] font-semibold text-jung-muted">{plan.offer}</p>}
            </div>
            {plan.id === 'insight' && <span className="rounded-lg bg-jung-accent px-2 py-1 text-[11px] font-semibold text-white">Best next</span>}
          </div>
          <p className="mt-3 text-xs leading-5 text-jung-secondary">{plan.body}</p>
          {plan.action ? (
            <Button
              variant={plan.id === 'insight' ? 'accent' : 'outline'}
              size="sm"
              className="mt-4 w-full"
              onClick={plan.action}
              rightIcon={plan.id === 'mastery' ? <Crown className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            >
              {plan.cta}
            </Button>
          ) : (
            <div className="mt-4 rounded-lg border border-jung-border bg-jung-surface px-3 py-2 text-center text-xs font-semibold text-jung-muted">
              {plan.cta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const LockedPaidReport: React.FC<{
  results: DepthAssessmentResult;
  scores: LegacyFunctionScore[];
  dominantLabel: string;
  inferiorLabel: string;
  analytics: PaidPreviewAnalyticsContext;
  onUnlockInsight: () => void;
  onUnlockMastery: () => void;
}> = ({ results, scores, dominantLabel, inferiorLabel, analytics, onUnlockInsight, onUnlockMastery }) => (
  <section className="mt-8 rounded-lg border border-jung-accent-muted bg-jung-surface p-6 shadow-md sm:p-8">
    <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-start">
      <div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-jung-accent-light px-3 py-1.5 text-xs font-semibold text-jung-accent">
          <Lock className="h-3.5 w-3.5" />
          Paid report preview
        </div>
        <h2 className="mt-4 text-heading text-4xl text-jung-dark">Unlock your full personal ranking and analysis.</h2>
        <p className="mt-4 text-sm leading-7 text-jung-secondary">
          Your free map found the {dominantLabel} to {inferiorLabel} axis. Insight unlocks the complete 8-function ranking, confidence interpretation, stress pattern analysis, relationship and work patterns, and a practical growth plan.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ['Full ranking', 'See all 8 functions ordered with score interpretation.'],
            ['Deep analysis', 'Turn the map into stress, relationship, work, and practice guidance.'],
            ['Instant access', 'Return from Stripe and read the report immediately.'],
            ['One-time CAD', `${PRICING.insight.price} for Insight, ${PRICING.mastery.price} for Mastery.`],
          ].map(([label, copy]) => (
            <div key={label} className="rounded-lg border border-jung-border bg-jung-base p-4">
              <p className="text-sm font-semibold text-jung-dark">{label}</p>
              <p className="mt-2 text-xs leading-5 text-jung-secondary">{copy}</p>
            </div>
          ))}
        </div>
        <OfferCodeCallout location="results_locked_paid_report" tier="insight" compact className="mt-5" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="accent" onClick={onUnlockInsight} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Unlock Insight - {PRICING.insight.price}
          </Button>
          <Button variant="outline" onClick={onUnlockMastery} rightIcon={<Crown className="h-4 w-4" />}>
            Add AI coach - {PRICING.mastery.price}
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-label">Personal ranking</p>
            <h3 className="mt-1 text-2xl font-semibold text-jung-dark">Top result visible, full ranking locked</h3>
          </div>
          <span className="rounded-lg bg-jung-dark px-3 py-1.5 text-xs font-semibold text-white">Locked</span>
        </div>
        <PersonalRanking scores={scores} locked />
      </div>
    </div>
    <div className="mt-6">
      <BlurredPremiumTeaser
        dominantLabel={dominantLabel}
        inferiorLabel={inferiorLabel}
        onUnlockInsight={onUnlockInsight}
      />
    </div>
    <ContextualPlanComparison
      dominantLabel={dominantLabel}
      inferiorLabel={inferiorLabel}
      onUnlockInsight={onUnlockInsight}
      onUnlockMastery={onUnlockMastery}
    />
    <div className="mt-6 grid gap-4 lg:grid-cols-3">
      {lockedModuleCopy(dominantLabel, inferiorLabel, results).map((module) => (
        <LockedPaidModuleCard key={module.id} module={module} analytics={analytics} />
      ))}
    </div>
  </section>
);

const FullPaidReport: React.FC<{
  results: DepthAssessmentResult;
  scores: LegacyFunctionScore[];
  premiumAnalysis: PremiumAnalysis | null;
  isLoadingPremium: boolean;
  premiumError: string | null;
}> = ({ results, scores, premiumAnalysis, isLoadingPremium, premiumError }) => {
  const reportSections = [
    ['Overview', premiumAnalysis?.overview || results.narrative.energyMap],
    ['Stress pattern analysis', premiumAnalysis?.theGrip || results.narrative.complexVulnerability],
    ['Relationship triggers', premiumAnalysis?.relationships || 'Relationship triggers become clearer when the inferior function is read as a charged developmental edge rather than a weakness.'],
    ['Work and decision pattern', premiumAnalysis?.career || 'Use the ranking to separate your natural mode of competence from the conditions that make it brittle.'],
    ['Growth practice plan', premiumAnalysis?.growth || results.narrative.practice],
    ['Shadow integration', premiumAnalysis?.shadow || results.narrative.developmentalEdge],
  ];

  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label">Paid report</p>
          <h2 className="mt-3 text-heading text-4xl text-jung-dark">Full personal ranking and analysis.</h2>
        </div>
        {isLoadingPremium && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-3 py-2 text-sm text-jung-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
            Generating deep report
          </div>
        )}
      </div>

      {premiumError && (
        <div className="mb-5 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
          Premium analysis unavailable: {premiumError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.82fr_1fr]">
        <div className="rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
              <BarChart3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-label">Personal ranking</p>
              <h3 className="text-2xl font-semibold text-jung-dark">All 8 functions</h3>
            </div>
          </div>
          <PersonalRanking scores={scores} />
        </div>

        <div className="grid gap-4">
          {reportSections.map(([title, body]) => (
            <div key={title} className="rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm">
              <p className="text-sm font-semibold text-jung-dark">{title}</p>
              <p className="mt-3 text-sm leading-7 text-jung-secondary">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StickyUpgradeBar: React.FC<{
  dominantLabel: string;
  inferiorLabel: string;
  onUnlockInsight: () => void;
  onUnlockMastery: () => void;
}> = ({ dominantLabel, inferiorLabel, onUnlockInsight, onUnlockMastery }) => (
  <aside
    aria-label="Unlock full TypeJung report"
    className="fixed inset-x-0 bottom-0 z-50 border-t border-jung-border bg-jung-surface/96 shadow-[0_-16px_40px_-28px_rgb(29_38_32_/_0.75)] backdrop-blur"
  >
    <div className="mx-auto grid w-full max-w-6xl gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="hidden h-10 w-10 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent sm:flex">
          <Lock className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-jung-dark">
            <span className="sm:hidden">Stress map locked</span>
            <span className="hidden sm:inline">Shadow, stress, and somatic analysis locked for {dominantLabel} to {inferiorLabel}</span>
          </p>
          <p className="mt-1 hidden text-xs leading-5 text-jung-secondary sm:block">
            Unlock the full ranking, inferior-function triggers, body cues, and practice plan. Insight is {EMAIL_OFFER_PRICES.insight} with {EMAIL_CAPTURE_OFFER.code}.
          </p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[24rem]">
        <Button
          variant="accent"
          size="sm"
          onClick={onUnlockInsight}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Unlock Insight - {EMAIL_OFFER_PRICES.insight} w/code
        </Button>
        <div className="hidden sm:block">
          <Button
            variant="outline"
            size="sm"
            onClick={onUnlockMastery}
            className="w-full"
            rightIcon={<Crown className="h-4 w-4" />}
          >
            Add AI coach
          </Button>
        </div>
      </div>
    </div>
  </aside>
);

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ResultsState>({ status: 'loading' });
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tier, isPremium, isLoading: premiumLoading } = usePremiumStatus();
  const {
    freeAnalysis,
    premiumAnalysis,
    isLoadingFree,
    isLoadingPremium,
    freeError,
    premiumError,
    fetchFreeAnalysis,
    fetchPremiumAnalysis,
  } = useAiAnalysis();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error' | 'skipped'>('idle');
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [showStickyUpgrade, setShowStickyUpgrade] = useState(false);

  const openUpgradeCheckout = useCallback((paidTier: PaidTierId, location: string) => {
    AnalyticsEvents.upgradeClicked(location, paidTier);
    AnalyticsEvents.ctaClicked(`unlock_${paidTier}`, location, {
      buttonText: `Unlock ${PRICING[paidTier].name}`,
      destination: `/checkout/${paidTier}`,
    });
    navigate(`/checkout/${paidTier}`);
  }, [navigate]);

  useEffect(() => {
    setState(readResults());
  }, []);

  const currentResults = state.status === 'ready' ? state.results : null;
  const legacyInput = useMemo(
    () => currentResults ? depthResultToLegacyAnalysisInput(currentResults) : null,
    [currentResults],
  );

  useEffect(() => {
    if (!currentResults) return;

    const dominantFunction = getFunctionCode(currentResults.dominant, currentResults.attitude.dominant);
    const viewedKey = `typejung_results_viewed_${currentResults.completedAt}`;

    try {
      if (sessionStorage.getItem(viewedKey)) return;
      AnalyticsEvents.resultsViewed(dominantFunction);
      sessionStorage.setItem(viewedKey, 'true');
    } catch {
      AnalyticsEvents.resultsViewed(dominantFunction);
    }
  }, [currentResults]);

  useEffect(() => {
    if (!currentResults || premiumLoading || isPremium) return;

    const viewedKey = `typejung_paid_preview_viewed_${currentResults.completedAt}`;
    const payload = {
      tier: 'insight',
      location: 'results_locked_paid_report',
      dominantFunction: getPositionFunctionCode(currentResults, 'dominant'),
      inferiorFunction: getPositionFunctionCode(currentResults, 'inferior'),
      resultAgeMinutes: getResultAgeMinutes(currentResults.completedAt),
    };

    try {
      if (sessionStorage.getItem(viewedKey)) return;
      AnalyticsEvents.paidReportPreviewViewed(payload);
      sessionStorage.setItem(viewedKey, 'true');
    } catch {
      AnalyticsEvents.paidReportPreviewViewed(payload);
    }
  }, [currentResults, isPremium, premiumLoading]);

  useEffect(() => {
    if (premiumLoading || isPremium) {
      setShowStickyUpgrade(false);
      return;
    }

    const updateStickyVisibility = () => {
      const threshold = Math.min(720, window.innerHeight * 0.78);
      setShowStickyUpgrade(window.scrollY > threshold);
    };

    updateStickyVisibility();
    window.addEventListener('scroll', updateStickyVisibility, { passive: true });
    window.addEventListener('resize', updateStickyVisibility);

    return () => {
      window.removeEventListener('scroll', updateStickyVisibility);
      window.removeEventListener('resize', updateStickyVisibility);
    };
  }, [isPremium, premiumLoading]);

  const lifecycleEmailSummary = useMemo(() => {
    if (!currentResults) return null;

    return {
      dominantLabel: `${ATTITUDE_LABELS[currentResults.attitude.dominant]} ${FUNCTION_LABELS[currentResults.dominant]}`,
      inferiorLabel: `${ATTITUDE_LABELS[currentResults.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[currentResults.inferior]}`,
    };
  }, [currentResults]);

  useEffect(() => {
    if (!currentResults || !legacyInput || authLoading) return;

    if (!isAuthenticated) {
      setSaveState('skipped');
      return;
    }

    const savedKey = `jungian_depth_saved_${currentResults.completedAt}`;
    const savedSlug = localStorage.getItem(`${savedKey}_share_slug`);
    if (localStorage.getItem(savedKey)) {
      setSaveState('saved');
      setShareSlug(savedSlug);
      return;
    }

    let cancelled = false;
    setSaveState('saving');

    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(legacyInput),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || 'Failed to save result');
        }
        return response.json();
      })
      .then((saved) => {
        if (cancelled) return;
        localStorage.setItem(savedKey, 'true');
        if (saved?.shareSlug) {
          localStorage.setItem(`${savedKey}_share_slug`, saved.shareSlug);
          localStorage.setItem('jungian_assessment_share_slug', saved.shareSlug);
          setShareSlug(saved.shareSlug);
        }
        AnalyticsEvents.resultSaved('auto_save_after_result', Boolean(saved?.shareSlug));
        setSaveState('saved');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to save depth result:', error);
        setSaveState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, currentResults, isAuthenticated, legacyInput]);

  useEffect(() => {
    if (!legacyInput || freeAnalysis || freeError || isLoadingFree) return;
    fetchFreeAnalysis(legacyInput);
  }, [fetchFreeAnalysis, freeAnalysis, freeError, isLoadingFree, legacyInput]);

  useEffect(() => {
    if (!legacyInput || !isPremium || premiumLoading || premiumAnalysis || premiumError || isLoadingPremium) return;
    fetchPremiumAnalysis(legacyInput);
  }, [fetchPremiumAnalysis, isLoadingPremium, isPremium, legacyInput, premiumAnalysis, premiumError, premiumLoading]);

  useEffect(() => {
    if (!currentResults || !lifecycleEmailSummary || authLoading || !user?.email) return;

    const attemptKey = `${RESULT_READY_EMAIL_ATTEMPT_PREFIX}${currentResults.completedAt}`;
    if (localStorage.getItem(attemptKey)) return;

    void postLifecycleEmail({
      lifecycle: 'result-ready',
      idempotencyKey: attemptKey,
      completedAt: currentResults.completedAt,
      dominantLabel: lifecycleEmailSummary.dominantLabel,
      inferiorLabel: lifecycleEmailSummary.inferiorLabel,
    }).then((ok) => {
      if (ok) {
        localStorage.setItem(attemptKey, new Date().toISOString());
      }
    });
  }, [authLoading, currentResults, lifecycleEmailSummary, user?.email]);

  useEffect(() => {
    if (!currentResults || !lifecycleEmailSummary || authLoading || premiumLoading || !user?.email) return;

    const dueKey = `${UPGRADE_EMAIL_DUE_PREFIX}${currentResults.completedAt}`;
    const attemptKey = `${UPGRADE_EMAIL_ATTEMPT_PREFIX}${currentResults.completedAt}`;

    if (isPremium) {
      localStorage.removeItem(dueKey);
      return;
    }

    if (localStorage.getItem(attemptKey)) return;

    const savedDueAt = Number(localStorage.getItem(dueKey));
    const dueAt = Number.isFinite(savedDueAt) && savedDueAt > 0
      ? savedDueAt
      : Date.now() + UPGRADE_EMAIL_DELAY_MS;

    if (!Number.isFinite(savedDueAt) || savedDueAt <= 0) {
      localStorage.setItem(dueKey, String(dueAt));
    }

    const timer = window.setTimeout(() => {
      if (localStorage.getItem('jungian_assessment_unlocked') === 'true') return;
      if (localStorage.getItem(attemptKey)) return;

      void postLifecycleEmail({
        lifecycle: 'free-result-upgrade',
        idempotencyKey: attemptKey,
        completedAt: currentResults.completedAt,
        dominantLabel: lifecycleEmailSummary.dominantLabel,
        inferiorLabel: lifecycleEmailSummary.inferiorLabel,
      }).then((ok) => {
        if (ok) {
          localStorage.setItem(attemptKey, new Date().toISOString());
        }
      });
    }, Math.max(0, dueAt - Date.now()));

    return () => window.clearTimeout(timer);
  }, [authLoading, currentResults, isPremium, lifecycleEmailSummary, premiumLoading, user?.email]);

  const downloadResults = useCallback(() => {
    if (state.status !== 'ready') return;
    const blob = new Blob([JSON.stringify(state.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `typejung-energy-map-${state.results.completedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const copyShareUrl = useCallback(async () => {
    if (!shareSlug || typeof window === 'undefined') return;

    const url = `${window.location.origin}/share/${shareSlug}`;

    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      AnalyticsEvents.resultsShared('link');
      window.setTimeout(() => setShareCopied(false), 2400);
    } catch (error) {
      console.error('Failed to copy share URL:', error);
    }
  }, [shareSlug]);

  const openShareWindow = useCallback((method: 'twitter' | 'linkedin') => {
    if (!shareSlug || typeof window === 'undefined') return;

    const url = `${window.location.origin}/share/${shareSlug}`;
    const text = 'I mapped my Jungian energy pattern with TypeJung. It shows cognitive functions, inferior-function stress, and a growth edge.';
    const shareUrl = method === 'twitter'
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

    AnalyticsEvents.resultsShared(method);
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }, [shareSlug]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-lg bg-jung-accent-light" />
            <p className="mt-5 text-sm font-semibold text-jung-muted">Loading results</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'no-results') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <h1 className="text-heading text-3xl text-jung-dark">No energy map yet</h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Complete the assessment first, then your result will appear here.
            </p>
            <Button className="mt-6" variant="accent" onClick={() => navigate('/assessment')} rightIcon={<ArrowRight className="h-5 w-5" />}>
              Start assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'legacy') {
    return (
      <div className="min-h-[60vh] bg-jung-base px-4 py-20">
        <div className="editorial-container">
          <div className="card-premium mx-auto max-w-xl p-8 text-center">
            <h1 className="text-heading text-3xl text-jung-dark">Retake for the new energy map</h1>
            <p className="mt-3 text-sm leading-6 text-jung-secondary">
              Your saved result was created with the older 8-function scorer. The redesigned flow uses the new 42-question depth model.
            </p>
            <Button className="mt-6" variant="accent" onClick={() => navigate('/assessment')} rightIcon={<RefreshCcw className="h-5 w-5" />}>
              Retake assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { results } = state;
  const shareUrl = shareSlug && typeof window !== 'undefined' ? `${window.location.origin}/share/${shareSlug}` : null;
  const dominantLabel = lifecycleEmailSummary?.dominantLabel ?? `${ATTITUDE_LABELS[results.attitude.dominant]} ${FUNCTION_LABELS[results.dominant]}`;
  const inferiorLabel = lifecycleEmailSummary?.inferiorLabel ?? `${ATTITUDE_LABELS[results.hierarchy.find((item) => item.position === 'inferior')?.attitude ?? 'extraverted']} ${FUNCTION_LABELS[results.inferior]}`;
  const chatProfile = legacyInput ? {
    dominantFunction: legacyInput.stack.dominant.function,
    auxiliaryFunction: legacyInput.stack.auxiliary.function,
    tertiaryFunction: legacyInput.stack.tertiary.function,
    inferiorFunction: legacyInput.stack.inferior.function,
    scores: legacyInput.scores.map((score) => ({ function: score.function, score: score.score })),
    attitudeScore: legacyInput.attitudeScore,
  } : null;
  const rankingScores = legacyInput?.scores ?? [];
  const paidPreviewAnalytics = {
    dominantFunction: getPositionFunctionCode(results, 'dominant'),
    inferiorFunction: getPositionFunctionCode(results, 'inferior'),
    resultAgeMinutes: getResultAgeMinutes(results.completedAt),
  };

  return (
    <div className={`min-h-screen bg-jung-base ${!premiumLoading && !isPremium ? 'pb-40 sm:pb-32' : 'pb-20'}`}>
      <div className="editorial-container py-10 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="justify-start px-0 text-jung-muted hover:text-jung-accent">
            Return home
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={downloadResults} leftIcon={<Download className="h-4 w-4" />}>
              Download result file
            </Button>
            <Button variant="outline" onClick={() => navigate('/assessment')} leftIcon={<RefreshCcw className="h-4 w-4" />}>
              Retake
            </Button>
          </div>
        </div>

        <section className="mb-10 rounded-lg border border-jung-border bg-jung-dark p-7 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-white/60">{formatDate(results.completedAt)}</p>
              <h1 className="mt-4 text-display text-5xl text-white sm:text-6xl">Your energy map</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">
                {results.narrative.energyMap}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white/60">Dominant-inferior axis</p>
              <p className="mt-3 text-2xl font-semibold">{dominantLabel}</p>
              <p className="my-2 text-sm text-white/45">to</p>
              <p className="text-2xl font-semibold text-jung-subtle">{inferiorLabel}</p>
            </div>
          </div>
        </section>

        {rankingScores.length > 0 && (
          <section className="mb-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <FunctionRadar
              scores={rankingScores}
              dominantCode={paidPreviewAnalytics.dominantFunction}
              inferiorCode={paidPreviewAnalytics.inferiorFunction}
            />
            <QuadAxisMatrix scores={rankingScores} />
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <EnergyBars results={results} />

          <div className="grid gap-6">
            <div className="card-premium p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-jung-accent-light text-jung-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-label">Answer consistency signal</p>
                  <h2 className="text-2xl font-semibold text-jung-dark">{results.reliability.label}</h2>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-jung-border-light">
                <div className="h-full rounded-full bg-jung-accent" style={{ width: `${results.reliability.score}%` }} />
              </div>
              <div className="mt-5 space-y-3">
                {results.reliability.notes.map((note) => (
                  <p key={note} className="text-sm leading-6 text-jung-secondary">{note}</p>
                ))}
              </div>
            </div>

            <div className="card-premium p-6 sm:p-8">
              <p className="text-label">Attitude</p>
              <h2 className="mt-2 text-2xl font-semibold text-jung-dark">{ATTITUDE_LABELS[results.attitude.dominant]} direction</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                  <p className="text-sm text-jung-muted">Introverted</p>
                  <p className="mt-2 text-3xl font-semibold text-jung-dark">{results.attitude.introverted}%</p>
                </div>
                <div className="rounded-lg border border-jung-border bg-jung-surface p-4">
                  <p className="text-sm text-jung-muted">Extraverted</p>
                  <p className="mt-2 text-3xl font-semibold text-jung-dark">{results.attitude.extraverted}%</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-jung-secondary">{results.attitude.summary}</p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <Hierarchy results={results} />
        </section>

        <section className="mt-8">
          <SignalGrid results={results} />
        </section>

        <TensionAxis
          results={results}
          dominantLabel={dominantLabel}
          inferiorLabel={inferiorLabel}
        />

        {isPremium ? (
          <FullPaidReport
            results={results}
            scores={rankingScores}
            premiumAnalysis={premiumAnalysis}
            isLoadingPremium={isLoadingPremium}
            premiumError={premiumError}
          />
        ) : (
          <>
            <LockedPaidReport
              results={results}
              scores={rankingScores}
              dominantLabel={dominantLabel}
              inferiorLabel={inferiorLabel}
              analytics={paidPreviewAnalytics}
              onUnlockInsight={() => openUpgradeCheckout('insight', 'results_full_ranking_preview')}
              onUnlockMastery={() => openUpgradeCheckout('mastery', 'results_full_ranking_preview')}
            />
            <DiscountCaptureCard
              source="results_below_paid_preview"
              dominantLabel={dominantLabel}
              inferiorLabel={inferiorLabel}
              compact
              className="mt-6"
            />
          </>
        )}

        <section className="mt-8 grid gap-5 lg:grid-cols-3 lg:items-start">
          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Account</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Save this result</h2>
            <div className="mt-4 text-sm leading-7 text-jung-secondary">
              {authLoading && 'Checking your session.'}
              {!authLoading && !user && 'Sign in to save this result to your history, create a share link, and restore any paid access tied to your email.'}
              {isAuthenticated && saveState === 'saving' && 'Saving this result to your account history.'}
              {isAuthenticated && saveState === 'saved' && 'Saved to your account history.'}
              {isAuthenticated && saveState === 'error' && 'The result is ready, but it could not be saved to your account right now.'}
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {!authLoading && !user && (
                <Button variant="outline" onClick={() => navigate('/auth')} leftIcon={<LogIn className="h-4 w-4" />}>
                  Sign in
                </Button>
              )}
              {isAuthenticated && (
                <Button variant="outline" onClick={() => navigate('/history')} leftIcon={saveState === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
                  Open history
                </Button>
              )}
              {shareUrl && (
                <div className="rounded-lg border border-jung-border bg-jung-base p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-jung-dark">
                    <Share2 className="h-4 w-4 text-jung-accent" />
                    Launch-ready share link
                  </div>
                  <a className="mt-3 block break-all text-xs leading-5 text-jung-accent hover:underline" href={shareUrl}>
                    {shareUrl}
                  </a>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <Button variant="outline" size="sm" onClick={copyShareUrl} leftIcon={shareCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}>
                      {shareCopied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openShareWindow('twitter')}>
                      Share on X
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openShareWindow('linkedin')}>
                      LinkedIn
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">First read</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Pattern synthesis</h2>
            {isLoadingFree ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-jung-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                Generating a live synthesis.
              </div>
            ) : freeAnalysis ? (
              <p className="mt-4 text-sm leading-7 text-jung-secondary">{freeAnalysis}</p>
            ) : (
              <p className="mt-4 text-sm leading-7 text-jung-secondary">
                {freeError ? `Pattern synthesis unavailable: ${freeError}` : 'A short synthesis will appear here when it is ready.'}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
            <p className="text-label">Paid report</p>
            <h2 className="mt-3 text-2xl font-semibold text-jung-dark">{isPremium ? `${PRICING[tier as PaidTierId]?.name || 'Paid'} report unlocked` : 'Unlock full ranking and analysis'}</h2>
            {premiumLoading ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-jung-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                Checking premium status.
              </div>
            ) : isPremium ? (
              <div className="mt-4 space-y-4 text-sm leading-7 text-jung-secondary">
                <p>
                  Your full ranking and paid analysis are active in this browser. Sign in later if you want cross-device restore and account history.
                </p>
                {isLoadingPremium && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-jung-accent" />
                    Generating the deeper report.
                  </div>
                )}
                {premiumAnalysis?.overview && <p>{premiumAnalysis.overview}</p>}
                {premiumError && <p>Premium analysis unavailable: {premiumError}</p>}
              </div>
            ) : (
              <>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">
                  Pay only after the free map earns it. Insight unlocks the complete 8-function ranking, confidence read, and deep report. Mastery adds the AI Type Coach.
                </p>
                <OfferCodeCallout location="results_paid_report_card" tier="insight" compact className="mt-5" />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Full ranking', 'Unlock the ordered 8-function profile and confidence interpretation.'],
                    ['One-time CAD', 'Insight is CA$10 and Mastery is CA$29. No renewal or hidden subscription.'],
                    ['30-day refund', 'If the paid report is not useful, contact support with your Stripe receipt.'],
                  ].map(([label, copy]) => (
                    <div key={label} className="rounded-lg border border-jung-border bg-jung-base p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-jung-dark">
                        <Check className="h-3.5 w-3.5 text-jung-accent" />
                        {label}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-jung-muted">{copy}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 divide-y divide-jung-border rounded-lg border border-jung-border bg-jung-base">
                  {upgradeOptions.map((option) => (
                    <div key={option.tier} className="p-4">
                      <div className="grid gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-jung-dark">{option.label}</h3>
                            <span className="rounded-lg bg-jung-accent-light px-2 py-1 text-xs font-semibold text-jung-accent">
                              {PRICING[option.tier].price} one-time
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-jung-secondary">{option.description}</p>
                          <div className="mt-3 rounded-lg border border-jung-border bg-jung-surface p-3 text-xs leading-5 text-jung-secondary">
                            {option.preview}
                          </div>
                          <ul className="mt-3 grid gap-2 text-xs text-jung-muted">
                            {option.features.map((feature) => (
                              <li key={feature} className="flex gap-2">
                                <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-jung-accent" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          variant={option.tier === 'insight' ? 'accent' : 'outline'}
                          size="sm"
                          className="w-full"
                          onClick={() => openUpgradeCheckout(option.tier, 'results_paid_report_card')}
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          {option.tier === 'insight' ? `Unlock Insight - ${PRICING.insight.price}` : `Add AI coach - ${PRICING.mastery.price}`}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4"
                  variant="ghost"
                  onClick={() => {
                    AnalyticsEvents.ctaClicked('compare_pricing', 'results_paid_report_card', {
                      buttonText: 'Compare plans',
                      destination: '/pricing',
                    });
                    navigate('/pricing');
                  }}
                  leftIcon={<Sparkles className="h-4 w-4" />}
                >
                  Compare all plans
                </Button>
              </>
            )}
          </div>
        </section>

        {isPremium && (
          <>
            <section className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
                <p className="text-label">Developmental edge</p>
                <h2 className="mt-3 text-2xl font-semibold text-jung-dark">{FUNCTION_LABELS[results.inferior]} asks for development</h2>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.developmentalEdge}</p>
              </div>

              <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
                <p className="text-label">Complex vulnerability</p>
                <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Where capture is likely</h2>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.complexVulnerability}</p>
              </div>

              <div className="rounded-lg border border-jung-border bg-jung-surface p-6">
                <p className="text-label">Somatic signal</p>
                <h2 className="mt-3 text-2xl font-semibold text-jung-dark">Where the body speaks</h2>
                <p className="mt-4 text-sm leading-7 text-jung-secondary">{results.narrative.somaticSignature}</p>
              </div>
            </section>

            <section className="mt-8 rounded-lg border border-jung-border bg-jung-surface p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
                <div>
                  <p className="text-label">Dominant-inferior tension</p>
                  <h2 className="mt-3 text-heading text-3xl text-jung-dark">
                    {FUNCTION_LABELS[results.dominant]} to {FUNCTION_LABELS[results.inferior]}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-jung-secondary">
                    {axisCopy[results.dominant]}
                  </p>
                </div>
                <div className="rounded-lg border border-jung-border bg-jung-base p-5">
                  <p className="text-sm font-semibold text-jung-dark">Practice for this edge</p>
                  <p className="mt-3 text-sm leading-7 text-jung-secondary">{results.narrative.practice}</p>
                </div>
              </div>
            </section>
          </>
        )}

        <section className="mt-8 grid gap-3">
          {[
            ['How to read this result', 'The percentages are not fixed traits. They are a map of where this assessment found habitual energy, stress vulnerability, body signal, and attitude direction.'],
            ['Why the inferior matters', 'The inferior function is usually less differentiated, so it often appears through stress, projection, attraction, embarrassment, or body symptoms before it becomes conscious skill.'],
            ['What to do next', 'Use the developmental edge as a practice target, then reassess later. The goal is not to change labels but to see whether energy distribution becomes more flexible.'],
          ].map(([title, body]) => (
            <details key={title} className="rounded-lg border border-jung-border bg-jung-surface p-5">
              <summary className="flex min-h-11 cursor-pointer list-none items-center text-base font-semibold text-jung-dark">{title}</summary>
              <p className="mt-3 text-sm leading-6 text-jung-secondary">{body}</p>
            </details>
          ))}
        </section>
      </div>
      {!premiumLoading && !isPremium && showStickyUpgrade && (
        <StickyUpgradeBar
          dominantLabel={dominantLabel}
          inferiorLabel={inferiorLabel}
          onUnlockInsight={() => openUpgradeCheckout('insight', 'results_sticky_upgrade_bar')}
          onUnlockMastery={() => openUpgradeCheckout('mastery', 'results_sticky_upgrade_bar')}
        />
      )}
      {isAuthenticated && isPremium && chatProfile && <ChatBot userProfile={chatProfile} />}
    </div>
  );
};
