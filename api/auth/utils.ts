import type { VercelRequest } from '@vercel/node';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../../shared/models/auth';

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

export async function getSessionUserFromCookie(
  cookieHeader: string | undefined,
  supabase: SupabaseClient,
): Promise<User | null> {
  if (!cookieHeader) return null;

  try {
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies['connect.sid'];

    if (!sessionCookie) return null;

    const match = sessionCookie.match(/^s:([^.]+)\./);
    if (!match) return null;

    const sessionId = match[1];
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('sid, sess, expire')
      .eq('sid', sessionId);

    if (sessionError || !sessions || sessions.length === 0) return null;

    const session = sessions[0];
    if (session.expire && new Date(session.expire) < new Date()) return null;

    const sessData = typeof session.sess === 'string' ? JSON.parse(session.sess) : session.sess;
    const userId = sessData?.passport?.user;

    if (!userId) return null;

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, profile_image_url, is_admin, created_at')
      .eq('id', userId);

    if (userError || !users || users.length === 0) return null;

    const user = users[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      profileImageUrl: user.profile_image_url,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
    } as User;
  } catch {
    return null;
  }
}

export function getRequestProtocol(req: Pick<VercelRequest, 'headers'>): 'http' | 'https' {
  const forwardedProto = getHeaderValue(req.headers['x-forwarded-proto'])?.split(',')[0]?.trim();

  if (forwardedProto === 'https') {
    return 'https';
  }

  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' ? 'https' : 'http';
}

export function buildRequestUrl(req: Pick<VercelRequest, 'headers'>, path: string): string {
  const protocol = getRequestProtocol(req);
  const host = getHeaderValue(req.headers['x-forwarded-host']) || getHeaderValue(req.headers.host);

  if (!host) {
    throw new Error('Missing request host');
  }

  return `${protocol}://${host}${path}`;
}

export function shouldUseSecureCookie(req: Pick<VercelRequest, 'headers'>): boolean {
  return getRequestProtocol(req) === 'https';
}
