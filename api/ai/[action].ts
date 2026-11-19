import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser } from '../_lib/auth.js';
import { generateGeminiText } from '../_lib/gemini.js';
import { findCompletedPurchaseForUser, isCheckoutSessionRedeemableBy, resolveTierFromCheckoutSession } from '../_lib/purchases.js';
import { enforceSharedRateLimit } from '../_lib/rate-limit.js';
import { isJsonObject, readJsonObjectBody, type JsonObject } from '../_lib/request-body.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../_lib/supabase.js';
import { getStripeSecretKey } from '../../server/checkout.js';
import { PREMIUM_REPORT_KEYS, readCompletePremiumReport, type PremiumAnalysis } from '../../lib/premium-report.js';
import { buildReportPreview } from '../../lib/report-preview.js';
import { isOversizedBody, sanitizeAssessmentInput, type CleanAssessment } from '../_lib/assessment-input.js';
import { markCachedReportUnlocked, readCachedReport, reportCacheKey, storeCachedReport } from '../_lib/report-cache.js';

interface FunctionScore {
  function: string;
  score: number;
  rawPreference?: number;
  rawInferior?: number;
  normalized?: number;
}

interface Stack {
  dominant: FunctionScore;
  auxiliary: FunctionScore;
  tertiary: FunctionScore;
  inferior: FunctionScore;
  resultVersion?: string;
  depthResult?: any;
}

interface AnalysisInput {
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore?: number;
  isUndifferentiated?: boolean;
  resultVersion?: string;
  depthResult?: any;
  checkoutSessionId?: string;
}

const FUNCTION_NAMES: Record<string, string> = {
  Te: 'Extraverted Thinking',
  Ti: 'Introverted Thinking',
  Fe: 'Extraverted Feeling',
  Fi: 'Introverted Feeling',
  Se: 'Extraverted Sensing',
  Si: 'Introverted Sensing',
  Ne: 'Extraverted Intuition',
  Ni: 'Introverted Intuition',
};

const CHANNEL_NAMES: Record<string, string> = {
  thinking: 'Thinking',
  feeling: 'Feeling',
  sensation: 'Sensation',
  intuition: 'Intuition',
};

const STACK_POSITIONS = ['dominant', 'auxiliary', 'tertiary', 'inferior'] as const;

function actionName(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

function isFunctionScore(value: unknown): value is FunctionScore {
  return isJsonObject(value) && typeof value.function === 'string' && typeof value.score === 'number';
}

// A JSON object can shadow toString, which makes string conversion throw, so
// a value that is interpolated into a prompt has to be a primitive.
function isPrintable(value: unknown): boolean {
  return value === null || typeof value !== 'object';
}

// The free analysis formats these fields into its prompt and fallback text,
// so each one must have the type that formatting relies on. Anything else is
// the caller's mistake and is answered with 400 rather than failing later.
function isFreeAnalysisInput(body: JsonObject): body is JsonObject & AnalysisInput {
  const { scores, stack, attitudeScore } = body;

  if (!Array.isArray(scores) || !scores.every(isFunctionScore)) return false;
  if (!isJsonObject(stack) || !STACK_POSITIONS.every((position) => isFunctionScore(stack[position]))) return false;
  // A score the browser could not compute arrives as null.
  if (attitudeScore !== undefined && attitudeScore !== null && typeof attitudeScore !== 'number') return false;

  const depth = body.depthResult || stack.depthResult;
  if (!isJsonObject(depth)) return true;

  const reliability = isJsonObject(depth.reliability) ? depth.reliability : {};
  const narrative = isJsonObject(depth.narrative) ? depth.narrative : {};
  return [
    depth.dominant,
    depth.auxiliary,
    depth.inferior,
    reliability.score,
    reliability.label,
    narrative.developmentalEdge,
    narrative.complexVulnerability,
  ].every(isPrintable);
}

function functionName(code: string): string {
  return FUNCTION_NAMES[code] || code;
}

// Only cleaned, capped fields are formatted here; the browser's JSON is never
// interpolated directly into a prompt.
function formatScoresForPrompt(input: CleanAssessment): string {
  const sortedScores = [...input.scores].sort((a, b) => b.score - a.score);
  const scoresList = sortedScores
    .map((s, i) => `${i + 1}. ${functionName(s.function)} (${s.function}): ${s.score.toFixed(1)}%`)
    .join('\n');

  const stackInfo = input.stack ? `
Cognitive Stack:
${STACK_POSITIONS.map((position) => {
    const entry = input.stack![position];
    return `- ${position[0].toUpperCase()}${position.slice(1)}: ${functionName(entry.function)} (${entry.function}) - ${entry.score.toFixed(1)}%`;
  }).join('\n')}` : '';

  const attitude = input.attitudeScore > 0 ? 'Extraverted' : 'Introverted';
  const depth = input.depth;
  const depthBlock = depth ? `
Depth Function-Stack Map:
- Dominant channel: ${depth.dominant ?? 'not given'}
- Auxiliary channel: ${depth.auxiliary ?? 'not given'}
- Inferior channel: ${depth.inferior ?? 'not given'}
- Answer consistency signal: ${depth.reliability.score ?? 'not given'}% (${depth.reliability.label ?? 'not given'})
- Developmental edge: ${depth.narrative.developmentalEdge ?? 'not given'}
- Pressure pattern: ${depth.narrative.complexVulnerability ?? 'not given'}
` : '';

  return `
Assessment Results:
${scoresList}

${stackInfo}

Overall Attitude: ${attitude} (score: ${input.attitudeScore.toFixed(1)})
Differentiation Status: ${input.isUndifferentiated ? 'Undifferentiated (scores are relatively even)' : 'Differentiated'}
${depthBlock}
`;
}

function extractJson(text: string): Record<string, string> | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function fallbackFreeAnalysis(input: CleanAssessment): string {
  const depth = input.depth;
  const stack = input.stack!;
  const dominant = depth?.dominant ? CHANNEL_NAMES[depth.dominant] : functionName(stack.dominant.function);
  const auxiliary = depth?.auxiliary ? CHANNEL_NAMES[depth.auxiliary] : functionName(stack.auxiliary.function);
  const inferior = depth?.inferior ? CHANNEL_NAMES[depth.inferior] : functionName(stack.inferior.function);
  const edge = depth?.narrative.developmentalEdge || `Your developmental work sits around ${inferior}, the channel with the least conscious energy in this result.`;
  const vulnerability = depth?.narrative.complexVulnerability || 'Stress is most likely to pull attention into the inferior channel before you can respond from your stronger functions.';

  return `Your function-stack map is led by ${dominant}, supported by ${auxiliary}. This means your strongest movement is not a fixed personality label but a repeated channel of attention, judgment, and effort. The important tension is the opposite pole: ${inferior}. ${edge} ${vulnerability} Use the result as a practice map. When stress rises, notice whether you are trying to solve the situation only through the dominant channel. The useful move is to give the inferior function a small, concrete role before it takes over in a primitive form.`;
}

function isUsableFreeAnalysis(text: string | undefined): text is string {
  const trimmed = text?.trim() || '';
  const words = trimmed.split(/\s+/).filter(Boolean).length;

  return (
    words >= 80 &&
    trimmed.length >= 350 &&
    /[.!?]["')\]]?$/.test(trimmed) &&
    !/unable to generate/i.test(trimmed)
  );
}

function cleanCheckoutSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^cs_[A-Za-z0-9_]+$/.test(trimmed)) return null;
  return trimmed.slice(0, 200);
}

async function verifyPaidCheckoutSession(sessionId: unknown): Promise<boolean> {
  const cleanedSessionId = cleanCheckoutSessionId(sessionId);
  if (!cleanedSessionId) return false;

  const stripeSecretKey = getStripeSecretKey();
  if (!stripeSecretKey) return false;

  const query = new URLSearchParams({
    'expand[]': 'line_items.data.price',
  });
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${cleanedSessionId}?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${stripeSecretKey}`,
    },
  });
  const session = await response.json();

  if (!response.ok) {
    console.error('Stripe session unlock check failed:', session?.error?.message || response.status);
    return false;
  }

  // Stripe keeps payment_status 'paid' after a refund. Callers that release
  // paid content must also pass isSessionEntitled (stored purchase status).
  if (session.payment_status !== 'paid') return false;
  return Boolean(resolveTierFromCheckoutSession(session));
}

function rejectOversized(body: unknown, res: VercelResponse): boolean {
  if (!isOversizedBody(body)) return false;
  res.status(413).json({ error: 'Assessment data is too large' });
  return true;
}

async function handleFreeAnalysis(req: VercelRequest, res: VercelResponse) {
  const body = readJsonObjectBody(req);

  if (!body) return res.status(400).json({ error: 'Invalid assessment data format' });
  if (rejectOversized(body, res)) return;
  if (!isFreeAnalysisInput(body)) {
    return res.status(400).json({ error: 'Invalid assessment data format' });
  }

  const input = sanitizeAssessmentInput(body);
  if (!input.stack) return res.status(400).json({ error: 'Invalid assessment data format' });

  const prompt = `Write as an educational Jungian typology guide. Based on the following TypeJung self-reflection results, provide a brief but insightful personalized analysis.

${formatScoresForPrompt(input)}

Write a personalized analysis in 150-200 words that:
1. Identifies where their psychic energy flows most strongly
2. Names the inferior-function developmental edge without reducing them to a four-letter label
3. Offers one practical observation about how they likely experience stress, the body, or value

Keep the tone direct, psychologically grounded, and useful. Use second person ("you"). Clearly treat the result as educational self-reflection, not diagnosis, therapy, or a clinical assessment. Avoid certainty, treatment advice, and claims of scientific validation. Do not mention that this is a free or limited analysis. Do not use bullet points, headers, or any markdown formatting like asterisks. Write in plain flowing paragraphs only.`;

  let analysis = fallbackFreeAnalysis(input);
  let generationSource: 'gemini' | 'openrouter' | 'template' = 'template';

  try {
    const generated = await generateGeminiText(prompt, {
      temperature: 0.7,
      // Reserve the short generation budget for the 150–200 word response.
      maxOutputTokens: 768,
      thinkingBudget: 0,
      timeoutMs: 30_000,
    });

    if (isUsableFreeAnalysis(generated)) {
      analysis = generated.trim();
      generationSource = providerName();
    } else {
      console.error('Using fallback free analysis: generated response was incomplete');
    }
  } catch (error: any) {
    console.error('Using fallback free analysis:', error?.message || error);
  }

  return res.status(200).json({ analysis, generationSource });
}

function providerName(): 'gemini' | 'openrouter' {
  return process.env.REPORT_AI_PROVIDER === 'openrouter' ? 'openrouter' : 'gemini';
}

function premiumReportPrompt(input: CleanAssessment): string {
  const { scores, stack, attitudeScore, isUndifferentiated, depth } = input;
  // completedAt keys the cache; it says nothing about the person.
  const depthForPrompt = depth ? { ...depth, completedAt: undefined } : null;
  return `Write as an educational Jungian typology guide. Create a premium TypeJung self-reflection report from this result.

Return valid JSON only with these exact string keys:
${PREMIUM_REPORT_KEYS.join(', ')}

Each value should be 120-180 words, direct, psychologically grounded, and second-person. Frame interpretations as possibilities for reflection, not clinical findings. Do not diagnose, provide therapy, or claim scientific validation. The theGrip section should open with one clear sentence about how stress can pull the reader from the dominant function toward the inferior one; every other section should also open with a sentence that names its theme for this reader.

Compatibility scores:
${JSON.stringify({ scores, stack, attitudeScore, isUndifferentiated }, null, 2)}

Depth function-stack map:
${JSON.stringify(depthForPrompt, null, 2)}
`;
}

async function generatePremiumReport(input: CleanAssessment): Promise<PremiumAnalysis | null> {
  const text = await generateGeminiText(premiumReportPrompt(input), {
    temperature: 0.65,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
    timeoutMs: 90_000,
  }).catch((error) => {
    console.error('Premium report generation unavailable:', error?.message || error);
    return '';
  });
  return readCompletePremiumReport(extractJson(text));
}

type ReportPreviewFallbackReason = 'cache_unavailable' | 'generation_failed' | 'incomplete_result';

function previewFallback(res: VercelResponse, reason: ReportPreviewFallbackReason, status = 200) {
  // The browser keeps the previous offer when this arrives; nothing is locked
  // behind a preview that could not be prepared.
  if (status === 503) res.setHeader('Retry-After', '60');
  return res.status(status).json({ available: false, reason });
}

/**
 * Builds the report once per result, stores it, and returns only the preview
 * parts: the stress-edge section in full and an opening sentence for each of
 * the other nine. The other sections' full text stays in the database until
 * premium-analysis confirms the reader is entitled to it.
 */
async function handleReportPreview(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  const body = readJsonObjectBody(req);
  if (!body) return res.status(400).json({ error: 'Invalid assessment data format' });
  if (rejectOversized(body, res)) return;
  if (!isFreeAnalysisInput(body)) return res.status(400).json({ error: 'Invalid assessment data format' });

  const input = sanitizeAssessmentInput(body);
  if (!input.stack) return res.status(400).json({ error: 'Invalid assessment data format' });
  const key = reportCacheKey(input);
  if (!key) return previewFallback(res, 'incomplete_result');
  // Without a place to keep the report, the preview could differ from the
  // report the reader later buys, so the old offer is shown instead.
  if (!hasSupabaseAdminConfig()) return previewFallback(res, 'cache_unavailable');

  const supabase = getSupabaseAdminClient();
  const cached = await readCachedReport(supabase, key);
  if (cached.status === 'unavailable') return previewFallback(res, 'cache_unavailable');

  let report = cached.status === 'hit' ? cached.entry.report : null;
  if (!report) {
    const generated = await generatePremiumReport(input);
    if (!generated) return previewFallback(res, 'generation_failed', 503);
    const stored = await storeCachedReport(supabase, key, { report: generated, generationSource: providerName() });
    if (!stored) return previewFallback(res, 'cache_unavailable');
    report = stored.report;
  }

  return res.status(200).json({ available: true, preview: buildReportPreview(report) });
}

async function handlePremiumAnalysis(req: VercelRequest, res: VercelResponse) {
  const body = readJsonObjectBody(req);
  if (!body) return res.status(400).json({ error: 'Invalid assessment data format' });
  if (rejectOversized(body, res)) return;
  const { scores, stack, checkoutSessionId } = body;

  // The report prompt embeds the cleaned values as JSON, so their container
  // types are all a buyer's request must satisfy.
  if (!Array.isArray(scores) || !isJsonObject(stack)) {
    return res.status(400).json({ error: 'Invalid assessment data format' });
  }

  const user = await getSessionUser(req.headers.cookie);

  // Entitlement. The account path only matches status 'completed' rows, and
  // refunded/disputed rows can no longer return to 'completed'. The session
  // path re-checks the stored purchase with isCheckoutSessionRedeemableBy,
  // which rejects refunded, disputed and other-account sessions. This is the
  // only place cached full report text is released.
  let hasPremiumAccess = false;

  if (user?.id) {
    const supabase = getSupabaseAdminClient();
    hasPremiumAccess = Boolean(await findCompletedPurchaseForUser(supabase, user));
  }

  if (!hasPremiumAccess) {
    hasPremiumAccess = await verifyPaidCheckoutSession(checkoutSessionId);

    // A paid session bound to another account must not unlock premium for
    // this requester, even though the session id itself checks out on Stripe.
    if (hasPremiumAccess && hasSupabaseAdminConfig()) {
      const cleanedSessionId = cleanCheckoutSessionId(checkoutSessionId);
      if (cleanedSessionId) {
        hasPremiumAccess = await isCheckoutSessionRedeemableBy(
          getSupabaseAdminClient(),
          cleanedSessionId,
          user,
        );
      }
    }
  }

  if (!hasPremiumAccess) {
    return res.status(403).json({ error: 'Premium access required' });
  }

  const input = sanitizeAssessmentInput(body);
  const key = reportCacheKey(input);
  const supabase = key && hasSupabaseAdminConfig() ? getSupabaseAdminClient() : null;

  // The report the reader previewed is the report they get: serve the stored
  // one rather than generating a different version after purchase.
  if (key && supabase) {
    const cached = await readCachedReport(supabase, key);
    if (cached.status === 'hit') {
      await markCachedReportUnlocked(supabase, key);
      return res.status(200).json({ analysis: cached.entry.report, generationSource: cached.entry.generationSource ?? providerName() });
    }
  }

  const analysis = await generatePremiumReport(input);
  if (!analysis) {
    console.error('Premium report delivery failed: a complete ten-section report was not generated');
    res.setHeader('Retry-After', '60');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      code: 'report_temporarily_unavailable',
      error: 'Your personalized report could not be completed. Your purchase is saved. Please try again later, or contact support for help or a refund.',
    });
  }

  if (key && supabase) {
    const stored = await storeCachedReport(supabase, key, { report: analysis, generationSource: providerName() });
    if (stored) {
      await markCachedReportUnlocked(supabase, key);
      return res.status(200).json({ analysis: stored.report, generationSource: stored.generationSource ?? providerName() });
    }
  }

  return res.status(200).json({ analysis, generationSource: providerName() });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const action = actionName(req.query.action);
    if (action === 'free-analysis') {
      if (await enforceSharedRateLimit(req, res, {
        keyPrefix: 'ai:free-analysis',
        limit: 20,
        windowMs: 60 * 60 * 1000,
        message: 'Too many analysis requests. Please wait and try again.',
      })) return;

      return await handleFreeAnalysis(req, res);
    }

    if (action === 'report-preview') {
      if (await enforceSharedRateLimit(req, res, {
        keyPrefix: 'ai:report-preview',
        limit: 30,
        windowMs: 60 * 60 * 1000,
        message: 'Too many report preview requests. Please wait and try again.',
      })) return;

      return await handleReportPreview(req, res);
    }

    if (action === 'premium-analysis') {
      if (await enforceSharedRateLimit(req, res, {
        keyPrefix: 'ai:premium-analysis',
        limit: 12,
        windowMs: 60 * 60 * 1000,
        message: 'Too many premium report requests. Please wait and try again.',
      })) return;

      return await handlePremiumAnalysis(req, res);
    }

    return res.status(404).json({ error: 'AI action not found' });
  } catch (error: any) {
    console.error('AI route error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate analysis',
    });
  }
}
