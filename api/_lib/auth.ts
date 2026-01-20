import { createClient } from '@supabase/supabase-js';

// Simple cookie parser to avoid module issues
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

export async function getSessionUser(cookieHeader: string | undefined): Promise<any | null> {
  if (!cookieHeader) return null;

  // Use service role key for server-side operations (bypasses RLS)
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
  );

  try {
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies['connect.sid'];

    if (!sessionCookie) {
      return null;
    }

    // Extract session ID from signed cookie
    // Format: s:sessionId.signature
    const match = sessionCookie.match(/^s:([^.]+)\./);
    if (!match) {
      return null;
    }

    const sessionId = match[1];

    // Query the session from the database
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('sid, sess, expire')
      .eq('sid', sessionId);

    if (sessionError || !sessions || sessions.length === 0) {
      return null;
    }

    const session = sessions[0];

    // Check if session is expired
    if (session.expire && new Date(session.expire) < new Date()) {
      return null;
    }

    // Parse the session data
    const sessData = typeof session.sess === 'string' ? JSON.parse(session.sess) : session.sess;
    const passport = sessData?.passport;
    const userId = passport?.user;

    if (!userId) {
      return null;
    }

    // Get the user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, firstName, lastName, profileImageUrl, createdAt')
      .eq('id', userId);

    if (userError || !users || users.length === 0) return null;

    return users[0];
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}
