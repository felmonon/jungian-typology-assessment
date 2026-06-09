import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Eye,
  FileText,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PRICING } from '../data/pricing';
import { discountedPriceLabel } from '../data/discount';
import { useSEO } from '../hooks/useSEO';
import { pathWithSource } from '../lib/acquisition-source';
import { trackEvent } from '../lib/analytics';

const operatingStats = [
  ['Operator status', 'Owner-supervised AI operations'],
  ['Primary metric', 'Paid checkout completion plus recoverable abandonment'],
  ['Current buyer path', `Free map, then ${discountedPriceLabel(PRICING.insight.amount)} Insight or ${discountedPriceLabel(PRICING.mastery.amount)} Mastery`],
  ['Approval rule', 'No ad spend, price change, or unsupported claim without owner approval'],
];

const buyerProof = [
  {
    icon: CheckCircle2,
    label: 'Free map first',
    body: 'Take the full assessment before checkout.',
  },
  {
    icon: FileText,
    label: 'Paid preview visible',
    body: 'Inspect the sample report before buying.',
  },
  {
    icon: CreditCard,
    label: 'One-time checkout',
    body: 'Insight and Mastery are not subscriptions.',
  },
  {
    icon: ShieldCheck,
    label: 'Claims stay bounded',
    body: 'No fake rankings, clinical claims, or invented proof.',
  },
];

const operatingLoop = [
  {
    icon: Eye,
    title: 'Observe the buyer path',
    body: 'Read funnel events, checkout attempts, lead captures, support friction, stale copy, and mobile behavior before changing anything.',
  },
  {
    icon: Brain,
    title: 'Pick one constraint',
    body: 'Choose the narrowest blocker: unclear promise, checkout leakage, weak trust, missing instrumentation, or poor follow-up.',
  },
  {
    icon: FileText,
    title: 'Ship a measurable change',
    body: 'Edit product copy, UI, analytics, lifecycle email, admin reporting, or SEO pages with a clear metric and rollback path.',
  },
  {
    icon: BarChart3,
    title: 'Publish the result',
    body: 'Record what changed, what metric should move, what was verified, and what still needs human approval.',
  },
];

const guardrails = [
  'Never invent testimonials, clinical claims, rankings, revenue, or customer stories.',
  'Never expose private emails, payments, secret keys, or raw customer data.',
  'Never spend ad budget or change legal-risk copy without owner approval.',
  'Keep checkout working even when optional telemetry tables are missing.',
  'Prefer small shipped experiments over vague strategy documents.',
];

const shippedLedger = [
  {
    date: '2026-06-02',
    title: 'Follow-up metrics accuracy',
    body: 'Separated real recovery emails from skipped purchased or invalid leads so the operator can see which follow-ups actually went out.',
  },
  {
    date: '2026-06-02',
    title: 'Checkout recovery consent',
    body: 'Made abandoned-checkout recovery easier to opt into before Stripe, especially when the buyer has not signed in or captured an email yet.',
  },
  {
    date: '2026-06-02',
    title: 'Checkout intent ledger',
    body: 'Added durable checkout-intent tracking code, admin funnel metrics, and purchase dedupe protection.',
  },
  {
    date: '2026-06-02',
    title: 'Lead dedupe pass',
    body: 'Recent duplicate discount captures now reuse the existing lead and admin metrics de-dupe historical repeats.',
  },
  {
    date: '2026-06-01',
    title: 'Mastery entitlement cleanup',
    body: 'AI Type Guide access is aligned to Mastery, and checkout/result copy no longer overpromises unshipped features.',
  },
];

const operatorRoles = [
  ['Product operator', 'Finds the next user-facing constraint and turns it into a scoped change.'],
  ['Growth operator', 'Builds SEO, lifecycle, recovery, pricing, and conversion tests around the current offer.'],
  ['Engineering operator', 'Ships code, runs tests, deploys, and keeps risky failures fail-soft.'],
  ['Claims operator', 'Cuts unsupported promises before they damage trust.'],
];

type ActionLinkProps = {
  to: string;
  variant?: 'accent' | 'secondary' | 'outline';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  trackingLabel: string;
  trackingSource: string;
};

const actionLinkVariants = {
  accent: 'bg-jung-accent text-white shadow-sm shadow-jung-accent/10 hover:bg-jung-accent-hover',
  secondary: 'border border-jung-border bg-jung-surface-alt text-jung-dark hover:border-jung-accent-muted hover:bg-jung-accent-light',
  outline: 'border border-jung-border bg-transparent text-jung-dark hover:border-jung-accent-muted hover:bg-jung-surface',
};

const ActionLink: React.FC<ActionLinkProps> = ({
  to,
  variant = 'accent',
  children,
  leftIcon,
  rightIcon,
  trackingLabel,
  trackingSource,
}) => (
  <Link
    to={to}
    onClick={() => {
      trackEvent('ai_lab_cta_clicked', {
        source: trackingSource,
        label: trackingLabel,
        destination: to,
      });
    }}
    className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold transition-all duration-200 hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-jung-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jung-base ${actionLinkVariants[variant]}`}
  >
    {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
    <span className="min-w-0">{children}</span>
    {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
  </Link>
);

export const AIRunStore: React.FC = () => {
  useSEO({
    title: 'AI-Run TypeJung Lab | Owner-Supervised Product Operator',
    description:
      'See how TypeJung is improved by an owner-supervised AI product operator: public operating loop, buyer-path guardrails, shipped changes, and current experiments.',
    url: '/ai-run-store',
  });

  return (
    <div className="bg-jung-base">
      <section className="section-rule">
        <div className="lab-container grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-jung-border bg-jung-surface px-3 py-2 text-sm font-semibold text-jung-secondary shadow-sm">
              <Bot className="h-4 w-4 text-jung-accent" />
              Owner-supervised AI operator
            </div>
            <h1 className="mt-6 max-w-4xl text-display text-4xl text-jung-dark sm:text-5xl lg:text-6xl">
              The assessment improves in public. The free function map stays the product.
            </h1>
            <p className="mt-5 max-w-3xl text-body-lg text-jung-secondary">
              TypeJung is being run as a measurable AI-operated software store, but the store story is only useful if it makes the buyer path clearer. The operator audits the funnel, ships scoped improvements, verifies them, and leaves a public trail while the product promise stays simple: inspect the function pattern before paying for depth.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ActionLink
                to={pathWithSource('/assessment', 'ai_run_store_primary')}
                variant="accent"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                trackingLabel="start_free_map"
                trackingSource="ai_run_store_primary"
              >
                Start the free map
              </ActionLink>
              <ActionLink
                to={pathWithSource('/pricing', 'ai_run_store_secondary')}
                variant="secondary"
                leftIcon={<CreditCard className="h-5 w-5" />}
                trackingLabel="see_store_offer"
                trackingSource="ai_run_store_secondary"
              >
                See the store offer
              </ActionLink>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {buyerProof.map(({ icon: Icon, label, body }) => (
                <div key={label} className="flex gap-3 rounded-lg border border-jung-border bg-jung-surface px-4 py-3 shadow-sm">
                  <Icon className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                  <div>
                    <p className="text-sm font-semibold leading-5 text-jung-dark">{label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-jung-secondary">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-jung-border bg-jung-surface p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-jung-accent" />
              <h2 className="text-heading text-xl text-jung-dark">System status</h2>
            </div>
            <div className="mt-5 divide-y divide-jung-border">
              {operatingStats.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted">{label}</p>
                  <p className="text-sm font-semibold leading-6 text-jung-dark">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section-rule bg-jung-surface">
        <div className="lab-container py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-label">Operating loop</p>
            <h2 className="mt-3 text-heading text-3xl text-jung-dark sm:text-4xl">
              The AI does not get to be vague.
            </h2>
            <p className="mt-4 text-body text-jung-secondary">
              Each pass has to name the constraint, ship a concrete change, run verification, and report what is still blocked. The target is not more AI theater; it is a clearer path from free assessment to useful paid interpretation.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {operatingLoop.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-jung-border bg-jung-base p-5">
                <Icon className="h-5 w-5 text-jung-accent" />
                <h3 className="mt-4 text-lg font-semibold text-jung-dark">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-jung-secondary">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lab-container grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-jung-accent" />
            <h2 className="text-heading text-2xl text-jung-dark">Guardrails</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {guardrails.map((guardrail) => (
              <div key={guardrail} className="flex gap-3 rounded-lg border border-jung-border bg-jung-base p-4">
                <Lock className="mt-0.5 h-4 w-4 flex-none text-jung-accent" />
                <p className="text-sm leading-6 text-jung-secondary">{guardrail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-jung-accent" />
            <h2 className="text-heading text-2xl text-jung-dark">Public ledger</h2>
          </div>
          <div className="mt-5 divide-y divide-jung-border">
            {shippedLedger.map((item) => (
              <article key={`${item.date}-${item.title}`} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-jung-accent-light px-2.5 py-1 text-xs font-semibold text-jung-accent">
                    {item.date}
                  </span>
                  <h3 className="text-base font-semibold text-jung-dark">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-jung-secondary">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-rule bg-jung-dark text-white">
        <div className="lab-container py-12 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-jung-accent-muted">Operator stack</p>
            <h2 className="mt-3 text-heading text-3xl text-white sm:text-4xl">
              The store is AI-operated, not ungoverned.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              TypeJung keeps the AI useful by splitting work into roles and requiring verification. The operator can ship software and marketing changes, but it has to stay inside evidence, privacy, and approval boundaries.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {operatorRoles.map(([title, body]) => (
              <div key={title} className="rounded-lg border border-white/12 bg-white/8 p-5">
                <BadgeCheck className="h-5 w-5 text-jung-accent-muted" />
                <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lab-container py-12 sm:py-16">
        <div className="rounded-lg border border-jung-border bg-jung-surface p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-jung-accent-light px-3 py-1.5 text-sm font-semibold text-jung-accent">
                <CheckCircle2 className="h-4 w-4" />
                First screen is still the actual product
              </div>
              <h2 className="mt-5 text-heading text-3xl text-jung-dark sm:text-4xl">
                The AI operator exists to make TypeJung easier to trust and easier to buy.
              </h2>
              <p className="mt-4 text-body text-jung-secondary">
                The core path stays simple: take the free function-stack map, read the result, preview the paid depth, then upgrade only if the interpretation feels worth keeping.
              </p>
            </div>
            <div className="grid gap-3">
              <ActionLink
                to={pathWithSource('/assessment', 'ai_run_store_bottom')}
                variant="accent"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                trackingLabel="take_free_assessment"
                trackingSource="ai_run_store_bottom"
              >
                Take the free assessment
              </ActionLink>
              <ActionLink
                to={pathWithSource('/sample-report', 'ai_run_store_bottom')}
                variant="outline"
                leftIcon={<FileText className="h-5 w-5" />}
                trackingLabel="view_sample_report"
                trackingSource="ai_run_store_bottom"
              >
                View sample report
              </ActionLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
