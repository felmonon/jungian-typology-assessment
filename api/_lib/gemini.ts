import { GoogleGenAI } from '@google/genai';
import { generateOpenRouterText } from './openrouter.js';

export interface GenerateTextOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  thinkingBudget?: number;
  timeoutMs?: number;
}

// A stalled provider call must not hold a serverless function (and the reader
// waiting on it) until the platform kills it. Gemini rejects deadlines below
// 10 seconds, so shorter requests are raised to that floor.
export const DEFAULT_GEMINI_TIMEOUT_MS = 60_000;
const MIN_GEMINI_TIMEOUT_MS = 10_000;

export function resolveGeminiTimeoutMs(timeoutMs: number | undefined): number {
  if (timeoutMs === undefined) return DEFAULT_GEMINI_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid AI request timeout');
  return Math.max(MIN_GEMINI_TIMEOUT_MS, timeoutMs);
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

export async function generateGeminiText(prompt: string, options: GenerateTextOptions = {}): Promise<string> {
  const provider = process.env.REPORT_AI_PROVIDER;
  if (provider === 'openrouter') return generateOpenRouterText(prompt, options);
  if (provider !== undefined && provider !== 'gemini') throw new Error('Invalid report AI provider');

  const attempts = [
    { label: 'AI integrations', client: getIntegrationClient() },
    { label: 'Gemini API', client: getDirectClient() },
  ].filter((attempt): attempt is { label: string; client: GoogleGenAI } => Boolean(attempt.client));

  if (attempts.length === 0) {
    throw new Error('AI service not configured');
  }

  const timeoutMs = resolveGeminiTimeoutMs(options.timeoutMs);
  let lastError: unknown;
  for (const attempt of attempts) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    // The SDK deadline is the primary limit; this local one also covers a
    // connection that never answers, which the SDK option alone may not end.
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(Object.assign(new Error('AI request timeout'), { name: 'TimeoutError' }));
      }, timeoutMs);
    });
    try {
      const request = attempt.client.models.generateContent({
        model: options.model || 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: options.responseMimeType,
          ...(options.thinkingBudget !== undefined ? { thinkingConfig: { thinkingBudget: options.thinkingBudget } } : {}),
          httpOptions: { timeout: timeoutMs },
          abortSignal: controller.signal,
        },
      });
      // A rejection that loses the race must not surface as unhandled.
      request.catch(() => undefined);
      const response = await Promise.race([request, deadline]);

      return response.text || 'Unable to generate analysis at this time.';
    } catch (error: any) {
      const timedOut = error?.name === 'AbortError' || error?.name === 'TimeoutError' ||
        /timeout|deadline|abort/i.test(typeof error?.message === 'string' ? error.message : '');
      lastError = new Error(timedOut ? 'AI request timeout' : 'AI service error');
      console.error('AI generation failed', {
        type: timedOut ? 'timeout' : 'provider_error',
        ...(Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599 ? { status: error.status } : {}),
      });
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI service error');
}
