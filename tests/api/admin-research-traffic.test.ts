import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/admin/[action]';

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('../../api/_lib/auth-utils', () => ({ getSessionUserFromCookie: vi.fn().mockResolvedValue({ isAdmin: true }) }));
vi.mock('../../api/_lib/supabase', () => ({ hasSupabaseAdminConfig: () => true, getSupabaseAdminClient: () => ({ from: mocks.from }) }));
vi.mock('../../api/_lib/browser-funnel', () => ({ loadBrowserFunnel: vi.fn().mockResolvedValue({ researchExcludedBrowsers: 1 }) }));

describe('admin research intent separation', () => {
  beforeEach(() => {
    const shared = { status: 'stripe_created', stripe_session_id: 'cs_fixture', tier: 'insight', amount: 700, created_at: '2026-10-27T12:00:00Z' };
    const tables: Record<string, unknown[]> = {
      purchases: [
        { id: 'purchase_customer', amount: 700, tier: 'insight' },
        { id: 'purchase_study', amount: 700, tier: 'insight', utm_source: 'typejung_research', utm_campaign: 'offer_observation_2026_10' },
      ],
      discount_leads: [],
      checkout_intents: [
        { ...shared, id: 'study', utm_source: 'typejung_research', utm_campaign: 'offer_observation_2026_10' },
        { ...shared, id: 'null-attribution', utm_source: null, utm_campaign: null },
        { ...shared, id: 'missing-attribution' },
        { ...shared, id: 'different-source', utm_source: 'newsletter', utm_campaign: 'offer_observation_2026_10' },
        { ...shared, id: 'different-campaign', utm_source: 'typejung_research', utm_campaign: 'another_campaign' },
      ],
    };
    mocks.from.mockImplementation((table: string) => {
      const result = { data: tables[table] || [], error: null, count: 5 };
      const query: any = { then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve) };
      for (const name of ['select', 'eq', 'gt', 'order', 'limit']) query[name] = vi.fn(() => query);
      return query;
    });
  });

  it('removes only exact study intents while preserving accounting and ordinary NULL-UTM rows', async () => {
    const res: any = { statusCode: 200, body: null, setHeader: vi.fn() };
    res.status = (status: number) => { res.statusCode = status; return res; };
    res.json = (body: unknown) => { res.body = body; return res; };
    await handler({ method: 'GET', headers: {}, query: { action: 'stats' } } as any, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      checkoutIntentCount: 4,
      researchCheckoutIntentsExcluded: 1,
      purchaseCount: 2,
      revenueCad: 14,
      userCount: 5,
      assessmentCount: 5,
    });
  });
});
