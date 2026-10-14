import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateGeminiText } from '../../api/_lib/gemini';
import { guardPaidReportCheckout, resetReportAvailabilityCache } from '../../api/_lib/report-availability';

const { generateContent, createClient } = vi.hoisted(() => ({ generateContent: vi.fn(), createClient: vi.fn() }));
vi.mock('@google/genai', () => ({ GoogleGenAI: class {
  models = { generateContent };
  constructor(...args: unknown[]) { createClient(...args); }
} }));
vi.mock('../../api/_lib/funnel-events', () => ({ recordFunnelEvent: vi.fn() }));

const completed = (content = 'READY', extra: object = {}) => ({
  choices: [{ finish_reason: 'stop', message: { content }, ...extra }],
});
const reply = (body: unknown, status = 200) => {
  vi.mocked(fetch).mockResolvedValue({ ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(body) } as any);
};
const res = () => {
  const response: any = { setHeader: vi.fn(), status: vi.fn(), json: vi.fn() };
  response.status.mockReturnValue(response);
  return response;
};

describe('report provider selection', () => {
  beforeEach(() => {
    vi.stubEnv('REPORT_AI_PROVIDER', 'openrouter');
    vi.stubEnv('OPENROUTER_API_KEY', 'unit-test-key');
    vi.stubEnv('OPENROUTER_MODEL', '');
    vi.mocked(fetch).mockReset();
    generateContent.mockReset();
    createClient.mockClear();
    resetReportAvailabilityCache();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); vi.useRealTimers(); });

  it('returns complete READY and opens the fail-closed checkout guard', async () => {
    reply(completed());
    const response = res();
    expect(await guardPaidReportCheckout(response)).toBe(true);
    expect(response.status).not.toHaveBeenCalled();
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(init).toMatchObject({ method: 'POST', headers: { Authorization: 'Bearer unit-test-key', 'Content-Type': 'application/json' } });
    expect(JSON.parse(init!.body as string)).toEqual({
      model: 'openai/gpt-4.1-mini', messages: [{ role: 'user', content: 'Reply with exactly the word READY.' }],
      temperature: 0, max_tokens: 16, stream: false,
      provider: { zdr: true, data_collection: 'deny', require_parameters: true, only: ['azure'], allow_fallbacks: false },
    });
    expect(createClient).not.toHaveBeenCalled();
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('passes JSON format, temperature and tokens and uses the configured OpenRouter model, not the Gemini model', async () => {
    vi.stubEnv('OPENROUTER_MODEL', 'openai/custom-model');
    reply(completed('{"report":"ok"}'));
    expect(await generateGeminiText('private prompt', { model: 'gemini-2.5-flash', temperature: 0.4, maxOutputTokens: 1234, responseMimeType: 'application/json' })).toBe('{"report":"ok"}');
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)).toMatchObject({
      model: 'openai/custom-model', temperature: 0.4, max_tokens: 1234, response_format: { type: 'json_object' },
    });
  });

  it.each([401, 429, 503])('sanitizes HTTP %s without reading error payload or falling back', async status => {
    reply({ error: { message: 'SECRET provider prompt' } }, status);
    await expect(generateGeminiText('private prompt')).rejects.toThrow('AI service error');
    expect(console.error).toHaveBeenCalledWith('AI generation failed', { status, type: 'http_error' });
    const response = await vi.mocked(fetch).mock.results[0].value;
    expect(response.json).not.toHaveBeenCalled();
    expect(generateContent).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each([
    completed(''), completed('   '), completed('partial', { finish_reason: 'length' }),
    completed('partial', { finish_reason: 'content_filter' }), completed('partial', { finish_reason: null }),
    completed('partial', { native_finish_reason: 'length' }),
    completed('READY', { error: { message: 'SECRET' } }),
    { error: { message: 'SECRET' }, ...completed() }, {},
    { choices: [{ finish_reason: 'stop', message: { content: 'READY', refusal: 'SECRET' } }] },
  ])('rejects incomplete or error responses even with HTTP 200: %#', async body => {
    reply(body);
    await expect(generateGeminiText('private prompt')).rejects.toThrow('AI service error');
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('keeps checkout fail-closed for a provider error', async () => {
    reply({ error: { message: 'SECRET' } });
    const response = res();
    expect(await guardPaidReportCheckout(response)).toBe(false);
    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json.mock.calls[0][0].code).toBe('reports_temporarily_unavailable');
  });

  it.each([25, undefined])('bounds the full request with timeout %s and aborts without fallback', async timeoutMs => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    const pending = expect(generateGeminiText('private prompt', { timeoutMs })).rejects.toThrow('AI request timeout');
    await vi.advanceTimersByTimeAsync(timeoutMs ?? 60_000);
    await pending;
    expect(vi.mocked(fetch).mock.calls[0][1]!.signal!.aborted).toBe(true);
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('times out while reading the response body too', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => new Promise(() => {}) } as any);
    const pending = expect(generateGeminiText('private prompt', { timeoutMs: 10 })).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(10);
    await pending;
  });

  it('sanitizes network and JSON errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Bearer SECRET private prompt'));
    await expect(generateGeminiText('private prompt')).rejects.toThrow(/^AI service error$/);
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: () => { throw new Error('SECRET'); } } as any);
    await expect(generateGeminiText('private prompt')).rejects.toThrow(/^AI service error$/);
    expect(console.error).not.toHaveBeenCalled();
  });

  it.each(['', '   ', undefined])('rejects missing OpenRouter credentials without Gemini fallback: %s', async key => {
    vi.stubEnv('OPENROUTER_API_KEY', key);
    await expect(generateGeminiText('private prompt')).rejects.toThrow('not configured');
    expect(fetch).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each(['invalid', '', 'OPENROUTER'])('rejects explicit invalid provider %s without sending data', async provider => {
    vi.stubEnv('REPORT_AI_PROVIDER', provider);
    await expect(generateGeminiText('private prompt')).rejects.toThrow('Invalid report AI provider');
    expect(fetch).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each([undefined, 'gemini'])('preserves Gemini defaults with selector %s', async provider => {
    vi.stubEnv('REPORT_AI_PROVIDER', provider);
    generateContent.mockResolvedValue({ text: 'Gemini result' });
    expect(await generateGeminiText('prompt')).toBe('Gemini result');
    expect(generateContent).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-2.5-flash' }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('redacts Gemini SDK errors while preserving configured integration-to-direct fallback', async () => {
    vi.stubEnv('REPORT_AI_PROVIDER', undefined);
    vi.stubEnv('AI_INTEGRATIONS_GEMINI_API_KEY', 'unit-integration-key');
    vi.stubEnv('AI_INTEGRATIONS_GEMINI_BASE_URL', 'https://example.invalid');
    generateContent.mockRejectedValueOnce(new Error('SECRET prompt')).mockResolvedValueOnce({ text: 'recovered' });
    expect(await generateGeminiText('prompt')).toBe('recovered');
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith('AI generation failed', { type: 'provider_error' });
  });
});
