import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/create-checkout-session';
import { generateGeminiText } from '../../api/_lib/gemini';
import { recordFunnelEvent } from '../../api/_lib/funnel-events';
import { guardPaidReportCheckout, resetReportAvailabilityCache } from '../../api/_lib/report-availability';

vi.mock('../../api/_lib/gemini', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/_lib/gemini')>()),
  generateGeminiText: vi.fn(),
}));
vi.mock('../../api/_lib/funnel-events', () => ({ recordFunnelEvent: vi.fn() }));
vi.mock('../../api/_lib/rate-limit', () => ({ enforceRateLimit: vi.fn(() => false) }));

const response = () => {
  const res: any = { statusCode: 200, body: null, headers: {} };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
  return res;
};

describe('report availability before payment', () => {
  beforeEach(() => {
    resetReportAvailabilityCache();
    vi.mocked(generateGeminiText).mockReset();
  });

  it.each([{ tier: 'insight' }, { tier: 'mastery' }, { product: 'mastery_upgrade' }])('does not contact Stripe during an outage: %j', async body => {
    vi.mocked(generateGeminiText).mockRejectedValue(new Error('credits depleted'));
    const res = response();
    await handler({ method: 'POST', headers: {}, body } as any, res);
    expect(res.statusCode).toBe(503);
    expect(res.body.code).toBe('reports_temporarily_unavailable');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('records each blocked checkout with its tier, source, and reason', async () => {
    vi.mocked(generateGeminiText).mockRejectedValue(new Error('billing account suspended'));
    const res = response();
    await handler({ method: 'POST', headers: {}, body: { tier: 'insight', source: 'results_locked_preview', anonymousId: 'anon_123' } } as any, res);

    expect(res.statusCode).toBe(503);
    expect(recordFunnelEvent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(recordFunnelEvent).mock.calls[0][1]).toMatchObject({
      eventName: 'checkout_guard_blocked',
      tier: 'insight',
      source: 'results_locked_preview',
      anonymousId: 'anon_123',
      properties: { reason: 'provider_error', attempts: 2 },
    });
  });

  it('records the provider status code so the outage cause is visible', async () => {
    vi.mocked(generateGeminiText).mockRejectedValue(Object.assign(new Error('model not found'), { status: 404 }));
    const res = response();

    expect(await guardPaidReportCheckout(res, { tier: 'insight' })).toBe(false);
    expect(vi.mocked(recordFunnelEvent).mock.calls[0][1]).toMatchObject({
      properties: { reason: 'provider_error', attempts: 2, provider_status: 404 },
    });
  });

  it('retries a quick provider failure once before blocking the buyer', async () => {
    vi.mocked(generateGeminiText)
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValueOnce('READY');
    const res = response();

    expect(await guardPaidReportCheckout(res)).toBe(true);
    expect(generateGeminiText).toHaveBeenCalledTimes(2);
    expect(res.body).toBeNull();
    expect(recordFunnelEvent).not.toHaveBeenCalled();
  });

  it('does not retry a probe that timed out', async () => {
    vi.mocked(generateGeminiText).mockRejectedValue(new Error('Request timeout after deadline'));
    const res = response();

    expect(await guardPaidReportCheckout(res, { tier: 'mastery', source: 'success_upsell' })).toBe(false);
    expect(generateGeminiText).toHaveBeenCalledTimes(1);
    expect(vi.mocked(recordFunnelEvent).mock.calls[0][1]).toMatchObject({
      properties: { reason: 'timeout', attempts: 1 },
    });
  });

  it('trusts a healthy probe for a few minutes, but never caches a failure', async () => {
    vi.mocked(generateGeminiText).mockResolvedValue('READY');
    expect(await guardPaidReportCheckout(response())).toBe(true);
    expect(await guardPaidReportCheckout(response())).toBe(true);
    expect(generateGeminiText).toHaveBeenCalledTimes(1);

    resetReportAvailabilityCache();
    vi.mocked(generateGeminiText).mockResolvedValue('Unable to generate analysis at this time.');
    expect(await guardPaidReportCheckout(response())).toBe(false);
    expect(await guardPaidReportCheckout(response())).toBe(false);
    // Each blocked attempt probed again (two quick attempts each).
    expect(generateGeminiText).toHaveBeenCalledTimes(5);
  });

  it('allows recovered generation using a deadline accepted by Gemini', async () => {
    vi.mocked(generateGeminiText).mockImplementation(async (_prompt, options) => {
      if (options?.timeoutMs !== undefined && options.timeoutMs < 10000) {
        throw new Error('Minimum allowed deadline is 10s.');
      }
      return 'READY';
    });
    const res = response();
    expect(await guardPaidReportCheckout(res)).toBe(true);
    expect(res.body).toBeNull();
  });

  it('rejects empty or incomplete readiness responses', async () => {
    vi.mocked(generateGeminiText).mockResolvedValue('Unable to generate analysis at this time.');
    expect(await guardPaidReportCheckout(response())).toBe(false);
  });

  it('validates the tier before spending a provider request', async () => {
    const res = response();
    await handler({ method: 'POST', headers: {}, body: { tier: 'invalid' } } as any, res);
    expect(res.statusCode).toBe(400);
    expect(generateGeminiText).not.toHaveBeenCalled();
  });
});
