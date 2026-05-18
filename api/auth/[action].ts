import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getSessionUserFromCookie, getVerifiedSessionId, shouldUseSecureCookie } from '../_lib/auth-utils.js';
import { enforceRateLimit } from '../_lib/rate-limit.js';
import { sendLifecycleEmail, type LifecycleEmailKind } from '../../server/resend.js';

// Generate a random session ID
function generateSessionId(): string {
  return crypto.randomBytes(24).toString('base64url');
}

// Sign session ID with secret (matching express-session format)
function signSessionId(sessionId: string, secret: string): string {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(sessionId)
    .digest('base64')
    .replace(/=+$/, '');
  return `s:${sessionId}.${signature}`;
}

const SALT_ROUNDS = 10;
const lifecycleKinds = new Set<LifecycleEmailKind>([
  'abandoned-assessment',
  'result-ready',
  'free-result-upgrade',
]);

function legacySha256PasswordHash(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    return bcrypt.compare(password, storedHash);
  }

  return legacySha256PasswordHash(password) === storedHash;
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );
}

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function cleanUrl(value: unknown, fallback: string): string {
  const url = cleanString(value, 500);
  if (!url) return fallback;

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Use the safe fallback.
  }

  return fallback;
}

function getBaseUrl(req: VercelRequest): string {
  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
  const protoHeader = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(protoHeader) ? protoHeader[0] : protoHeader;

  if (host) {
    return `${proto || 'https'}://${host}`.replace(/\/$/, '');
  }

  const origin = cleanUrl(req.headers.origin, 'https://typejung.com');
  return origin.replace(/\/$/, '');
}

function cleanProgress(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cleanIdempotencyKey(value: unknown): string | undefined {
  return cleanString(value, 180)?.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function hasPremiumAccess(supabase: SupabaseClient, userId: string): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .limit(1);

  if (error) {
    console.error('Lifecycle email premium lookup failed:', error);
    return null;
  }

  return !!data?.length;
}

async function createSession(userId: string, req: VercelRequest, res: VercelResponse) {
  const sessionSecret = process.env.SESSION_SECRET!;
  const supabase = getSupabase();

  const sessionId = generateSessionId();
  const signedSessionId = signSessionId(sessionId, sessionSecret);

  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 30);

  const sessionData = {
    cookie: {
      originalMaxAge: 30 * 24 * 60 * 60 * 1000,
      expires: expireDate.toISOString(),
      httpOnly: true,
      path: '/',
    },
    passport: { user: userId },
  };

  await supabase.from('sessions').upsert({
    sid: sessionId,
    sess: sessionData,
    expire: expireDate.toISOString(),
  });

  res.setHeader('Set-Cookie', [
    `connect.sid=${signedSessionId}`,
    'Path=/',
    'HttpOnly',
    `Expires=${expireDate.toUTCString()}`,
    'SameSite=Lax',
    // Only set Secure on HTTPS requests so local auth sessions persist.
    shouldUseSecureCookie(req) ? 'Secure' : '',
  ].filter(Boolean).join('; '));
}

// GET /api/auth/user
async function handleGetUser(req: VercelRequest, res: VercelResponse) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return res.status(200).json(null);

  const supabase = getSupabase();
  const sessionId = getVerifiedSessionId(cookieHeader);
  if (!sessionId) return res.status(200).json(null);

  const { data: sessions } = await supabase
    .from('sessions')
    .select('sid, sess, expire')
    .eq('sid', sessionId);

  if (!sessions || sessions.length === 0) return res.status(200).json(null);

  const session = sessions[0];
  if (session.expire && new Date(session.expire) < new Date()) {
    return res.status(200).json(null);
  }

  const sessData = typeof session.sess === 'string' ? JSON.parse(session.sess) : session.sess;
  const userId = sessData?.passport?.user;
  if (!userId) return res.status(200).json(null);

  const { data: users } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, profile_image_url, created_at')
    .eq('id', userId);

  if (!users || users.length === 0) return res.status(200).json(null);

  const user = users[0];
  return res.status(200).json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImageUrl: user.profile_image_url,
    createdAt: user.created_at,
  });
}

// POST /api/auth/login
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const supabase = getSupabase();
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('email', email);

  if (!users || users.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const user = users[0];
  if (!(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  await createSession(user.id, req, res);

  return res.status(200).json({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImageUrl: user.profile_image_url,
    createdAt: user.created_at,
  });
}

// POST /api/auth/signup
async function handleSignup(req: VercelRequest, res: VercelResponse) {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const supabase = getSupabase();
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id')
    .eq('email', email);

  if (existingUsers && existingUsers.length > 0) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const passwordHash = await hashPassword(password);
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      first_name: firstName || '',
      last_name: lastName || '',
    })
    .select()
    .single();

  if (error || !newUser) {
    return res.status(500).json({ message: 'Failed to create account' });
  }

  await createSession(newUser.id, req, res);

  return res.status(200).json({
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.first_name,
    lastName: newUser.last_name,
    profileImageUrl: newUser.profile_image_url,
    createdAt: newUser.created_at,
  });
}

// POST /api/auth/logout
async function handleLogout(req: VercelRequest, res: VercelResponse) {
  const cookieHeader = req.headers.cookie;

  const sessionId = getVerifiedSessionId(cookieHeader);

  if (sessionId) {
    const supabase = getSupabase();
    await supabase.from('sessions').delete().eq('sid', sessionId);
  }

  res.setHeader('Set-Cookie', 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  return res.status(200).json({ success: true });
}

async function handleLifecycleEmail(req: VercelRequest, res: VercelResponse) {
  if (!process.env.SUPABASE_URL || !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
    return res.status(200).json({ sent: false, skipped: true, reason: 'auth_not_configured' });
  }

  const lifecycle = cleanString(req.body?.lifecycle, 80) as LifecycleEmailKind | undefined;

  if (!lifecycle || !lifecycleKinds.has(lifecycle)) {
    return res.status(400).json({ error: 'Invalid lifecycle email type' });
  }

  const supabase = getSupabase();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);
  if (!user?.email) {
    return res.status(200).json({ sent: false, skipped: true, reason: 'missing_user_email' });
  }

  if (lifecycle === 'free-result-upgrade' && user.id) {
    const userHasPremium = await hasPremiumAccess(supabase, user.id);
    if (userHasPremium === null) {
      return res.status(200).json({ sent: false, skipped: true, reason: 'premium_check_failed' });
    }
    if (userHasPremium) {
      return res.status(200).json({ sent: false, skipped: true, reason: 'already_premium' });
    }
  }

  const baseUrl = getBaseUrl(req);
  const sendResult = await sendLifecycleEmail({
    kind: lifecycle,
    toEmail: user.email,
    resultUrl: `${baseUrl}/results`,
    assessmentUrl: `${baseUrl}/assessment`,
    upgradeUrl: `${baseUrl}/pricing`,
    dominantLabel: cleanString(req.body?.dominantLabel, 120),
    inferiorLabel: cleanString(req.body?.inferiorLabel, 120),
    progressPercent: cleanProgress(req.body?.progressPercent),
    completedAt: cleanString(req.body?.completedAt, 80),
    idempotencyKey: cleanIdempotencyKey(req.body?.idempotencyKey),
  });

  return res.status(200).json(sendResult);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  if (!process.env.SESSION_SECRET) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    switch (action) {
      case 'user':
        if (req.method !== 'GET') {
          res.setHeader('Allow', 'GET');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return handleGetUser(req, res);

      case 'login':
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        if (enforceRateLimit(req, res, {
          keyPrefix: 'auth:login',
          limit: 10,
          windowMs: 15 * 60 * 1000,
          message: 'Too many login attempts. Please wait and try again.',
        })) return;
        return handleLogin(req, res);

      case 'signup':
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        if (enforceRateLimit(req, res, {
          keyPrefix: 'auth:signup',
          limit: 6,
          windowMs: 60 * 60 * 1000,
          message: 'Too many signup attempts. Please wait and try again.',
        })) return;
        return handleSignup(req, res);

      case 'logout':
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return handleLogout(req, res);

      case 'lifecycle-email':
        if (req.method === 'OPTIONS') {
          return res.status(204).end();
        }
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        if (enforceRateLimit(req, res, {
          keyPrefix: 'email:lifecycle',
          limit: 4,
          windowMs: 24 * 60 * 60 * 1000,
          message: 'Too many lifecycle email attempts. Please try again later.',
        })) return;
        return handleLifecycleEmail(req, res);

      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
