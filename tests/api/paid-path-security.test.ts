import { Readable } from 'stream';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import webhookHandler from '../../api/webhook';
import verifySessionHandler from '../../api/verify-session';
import { createMasteryUpgradeSession } from '../../api/_lib/mastery-upgrade';
import {
  findCompletedPurchaseForUser,
  findPurchaseUserId,
  isCheckoutSessionRedeemableBy,
  recordCheckoutPurchase,
} from '../../api/_lib/purchases';
import { getSessionUserFromCookie } from '../../api/_lib/auth-utils';
import { FakeSupabase, response } from './fake-supabase';

const state = vi.hoisted(() => ({
  db: null as any,
  stripeSessions: {} as Record<string, any>,
}));

vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: () => true,
  getSupabaseAdminClient: () => state.db,
}));
vi.mock('../../api/_lib/auth-utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../api/_lib/auth-utils')>(),
  getSessionUserFromCookie: vi.fn(async () => null),
}));
vi.mock('../../api/_lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(() => false),
  enforceSharedRateLimit: vi.fn(async () => false),
}));
vi.mock('../../api/_lib/checkout-intents', () => ({
  markCheckoutIntentCompleted: vi.fn(async () => undefined),
  markCheckoutIntentExpired: vi.fn(async () => undefined),
}));
vi.mock('../../api/_lib/funnel-events', () => ({ recordFunnelEvent: vi.fn(async () => undefined) }));
vi.mock('../../api/_lib/recovery-emails', () => ({ queueCheckoutRecoveryEmail: vi.fn(async () => ({ queued: false })) }));
vi.mock('../../api/_lib/report-availability', () => ({ guardPaidReportCheckout: vi.fn(async () => true) }));
vi.mock('../../server/resend', () => ({ sendDebriefRequestNotification: vi.fn(async () => undefined) }));
vi.mock('@vercel/analytics/server', () => ({ track: vi.fn(async () => undefined) }));
vi.mock('stripe', () => ({
  default: class {
    webhooks = {
      constructEvent: (body: Buffer, signature: string) => {
        if (signature !== 'valid-signature') throw new Error('No signatures found matching the expected signature');
        return JSON.parse(body.toString());
      },
    };
    checkout = {
      sessions: { retrieve: async (id: string) => state.stripeSessions[id] },
    };
  },
}));

const BUYER = 'buyer@example.com';

function paidSession(id: string, overrides: Record<string, any> = {}) {
  return {
    id,
    payment_status: 'paid',
    status: 'complete',
    amount_total: 1400,
    currency: 'cad',
    payment_intent: `pi_${id}`,
    customer_details: { email: BUYER },
    metadata: { product: 'typejung_premium', tier: 'insight', source: 'results' },
    ...overrides,
  };
}

function webhookRequest(event: unknown, signature = 'valid-signature') {
  return Object.assign(Readable.from([Buffer.from(JSON.stringify(event))]), {
    method: 'POST',
    headers: { 'stripe-signature': signature },
  });
}

async function deliver(event: unknown, signature?: string) {
  const res = response();
  await webhookHandler(webhookRequest(event, signature) as any, res);
  return res;
}

const completedEvent = (id: string, type = 'checkout.session.completed') => ({
  id: `evt_${id}_${type}`,
  type,
  data: { object: { id } },
});

function stubStripeFetch(extra?: (url: string, init?: any) => any) {
  vi.mocked(fetch).mockImplementation(async (input: any, init?: any) => {
    const url = String(input);
    const custom = extra?.(url, init);
    if (custom) return custom;
    const match = url.match(/checkout\/sessions\/([^?]+)/);
    const session = match ? state.stripeSessions[match[1]] : undefined;
    return {
      ok: Boolean(session),
      status: session ? 200 : 404,
      json: async () => session || { error: { message: 'No such checkout.session: secret detail' } },
    } as any;
  });
}

async function verify(sessionId: unknown, user: any = null) {
  vi.mocked(getSessionUserFromCookie).mockResolvedValue(user);
  const res = response();
  await verifySessionHandler({ method: 'POST', headers: {}, body: { sessionId }, query: {} } as any, res);
  return res;
}

beforeEach(() => {
  state.db = new FakeSupabase({ users: [], purchases: [] });
  state.stripeSessions = {};
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  vi.mocked(getSessionUserFromCookie).mockResolvedValue(null);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  stubStripeFetch();
});

describe('Stripe webhook', () => {
  it('rejects a bad signature without recording anything or echoing the error', async () => {
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');
    const res = await deliver(completedEvent('cs_test_a'), 'forged');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid webhook signature' });
    expect(state.db.rows('purchases')).toHaveLength(0);
  });

  it('records one purchase across redeliveries and keeps its account binding', async () => {
    state.db.rows('users').push({ id: 'user_owner', email: BUYER, google_id: 'g_1' });
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');

    await deliver(completedEvent('cs_test_a'));
    state.db.rows('users')[0].email = 'changed@example.com';
    const res = await deliver(completedEvent('cs_test_a'));

    expect(res.statusCode).toBe(200);
    expect(state.db.rows('purchases')).toHaveLength(1);
    expect(state.db.rows('purchases')[0]).toMatchObject({
      stripe_session_id: 'cs_test_a',
      status: 'completed',
      user_id: 'user_owner',
    });
  });

  it('keeps a refunded purchase refunded when the completion event is redelivered', async () => {
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');
    await deliver(completedEvent('cs_test_a'));
    await deliver({ id: 'evt_refund', type: 'charge.refunded', data: { object: { payment_intent: 'pi_cs_test_a' } } });
    await deliver(completedEvent('cs_test_a'));

    expect(state.db.rows('purchases')[0].status).toBe('refunded');
  });

  it('grants access when a delayed payment settles, and not before', async () => {
    state.stripeSessions.cs_test_async = paidSession('cs_test_async', { payment_status: 'unpaid' });
    await deliver(completedEvent('cs_test_async'));
    expect(state.db.rows('purchases')).toHaveLength(0);

    state.stripeSessions.cs_test_async = paidSession('cs_test_async');
    const res = await deliver(completedEvent('cs_test_async', 'checkout.session.async_payment_succeeded'));

    expect(res.statusCode).toBe(200);
    expect(state.db.rows('purchases')[0]).toMatchObject({ status: 'completed', tier: 'insight' });
  });

  it('acknowledges a failed delayed payment without granting access', async () => {
    const res = await deliver({ id: 'evt_f', type: 'checkout.session.async_payment_failed', data: { object: { id: 'cs_test_f', metadata: {} } } });
    expect(res.statusCode).toBe(200);
    expect(state.db.rows('purchases')).toHaveLength(0);
  });
});

describe('verify-session', () => {
  it.each(['cs_test/../../v1/customers', 'pi_123', 'cs_test_a?expand[]=x', 'cs_', ''])('rejects the malformed session id %j before calling Stripe', async (sessionId) => {
    const res = await verify(sessionId);
    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not echo Stripe error text', async () => {
    const res = await verify('cs_test_missing');
    expect(res.statusCode).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain('secret detail');
  });

  it('stays locked after a refund even though Stripe still reports the session paid', async () => {
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');
    await deliver(completedEvent('cs_test_a'));
    await deliver({ id: 'evt_refund', type: 'charge.refunded', data: { object: { payment_intent: 'pi_cs_test_a' } } });

    const res = await verify('cs_test_a');

    expect(res.body).toMatchObject({ paid: false, status: 'refunded' });
    expect(state.db.rows('purchases')[0].status).toBe('refunded');
  });

  it('never rebinds a purchase that belongs to another account', async () => {
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');
    state.db.rows('purchases').push({ id: 'p1', stripe_session_id: 'cs_test_a', user_id: 'user_owner', status: 'completed', tier: 'insight' });

    const res = await verify('cs_test_a', { id: 'user_attacker', email: 'attacker@example.com' });

    expect(res.statusCode).toBe(403);
    expect(state.db.rows('purchases')[0].user_id).toBe('user_owner');
  });

  it('returns the buyer email only to the account the purchase is bound to', async () => {
    state.stripeSessions.cs_test_a = paidSession('cs_test_a');

    const anonymous = await verify('cs_test_a');
    expect(anonymous.body.paid).toBe(true);
    expect(anonymous.body).not.toHaveProperty('customerEmail');

    const owner = await verify('cs_test_a', { id: 'user_owner', email: BUYER });
    expect(owner.body.customerEmail).toBe(BUYER);
    expect(state.db.rows('purchases')[0].user_id).toBe('user_owner');
  });
});

describe('mastery upgrade guard', () => {
  async function upgrade(body: Record<string, unknown>, user: any = null) {
    vi.mocked(getSessionUserFromCookie).mockResolvedValue(user);
    stubStripeFetch((url, init) => (init?.method === 'POST'
      ? { ok: true, status: 200, json: async () => ({ id: 'cs_test_upgrade', url: 'https://checkout.stripe.test/upgrade' }) }
      : null));
    const res = response();
    await createMasteryUpgradeSession({ method: 'POST', headers: { host: 'typejung.com' }, body } as any, res);
    const createdCheckout = vi.mocked(fetch).mock.calls.some(([, init]: any) => init?.method === 'POST');
    return { res, createdCheckout };
  }

  it('refuses an anonymous caller with no Insight purchase', async () => {
    const { res, createdCheckout } = await upgrade({ email: 'anyone@example.com' });
    expect(res.statusCode).toBe(403);
    expect(createdCheckout).toBe(false);
  });

  it('refuses the session of a refunded Insight purchase', async () => {
    state.db.rows('purchases').push({ id: 'p1', stripe_session_id: 'cs_test_a', status: 'refunded', tier: 'insight' });
    const { res, createdCheckout } = await upgrade({ sessionId: 'cs_test_a' });
    expect(res.statusCode).toBe(403);
    expect(createdCheckout).toBe(false);
  });

  it('refuses a Mastery session, which has nothing to upgrade', async () => {
    state.db.rows('purchases').push({ id: 'p1', stripe_session_id: 'cs_test_m', status: 'completed', tier: 'mastery' });
    const { res } = await upgrade({ sessionId: 'cs_test_m' });
    expect(res.statusCode).toBe(403);
  });

  it('sells the upgrade to the holder of a completed Insight session', async () => {
    state.db.rows('purchases').push({ id: 'p1', stripe_session_id: 'cs_test_a', status: 'completed', tier: 'insight', customer_email: BUYER });
    const { res, createdCheckout } = await upgrade({ sessionId: 'cs_test_a' });
    expect(res.statusCode).toBe(200);
    expect(createdCheckout).toBe(true);
  });

  it('checks Stripe when the Insight purchase is not recorded yet', async () => {
    state.stripeSessions.cs_test_new = paidSession('cs_test_new');
    const { res } = await upgrade({ sessionId: 'cs_test_new' });
    expect(res.statusCode).toBe(200);
  });

  it('sells the upgrade to a signed-in account that owns Insight', async () => {
    state.db.rows('users').push({ id: 'user_owner', email: BUYER });
    state.db.rows('purchases').push({ id: 'p1', user_id: 'user_owner', status: 'completed', tier: 'insight' });
    const { res } = await upgrade({}, { id: 'user_owner', email: BUYER });
    expect(res.statusCode).toBe(200);
  });
});

describe('purchase access by email', () => {
  it('links a guest purchase only to an account whose email a provider verified', async () => {
    state.db.rows('users').push({ id: 'user_password', email: BUYER, password_hash: '$2b$10$x' });
    expect(await findPurchaseUserId(state.db, null, BUYER)).toBeNull();

    state.db.rows('users')[0].email_verified_at = '2026-11-01T00:00:00Z';
    expect(await findPurchaseUserId(state.db, null, BUYER)).toBe('user_password');
  });

  it('does not unlock a guest purchase for an unverified account with the same email', async () => {
    state.db.rows('users').push({ id: 'user_squatter', email: BUYER, password_hash: '$2b$10$x' });
    state.db.rows('purchases').push({ id: 'p1', customer_email: BUYER, user_id: null, status: 'completed', tier: 'mastery' });

    expect(await findCompletedPurchaseForUser(state.db, { id: 'user_squatter', email: BUYER })).toBeNull();

    state.db.rows('users')[0].apple_id = 'apple_sub_1';
    expect(await findCompletedPurchaseForUser(state.db, { id: 'user_squatter', email: BUYER })).toMatchObject({ id: 'p1' });
  });

  it('keeps purchases reachable by account id regardless of email', async () => {
    state.db.rows('purchases').push({ id: 'p1', user_id: 'user_a', status: 'completed', tier: 'insight' });
    expect(await findCompletedPurchaseForUser(state.db, { id: 'user_a', email: 'other@example.com' })).toMatchObject({ id: 'p1' });
  });

  it('treats a refunded session as not redeemable', async () => {
    state.db.rows('purchases').push({ id: 'p1', stripe_session_id: 'cs_test_a', status: 'disputed', user_id: null });
    expect(await isCheckoutSessionRedeemableBy(state.db, 'cs_test_a', null)).toBe(false);
  });

  it('survives a concurrent insert of the same session', async () => {
    const session = paidSession('cs_test_race');
    state.db.rows('purchases').push({ id: 'p_race', stripe_session_id: 'cs_test_race', status: 'refunded', user_id: 'u1' });
    const recorded = await recordCheckoutPurchase(state.db, session as any, 'u2');
    expect(recorded).toMatchObject({ id: 'p_race', status: 'refunded', user_id: 'u1' });
    expect(state.db.rows('purchases')).toHaveLength(1);
  });
});
