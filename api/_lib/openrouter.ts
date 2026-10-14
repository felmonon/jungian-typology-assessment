import type { GenerateTextOptions } from './gemini.js';

const DEFAULT_TIMEOUT_MS = 60_000;

// Do not retain provider errors as causes: SDK/fetch messages can include
// authorization headers, prompts, or response payloads.
export async function generateOpenRouterText(prompt: string, options: GenerateTextOptions = {}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error('AI service not configured');

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Invalid AI request timeout');
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('AI request timeout'));
    }, timeoutMs);
  });

  const request = async (): Promise<string> => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature,
        max_tokens: options.maxOutputTokens,
        ...(options.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {}),
        // https://openrouter.ai/docs/guides/routing/provider-selection
        provider: {
          zdr: true,
          data_collection: 'deny',
          require_parameters: true,
          only: ['azure'],
          allow_fallbacks: false,
        },
        stream: false,
      }),
    });
    if (!response.ok) {
      // Never read/log an error body or statusText (both are provider-controlled).
      console.error('AI generation failed', { status: response.status, type: 'http_error' });
      throw new Error('AI service error');
    }
    const body = await response.json();
    const choice = body?.choices?.[0];
    if (body?.error || choice?.error || choice?.message?.error || choice?.message?.refusal ||
        choice?.finish_reason !== 'stop' || choice?.native_finish_reason === 'length' ||
        typeof choice?.message?.content !== 'string' || !choice.message.content.trim()) {
      throw new Error('AI service error');
    }
    return choice.message.content;
  };

  try {
    return await Promise.race([request(), deadline]);
  } catch {
    throw new Error(controller.signal.aborted ? 'AI request timeout' : 'AI service error');
  } finally {
    clearTimeout(timer);
  }
}
