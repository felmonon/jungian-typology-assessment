import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import handler from '../../api/auth/[action]';
import { FakeSupabase, response } from './fake-supabase';

const state = vi.hoisted(() => ({ db: null as any }));

vi.mock('../../api/_lib/supabase', () => ({
  hasSupabaseAdminConfig: () => true,
  getSupabaseAdminClient: () => state.db,
}));
vi.mock('../../api/_lib/rate-limit', () => ({
  enforceRateLimit: vi.fn(() => false),
  enforceSharedRateLimit: vi.fn(async () => false),
}));
vi.mock('../../api/_lib/recovery-emails', () => ({ processQueuedRecoveryEmails: vi.fn() }));
vi.mock('../../server/resend', () => ({
  sendDiscountLeadEmail: vi.fn(),
  sendDiscountLeadFollowupEmail: vi.fn(),
  sendLifecycleEmail: vi.fn(),
}));

const EMAIL = 'owner@example.com';

async function call(action: string, req: Record<string, any> = {}) {
  const res = response();
  await handler({ method: 'POST', headers: { host: 'typejung.com' }, body: {}, ...req, query: { action, ...(req.query || {}) } } as any, res);
  return res;
}

function setCookies(res: any): string[] {
  const value = res.headers['set-cookie'];
  return Array.isArray(value) ? value : value ? [value] : [];
}

beforeEach(() => {
  state.db = new FakeSupabase({ users: [], sessions: [] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('password signup', () => {
  it('cannot claim a row created by Apple sign-in', async () => {
    state.db.rows('users').push({ id: 'user_apple', email: EMAIL, password_hash: null, google_id: null, first_name: 'Real' });

    const res = await call('signup', { body: { email: EMAIL, password: 'attacker-password' } });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ message: 'Email already registered' });
    expect(state.db.rows('users')[0].password_hash).toBeNull();
    expect(state.db.rows('sessions')).toHaveLength(0);
  });

  it('still creates a new account for an unused email', async () => {
    const res = await call('signup', { body: { email: 'new@example.com', password: 'a-good-password' } });
    expect(res.statusCode).toBe(200);
    expect(state.db.rows('users')[0].password_hash).toMatch(/^\$2[aby]\$/);
  });
});

describe('password login', () => {
  it('replaces a legacy unsalted SHA-256 hash with bcrypt after a successful login', async () => {
    const legacy = crypto.createHash('sha256').update('old-password').digest('hex');
    state.db.rows('users').push({ id: 'user_legacy', email: EMAIL, password_hash: legacy });

    const res = await call('login', { body: { email: EMAIL, password: 'old-password' } });

    expect(res.statusCode).toBe(200);
    const stored = state.db.rows('users')[0].password_hash;
    expect(stored).toMatch(/^\$2[aby]\$/);
    expect(await bcrypt.compare('old-password', stored)).toBe(true);
  });

  it('leaves the legacy hash alone when the password is wrong', async () => {
    const legacy = crypto.createHash('sha256').update('old-password').digest('hex');
    state.db.rows('users').push({ id: 'user_legacy', email: EMAIL, password_hash: legacy });

    const res = await call('login', { body: { email: EMAIL, password: 'wrong' } });

    expect(res.statusCode).toBe(401);
    expect(state.db.rows('users')[0].password_hash).toBe(legacy);
  });
});

describe('Google OAuth state', () => {
  it('sends a state parameter and stores it in a short-lived cookie', async () => {
    const res = await call('google', { method: 'GET' });
    const location = new URL(res.redirectedTo);
    const state = location.searchParams.get('state');

    expect(state).toBeTruthy();
    expect(setCookies(res).join(';')).toContain(`typejung.google_oauth_state=${state}`);
  });

  it('rejects a callback whose state does not match the cookie', async () => {
    const res = await call('google-callback', {
      method: 'GET',
      query: { code: 'code_1', state: 'from-attacker' },
      headers: { host: 'typejung.com', cookie: 'typejung.google_oauth_state=mine' },
    });

    expect(res.redirectedTo).toBe('/auth?error=invalid_oauth_state');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a callback with no state cookie', async () => {
    const res = await call('google-callback', { method: 'GET', query: { code: 'code_1', state: 'x' } });
    expect(res.redirectedTo).toBe('/auth?error=invalid_oauth_state');
  });

  function stubGoogle(userInfo: Record<string, unknown>) {
    vi.mocked(fetch).mockImplementation(async (input: any) => {
      const url = String(input);
      if (url.includes('oauth2.googleapis.com/token')) return { ok: true, json: async () => ({ access_token: 'at' }) } as any;
      return { ok: true, json: async () => userInfo } as any;
    });
  }

  const callback = () => call('google-callback', {
    method: 'GET',
    query: { code: 'code_1', state: 'st' },
    headers: { host: 'typejung.com', cookie: 'typejung.google_oauth_state=st' },
  });

  it('refuses a Google account whose email Google has not verified', async () => {
    state.db.rows('users').push({ id: 'user_owner', email: EMAIL, password_hash: '$2b$10$x' });
    stubGoogle({ id: 'g1', email: EMAIL, verified_email: false });

    const res = await callback();

    expect(res.redirectedTo).toBe('/auth?error=no_verified_email');
    expect(state.db.rows('users')[0].google_id).toBeUndefined();
  });

  it('revokes an unverified password when the verified Google owner signs in', async () => {
    state.db.rows('users').push({ id: 'user_x', email: EMAIL, password_hash: '$2b$10$squatter' });
    state.db.rows('sessions').push({ sid: 'old', sess: { passport: { user: 'user_x' } }, expire: '2099-01-01' });
    stubGoogle({ id: 'g1', email: EMAIL, verified_email: true });

    const res = await callback();

    expect(res.redirectedTo).toBe('/profile');
    const user = state.db.rows('users')[0];
    expect(user).toMatchObject({ google_id: 'g1', password_hash: null });
    expect(user.email_verified_at).toBeTruthy();
    expect(state.db.rows('sessions').some((session: any) => session.sid === 'old')).toBe(false);
  });
});

describe('Apple identity', () => {
  const appleSigningKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const clientSecretKey = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });

  beforeEach(() => {
    process.env.APPLE_CLIENT_ID = 'com.typejung.web';
    process.env.APPLE_TEAM_ID = 'TEAM';
    process.env.APPLE_KEY_ID = 'KEY';
    process.env.APPLE_PRIVATE_KEY = clientSecretKey.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  });

  function idToken(claims: Record<string, unknown>) {
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'apple-kid' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      iss: 'https://appleid.apple.com',
      aud: 'com.typejung.web',
      exp: Math.floor(Date.now() / 1000) + 600,
      ...claims,
    })).toString('base64url');
    const signature = crypto.sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), appleSigningKey.privateKey).toString('base64url');
    return `${header}.${payload}.${signature}`;
  }

  async function appleCallback(claims: Record<string, unknown>) {
    const jwk = { ...appleSigningKey.publicKey.export({ format: 'jwk' }), kid: 'apple-kid' };
    vi.mocked(fetch).mockImplementation(async (input: any) => {
      const url = String(input);
      if (url.endsWith('/auth/token')) return { ok: true, json: async () => ({ id_token: idToken(claims) }) } as any;
      return { ok: true, json: async () => ({ keys: [jwk] }) } as any;
    });
    return call('apple-callback', {
      body: { code: 'code_1', state: 'st' },
      headers: { host: 'typejung.com', cookie: 'typejung.apple_oauth_state=st' },
    });
  }

  it('records the Apple identity and a verified email on a new account', async () => {
    const res = await appleCallback({ sub: 'apple_sub_1', email: EMAIL, email_verified: 'true' });

    expect(res.redirectedTo).toBe('/profile');
    expect(state.db.rows('users')[0]).toMatchObject({ email: EMAIL, apple_id: 'apple_sub_1' });
    expect(state.db.rows('users')[0].email_verified_at).toBeTruthy();
  });

  it('still signs in before migration 0020 adds the new columns', async () => {
    state.db.missingColumns.users = ['apple_id', 'email_verified_at'];
    const res = await appleCallback({ sub: 'apple_sub_1', email: EMAIL, email_verified: true });

    expect(res.redirectedTo).toBe('/profile');
    expect(state.db.rows('users')).toHaveLength(1);
    expect(state.db.rows('users')[0]).not.toHaveProperty('apple_id');
  });

  it('finds a returning Apple account by its Apple identity even if the email changed', async () => {
    state.db.rows('users').push({ id: 'user_apple', email: 'relay@privaterelay.appleid.com', apple_id: 'apple_sub_1' });
    const res = await appleCallback({ sub: 'apple_sub_1', email: EMAIL, email_verified: true });

    expect(res.redirectedTo).toBe('/profile');
    expect(state.db.rows('users')).toHaveLength(1);
    expect(state.db.rows('sessions')[0].sess.passport.user).toBe('user_apple');
  });
});
