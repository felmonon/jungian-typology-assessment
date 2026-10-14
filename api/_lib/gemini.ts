import { GoogleGenAI, ThinkingLevel } from '@google/genai';

interface GenerateTextOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  thinkingBudget?: number;
  timeoutMs?: number;
}

let integrationClient: GoogleGenAI | null = null;
let directClient: GoogleGenAI | null = null;

function getIntegrationClient(): GoogleGenAI | null {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  if (!apiKey || !baseUrl) return null;

  if (!integrationClient) {
    integrationClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: '',
        baseUrl,
      },
    });
  }

  return integrationClient;
}

function getDirectClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!directClient) {
    directClient = new GoogleGenAI({ apiKey });
  }

  return directClient;
}

// Google restricts older models (gemini-2.5-flash) for some projects, answering
// with a 4xx before any generation happens. When a model is refused that way the
// next one is tried, so checkout and reports keep working through a retirement.
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_FALLBACK_MODEL = 'gemini-3.8-flash';
const MODEL_REFUSED_STATUSES = new Set([400, 403, 404]);
// Gemini 3 models cannot turn thinking off and count thinking tokens against
// maxOutputTokens, so a "no thinking" request gets low thinking plus headroom.
const LOW_THINKING_TOKEN_HEADROOM = 1024;

export function geminiModelCandidates(requestedModel?: string): string[] {
  const models = [
    requestedModel || process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL,
    ...(process.env.GEMINI_FALLBACK_MODELS || DEFAULT_FALLBACK_MODEL).split(','),
  ].map((model) => model.trim()).filter(Boolean);
  return Array.from(new Set(models));
}

function usesThinkingLevel(model: string): boolean {
  const version = /^gemini-(\d+)/.exec(model)?.[1];
  return Boolean(version && Number(version) >= 3);
}

export function geminiErrorStatus(error: unknown): number | null {
  const status = (error as { status?: unknown } | null)?.status;
  if (typeof status === 'number' && Number.isFinite(status)) return status;
  const message = error instanceof Error ? error.message : '';
  const match = /"code":\s*(\d{3})|\b(4\d\d|5\d\d)\b/.exec(message);
  const code = match ? Number(match[1] || match[2]) : NaN;
  return Number.isFinite(code) ? code : null;
}

function buildConfig(model: string, options: GenerateTextOptions) {
  let maxOutputTokens = options.maxOutputTokens;
  let thinkingConfig: Record<string, unknown> | undefined;

  if (options.thinkingBudget !== undefined) {
    if (usesThinkingLevel(model)) {
      thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
      if (options.thinkingBudget === 0 && maxOutputTokens !== undefined) {
        maxOutputTokens += LOW_THINKING_TOKEN_HEADROOM;
      }
    } else {
      thinkingConfig = { thinkingBudget: options.thinkingBudget };
    }
  }

  return {
    temperature: options.temperature,
    maxOutputTokens,
    responseMimeType: options.responseMimeType,
    ...(thinkingConfig ? { thinkingConfig } : {}),
    ...(options.timeoutMs !== undefined ? { httpOptions: { timeout: options.timeoutMs } } : {}),
  };
}

export async function generateGeminiText(prompt: string, options: GenerateTextOptions = {}): Promise<string> {
  const attempts = [
    { label: 'AI integrations', client: getIntegrationClient() },
    { label: 'Gemini API', client: getDirectClient() },
  ].filter((attempt): attempt is { label: string; client: GoogleGenAI } => Boolean(attempt.client));

  if (attempts.length === 0) {
    throw new Error('AI service not configured');
  }

  const models = geminiModelCandidates(options.model);
  let lastError: unknown;
  for (const attempt of attempts) {
    for (const model of models) {
      try {
        const response = await attempt.client.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: buildConfig(model, options),
        });

        return response.text || 'Unable to generate analysis at this time.';
      } catch (error: any) {
        lastError = error;
        const status = geminiErrorStatus(error);
        console.error(`${attempt.label} generation failed (${model}, status ${status ?? 'unknown'}):`, error?.message || error);
        if (status === null || !MODEL_REFUSED_STATUSES.has(status)) break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI service error');
}
