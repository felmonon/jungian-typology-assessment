import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { send, lookup, upsert } = vi.hoisted(() => ({
  send: vi.fn(),
  lookup: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send } };
  }),
}));

vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: vi.fn(() => true),
  getSupabaseAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn((_column: string, email: string) => ({ maybeSingle: () => lookup(email) })),
      })),
      upsert,
    })),
  })),
}));

import {
  sendCheckoutRecoveryEmail,
  sendDebriefRequestNotification,
  sendDiscountLeadEmail,
  sendDiscountLeadFollowupEmail,
  sendLifecycleEmail,
  sendPdfEmail,
} from '../../server/resend';
import { createUnsubscribeToken, verifyUnsubscribeToken } from '../../server/email-suppression';
import { handleUnsubscribe } from '../../api/_lib/unsubscribe';

process.env.RESEND_API_KEY = 'test-resend-key';
process.env.RESEND_FROM_EMAIL = 'hello@typejung.test';

const reader = 'Reader@Example.com';

function lastPayload() {
  return send.mock.calls[send.mock.calls.length - 1][0];
}

const marketingSends: [string, () => Promise<unknown>][] = [
  ['lifecycle', () => sendLifecycleEmail({ kind: 'result-ready', toEmail: reader })],
  ['discount lead', () => sendDiscountLeadEmail({ toEmail: reader, discountCode: 'MAP15', percentOff: 15 })],
  ['first follow-up', () => sendDiscountLeadFollowupEmail({
    toEmail: reader, discountCode: 'MAP15', percentOff: 15, actionUrl: 'https://typejung.com/pricing', actionLabel: 'Compare',
  })],
  ['late follow-up', () => sendDiscountLeadFollowupEmail({
    toEmail: reader, discountCode: 'MAP15', percentOff: 15, actionUrl: 'https://typejung.com/pricing', actionLabel: 'Compare', stage: 'fourth',
  })],
  ['checkout recovery', () => sendCheckoutRecoveryEmail({ toEmail: reader, recoveryUrl: 'https://typejung.com/checkout/insight' })],
];

beforeEach(() => {
  send.mockResolvedValue({ data: { id: 'email_1' }, error: null });
  lookup.mockResolvedValue({ data: null, error: null });
  upsert.mockResolvedValue({ error: null });
});

describe('sendCustomerEmail routing', () => {
  it.each(marketingSends)('%s email carries the footer and one-click unsubscribe headers', async (_name, run) => {
    await expect(run()).resolves.toEqual({ sent: true, id: 'email_1' });

    const payload = lastPayload();
    const listUnsubscribe = payload.headers['List-Unsubscribe'];
    const url = listUnsubscribe.slice(1, -1);
    expect(listUnsubscribe).toMatch(/^<https:\/\/typejung\.com\/api\/unsubscribe\?token=.+>$/);
    expect(payload.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(payload.html).toContain('Unsubscribe from TypeJung emails');
    expect(payload.html).toContain('TypeJung · typejung.com');
    expect(payload.text).toContain(`Unsubscribe: ${url}`);
    expect(verifyUnsubscribeToken(new URL(url).searchParams.get('token'))).toBe('reader@example.com');
    expect(lookup).toHaveBeenCalledWith('reader@example.com');
  });

  it.each(marketingSends)('%s email is skipped for an unsubscribed address', async (_name, run) => {
    lookup.mockResolvedValue({ data: { reason: 'unsubscribe' }, error: null });

    await expect(run()).resolves.toEqual({ sent: false, skipped: true, reason: 'email_suppressed' });
    expect(send).not.toHaveBeenCalled();
  });

  it('skips marketing mail when the suppression lookup fails', async () => {
    lookup.mockResolvedValue({ data: null, error: { code: 'XX000', message: 'connection reset' } });

    await expect(sendLifecycleEmail({ kind: 'result-ready', toEmail: reader }))
      .resolves.toEqual({ sent: false, skipped: true, reason: 'suppression_check_failed' });
    expect(send).not.toHaveBeenCalled();
  });

  it('keeps sending while migration 0019 has not been applied', async () => {
    lookup.mockResolvedValue({ data: null, error: { code: 'PGRST205', message: "Could not find the table 'public.email_suppressions' in the schema cache" } });

    await expect(sendLifecycleEmail({ kind: 'result-ready', toEmail: reader })).resolves.toMatchObject({ sent: true });
  });

  it('still delivers a requested PDF report to an unsubscribed reader, without unsubscribe headers', async () => {
    lookup.mockResolvedValue({ data: { reason: 'unsubscribe' }, error: null });

    await sendPdfEmail(reader, Buffer.from('pdf'), '<b>Sam</b>', 'Ni');

    const payload = lastPayload();
    expect(payload.headers).toBeUndefined();
    expect(payload.attachments[0].filename).toBe('jungian-typology-results.pdf');
    expect(payload.html).toContain('&lt;b&gt;Sam&lt;/b&gt;');
    expect(payload.html).not.toContain('Unsubscribe');
  });

  it('refuses a PDF report to a bounced address', async () => {
    lookup.mockResolvedValue({ data: { reason: 'bounce' }, error: null });

    await expect(sendPdfEmail(reader, Buffer.from('pdf'), 'Sam', 'Ni')).rejects.toThrow('email_suppressed');
    expect(send).not.toHaveBeenCalled();
  });

  it('sends the founder debrief notification without a suppression lookup or footer', async () => {
    await sendDebriefRequestNotification({ requestId: 'req_1', customerEmail: reader });

    const payload = lastPayload();
    expect(lookup).not.toHaveBeenCalled();
    expect(payload.replyTo).toBe(reader);
    expect(payload.headers).toBeUndefined();
    expect(payload.html).not.toContain('Unsubscribe');
  });

  it('leaves exactly one Resend send call in the server and API code', () => {
    const root = path.resolve(__dirname, '../..');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (full.endsWith('.ts')) files.push(full);
      }
    };
    ['server', 'api'].forEach(dir => walk(path.join(root, dir)));
    files.push(path.join(root, 'server.ts'), path.join(root, 'server-prod.ts'));

    const sendSites = files.flatMap(file => (readFileSync(file, 'utf8').match(/emails\.send\(/g) || []).map(() => path.relative(root, file)));
    expect(sendSites).toEqual(['server/resend.ts']);
  });
});

describe('unsubscribe tokens', () => {
  it('normalizes the address and rejects tampering', () => {
    const token = createUnsubscribeToken(' Reader@Example.com ');
    expect(verifyUnsubscribeToken(token)).toBe('reader@example.com');

    const [, signature] = token.split('.');
    const forged = `${Buffer.from('someone@example.com').toString('base64url')}.${signature}`;
    expect(verifyUnsubscribeToken(forged)).toBeNull();
    expect(verifyUnsubscribeToken(`${token}x`)).toBeNull();
    expect(verifyUnsubscribeToken(undefined)).toBeNull();
  });
});

describe('unsubscribe endpoint', () => {
  const response = () => {
    const res: any = { statusCode: 200, body: '', headers: {} };
    res.status = (status: number) => { res.statusCode = status; return res; };
    res.send = (body: string) => { res.body = body; return res; };
    res.json = (body: unknown) => { res.body = body; return res; };
    res.setHeader = (key: string, value: string) => { res.headers[key] = value; };
    return res;
  };

  it('shows a confirm button on GET without unsubscribing', async () => {
    const res = response();
    await handleUnsubscribe({ method: 'GET', query: { token: createUnsubscribeToken(reader) } } as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('<form method="post"');
    expect(res.body).toContain('reader@example.com');
    expect(upsert).not.toHaveBeenCalled();
  });

  it('records the suppression on POST, as mail clients send for one-click unsubscribe', async () => {
    const res = response();
    await handleUnsubscribe({ method: 'POST', query: { token: createUnsubscribeToken(reader) }, body: 'List-Unsubscribe=One-Click' } as any, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain('You are unsubscribed');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'reader@example.com', reason: 'unsubscribe', source: 'unsubscribe_link' }),
      { onConflict: 'email' },
    );
  });

  it('rejects an invalid token', async () => {
    const res = response();
    await handleUnsubscribe({ method: 'POST', query: { token: 'bad.token' } } as any, res);

    expect(res.statusCode).toBe(400);
    expect(upsert).not.toHaveBeenCalled();
  });
});
