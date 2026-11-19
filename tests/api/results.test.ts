import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { MAX_RESULT_PAYLOAD_BYTES, validateResultInput } from '../../api/results';
import { enforceSharedRateLimit } from '../../api/_lib/rate-limit';
import { FakeSupabase, response } from './fake-supabase';

const state = vi.hoisted(() => ({ db: null as any }));

vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: () => true,
  getSupabaseAdminClient: () => state.db,
}));
vi.mock('../../api/_lib/auth', () => ({ getSessionUser: vi.fn(async () => null) }));
vi.mock('../../api/_lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(() => false),
  enforceSharedRateLimit: vi.fn(async () => false),
}));

const score = (fn: string, value: number) => ({ function: fn, score: value });
const validResult = () => ({
  scores: ['Ni', 'Te', 'Fi', 'Se', 'Ne', 'Ti', 'Fe', 'Si'].map((fn, i) => score(fn, 90 - i * 10)),
  stack: { dominant: score('Ni', 90), auxiliary: score('Te', 80), tertiary: score('Fi', 70), inferior: score('Se', 60), resultVersion: 'depth-energy-map' },
  attitudeScore: -12,
  isUndifferentiated: false,
});

async function share(body: Record<string, unknown>) {
  const res = response();
  await handler({ method: 'POST', headers: {}, body: { ...body, shareOnly: true }, query: {} } as any, res);
  return res;
}

beforeEach(() => {
  state.db = new FakeSupabase({ assessment_results: [] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('results share-only insert', () => {
  it('stores a valid anonymous share result', async () => {
    const res = await share(validResult());
    expect(res.statusCode).toBe(201);
    expect(state.db.rows('assessment_results')).toHaveLength(1);
    expect(state.db.rows('assessment_results')[0].user_id).toBeNull();
  });

  it('rejects an oversized result without storing it', async () => {
    const body = validResult();
    (body.stack as any).depthResult = { blob: 'x'.repeat(MAX_RESULT_PAYLOAD_BYTES) };
    const res = await share(body);
    expect(res.statusCode).toBe(400);
    expect(state.db.rows('assessment_results')).toHaveLength(0);
  });

  it.each([
    ['scores that are not function scores', { scores: [{ any: 'json' }] }],
    ['an unknown function code', { scores: [score('Xx', 1)] }],
    ['a stack missing a position', { stack: { dominant: score('Ni', 1) } }],
    ['a non-numeric attitude score', { attitudeScore: 'loud' }],
    ['a non-boolean undifferentiated flag', { isUndifferentiated: 'yes' }],
  ])('rejects %s', async (_label, override) => {
    const res = await share({ ...validResult(), ...override });
    expect(res.statusCode).toBe(400);
    expect(state.db.rows('assessment_results')).toHaveLength(0);
  });

  it('is rate limited', async () => {
    vi.mocked(enforceSharedRateLimit).mockImplementationOnce(async (_req, res: any) => {
      res.status(429).json({ error: 'Too many share links. Please try again later.' });
      return true;
    });
    const res = await share(validResult());
    expect(res.statusCode).toBe(429);
    expect(state.db.rows('assessment_results')).toHaveLength(0);
    expect(vi.mocked(enforceSharedRateLimit).mock.calls[0][2]).toMatchObject({ keyPrefix: 'results:share' });
  });

  it('accepts a null attitude score, which the browser sends when it cannot compute one', () => {
    expect(validateResultInput({ ...validResult(), attitudeScore: null }).ok).toBe(true);
  });
});
