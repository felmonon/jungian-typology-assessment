import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { parseCookies, shouldUseSecureCookie } from './utils';

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

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );
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
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies['connect.sid'];

  if (!sessionCookie) return res.status(200).json(null);

  const match = sessionCookie.match(/^s:([^.]+)\./);
  if (!match) return res.status(200).json(null);

  const sessionId = match[1];
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
  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
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

  const passwordHash = hashPassword(password);
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

  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies['connect.sid'];

    if (sessionCookie) {
      const match = sessionCookie.match(/^s:([^.]+)\./);
      if (match) {
        const supabase = getSupabase();
        await supabase.from('sessions').delete().eq('sid', match[1]);
      }
    }
  }

  res.setHeader('Set-Cookie', 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  return res.status(200).json({ success: true });
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
        return handleLogin(req, res);

      case 'signup':
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return handleSignup(req, res);

      case 'logout':
        if (req.method !== 'POST') {
          res.setHeader('Allow', 'POST');
          return res.status(405).json({ error: 'Method not allowed' });
        }
        return handleLogout(req, res);

      default:
        return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
