import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.hoisted(() => vi.fn());
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return { models: { generateContent } };
  }),
}));

import { DEFAULT_GEMINI_TIMEOUT_MS, generateGeminiText, resolveGeminiTimeoutMs } from '../../api/_lib/gemini';

describe('Gemini request timeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('REPORT_AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('AI_INTEGRATIONS_GEMINI_API_KEY', '');
    vi.stubEnv('AI_INTEGRATIONS_GEMINI_BASE_URL', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    generateContent.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('applies a default deadline when the caller sets none', async () => {
    generateContent.mockImplementation(() => new Promise(() => {}));
    const pending = expect(generateGeminiText('prompt')).rejects.toThrow('AI request timeout');
    await vi.advanceTimersByTimeAsync(DEFAULT_GEMINI_TIMEOUT_MS);
    await pending;
    const config = generateContent.mock.calls[0][0].config;
    expect(config.httpOptions).toEqual({ timeout: DEFAULT_GEMINI_TIMEOUT_MS });
    expect(config.abortSignal.aborted).toBe(true);
  });

  it('returns the response when it arrives in time', async () => {
    generateContent.mockResolvedValue({ text: 'READY' });
    await expect(generateGeminiText('prompt', { timeoutMs: 15_000 })).resolves.toBe('READY');
  });

  it('raises a deadline below the provider minimum and rejects nonsense values', () => {
    expect(resolveGeminiTimeoutMs(undefined)).toBe(DEFAULT_GEMINI_TIMEOUT_MS);
    expect(resolveGeminiTimeoutMs(25)).toBe(10_000);
    expect(() => resolveGeminiTimeoutMs(Number.NaN)).toThrow('Invalid AI request timeout');
    expect(() => resolveGeminiTimeoutMs(-1)).toThrow('Invalid AI request timeout');
  });
});
