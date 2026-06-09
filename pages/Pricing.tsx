import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, Clock, FileText, RefreshCcw, ShieldCheck, Sparkles, X, Brain, Shield } from 'lucide-react';
import { DiscountCaptureCard } from '../components/discount/DiscountCaptureCard';
import { Button } from '../components/ui/Button';
import { discountedPriceLabel, discountSavingsLabel, EMAIL_CAPTURE_OFFER } from '../data/discount';
import { isPaidTierId, PRICING } from '../data/pricing';
import type { PaidTierId, PricingTierId } from '../data/pricing';
import { SUPPORT_EMAIL } from '../data/support';
import { AnalyticsEvents, trackEvent } from '../lib/analytics';
import { pathWithSource } from '../lib/acquisition-source';
import { PAGE_SEO, useSEO } from '../hooks/useSEO';
import { useModalFocus } from '../hooks/useModalFocus';
import { STORAGE_KEYS } from '../lib/validation';
import { writeUpgradeIntent } from '../lib/upgrade-intent';
import { isDepthAssessmentResult } from '../utils/depthScoring';

type Tier = {
  name: string;
  price: string;
  originalPrice?: string;
  priceNote?: string;
  savingsLabel?: string;
  eyebrow: string;
  summary: string;
  bestFor: string;
  features: string[];
  buttonText: string;
  tier: PricingTierId;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: PRICING.free.price,
    eyebrow: 'Free first',
    summary: 'Complete the full 42-question assessment and see your function-stack map before you decide anything.',
    bestFor: 'People who want to test whether the TypeJung map feels useful before paying.',
    features: [
      '42 scenario-based questions',
      'All 8 function scores',
      'Dominant-inferior axis',
      'Private, no signup required',
    ],
    buttonText: 'Start free assessment',
    tier: 'free',
  },
  {
    name: 'Insight',
    price: discountedPriceLabel(PRICING.insight.amount),
    originalPrice: PRICING.insight.price,
    priceNote: `${EMAIL_CAPTURE_OFFER.code} auto-applies on Stripe`,
    savingsLabel: discountSavingsLabel(PRICING.insight.amount),
    eyebrow: 'Most popular',
    summary: 'Unlock a deeper written read of your map: developmental edge, stress-pattern reflection, relationship-pattern reflection, and practical next steps.',
    bestFor: 'People whose free map feels accurate and who want the meaning behind the scores.',
    features: [
      'Detailed TypeJung report',
      'Inferior-function growth edge',
      'Stress and relationship patterns',
      'Practical reflection prompts',
      'One-time CAD purchase',
    ],
    buttonText: `Review Insight - ${discountedPriceLabel(PRICING.insight.amount)}`,
    tier: 'insight',
    highlighted: true,
  },
  {
    name: 'Mastery',
    price: discountedPriceLabel(PRICING.mastery.amount),
    originalPrice: PRICING.mastery.price,
    priceNote: `${EMAIL_CAPTURE_OFFER.code} auto-applies on Stripe`,
    savingsLabel: discountSavingsLabel(PRICING.mastery.amount),
    eyebrow: 'Guide and practice tools',
    summary: 'Add the AI Type Guide, practice roadmap, and follow-up tools for reflecting on your result over time.',
    bestFor: 'People who want guided follow-up after reading the deeper report.',
    features: [
      'Everything in Insight',
      'AI Type Guide',
      'Growth exercises',
      'Individuation roadmap',
    ],
    buttonText: `Review Mastery - ${discountedPriceLabel(PRICING.mastery.amount)}`,
    tier: 'mastery',
  },
];

const COMPARISON_FEATURES = [
  { name: '42-question assessment', free: true, insight: true, mastery: true },
  { name: 'Function-stack map and hierarchy', free: true, insight: true, mastery: true },
  { name: 'Developmental edge report', free: false, insight: true, mastery: true },
  { name: 'Stress pattern map', free: false, insight: true, mastery: true },
  { name: 'Practical reflection prompts', free: false, insight: true, mastery: true },
  { name: 'AI Type Guide', free: false, insight: false, mastery: true },
  { name: 'Reassessment tracking', free: false, insight: false, mastery: true },
];

const FAQ_ITEMS = [
  {
    question: 'Is this a subscription?',
    answer: `No. Insight and Mastery are one-time payments in Canadian dollars. ${EMAIL_CAPTURE_OFFER.code} currently auto-applies on Stripe for ${EMAIL_CAPTURE_OFFER.percentOff}% off. There is no renewal or hidden subscription.`,
  },
  {
    question: 'Which plan should I choose?',
    answer: 'Start free first. Choose Insight if the map feels accurate and you want the deeper report. Choose Mastery if you also want the AI guide and practice tools.',
  },
  {
    question: 'Can I start with Free and upgrade later?',
    answer: 'Yes. Take the assessment first, review the free map, then unlock the paid report only if the result feels worth keeping.',
  },
  {
    question: 'What if the paid report is not useful?',
    answer: `Email ${SUPPORT_EMAIL} within 7 days of purchase with your Stripe receipt. If the paid report does not feel helpful, you can request a refund.`,
  },
  {
    question: 'What does the report look like?',
    answer: 'Open the public sample report to see the structure: developmental edge, stress-pattern map, relationship reflection, and practice prompts. Your paid report uses the same format but is generated from your actual result.',
  },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'CAD pricing', body: `${EMAIL_CAPTURE_OFFER.code} applied before payment` },
  { icon: Clock, label: 'One-time payment', body: 'no renewal or subscription' },
  { icon: Sparkles, label: 'Secure checkout', body: 'payment handled by Stripe' },
  { icon: RefreshCcw, label: '7-day guarantee', body: 'request a refund if the paid report is not useful' },
];

const PREVIEW_MODULES = [
  {
    title: 'Developmental edge preview',
    tier: 'Insight',
    body: 'A plain-language read on the inferior function: where stress, projection, avoidance, or fascination may point toward the next growth edge.',
  },
  {
    title: 'Stress pattern map',
    tier: 'Insight',
    body: 'Examples of how your dominant-inferior axis can show up in pressure, conflict, work habits, and relationship patterns.',
  },
  {
    title: 'Practice plan sample',
    tier: 'Mastery',
    body: 'A starting exercise set for grounding, reflection, and follow-up prompts tied to your cognitive stack.',
  },
];

const IncludedIcon: React.FC<{ included: boolean }> = ({ included }) => (
  <span
    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
      included ? 'bg-jung-accent-light text-jung-accent' : 'bg-jung-surface-alt text-jung-muted'
    }`}
    aria-label={included ? 'Included' : 'Not included'}
  >
    {included ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
  </span>
);

const hasValidLocalResult = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || 'null');
    return isDepthAssessmentResult(parsed);
  } catch {
    return false;
  }
};

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAssessmentPrompt, setShowAssessmentPrompt] = useState(false);
  const assessmentPromptRef = useRef<HTMLDivElement>(null);
  const promptCloseRef = useRef<HTMLButtonElement>(null);
  const selectedTier = new URLSearchParams(location.search).get('tier');
  const selectedPaidTier = isPaidTierId(selectedTier) ? selectedTier : null;
  const [promptTier, setPromptTier] = useState<PaidTierId | null>(selectedPaidTier);
  const [hasLocalResults] = useState(hasValidLocalResult);
  const plansSectionRef = useRef<HTMLElement>(null);
  const compareSectionRef = useRef<HTMLElement>(null);

  useSEO(PAGE_SEO.pricing);

  const closeAssessmentPrompt = useCallback(() => {
    setShowAssessmentPrompt(false);
  }, []);

  useModalFocus({
    isOpen: showAssessmentPrompt,
    dialogRef: assessmentPromptRef,
    initialFocusRef: promptCloseRef,
    onClose: closeAssessmentPrompt,
  });

  useEffect(() => {
    AnalyticsEvents.pricingViewed('pricing_page', document.referrer || undefined);
  }, []);

  useEffect(() => {
    const anchor = location.hash.replace('#', '');
    const shouldScrollToPlans = !anchor && Boolean(selectedPaidTier);
    const target = anchor === 'compare'
      ? compareSectionRef.current
      : anchor === 'plans' || shouldScrollToPlans
        ? plansSectionRef.current
        : null;

    if (!target) return;

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [location.hash, selectedPaidTier]);

  const scrollToPricingSection = useCallback((section: 'plans' | 'compare') => {
    const target = section === 'compare' ? compareSectionRef.current : plansSectionRef.current;
    if (!target) return;

    trackEvent('pricing_anchor_clicked', {
      source: 'pricing_page',
      section,
    });
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const saveUpgradeIntent = (tier: PaidTierId, source: string) => {
    writeUpgradeIntent(tier, source);
    trackEvent('upgrade_intent_saved', { source, tier });
  };

  const startAssessment = (location: string, tierIntent?: PaidTierId | null) => {
    if (tierIntent) {
      saveUpgradeIntent(tierIntent, location);
    }

    const destination = pathWithSource('/assessment', location, { tier: tierIntent || undefined });
    AnalyticsEvents.ctaClicked('start_assessment', location, {
      buttonText: 'Start free assessment',
      destination,
    });
    navigate(destination);
  };

  const viewSampleReport = (location: string) => {
    const destination = pathWithSource('/sample-report', location, {
      result_context: hasLocalResults ? 'local_result' : undefined,
    });
    AnalyticsEvents.ctaClicked('view_sample_report', location, {
      buttonText: 'View sample report',
      destination,
    });
    navigate(destination);
  };

  const handleCheckout = async (tier: PricingTierId) => {
    if (tier === 'free') {
      startAssessment('pricing_free_tier');
      return;
    }

    if (!hasLocalResults) {
      saveUpgradeIntent(tier, 'pricing_tier_card');
      setPromptTier(tier);
      trackEvent('upgrade_attempt_without_result', { source: 'pricing_tier_card', tier });
      setShowAssessmentPrompt(true);
      return;
    }

    const paidTier: PaidTierId = tier;
    const destination = pathWithSource(`/checkout/${paidTier}`, 'pricing_tier_card', {
      tier: paidTier,
    });
    AnalyticsEvents.ctaClicked(`unlock_${paidTier}`, 'pricing_tier_card', {
      buttonText: PRICING[paidTier].name,
      destination,
    });
    AnalyticsEvents.upgradeClicked('pricing_tier_card', paidTier);
    trackEvent('pricing_result_checkout_clicked', {
      source: 'pricing_tier_card',
      tier: paidTier,
      has_local_results: true,
    });
    navigate(destination);
  };

  return (
    <div className="min-h-screen bg-jung-base">
      <section className="section-rule py-12 lg:py-16">
        <div className="editorial-container grid gap-10 lg:grid-cols-[0.78fr_1fr] lg:items-end">
          <div>
            <p className="text-label">Pricing</p>
            <h1 className="mt-4 text-display text-5xl text-jung-dark sm:text-6xl">
              Take the map first. Buy depth only if it earns trust.
            </h1>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="accent"
                size="lg"
                onClick={() => startAssessment('pricing_hero', selectedPaidTier)}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Start with the free assessment
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => viewSampleReport('pricing_hero')}
                rightIcon={<FileText className="h-5 w-5" />}
              >
                View sample report
              </Button>
            </div>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-body-lg text-jung-secondary">
              The free assessment gives you the function-stack map first. Insight and Mastery are optional one-time upgrades for deeper interpretation, practice prompts, and result-aware reflection support. With {EMAIL_CAPTURE_OFFER.code}, Stripe currently shows Insight at {discountedPriceLabel(PRICING.insight.amount)} and Mastery at {discountedPriceLabel(PRICING.mastery.amount)}.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRUST_ITEMS.map(({ icon: Icon, label, body }) => (
                <div key={label} className="rounded-lg border border-jung-border bg-jung-surface p-4 shadow-sm">
                  <Icon className="mb-3 h-4 w-4 text-jung-accent" />
                  <p className="text-sm font-semibold text-jung-dark">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-jung-muted">{body}</p>
                </div>
              ))}
            </div>
            <DiscountCaptureCard
              source="pricing_hero"
              compact
              preferredTier={selectedPaidTier || undefined}
              showCheckoutButtons={hasLocalResults}
              className="mt-5"
            />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToPricingSection('plans')}
                rightIcon={<ChevronDown className="h-4 w-4" />}
              >
                See plans
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => scrollToPricingSection('compare')}
                rightIcon={<ChevronDown className="h-4 w-4" />}
              >
                Compare tiers
              </Button>
            </div>
          </div>
        </div>
      </section>

      {hasLocalResults && (
        <section className="editorial-container pt-10">
          <div className="rounded-lg border border-jung-accent-muted bg-jung-accent-light/70 p-5 shadow-sm sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-label">Result ready</p>
                <h2 className="mt-2 text-heading text-3xl text-jung-dark">
                  Continue from the map already saved in this browser.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-jung-secondary">
                  Insight and Mastery will use your actual TypeJung result, then send you through secure Stripe checkout.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[28rem]">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => handleCheckout('insight')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Insight - {discountedPriceLabel(PRICING.insight.amount)}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleCheckout('mastery')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Mastery - {discountedPriceLabel(PRICING.mastery.amount)}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="plans" ref={plansSectionRef} className="scroll-mt-24 py-12 lg:py-16">
        <div className="editorial-container">
          <div className="grid gap-5 lg:grid-cols-3">
            {TIERS.map((tier) => {
              return (
                <article
                  key={tier.name}
                  className={`relative flex min-h-full flex-col rounded-lg border p-5 shadow-sm transition-all sm:p-6 ${
                    tier.highlighted
                      ? 'border-jung-accent-muted bg-jung-dark text-white shadow-xl'
                      : 'border-jung-border bg-jung-surface hover:-translate-y-1 hover:border-jung-accent-muted hover:shadow-md'
                  } ${selectedTier === tier.tier ? 'ring-2 ring-jung-accent ring-offset-2 ring-offset-jung-base' : ''}`}
                >
                  {tier.highlighted && (
                    <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg bg-jung-accent px-3 py-1.5 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most popular
                    </span>
                  )}

                  <p className={`text-sm font-semibold ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-accent'}`}>
                    {tier.eyebrow}
                  </p>
                  <h2 className={`mt-2 text-heading text-3xl ${tier.highlighted ? 'text-white' : 'text-jung-dark'}`}>
                    {tier.name}
                  </h2>
                  <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
                    <span className={`text-display text-4xl sm:text-5xl ${tier.highlighted ? 'text-white' : 'text-jung-dark'}`}>
                      {tier.price}
                    </span>
                    <span className={`pb-2 text-xs font-semibold uppercase tracking-[0.08em] ${tier.highlighted ? 'text-white/55' : 'text-jung-muted'}`}>
                      {tier.tier === 'free' ? 'to start' : 'one-time'}
                    </span>
                  </div>
                  {tier.originalPrice && (
                    <p className={`mt-2 text-xs leading-5 ${tier.highlighted ? 'text-white/65' : 'text-jung-muted'}`}>
                      <span className="line-through">{tier.originalPrice}</span> before code. {tier.savingsLabel}. {tier.priceNote}.
                    </p>
                  )}

                  <p className={`mt-5 text-sm leading-6 ${tier.highlighted ? 'text-white/75' : 'text-jung-secondary'}`}>
                    {tier.summary}
                  </p>
                  <div className={`mt-5 rounded-lg border p-4 ${tier.highlighted ? 'border-white/15 bg-white/10' : 'border-jung-border bg-jung-base'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${tier.highlighted ? 'text-jung-subtle' : 'text-jung-muted'}`}>
                      Best for
                    </p>
                    <p className={`mt-2 text-sm leading-6 ${tier.highlighted ? 'text-white/75' : 'text-jung-secondary'}`}>
                      {tier.bestFor}
                    </p>
                  </div>

                  <ul className="mt-6 grid flex-1 gap-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className={`flex gap-3 text-sm ${tier.highlighted ? 'text-white/78' : 'text-jung-secondary'}`}>
                        <Check className={`mt-0.5 h-4 w-4 flex-none ${tier.highlighted ? 'text-jung-accent-muted' : 'text-jung-accent'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleCheckout(tier.tier)}
                    variant={tier.highlighted ? 'accent' : 'primary'}
                    size="lg"
                    className="mt-8 w-full"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    {tier.buttonText}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="compare" ref={compareSectionRef} className="scroll-mt-24 border-y border-jung-border bg-jung-surface py-14">
        <div className="editorial-container">
          <div className="mb-8 max-w-2xl">
            <p className="text-label">Compare</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">What each tier unlocks.</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-jung-border bg-jung-surface">
            <div className="hidden grid-cols-[1fr_8rem_8rem_8rem] border-b border-jung-border bg-jung-base text-xs font-semibold uppercase tracking-[0.08em] text-jung-muted md:grid">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center">Free</div>
              <div className="p-4 text-center text-jung-accent">Insight</div>
              <div className="p-4 text-center">Mastery</div>
            </div>

            {COMPARISON_FEATURES.map((feature) => (
              <div key={feature.name} className="grid gap-3 border-b border-jung-border p-4 last:border-b-0 md:grid-cols-[1fr_8rem_8rem_8rem] md:items-center">
                <p className="text-sm font-semibold text-jung-dark">{feature.name}</p>
                <div className="grid grid-cols-3 gap-2 md:contents">
                  {[
                    ['Free', feature.free],
                    ['Insight', feature.insight],
                    ['Mastery', feature.mastery],
                  ].map(([label, included]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-lg bg-jung-base px-3 py-2 md:justify-center md:bg-transparent md:px-4">
                      <span className="text-xs font-semibold text-jung-muted md:hidden">{label as string}</span>
                      <IncludedIcon included={Boolean(included)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container py-14">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
          <div>
            <p className="text-label">Paid preview</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">What the upgrade adds to your free map.</h2>
            <p className="mt-4 text-sm leading-7 text-jung-secondary">
              Free shows the function-stack map and core axis. Paid tiers turn that map into interpretation you can use: what the pattern may mean, where it tends to tighten under pressure, and what to practice next.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-6"
              onClick={() => viewSampleReport('pricing_paid_preview')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              View sample report
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PREVIEW_MODULES.map((module) => (
              <div key={module.title} className="rounded-lg border border-jung-border bg-jung-surface p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-jung-accent">
                  <FileText className="h-4 w-4" />
                  {module.tier}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-jung-dark">{module.title}</h3>
                <p className="mt-3 text-sm leading-6 text-jung-secondary">{module.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-container pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Private by default', body: 'The free result can stay local. Sign in when you want saved history, share links, or paid access restored across devices.' },
            { icon: Clock, title: 'Restore access', body: 'Paid access is one-time. Sign in with the purchase email to restore the unlocked tier across devices.' },
            { icon: Sparkles, title: 'Upgrade after seeing value', body: 'You can complete the assessment first and decide after the free map is generated.' },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border border-jung-border bg-jung-surface p-6">
              <item.icon className="h-5 w-5 text-jung-accent" />
              <h3 className="mt-4 text-lg font-semibold text-jung-dark">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-jung-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="editorial-container pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="text-label">Questions</p>
            <h2 className="mt-3 text-heading text-4xl text-jung-dark">Clear answers before checkout.</h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group rounded-lg border border-jung-border bg-jung-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5">
                  <span className="font-semibold text-jung-dark">{item.question}</span>
                  <ChevronDown className="h-5 w-5 flex-none text-jung-muted transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-6 text-jung-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-jung-dark py-16">
        <div className="editorial-container grid gap-8 text-white lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-white/60">Ready when you are</p>
            <h2 className="mt-3 text-heading text-4xl text-white">Start with the free map. Decide after you see it.</h2>
          </div>
          <Button variant="inverted" size="lg" onClick={() => startAssessment('pricing_final_cta')} rightIcon={<ArrowRight className="h-5 w-5" />}>
            Start free assessment
          </Button>
        </div>
      </section>

      {/* Free result required modal */}
      <AnimatePresence>
        {showAssessmentPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={closeAssessmentPrompt}
            />

            {/* Modal Card */}
            <motion.div
              ref={assessmentPromptRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pricing-upgrade-prompt-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col gap-6 overflow-y-auto rounded-lg border border-white/10 bg-jung-dark p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-jung-accent-muted">
                  <Brain className="w-3.5 h-3.5" /> Free Map Needed First
                </div>
                <button
                  ref={promptCloseRef}
                  onClick={closeAssessmentPrompt}
                  className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close upgrade prompt"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <h3 id="pricing-upgrade-prompt-title" className="text-display text-2xl sm:text-3xl text-white font-serif tracking-tight leading-snug text-left">
                  Take the assessment first. <br />
                  <span className="text-jung-accent-muted italic font-normal text-left">
                    {promptTier ? `Then continue to ${PRICING[promptTier].name}.` : 'Then decide from your result.'}
                  </span>
                </h3>
                <p className="text-sm sm:text-base text-jung-subtle leading-relaxed font-serif text-left">
                  Insight and Mastery are based on your actual TypeJung function-stack map. Complete the free 42-question assessment, read the result, then we will keep your selected upgrade visible if the map feels worth keeping.
                </p>
              </div>

              <div className="border-y border-white/10 py-5">
                <DiscountCaptureCard
                  source="pricing_upgrade_prompt"
                  minimal
                  minimalTone="dark"
                  preferredTier={promptTier || undefined}
                  showCheckoutButtons={false}
                  minimalTitle={promptTier ? `Email the ${PRICING[promptTier].name} path to yourself` : 'Email this upgrade path to yourself'}
                  minimalDescription={
                    promptTier
                      ? `Get the ${EMAIL_CAPTURE_OFFER.code} code and a direct link back to ${PRICING[promptTier].name} after your free map is ready.`
                      : `Get the ${EMAIL_CAPTURE_OFFER.code} code and a direct link back after your free map is ready.`
                  }
                  minimalSubmitLabel="Send path"
                  minimalFootnote="Use this if you want to leave and finish the assessment later. No card required."
                  minimalSentMessage={
                    promptTier
                      ? `Sent. The email links back to ${PRICING[promptTier].name} with ${EMAIL_CAPTURE_OFFER.code} ready.`
                      : `Sent. The email includes ${EMAIL_CAPTURE_OFFER.code} and a link back to pricing.`
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => {
                    closeAssessmentPrompt();
                    startAssessment('pricing_upgrade_prompt', promptTier);
                  }}
                  className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-jung-accent py-4 font-sans text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-jung-accent/25 transition-all hover:-translate-y-0.5 hover:bg-jung-accent-hover"
                >
                  {promptTier ? `Start free first - ${PRICING[promptTier].name}` : 'Start free assessment'} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={closeAssessmentPrompt}
                  className="rounded-lg border border-white/5 bg-white/5 px-6 py-4 font-sans text-xs font-bold uppercase tracking-widest text-jung-subtle transition-all hover:bg-white/10"
                >
                  Dismiss
                </button>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-white/5 text-[10px] uppercase tracking-widest text-jung-muted text-left">
                <Shield className="w-4 h-4 text-jung-accent/70" />
                <span>No card required • Private by default</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
