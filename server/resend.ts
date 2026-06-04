import { Resend } from 'resend';
import { getEnvValue } from './env.js';

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
  pricingUrl?: string;
  dominantLabel?: string;
  inferiorLabel?: string;
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
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2f2a25;">
      ${body}
      <p style="margin-top: 32px; color: #8a8177; font-size: 12px; line-height: 1.6;">
        ${escapeHtml(footerReason)}
      </p>
    </div>
  `;
}

function buildActionLink(url: string, label: string): string {
  const safeUrl = escapeHtml(url);
  return `
    <p style="margin: 28px 0;">
      <a href="${safeUrl}" style="display: inline-block; border-radius: 8px; background: #8a5a32; color: #ffffff; font-weight: 700; padding: 12px 18px; text-decoration: none;">
        ${escapeHtml(label)}
      </a>
    </p>
  `;
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
      <h1 style="margin: 0 0 16px; color: #2f2a25; font-size: 28px; line-height: 1.2;">Finish the map behind your type</h1>
      <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
        You started the TypeJung assessment and stopped before the pattern could resolve.${progressCopy}
        If you return on the same device, your progress should still be saved.
      </p>
      <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
        Come back when you have a clear few minutes. The free result gives you the core energy map first, so you can decide from the result itself whether a deeper report is worth it.
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
    const axisCopy = dominantLabel && inferiorLabel
      ? ` Your current map centers on ${dominantLabel} with ${inferiorLabel} as the developmental edge.`
      : '';
    const preview = 'Turn your free map into a deeper read when it feels worth keeping.';
    const body = `
      <h1 style="margin: 0 0 16px; color: #2f2a25; font-size: 28px; line-height: 1.2;">Keep the result only if it earned it</h1>
      <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
        Your free TypeJung map is the test. If it felt accurate enough to keep, the paid report turns that map into a practical read.${axisCopy}
      </p>
      <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
        Insight gives you the developmental edge, stress pattern, relationship triggers, and practice guidance. Mastery adds the AI Type Coach and a practice roadmap. Both are one-time CAD purchases with no subscription.
      </p>
      ${buildActionLink(upgradeUrl, 'Compare report options')}
    `;

    return {
      subject: 'Your TypeJung map can go deeper',
      preview,
      html: buildBaseHtml(preview, body),
      text: `If your free TypeJung map felt accurate enough to keep, the paid report turns it into a practical read.${axisCopy} Insight and Mastery are one-time CAD purchases with no subscription. Compare options: ${upgradeUrl}`,
    };
  }

  const completedCopy = formatCompletedAt(input.completedAt);
  const axisCopy = dominantLabel && inferiorLabel
    ? ` Your dominant-inferior axis is ${dominantLabel} to ${inferiorLabel}.`
    : '';
  const preview = 'Your TypeJung map is ready to review.';
  const body = `
    <h1 style="margin: 0 0 16px; color: #2f2a25; font-size: 28px; line-height: 1.2;">Your energy map is ready</h1>
    <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
      Your TypeJung assessment was completed ${escapeHtml(completedCopy)}.${axisCopy}
    </p>
    <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
      Open the result while the answers are still fresh. Start with the free map, then decide whether you want the deeper report after you have read the pattern.
    </p>
    ${buildActionLink(resultUrl, 'Read your map')}
  `;

  return {
    subject: 'Your TypeJung map is ready',
    preview,
    html: buildBaseHtml(preview, body),
    text: `Your TypeJung assessment was completed ${completedCopy}.${axisCopy} Read your map here: ${resultUrl}`,
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

  const pricingUrl = input.pricingUrl || 'https://typejung.com/pricing';
  const safeCode = escapeHtml(input.discountCode);
  const axisCopy = input.dominantLabel && input.inferiorLabel
    ? ` Your map centers on ${escapeHtml(input.dominantLabel)} with ${escapeHtml(input.inferiorLabel)} as the developmental edge.`
    : '';
  const preview = `Your private ${input.percentOff}% TypeJung upgrade code is inside.`;
  const body = `
    <h1 style="margin: 0 0 16px; color: #2f2a25; font-size: 28px; line-height: 1.2;">Your private TypeJung upgrade code</h1>
    <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
      If your free map felt accurate enough to keep, this gives you ${input.percentOff}% off a one-time Insight or Mastery upgrade.${axisCopy}
    </p>
    <div style="margin: 24px 0; border: 1px solid #d6ccc2; border-radius: 10px; background: #fafaf8; padding: 18px;">
      <p style="margin: 0 0 8px; color: #8a8177; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">Promotion code</p>
      <p style="margin: 0; color: #2f2a25; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 26px; font-weight: 800; letter-spacing: 0.08em;">${safeCode}</p>
    </div>
    <p style="color: #555d56; font-size: 16px; line-height: 1.7;">
      Copy the code from this email and enter it on the secure Stripe checkout step before payment. Paid access is a one-time CAD purchase, not a subscription.
    </p>
    ${buildActionLink(pricingUrl, 'Choose your report')}
  `;

  const client = new Resend(credentials.apiKey);
  const result = await client.emails.send({
    from: credentials.fromEmail,
    to: input.toEmail,
    subject: `Your private ${input.percentOff}% TypeJung upgrade code`,
    html: buildBaseHtml(preview, body, 'You received this TypeJung email because you requested a discount code.'),
    text: `Your private TypeJung upgrade code is ${input.discountCode}. Use it for ${input.percentOff}% off Insight or Mastery on the secure Stripe checkout step. Choose your report: ${pricingUrl}`,
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
        <h1 style="color: #44403c; border-bottom: 2px solid #2d5a3d; padding-bottom: 10px;">
          Your TypeJung Results
        </h1>
        
        <p style="color: #555d56; font-size: 16px; line-height: 1.6;">
          Dear ${userName || 'Explorer'},
        </p>
        
        <p style="color: #555d56; font-size: 16px; line-height: 1.6;">
          Thank you for completing TypeJung. Your dominant cognitive function appears to be <strong>${dominantFunction}</strong>.
        </p>
        
        <p style="color: #555d56; font-size: 16px; line-height: 1.6;">
          Your complete 25+ page premium analysis is attached as a PDF. This report includes:
        </p>
        
        <ul style="color: #555d56; font-size: 16px; line-height: 1.8;">
          <li>Deep analysis of all 8 cognitive functions</li>
          <li>Your archetypal stack with detailed descriptions</li>
          <li>The Grip: Your stress patterns and recovery paths</li>
          <li>Relationships & compatibility insights</li>
          <li>Career alignment guidance</li>
          <li>Individuation path with exercises</li>
          <li>Active imagination prompts</li>
          <li>Dream journaling guide</li>
        </ul>
        
        <p style="color: #555d56; font-size: 16px; line-height: 1.6;">
          Remember: Your type is a starting point for self-reflection, not a fixed label. As Jung wrote, 
          <em>"The classification of individuals means nothing, nothing at all."</em>
        </p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #fafaf8; border-left: 4px solid #2d5a3d;">
          <p style="color: #666666; font-size: 14px; margin: 0;">
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
