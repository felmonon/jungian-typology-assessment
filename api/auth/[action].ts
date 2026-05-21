import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { buildRequestUrl, getSessionUserFromCookie, getVerifiedSessionId, parseCookies, shouldUseSecureCookie } from '../_lib/auth-utils.js';
import { enforceRateLimit } from '../_lib/rate-limit.js';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../_lib/supabase.js';
import { EMAIL_CAPTURE_OFFER } from '../../data/discount.js';
import { resolveCheckoutBaseUrl } from '../../server/checkout.js';
import { sendDiscountLeadEmail, sendLifecycleEmail, type LifecycleEmailKind } from '../../server/resend.js';

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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_CAPTURE_DISCOUNT_CODE = process.env.EMAIL_CAPTURE_DISCOUNT_CODE || 'TYPEJUNG30';
const lifecycleKinds = new Set<LifecycleEmailKind>([
  'abandoned-assessment',
  'result-ready',
  'free-result-upgrade',
]);

type AppleTokenPayload = {
  aud?: string;
  email?: string;
  email_verified?: boolean | string;
  exp?: number;
  iss?: string;
  sub?: string;
};

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
  return getSupabaseAdminClient();
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

function cleanEmail(value: unknown): string | null {
  const email = cleanString(value, 254)?.toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

function cleanSource(value: unknown): string {
  return cleanString(value, 80)?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'unknown';
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

type DiscountLeadCaptureInput = {
  email: string;
  source: string;
  discountCode: string;
  percentOff: number;
  dominantLabel?: string;
  inferiorLabel?: string;
};

async function captureDiscountLead(input: DiscountLeadCaptureInput) {
  if (!hasSupabaseAdminConfig()) {
    return { captured: false, reason: 'supabase_not_configured' };
  }

  const supabase = getSupabase();
  const { data: users, error: lookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', input.email)
    .limit(1);

  if (lookupError) {
    console.error('Discount lead lookup failed:', lookupError);
    return { captured: false, reason: 'lookup_failed' };
  }

  const userId = users?.[0]?.id || null;

  const { data: lead, error: insertError } = await supabase
    .from('discount_leads')
    .insert({
      email: input.email,
      user_id: userId,
      source: input.source,
      discount_code: input.discountCode,
      percent_off: input.percentOff,
      dominant_label: input.dominantLabel || null,
      inferior_label: input.inferiorLabel || null,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Discount lead capture failed:', insertError);
    return { captured: false, reason: 'insert_failed' };
  }

  return {
    captured: true,
    leadId: lead?.id as string | undefined,
    reason: userId ? 'existing_user_lead_created' : 'anonymous_lead_created',
  };
}

async function updateDiscountLeadSendStatus(
  leadId: string | undefined,
  status: { sent: boolean; emailSentId?: string; emailError?: string },
) {
  if (!leadId || !hasSupabaseAdminConfig()) return;

  const supabase = getSupabase();
  const { error } = await supabase
    .from('discount_leads')
    .update({
      email_sent: status.sent,
      email_sent_id: status.emailSentId || null,
      email_error: status.emailError || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) {
    console.error('Discount lead send-status update failed:', error);
  }
}

async function createSession(userId: string, req: VercelRequest, res: VercelResponse, extraCookies: string[] = []) {
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

  const sessionCookie = [
    `connect.sid=${signedSessionId}`,
    'Path=/',
    'HttpOnly',
    `Expires=${expireDate.toUTCString()}`,
    'SameSite=Lax',
    // Only set Secure on HTTPS requests so local auth sessions persist.
    shouldUseSecureCookie(req) ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', [...extraCookies, sessionCookie]);
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
  const email = cleanEmail(req.body?.email);
  const { password } = req.body;
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
  const email = cleanEmail(req.body?.email);
  const { password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const supabase = getSupabase();
  const { data: existingUsers } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, profile_image_url, password_hash, google_id, created_at')
    .eq('email', email);

  if (existingUsers && existingUsers.length > 0) {
    const existingUser = existingUsers[0];
    if (existingUser.password_hash || existingUser.google_id) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const { data: claimedUser, error: claimError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        first_name: firstName || existingUser.first_name || '',
        last_name: lastName || existingUser.last_name || '',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (claimError || !claimedUser) {
      return res.status(500).json({ message: 'Failed to create account' });
    }

    await createSession(claimedUser.id, req, res);

    return res.status(200).json({
      id: claimedUser.id,
      email: claimedUser.email,
      firstName: claimedUser.first_name,
      lastName: claimedUser.last_name,
      profileImageUrl: claimedUser.profile_image_url,
      createdAt: claimedUser.created_at,
    });
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

  res.setHeader('Set-Cookie', [
    'connect.sid=',
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
    shouldUseSecureCookie(req) ? 'Secure' : '',
  ].filter(Boolean).join('; '));
  return res.status(200).json({ success: true });
}

function cleanName(value: unknown): string {
  return cleanString(value, 80) || '';
}

function cleanProfileImageUrl(value: unknown): string | null {
  if (value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > 750_000) return null;
  if (trimmed.startsWith('data:image/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Invalid image URL.
  }

  return null;
}

function serializeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profileImageUrl: user.profile_image_url,
    createdAt: user.created_at,
  };
}

async function handleProfile(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase();
  const user = await getSessionUserFromCookie(req.headers.cookie, supabase);

  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return res.status(200).json(user);
  }

  if (req.method === 'PATCH') {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: cleanName(req.body?.firstName),
        last_name: cleanName(req.body?.lastName),
        profile_image_url: cleanProfileImageUrl(req.body?.profileImageUrl),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('id, email, first_name, last_name, profile_image_url, created_at')
      .single();

    if (error || !updatedUser) {
      console.error('Profile update failed:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    return res.status(200).json(serializeUser(updatedUser));
  }

  if (req.method === 'DELETE') {
    const sessionId = getVerifiedSessionId(req.headers.cookie);

    if (sessionId) {
      await supabase.from('sessions').delete().eq('sid', sessionId);
    }

    await supabase.from('sessions').delete().contains('sess', { passport: { user: user.id } });
    await supabase.from('assessment_results').delete().eq('user_id', user.id);
    await supabase.from('purchases').delete().eq('user_id', user.id);

    const { error } = await supabase.from('users').delete().eq('id', user.id);
    if (error) {
      console.error('Account delete failed:', error);
      return res.status(500).json({ message: 'Failed to delete account' });
    }

    res.setHeader('Set-Cookie', [
      'connect.sid=',
      'Path=/',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'Max-Age=0',
      'HttpOnly',
      'SameSite=Lax',
      shouldUseSecureCookie(req) ? 'Secure' : '',
    ].filter(Boolean).join('; '));
    return res.status(200).json({ message: 'Account deleted successfully' });
  }

  res.setHeader('Allow', 'GET, PATCH, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleLifecycleEmail(req: VercelRequest, res: VercelResponse) {
  if (!hasSupabaseAdminConfig()) {
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

async function handleDiscountLead(req: VercelRequest, res: VercelResponse) {
  if (cleanString(req.body?.website, 120)) {
    return res.status(200).json({ sent: false, skipped: true, reason: 'bot_check' });
  }

  const email = cleanEmail(req.body?.email);

  if (!email) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }

  const source = cleanSource(req.body?.source);
  const dominantLabel = cleanString(req.body?.dominantLabel, 120);
  const inferiorLabel = cleanString(req.body?.inferiorLabel, 120);
  const capture = await captureDiscountLead({
    email,
    source,
    discountCode: EMAIL_CAPTURE_DISCOUNT_CODE,
    percentOff: EMAIL_CAPTURE_OFFER.percentOff,
    dominantLabel,
    inferiorLabel,
  });
  const baseUrl = resolveCheckoutBaseUrl(req.headers.origin, req.headers.host);
  const pricingUrl = `${baseUrl}/pricing?source=${encodeURIComponent(source)}`;

  let sendResult: Awaited<ReturnType<typeof sendDiscountLeadEmail>>;
  try {
    sendResult = await sendDiscountLeadEmail({
      toEmail: email,
      discountCode: EMAIL_CAPTURE_DISCOUNT_CODE,
      percentOff: EMAIL_CAPTURE_OFFER.percentOff,
      pricingUrl,
      dominantLabel,
      inferiorLabel,
      idempotencyKey: cleanIdempotencyKey(`discount-${email}-${source}`),
    });
  } catch (error) {
    await updateDiscountLeadSendStatus(capture.leadId, {
      sent: false,
      emailError: error instanceof Error ? error.message : 'Unknown email send error',
    });
    throw error;
  }

  await updateDiscountLeadSendStatus(capture.leadId, {
    sent: sendResult.sent,
    emailSentId: 'id' in sendResult ? sendResult.id : undefined,
    emailError: 'reason' in sendResult ? sendResult.reason : undefined,
  });

  return res.status(200).json({
    ...sendResult,
    captured: capture.captured,
    captureReason: capture.reason,
    percentOff: EMAIL_CAPTURE_OFFER.percentOff,
  });
}

function handleProviders(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    emailPassword: true,
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(
      (process.env.APPLE_CLIENT_ID || process.env.APPLE_SERVICE_ID) &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY
    ),
  });
}

function getAppleClientId(): string {
  return process.env.APPLE_CLIENT_ID || process.env.APPLE_SERVICE_ID || '';
}

function isAppleConfigured(): boolean {
  return Boolean(
    getAppleClientId() &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY
  );
}

function appleStateCookie(value: string, req: VercelRequest): string {
  return [
    `typejung.apple_oauth_state=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600',
    shouldUseSecureCookie(req) ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

function clearAppleStateCookie(req: VercelRequest): string {
  return [
    'typejung.apple_oauth_state=',
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
    shouldUseSecureCookie(req) ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

function normalizeInteger(value: Buffer, keySize: number): Buffer {
  let normalized = value;
  while (normalized.length > keySize && normalized[0] === 0) {
    normalized = normalized.subarray(1);
  }

  if (normalized.length === keySize) return normalized;
  if (normalized.length > keySize) return normalized.subarray(normalized.length - keySize);
  return Buffer.concat([Buffer.alloc(keySize - normalized.length), normalized]);
}

function derToJoseSignature(signature: Buffer, keySize: number): Buffer {
  let offset = 0;
  if (signature[offset++] !== 0x30) {
    throw new Error('Invalid ECDSA signature');
  }

  const sequenceLength = signature[offset++];
  if (sequenceLength === 0x81) {
    offset += 1;
  }

  if (signature[offset++] !== 0x02) {
    throw new Error('Invalid ECDSA signature');
  }

  const rLength = signature[offset++];
  const r = signature.subarray(offset, offset + rLength);
  offset += rLength;

  if (signature[offset++] !== 0x02) {
    throw new Error('Invalid ECDSA signature');
  }

  const sLength = signature[offset++];
  const s = signature.subarray(offset, offset + sLength);

  return Buffer.concat([normalizeInteger(r, keySize), normalizeInteger(s, keySize)]);
}

function buildAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const clientId = getAppleClientId();
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const derSignature = crypto.sign('sha256', Buffer.from(data), privateKey);
  const signature = derToJoseSignature(derSignature, 32).toString('base64url');

  return `${data}.${signature}`;
}

function decodeJsonSegment<T>(segment: string): T {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
}

async function verifyAppleIdToken(idToken: string): Promise<AppleTokenPayload> {
  const [encodedHeader, encodedPayload, encodedSignature] = idToken.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid Apple identity token');
  }

  const header = decodeJsonSegment<{ alg?: string; kid?: string }>(encodedHeader);
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Apple identity token');
  }

  const jwksResponse = await fetch('https://appleid.apple.com/auth/keys');
  if (!jwksResponse.ok) {
    throw new Error('Could not load Apple signing keys');
  }

  const jwks = await jwksResponse.json();
  const jwk = jwks.keys?.find((key: any) => key.kid === header.kid);
  if (!jwk) {
    throw new Error('Apple signing key not found');
  }

  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const isValid = verifier.verify(publicKey, Buffer.from(encodedSignature, 'base64url'));
  if (!isValid) {
    throw new Error('Invalid Apple identity signature');
  }

  const payload = decodeJsonSegment<AppleTokenPayload>(encodedPayload);
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== 'https://appleid.apple.com') throw new Error('Invalid Apple token issuer');
  if (payload.aud !== getAppleClientId()) throw new Error('Invalid Apple token audience');
  if (!payload.exp || payload.exp < now) throw new Error('Expired Apple identity token');

  return payload;
}

function getCallbackBody(req: VercelRequest): Record<string, any> {
  if (!req.body) return {};
  if (typeof req.body === 'string') return Object.fromEntries(new URLSearchParams(req.body));
  return req.body;
}

function parseAppleName(value: unknown): { firstName: string; lastName: string } {
  if (typeof value !== 'string') return { firstName: '', lastName: '' };

  try {
    const parsed = JSON.parse(value);
    return {
      firstName: typeof parsed?.name?.firstName === 'string' ? parsed.name.firstName.slice(0, 80) : '',
      lastName: typeof parsed?.name?.lastName === 'string' ? parsed.name.lastName.slice(0, 80) : '',
    };
  } catch {
    return { firstName: '', lastName: '' };
  }
}

async function handleAppleStart(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAppleConfigured()) {
    return res.redirect(302, '/auth?error=apple_not_configured');
  }

  const callbackUrl = buildRequestUrl(req, '/api/auth/apple-callback');
  const state = crypto.randomBytes(18).toString('base64url');
  const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize');

  appleAuthUrl.searchParams.set('client_id', getAppleClientId());
  appleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  appleAuthUrl.searchParams.set('response_type', 'code');
  appleAuthUrl.searchParams.set('response_mode', 'form_post');
  appleAuthUrl.searchParams.set('scope', 'name email');
  appleAuthUrl.searchParams.set('state', state);

  res.setHeader('Set-Cookie', appleStateCookie(state, req));
  return res.redirect(302, appleAuthUrl.toString());
}

async function handleAppleCallback(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = getAppleClientId();
  const sessionSecret = process.env.SESSION_SECRET;

  if (!isAppleConfigured()) {
    res.setHeader('Set-Cookie', clearAppleStateCookie(req));
    return res.redirect(302, '/auth?error=apple_not_configured');
  }

  if (!sessionSecret) {
    res.setHeader('Set-Cookie', clearAppleStateCookie(req));
    return res.redirect(302, '/auth?error=server_error');
  }

  const body = getCallbackBody(req);
  const code = typeof req.query.code === 'string' ? req.query.code : body.code;
  const state = typeof req.query.state === 'string' ? req.query.state : body.state;
  const storedState = parseCookies(req.headers.cookie)['typejung.apple_oauth_state'];

  if (!code || !state || !storedState || state !== storedState) {
    res.setHeader('Set-Cookie', clearAppleStateCookie(req));
    return res.redirect(302, '/auth?error=invalid_oauth_state');
  }

  try {
    const callbackUrl = buildRequestUrl(req, '/api/auth/apple-callback');
    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: buildAppleClientSecret(),
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackUrl,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Apple token exchange failed:', errorText);
      res.setHeader('Set-Cookie', clearAppleStateCookie(req));
      return res.redirect(302, '/auth?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json();
    const payload = await verifyAppleIdToken(tokens.id_token);
    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    const email = payload.email?.toLowerCase();

    if (!email || !emailVerified) {
      res.setHeader('Set-Cookie', clearAppleStateCookie(req));
      return res.redirect(302, '/auth?error=no_verified_email');
    }

    const name = parseAppleName(body.user);
    const supabase = getSupabase();
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    let user = existingUsers?.[0];

    if (user) {
      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          first_name: user.first_name || name.firstName,
          last_name: user.last_name || name.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();
      user = updatedUser || user;
    } else {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          first_name: name.firstName,
          last_name: name.lastName,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Apple user creation failed:', createError);
        res.setHeader('Set-Cookie', clearAppleStateCookie(req));
        return res.redirect(302, '/auth?error=user_creation_failed');
      }

      user = newUser;
    }

    await createSession(user.id, req, res, [clearAppleStateCookie(req)]);
    return res.redirect(302, '/profile');
  } catch (error) {
    console.error('Apple OAuth callback error:', error);
    res.setHeader('Set-Cookie', clearAppleStateCookie(req));
    return res.redirect(302, '/auth?error=callback_failed');
  }
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

      case 'providers':
        return handleProviders(req, res);

      case 'profile':
        return handleProfile(req, res);

      case 'apple':
        return handleAppleStart(req, res);

      case 'apple-callback':
        return handleAppleCallback(req, res);

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

      case 'discount-lead':
        if (req.method === 'OPTIONS') {
          return res.status(204).end();
        }
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        if (enforceRateLimit(req, res, {
          keyPrefix: 'discount:lead',
          limit: 5,
          windowMs: 60 * 60 * 1000,
          message: 'Too many discount email requests. Please try again later.',
        })) return;
        return handleDiscountLead(req, res);

      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
