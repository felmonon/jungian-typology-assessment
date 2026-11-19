import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  processQueuedRecoveryEmails,
  queueCheckoutRecoveryEmail,
  RECOVERY_SEND_DELAY_MS,
  recoverySendAfter,
} from '../../api/_lib/recovery-emails';
import { sendCheckoutRecoveryEmail } from '../../server/resend';

vi.mock('../../server/resend', () => ({ sendCheckoutRecoveryEmail: vi.fn() }));

type Call = { table: string; op: string; payload?: unknown; filters: Array<[string, string, unknown]> };

// Minimal chainable Supabase stand-in. `rows` answers selects per table.
function fakeSupabase(rows: Record<string, unknown[]> = {}) {
  const calls: Call[] = [];
  const from = (table: string) => {
    const call: Call = { table, op: 'select', filters: [] };
    calls.push(call);
    const builder: any = {
      select: () => builder,
      upsert: (payload: unknown) => { call.op = 'upsert'; call.payload = payload; return builder; },
      update: (payload: unknown) => { call.op = 'update'; call.payload = payload; return builder; },
      eq: (column: string, value: unknown) => { call.filters.push(['eq', column, value]); return builder; },
      gt: (column: string, value: unknown) => { call.filters.push(['gt', column, value]); return builder; },
      lte: (column: string, value: unknown) => { call.filters.push(['lte', column, value]); return builder; },
      order: () => builder,
      limit: () => builder,
      then: (resolve: (value: unknown) => void) =>
        resolve({ data: call.op === 'select' ? rows[table] || [] : null, error: null }),
    };
    return builder;
  };
  return { client: { from } as any, calls };
}

const expiredSession = (metadata: Record<string, string> = {}) => ({
  id: 'cs_expired_1',
  cancel_url: 'https://typejung.com/checkout/insight?checkout=cancelled',
  customer_email: 'reader@example.com',
  metadata: {
    tier: 'insight',
    source: 'checkout_review',
    recovery_email_consent: 'site_opt_in',
    recovery_email_consent_version: 'checkout_link_if_unfinished_v1',
    recovery_email_consent_at: '2026-11-18T11:00:00.000Z',
    ...metadata,
  },
});

describe('recovery email timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-18T12:00:00.000Z'));
    vi.mocked(sendCheckoutRecoveryEmail).mockReset().mockResolvedValue({ sent: true, id: 'email_1' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues with send_after at the expiry time, not an hour later', () => {
    expect(RECOVERY_SEND_DELAY_MS).toBe(0);
    expect(recoverySendAfter(new Date('2026-11-18T12:00:00.000Z'))).toBe('2026-11-18T12:00:00.000Z');
  });

  it('sends straight away when the expired-session webhook queues it', async () => {
    const { client, calls } = fakeSupabase();
    const result = await queueCheckoutRecoveryEmail(client, expiredSession());

    expect(result).toMatchObject({ queued: true, sent: true, sendReason: 'sent' });
    const upsert = calls.find((call) => call.op === 'upsert');
    expect(upsert?.payload).toMatchObject({
      status: 'queued',
      consent_source: 'site',
      send_after: '2026-11-18T12:00:00.000Z',
      metadata: expect.objectContaining({
        consent_version: 'checkout_link_if_unfinished_v1',
        consent_recorded_at: '2026-11-18T11:00:00.000Z',
      }),
    });
    expect(sendCheckoutRecoveryEmail).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      toEmail: 'reader@example.com',
      tier: 'insight',
      priceLabel: 'CA$7',
      consentSource: 'site',
      idempotencyKey: 'checkout-recovery:cs_expired_1',
    }));
    const update = calls.find((call) => call.op === 'update');
    expect(update?.payload).toMatchObject({ status: 'sent', resend_email_id: 'email_1' });
    expect(update?.filters).toContainEqual(['eq', 'stripe_session_id', 'cs_expired_1']);
  });

  it('leaves the row queued for the daily cron when the immediate send throws', async () => {
    vi.mocked(sendCheckoutRecoveryEmail).mockRejectedValueOnce(new Error('resend down'));
    const { client, calls } = fakeSupabase();
    const result = await queueCheckoutRecoveryEmail(client, expiredSession());

    expect(result).toMatchObject({ queued: true, sent: false, sendReason: 'retry_later' });
    const update = calls.find((call) => call.op === 'update');
    expect(update?.payload).not.toHaveProperty('status');
    expect(update?.payload).toMatchObject({ error_message: 'resend down' });
  });

  it('can queue without sending', async () => {
    const { client } = fakeSupabase();
    const result = await queueCheckoutRecoveryEmail(client, expiredSession(), { sendNow: false });
    expect(result).toEqual({ queued: true });
    expect(sendCheckoutRecoveryEmail).not.toHaveBeenCalled();
  });

  it('never sends without consent', async () => {
    const { client, calls } = fakeSupabase();
    const result = await queueCheckoutRecoveryEmail(client, expiredSession({ recovery_email_consent: 'none' }));
    expect(result).toMatchObject({ queued: false, skipped: true, reason: 'missing_consent' });
    expect(sendCheckoutRecoveryEmail).not.toHaveBeenCalled();
    expect(calls.find((call) => call.op === 'upsert')?.payload).toMatchObject({ status: 'skipped' });
  });

  it('skips people who already bought', async () => {
    const { client } = fakeSupabase({ purchases: [{ id: 'purchase_1' }] });
    const result = await queueCheckoutRecoveryEmail(client, expiredSession());
    expect(result).toMatchObject({ queued: false, reason: 'already_purchased' });
    expect(sendCheckoutRecoveryEmail).not.toHaveBeenCalled();
  });

  it('keeps the daily cron as a backstop for due rows', async () => {
    const { client, calls } = fakeSupabase({
      recovery_emails: [{
        id: 'row_1',
        stripe_session_id: 'cs_old',
        customer_email: 'reader@example.com',
        tier: 'mastery',
        recovery_url: 'https://typejung.com/checkout/mastery?checkout=recovery',
        consent_source: 'stripe',
      }],
    });
    const counters = await processQueuedRecoveryEmails(client);
    expect(counters).toMatchObject({ considered: 1, sent: 1, failed: 0 });
    expect(sendCheckoutRecoveryEmail).toHaveBeenCalledWith(expect.objectContaining({ priceLabel: 'CA$19' }));
    const lookup = calls.find((call) => call.table === 'recovery_emails' && call.op === 'select');
    expect(lookup?.filters).toContainEqual(['lte', 'send_after', '2026-11-18T12:00:00.000Z']);
    expect(calls.find((call) => call.op === 'update')?.filters).toContainEqual(['eq', 'id', 'row_1']);
  });
});
