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

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const response = await attempt.client.models.generateContent({
        model: options.model || 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: options.temperature,
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: options.responseMimeType,
          ...(options.thinkingBudget !== undefined ? { thinkingConfig: { thinkingBudget: options.thinkingBudget } } : {}),
          ...(options.timeoutMs !== undefined ? { httpOptions: { timeout: options.timeoutMs } } : {}),
        },
      });

      return response.text || 'Unable to generate analysis at this time.';
    } catch (error: any) {
      const timedOut = error?.name === 'AbortError' || error?.name === 'TimeoutError' ||
        /timeout|deadline|abort/i.test(typeof error?.message === 'string' ? error.message : '');
      lastError = new Error(timedOut ? 'AI request timeout' : 'AI service error');
      console.error('AI generation failed', {
        type: timedOut ? 'timeout' : 'provider_error',
        ...(Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599 ? { status: error.status } : {}),
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error('AI service error');
}
