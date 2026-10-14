import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateContent = vi.fn();

vi.mock('@google/genai', () => ({
  GoogleGenAI: class { models = { generateContent }; },
  ThinkingLevel: { LOW: 'LOW' },
}));

const { generateGeminiText, geminiErrorStatus, geminiModelCandidates } = await import('../../api/_lib/gemini');

const apiError = (status: number, message: string) => Object.assign(new Error(message), { status });

describe('Gemini model fallback', () => {
  beforeEach(() => {
    generateContent.mockReset();
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_FALLBACK_MODELS;
  });

  it('moves to the fallback model when Google refuses the primary model', async () => {
    generateContent
      .mockRejectedValueOnce(apiError(404, 'models/gemini-2.5-flash is no longer available to new users'))
      .mockResolvedValueOnce({ text: 'READY' });

    await expect(generateGeminiText('probe', { maxOutputTokens: 16, thinkingBudget: 0 })).resolves.toBe('READY');
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[0][0]).toMatchObject({
      model: 'gemini-2.5-flash',
      config: { maxOutputTokens: 16, thinkingConfig: { thinkingBudget: 0 } },
    });
    expect(generateContent.mock.calls[1][0]).toMatchObject({
      model: 'gemini-3.8-flash',
      config: { maxOutputTokens: 16 + 1024, thinkingConfig: { thinkingLevel: 'LOW' } },
    });
  });

  it('does not switch models on rate limits or outages', async () => {
    generateContent.mockRejectedValue(apiError(503, 'Service Unavailable'));

    await expect(generateGeminiText('probe')).rejects.toThrow('Service Unavailable');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it('lets the environment choose the primary and fallback models', () => {
    process.env.GEMINI_MODEL = 'gemini-3.8-flash';
    process.env.GEMINI_FALLBACK_MODELS = 'gemini-3.8-flash, gemini-3.8-flash-lite';
    expect(geminiModelCandidates()).toEqual(['gemini-3.8-flash', 'gemini-3.8-flash-lite']);
  });

  it('reads the HTTP status from SDK errors and JSON error messages', () => {
    expect(geminiErrorStatus(apiError(429, 'quota'))).toBe(429);
    expect(geminiErrorStatus(new Error('{"error":{"code":403,"message":"denied"}}'))).toBe(403);
    expect(geminiErrorStatus(new Error('fetch failed'))).toBeNull();
  });
});
