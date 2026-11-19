import { beforeEach, describe, expect, it, vi } from 'vitest';
import { enforceRateLimit, enforceSharedRateLimit } from '../../api/_lib/rate-limit';
import { FakeSupabase, response } from './fake-supabase';

const state = vi.hoisted(() => ({ db: null as any, configured: true }));

vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: () => state.configured,
  getSupabaseAdminClient: () => state.db,
}));

let ipCounter = 0;
const request = (ip: string) => ({ method: 'POST', headers: { 'x-real-ip': ip } }) as any;
const config = { keyPrefix: 'test:limit', limit: 2, windowMs: 60_000 };

beforeEach(() => {
  state.db = new FakeSupabase();
  state.configured = true;
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('shared rate limit', () => {
  it('counts in Postgres so the limit holds across instances', async () => {
    const counts = new Map<string, number>();
    const calls: any[] = [];
    state.db.rpcHandler = (name: string, args: any) => {
      calls.push({ name, args });
      const count = (counts.get(args.p_key) || 0) + 1;
      counts.set(args.p_key, count);
      return { data: [{ count, reset_at: new Date(Date.now() + 60_000).toISOString() }], error: null };
    };
    const ip = `10.0.0.${++ipCounter}`;

    expect(await enforceSharedRateLimit(request(ip), response(), config)).toBe(false);
    expect(await enforceSharedRateLimit(request(ip), response(), config)).toBe(false);
    const blocked = response();
    expect(await enforceSharedRateLimit(request(ip), blocked, config)).toBe(true);

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['retry-after']).toBeTruthy();
    expect(calls[0]).toMatchObject({ name: 'rate_limit_hit', args: { p_window_ms: 60_000 } });
    // The raw IP is never sent to the database.
    expect(calls[0].args.p_key).toMatch(/^test:limit:[0-9a-f]{32}$/);
    expect(calls[0].args.p_key).not.toContain(ip);
  });

  it('falls back to the in-memory limit when the RPC fails', async () => {
    state.db.rpcHandler = () => ({ data: null, error: { code: 'PGRST202', message: 'function not found' } });
    const ip = `10.0.1.${++ipCounter}`;

    expect(await enforceSharedRateLimit(request(ip), response(), config)).toBe(false);
    expect(await enforceSharedRateLimit(request(ip), response(), config)).toBe(false);
    const blocked = response();
    expect(await enforceSharedRateLimit(request(ip), blocked, config)).toBe(true);
    expect(blocked.statusCode).toBe(429);
  });

  it('falls back when Supabase is not configured', async () => {
    state.configured = false;
    const ip = `10.0.2.${++ipCounter}`;
    await enforceSharedRateLimit(request(ip), response(), config);
    await enforceSharedRateLimit(request(ip), response(), config);
    expect(await enforceSharedRateLimit(request(ip), response(), config)).toBe(true);
  });

  it('keeps the synchronous in-memory export unchanged', () => {
    const ip = `10.0.3.${++ipCounter}`;
    expect(enforceRateLimit(request(ip), response(), config)).toBe(false);
    expect(enforceRateLimit(request(ip), response(), config)).toBe(false);
    expect(enforceRateLimit(request(ip), response(), config)).toBe(true);
  });
});
