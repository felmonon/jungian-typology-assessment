import { Resend } from 'resend';
import { getEnvValue } from './env.js';
import { EMAIL_CAPTURE_OFFER } from '../data/discount.js';
import type { PaidTierId } from '../data/pricing.js';
import { PRICING } from '../data/pricing.js';
import {
  isAssessmentReturnSource,
  isCheckoutReturnSource,
  isResultUpgradeSource,
} from '../lib/discount-lead-routing.js';

let connectionSettings: any;

type ResendCredentials = {
  apiKey: string;
  fromEmail: string;
};

export type LifecycleEmailKind = 'abandoned-assessment' | 'result-ready' | 'free-result-upgrade';

export type LifecycleEmailInput = {
  kind: LifecycleEmailKind;
  toEmail: string;
  resultUrl?: string;
  assessmentUrl?: string;
  upgradeUrl?: string;
  dominantLabel?: string;
  inferiorLabel?: string;
  progressPercent?: number;
  completedAt?: string;
  idempotencyKey?: string;
};

export type DiscountLeadEmailInput = {
  toEmail: string;
  discountCode: string;
  percentOff: number;
  actionUrl?: string;
  actionLabel?: string;
  tier?: PaidTierId;
  dominantLabel?: string;
  inferiorLabel?: string;
  idempotencyKey?: string;
};

export type DiscountLeadFollowupEmailInput = {
  toEmail: string;
  discountCode: string;
  percentOff: number;
  actionUrl: string;
  actionLabel: string;
  stage?: 'first' | 'second' | 'third' | 'fourth';
  tier?: PaidTierId;
  source?: string;
  dominantLabel?: string;
  inferiorLabel?: string;
  idempotencyKey?: string;
};

export type CheckoutRecoveryEmailInput = {
  toEmail: string;
  recoveryUrl: string;
  tier?: PaidTierId;
  priceLabel?: string;
  consentSource?: 'stripe' | 'site';
  idempotencyKey?: string;
};

type LifecycleEmailTemplate = {
  subject: string;
  preview: string;
  html: string;
  text: string;
};

type LifecycleEmailSendResult =
  | { sent: true; id?: string }
  | { sent: false; skipped: true; reason: string };

function getEnvCredentials(): ResendCredentials | null {
  const apiKey = getEnvValue('RESEND_API_KEY');
  const fromEmail = getEnvValue('RESEND_FROM_EMAIL') || getEnvValue('FROM_EMAIL');

  if (!apiKey || !fromEmail) {
    return null;
  }

  return { apiKey, fromEmail };
}

async function getReplitCredentials(): Promise<ResendCredentials | null> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname || !xReplitToken) {
    return null;
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || !connectionSettings.settings.api_key || !connectionSettings.settings.from_email) {
    return null;
  }

  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getCredentials(): Promise<ResendCredentials | null> {
  return getEnvCredentials() || await getReplitCredentials();
}

export async function getResendClient() {
  const credentials = await getCredentials();

  if (!credentials) {
    throw new Error('Resend not configured');
  }

  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCompletedAt(value?: string): string {
  if (!value) return 'recently';

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return 'recently';
  }
}

function buildBaseHtml(
  preview: string,
  body: string,
  footerReason = 'You received this TypeJung email because this account started or completed an assessment.',
): string {
  return `
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
      ${escapeHtml(preview)}
    </div>
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #121512;">
      ${body}
      <p style="margin-top: 32px; color: #6b746c; font-size: 12px; line-height: 1.6;">
        ${escapeHtml(footerReason)}
      </p>
    </div>
  `;
}

function buildActionLink(url: string, label: string): string {
  const safeUrl = escapeHtml(url);
  return `
    <p style="margin: 28px 0;">
      <a href="${safeUrl}" style="display: inline-block; border-radius: 8px; background: #224A31; color: #ffffff; font-weight: 700; padding: 12px 18px; text-decoration: none;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
}

function urlForPath(baseUrl: string, path: string): string {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return `https://typejung.com${path}`;
  }
}

function buildLifecycleEmail(input: LifecycleEmailInput): LifecycleEmailTemplate {
  const resultUrl = input.resultUrl || 'https://typejung.com/results';
  const assessmentUrl = input.assessmentUrl || 'https://typejung.com/assessment';
  const upgradeUrl = input.upgradeUrl || 'https://typejung.com/pricing';
  const dominantLabel = input.dominantLabel ? escapeHtml(input.dominantLabel) : null;
  const inferiorLabel = input.inferiorLabel ? escapeHtml(input.inferiorLabel) : null;

  if (input.kind === 'abandoned-assessment') {
    const progressCopy = Number.isFinite(input.progressPercent)
      ? ` You were about ${Math.max(0, Math.min(100, Math.round(input.progressPercent || 0)))}% through.`
      : '';
    const preview = 'You are close to seeing the map behind your type.';
    const body = `
      <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">Finish the map behind your type</h1>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        You started the TypeJung assessment and stopped before the pattern could resolve.${progressCopy}
        If you return on the same device, your progress should still be saved.
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Come back when you have a clear few minutes. The free result gives you the core function-stack map first, so you can decide from the result itself whether a deeper report is worth it.
      </p>
      ${buildActionLink(assessmentUrl, 'Finish the assessment')}
    `;

    return {
      subject: 'Your TypeJung map is unfinished',
      preview,
      html: buildBaseHtml(preview, body),
      text: `You started the TypeJung assessment and stopped before the pattern could resolve.${progressCopy} Finish it here: ${assessmentUrl}`,
    };
  }

  if (input.kind === 'free-result-upgrade') {
    const sampleReportUrl = urlForPath(upgradeUrl, '/sample-report');
    const debriefUrl = urlForPath(upgradeUrl, '/debrief');
    const discountCode = escapeHtml(EMAIL_CAPTURE_OFFER.code);
    const axisCopy = dominantLabel && inferiorLabel
      ? ` Your current map centers on ${dominantLabel} with ${inferiorLabel} as the developmental edge.`
      : '';
    const preview = 'Turn your free map into a deeper read when it feels worth keeping.';
    const body = `
      <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">Keep the result only if it earned it</h1>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Your free TypeJung map is the test. If it felt accurate enough to keep, the paid report turns that map into a practical read.${axisCopy}
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Insight gives you the developmental edge, stress-pattern reflection, relationship-pattern reflection, and practice prompts. Mastery adds the AI Type Guide and a practice roadmap. Both are one-time CAD purchases with no subscription.
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Still stuck between two types? The Personal Type Debrief is the human-reviewed path: a founder-reviewed read of your actual map, likely mistype risks, and stress edge.
      </p>
      <div style="margin: 24px 0; border: 1px solid #D2DCD3; border-radius: 10px; background: #FAFAF8; padding: 18px;">
        <p style="margin: 0 0 8px; color: #6b746c; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Upgrade code</p>
        <p style="margin: 0; color: #121512; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 24px; font-weight: 800; letter-spacing: 0.08em;">${discountCode}</p>
        <p style="margin: 10px 0 0; color: #4B524C; font-size: 14px; line-height: 1.6;">
          Use it on Stripe for ${EMAIL_CAPTURE_OFFER.percentOff}% off Insight or Mastery.
        </p>
      </div>
      ${buildActionLink(sampleReportUrl, 'View a sample report')}
      ${buildActionLink(upgradeUrl, 'Compare report options')}
      ${buildActionLink(debriefUrl, 'Get a Personal Type Debrief')}
    `;

    return {
      subject: 'Your TypeJung map can go deeper',
      preview,
      html: buildBaseHtml(preview, body),
      text: `If your free TypeJung map felt accurate enough to keep, the paid report turns it into a practical read.${axisCopy} Use code ${EMAIL_CAPTURE_OFFER.code} for ${EMAIL_CAPTURE_OFFER.percentOff}% off Insight or Mastery on Stripe. If you are still stuck between two types, the Personal Type Debrief is the human-reviewed path. Sample report: ${sampleReportUrl} Compare options: ${upgradeUrl} Personal Type Debrief: ${debriefUrl}`,
    };
  }

  const completedCopy = formatCompletedAt(input.completedAt);
  const debriefUrl = urlForPath(resultUrl, '/debrief');
  const axisCopy = dominantLabel && inferiorLabel
    ? ` Your dominant-inferior axis is ${dominantLabel} to ${inferiorLabel}.`
    : '';
  const preview = 'Your TypeJung map is ready to review.';
  const body = `
    <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">Your function-stack map is ready</h1>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      Your TypeJung assessment was completed ${escapeHtml(completedCopy)}.${axisCopy}
    </p>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      Open the result while the answers are still fresh. Start with the free map, then decide whether you want the deeper report after you have read the pattern.
    </p>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      If the map is interesting but you are still stuck between two types, use the Personal Type Debrief for a human-reviewed second read.
    </p>
    ${buildActionLink(resultUrl, 'Read your map')}
    ${buildActionLink(debriefUrl, 'See the Personal Type Debrief')}
  `;

  return {
    subject: 'Your TypeJung map is ready',
    preview,
    html: buildBaseHtml(preview, body),
    text: `Your TypeJung assessment was completed ${completedCopy}.${axisCopy} Read your map here: ${resultUrl}. If you are still stuck between two types, see the Personal Type Debrief: ${debriefUrl}`,
  };
}

export async function sendLifecycleEmail(input: LifecycleEmailInput): Promise<LifecycleEmailSendResult> {
  if (!input.toEmail) {
    return { sent: false, skipped: true, reason: 'missing_email' };
  }

  const credentials = await getCredentials();

  if (!credentials) {
    return { sent: false, skipped: true, reason: 'resend_not_configured' };
  }

  const template = buildLifecycleEmail(input);
  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

export async function sendDiscountLeadEmail(input: DiscountLeadEmailInput): Promise<LifecycleEmailSendResult> {
  if (!input.toEmail) {
    return { sent: false, skipped: true, reason: 'missing_email' };
  }

  const credentials = await getCredentials();

  if (!credentials) {
    return { sent: false, skipped: true, reason: 'resend_not_configured' };
  }

  const actionUrl = input.actionUrl || 'https://typejung.com/pricing';
  const tierName = input.tier ? PRICING[input.tier].name : null;
  const actionLabel = input.actionLabel || (tierName ? `Continue to ${tierName}` : 'Choose your report');
  const hasAxisContext = Boolean(input.dominantLabel && input.inferiorLabel);
  const safeCode = escapeHtml(input.discountCode);
  const axisCopy = input.dominantLabel && input.inferiorLabel
    ? ` Your map centers on ${escapeHtml(input.dominantLabel)} with ${escapeHtml(input.inferiorLabel)} as the developmental edge.`
    : '';
  const preview = `Your private ${input.percentOff}% TypeJung upgrade code is inside.`;
  const body = `
    <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">${hasAxisContext ? 'Your TypeJung result path' : 'Your private TypeJung upgrade code'}</h1>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      If your free map felt accurate enough to keep, this gives you ${input.percentOff}% off a one-time Insight or Mastery upgrade.${tierName ? ` You asked to keep ${escapeHtml(tierName)} ready.` : ''}${axisCopy}
    </p>
    <div style="margin: 24px 0; border: 1px solid #D2DCD3; border-radius: 10px; background: #FAFAF8; padding: 18px;">
      <p style="margin: 0 0 8px; color: #6b746c; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Promotion code</p>
      <p style="margin: 0; color: #121512; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 26px; font-weight: 800; letter-spacing: 0.08em;">${safeCode}</p>
    </div>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      Copy the code from this email and enter it on the secure Stripe checkout step before payment. Paid access is a one-time CAD purchase, not a subscription.
    </p>
    ${buildActionLink(actionUrl, actionLabel)}
  `;

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject: hasAxisContext ? 'Your TypeJung result path and upgrade code' : `Your private ${input.percentOff}% TypeJung upgrade code`,
    html: buildBaseHtml(preview, body, 'You received this TypeJung email because you requested a discount code.'),
    text: hasAxisContext
      ? `Your TypeJung result path centers on ${input.dominantLabel} with ${input.inferiorLabel} as the developmental edge. Your private upgrade code is ${input.discountCode}. Use it for ${input.percentOff}% off Insight or Mastery on the secure Stripe checkout step. ${actionLabel}: ${actionUrl}`
      : `Your private TypeJung upgrade code is ${input.discountCode}. Use it for ${input.percentOff}% off Insight or Mastery on the secure Stripe checkout step. ${actionLabel}: ${actionUrl}`,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

// Late drip steps (emails 4 and 5): kept as a self-contained template so the
// established first/second follow-up copy stays untouched. Email 4 explains what
// the paid interpretation adds; email 5 points still-stuck readers to the Debrief.
async function sendDiscountSequenceLateEmail(
  input: DiscountLeadFollowupEmailInput,
  credentials: ResendCredentials,
): Promise<LifecycleEmailSendResult> {
  const isFourth = input.stage === 'fourth';
  const safeCode = escapeHtml(input.discountCode);
  const sampleUrl = urlForPath(input.actionUrl, '/sample-report');
  const debriefUrl = urlForPath(input.actionUrl, '/debrief');

  const subject = isFourth
    ? 'Still stuck between two types?'
    : 'What the paid interpretation actually adds';
  const preview = isFourth
    ? 'If you are still unsure how to read your result, you may need a second read.'
    : 'Free shows the pattern. Insight explains it. Mastery helps you work with it.';

  const body = isFourth
    ? `
      <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">Still stuck between two types?</h1>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        If your result is interesting but you are still unsure how to interpret it, you may not need another test. You may need a second read.
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        The Personal Type Debrief is a founder-reviewed read of your TypeJung map, your likely mistype risks, and your dominant-inferior stress edge, delivered within 72 hours. It is a one-time service, limited to a few per week, and it is educational self-reflection rather than a clinical or diagnostic assessment.
      </p>
      ${buildActionLink(debriefUrl, 'Get a Personal Type Debrief')}
    `
    : `
      <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">What the paid interpretation actually adds</h1>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        The free map answers: what pattern showed up? Insight answers: what does it mean? Mastery answers: how do I keep working with it?
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Insight adds the developmental edge, stress-pattern reflection, relationship-pattern reflection, and practical prompts. ${safeCode} is ${input.percentOff}% off Insight or Mastery on the secure Stripe step. Only unlock it if your free map feels worth keeping.
      </p>
      <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
        Still stuck between two types? The Personal Type Debrief is the human-reviewed path: a founder-reviewed read of your exact map.
      </p>
      ${buildActionLink(sampleUrl, 'View the sample report')}
      ${buildActionLink(debriefUrl, 'See the Personal Type Debrief')}
    `;

  const text = isFourth
    ? `If your result is interesting but you are still unsure how to interpret it, the Personal Type Debrief is a founder-reviewed second read of your TypeJung map, likely mistype risks, and stress edge, delivered within 72 hours. Get a Personal Type Debrief: ${debriefUrl}`
    : `Free shows the pattern; Insight explains it; Mastery helps you keep working with it. Insight adds the developmental edge, stress-pattern reflection, relationship reflection, and practice prompts. ${input.discountCode} is ${input.percentOff}% off on Stripe. Sample report: ${sampleUrl} Personal Type Debrief: ${debriefUrl}`;

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject,
    html: buildBaseHtml(preview, body),
    text,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

export async function sendDiscountLeadFollowupEmail(input: DiscountLeadFollowupEmailInput): Promise<LifecycleEmailSendResult> {
  if (!input.toEmail) {
    return { sent: false, skipped: true, reason: 'missing_email' };
  }

  const credentials = await getCredentials();

  if (!credentials) {
    return { sent: false, skipped: true, reason: 'resend_not_configured' };
  }

  if (input.stage === 'third' || input.stage === 'fourth') {
    return sendDiscountSequenceLateEmail(input, credentials);
  }

  const tierName = input.tier ? PRICING[input.tier].name : null;
  const safeCode = escapeHtml(input.discountCode);
  const axisCopy = input.dominantLabel && input.inferiorLabel
    ? ` Your saved map centers on ${escapeHtml(input.dominantLabel)} with ${escapeHtml(input.inferiorLabel)} as the developmental edge.`
    : '';
  const source = input.source || '';
  const checkoutSource = isCheckoutReturnSource(source);
  const resultSource = isResultUpgradeSource(source);
  const assessmentSource = isAssessmentReturnSource(source);
  const isSecondFollowup = input.stage === 'second';
  const preview = isSecondFollowup
    ? 'One more note about the TypeJung path you saved.'
    : checkoutSource
      ? 'Your TypeJung checkout path is still available.'
      : resultSource
        ? 'Your TypeJung report path is still available.'
      : assessmentSource
        ? 'Finish the free map before deciding on a paid report.'
        : 'Use the sample report to decide whether the upgrade is worth keeping.';
  const subject = isSecondFollowup
    ? 'One more note about your TypeJung path'
    : checkoutSource
      ? 'Your TypeJung checkout path is still ready'
      : resultSource
        ? 'Your TypeJung report path is still ready'
      : assessmentSource
        ? 'Finish your free TypeJung map'
        : 'Still deciding on your TypeJung report?';
  const headline = isSecondFollowup
    ? 'One more note about the path you saved'
    : checkoutSource
      ? 'Your checkout path is still ready'
      : resultSource
        ? 'Your saved map can go deeper'
      : assessmentSource
        ? 'Finish the map before you decide'
        : 'Use the sample before you decide';
  const tierCopy = tierName
    ? ` for ${escapeHtml(tierName)}`
    : '';
  const primaryCopy = isSecondFollowup
    ? assessmentSource
      ? `You saved the ${safeCode} path, but the useful part still comes first: finish the free function-stack map before deciding whether any paid report is worth it.`
      : `You saved the ${safeCode} path${tierCopy}.${axisCopy} If the free map still feels worth keeping, the report path is still available. If not, you can ignore this and stay with the free result.`
    : assessmentSource
      ? `You asked TypeJung to keep the ${safeCode} path available${tierCopy}. Finish the free assessment first so you can judge the function-stack map before paying for anything.`
      : resultSource
        ? `You asked TypeJung to keep the ${safeCode} report path available${tierCopy}.${axisCopy}
        If the free map still feels accurate, the selected report path is ready to reopen with the discount code available.`
      : `You asked TypeJung to keep the ${safeCode} path available${tierCopy}.${axisCopy}
        If the free map still feels accurate, the paid report is there to add interpretation, stress patterns, and practice guidance.`;
  const secondaryCopy = isSecondFollowup
    ? 'TypeJung is built free-first: no card for the core map, one-time CAD upgrades only after the result earns interest, and no subscription.'
    : assessmentSource
      ? 'The core map is free and no card is required. If it feels useful after you read it, the code stays available for a one-time Insight or Mastery upgrade.'
      : resultSource
        ? 'Insight adds a deeper interpretation of the result you already saw. Mastery adds the AI Type Guide and practice roadmap. Both are one-time CAD purchases with no subscription.'
      : 'This is a one-time CAD upgrade, not a subscription. You can also start with the sample report if you want to inspect the paid format before Stripe.';

  const body = `
    <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">${headline}</h1>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      ${primaryCopy}
    </p>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      ${secondaryCopy}
    </p>
    <div style="margin: 24px 0; border: 1px solid #D2DCD3; border-radius: 10px; background: #FAFAF8; padding: 18px;">
      <p style="margin: 0 0 8px; color: #6b746c; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Saved code</p>
      <p style="margin: 0; color: #121512; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 26px; font-weight: 800; letter-spacing: 0.08em;">${safeCode}</p>
      <p style="margin: 10px 0 0; color: #4B524C; font-size: 14px; line-height: 1.6;">
        ${input.percentOff}% off Insight or Mastery while the code is active.
      </p>
    </div>
    ${buildActionLink(input.actionUrl, input.actionLabel)}
  `;

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject,
    html: buildBaseHtml(preview, body, 'You received this TypeJung email because you requested a discount or checkout path.'),
    text: assessmentSource
      ? isSecondFollowup
        ? `One more note about the TypeJung path you saved. Finish the free function-stack map before deciding whether any paid report is worth it. Your saved code is ${input.discountCode} for ${input.percentOff}% off Insight or Mastery if the map feels useful. ${input.actionLabel}: ${input.actionUrl}`
        : `Finish the free TypeJung assessment first so you can judge the function-stack map before paying for anything. Your saved code is ${input.discountCode} for ${input.percentOff}% off Insight or Mastery if the map feels useful. ${input.actionLabel}: ${input.actionUrl}`
      : resultSource
        ? isSecondFollowup
          ? `One more note about your TypeJung report path${tierName ? ` for ${tierName}` : ''}.${axisCopy ? ` ${axisCopy.replace(/<[^>]*>/g, '')}` : ''} If the free map still feels worth keeping, your saved code is ${input.discountCode}. ${input.actionLabel}: ${input.actionUrl}`
          : `Your TypeJung report path is still ready${tierName ? ` for ${tierName}` : ''}.${axisCopy ? ` ${axisCopy.replace(/<[^>]*>/g, '')}` : ''} Your saved code is ${input.discountCode}. ${input.actionLabel}: ${input.actionUrl}`
      : isSecondFollowup
        ? `One more note about the TypeJung path you saved${tierName ? ` for ${tierName}` : ''}.${axisCopy ? ` ${axisCopy.replace(/<[^>]*>/g, '')}` : ''} TypeJung is free-first, with one-time CAD upgrades and no subscription. Your saved code is ${input.discountCode}. ${input.actionLabel}: ${input.actionUrl}`
        : `You asked TypeJung to keep the ${input.discountCode} path available${tierName ? ` for ${tierName}` : ''}.${axisCopy ? ` ${axisCopy.replace(/<[^>]*>/g, '')}` : ''} This is a one-time CAD upgrade, not a subscription. ${input.actionLabel}: ${input.actionUrl}`,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

export async function sendCheckoutRecoveryEmail(input: CheckoutRecoveryEmailInput): Promise<LifecycleEmailSendResult> {
  if (!input.toEmail) {
    return { sent: false, skipped: true, reason: 'missing_email' };
  }

  const credentials = await getCredentials();

  if (!credentials) {
    return { sent: false, skipped: true, reason: 'resend_not_configured' };
  }

  const tierName = input.tier ? PRICING[input.tier].name : 'paid report';
  const priceCopy = input.priceLabel ? ` for ${escapeHtml(input.priceLabel)}` : '';
  const preview = `Your secure TypeJung ${tierName} checkout can still be reopened.`;
  const footerReason = input.consentSource === 'site'
    ? 'You received this TypeJung email because you asked TypeJung to email your discount or checkout path before starting Stripe.'
    : 'You received this TypeJung email because you opted in on Stripe after starting a TypeJung checkout.';
  const body = `
    <h1 style="margin: 0 0 16px; color: #121512; font-size: 28px; line-height: 1.2;">Reopen your TypeJung checkout</h1>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      You started the secure Stripe step for the TypeJung ${escapeHtml(tierName)}${priceCopy}, but payment was not completed before that checkout expired.
    </p>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      If the free map still feels worth keeping, this recovery link reopens the TypeJung checkout review so you can start a fresh secure Stripe checkout. It is a one-time CAD purchase, not a subscription.
    </p>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      The paid report includes a 7-day money-back guarantee. If it does not feel useful, reply with your Stripe receipt within 7 days.
    </p>
    <div style="margin: 24px 0; border: 1px solid #D2DCD3; border-radius: 10px; background: #FAFAF8; padding: 18px;">
      <p style="margin: 0 0 8px; color: #6b746c; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Current offer</p>
      <p style="margin: 0; color: #121512; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 24px; font-weight: 800; letter-spacing: 0.08em;">${escapeHtml(EMAIL_CAPTURE_OFFER.code)}</p>
      <p style="margin: 10px 0 0; color: #4B524C; font-size: 14px; line-height: 1.6;">
        TypeJung will reopen the selected report checkout. If Stripe asks for a code, use ${escapeHtml(EMAIL_CAPTURE_OFFER.code)} for ${EMAIL_CAPTURE_OFFER.percentOff}% off.
      </p>
    </div>
    ${buildActionLink(input.recoveryUrl, 'Review checkout again')}
  `;

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject: `Reopen your TypeJung ${tierName} checkout`,
    html: buildBaseHtml(preview, body, footerReason),
    text: `You started the secure Stripe step for the TypeJung ${tierName}${input.priceLabel ? ` for ${input.priceLabel}` : ''}, but payment was not completed before that checkout expired. Review checkout again here: ${input.recoveryUrl}. One-time CAD purchase, no subscription, with a 7-day money-back guarantee. If Stripe asks for a code, use ${EMAIL_CAPTURE_OFFER.code} for ${EMAIL_CAPTURE_OFFER.percentOff}% off.`,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

export type DebriefRequestNotificationInput = {
  requestId: string;
  customerEmail: string;
  resultSummary?: string;
  testedAs?: string;
  stuckBetween?: string;
  feltAccurate?: string;
  feltConfusing?: string;
  amountLabel?: string;
  idempotencyKey?: string;
};

// Notifies the founder of a paid Personal Type Debrief request so it can be
// fulfilled within the promised window. Sent to DEBRIEF_NOTIFY_EMAIL (falling
// back to the Resend from-address, which the founder controls).
export async function sendDebriefRequestNotification(
  input: DebriefRequestNotificationInput,
): Promise<LifecycleEmailSendResult> {
  const credentials = await getCredentials();
  if (!credentials) {
    return { sent: false, skipped: true, reason: 'resend_not_configured' };
  }

  const notifyEmail = getEnvValue('DEBRIEF_NOTIFY_EMAIL') || credentials.fromEmail;
  const row = (label: string, value?: string) => value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#6b746c;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:6px 0;color:#121512;font-size:14px;line-height:1.6;">${escapeHtml(value)}</td></tr>`
    : '';

  const preview = `Paid Personal Type Debrief from ${input.customerEmail}`;
  const body = `
    <h1 style="margin: 0 0 16px; color: #121512; font-size: 26px; line-height: 1.2;">New paid Personal Type Debrief</h1>
    <p style="color: #4B524C; font-size: 16px; line-height: 1.7;">
      A Personal Type Debrief${input.amountLabel ? ` (${escapeHtml(input.amountLabel)})` : ''} was paid for. Deliver the founder-reviewed breakdown to the customer.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;border:1px solid #D2DCD3;border-radius:10px;background:#FAFAF8;">
      ${row('Reply to', input.customerEmail)}
      ${row('Request ID', input.requestId)}
      ${row('TypeJung result', input.resultSummary)}
      ${row('Tested as', input.testedAs)}
      ${row('Stuck between', input.stuckBetween)}
      ${row('Felt accurate', input.feltAccurate)}
      ${row('Felt confusing', input.feltConfusing)}
    </table>
  `;

  const text = [
    'New paid Personal Type Debrief.',
    `Reply to: ${input.customerEmail}`,
    `Request ID: ${input.requestId}`,
    input.resultSummary ? `TypeJung result: ${input.resultSummary}` : '',
    input.testedAs ? `Tested as: ${input.testedAs}` : '',
    input.stuckBetween ? `Stuck between: ${input.stuckBetween}` : '',
    input.feltAccurate ? `Felt accurate: ${input.feltAccurate}` : '',
    input.feltConfusing ? `Felt confusing: ${input.feltConfusing}` : '',
  ].filter(Boolean).join('\n');

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: notifyEmail,
    replyTo: input.customerEmail,
    subject: `New Personal Type Debrief — ${input.customerEmail}`,
    html: buildBaseHtml(preview, body, 'Internal TypeJung notification for a paid Personal Type Debrief.'),
    text,
  }, input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return { sent: true, id: result.data?.id };
}

export async function sendPdfEmail(
  toEmail: string,
  pdfBuffer: Buffer,
  userName: string,
  dominantFunction: string
) {
  const { client, fromEmail } = await getResendClient();
  
  const result = await client.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: 'Your TypeJung Results',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #121512; border-bottom: 2px solid #D2DCD3; padding-bottom: 10px;">
          Your TypeJung Results
        </h1>
        
        <p style="color: #4B524C; font-size: 16px; line-height: 1.6;">
          Dear ${userName || 'Explorer'},
        </p>
        
        <p style="color: #4B524C; font-size: 16px; line-height: 1.6;">
          Thank you for completing TypeJung. Your dominant cognitive function appears to be <strong>${dominantFunction}</strong>.
        </p>
        
        <p style="color: #4B524C; font-size: 16px; line-height: 1.6;">
          Your complete 25+ page premium analysis is attached as a PDF. This report includes:
        </p>
        
        <ul style="color: #4B524C; font-size: 16px; line-height: 1.8;">
          <li>Deep analysis of all 8 cognitive functions</li>
          <li>Your archetypal stack with detailed descriptions</li>
          <li>The Grip: Your stress patterns and recovery paths</li>
          <li>Relationships & compatibility insights</li>
          <li>Career alignment guidance</li>
          <li>Individuation path with exercises</li>
          <li>Active imagination prompts</li>
          <li>Dream journaling guide</li>
        </ul>
        
        <p style="color: #4B524C; font-size: 16px; line-height: 1.6;">
          Remember: Your type is a starting point for self-reflection, not a fixed label. As Jung wrote, 
          <em>"The classification of individuals means nothing, nothing at all."</em>
        </p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #FAFAF8; border-left: 4px solid #D2DCD3;">
          <p style="color: #78716c; font-size: 14px; margin: 0;">
            <strong>Next Steps:</strong> Visit your results page to explore interactive features, 
            compare with past results, or share with others.
          </p>
        </div>
        
        <p style="color: #a8a29e; font-size: 12px; margin-top: 30px; text-align: center;">
          TypeJung<br>
          Based on the typological work of Carl Gustav Jung
        </p>
      </div>
    `,
    attachments: [
      {
        filename: 'jungian-typology-results.pdf',
        content: pdfBuffer.toString('base64'),
      }
    ]
  });
  
  return result;
}
