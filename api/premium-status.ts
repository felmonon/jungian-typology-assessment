import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Simple cookie parser
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

async function getSessionUser(cookieHeader: string | undefined, supabase: any): Promise<any | null> {
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
      .select('id, email, firstName, lastName, profileImageUrl, createdAt')
      .eq('id', userId);

    if (userError || !users || users.length === 0) return null;
    return users[0];
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    );

    const user = await getSessionUser(req.headers.cookie, supabase);

    if (!user) {
      return res.status(200).json({ tier: 'free', isPremium: false, reason: 'not_authenticated' });
    }

    // Check for purchase by user ID
    let { data: purchases } = await supabase
      .from('purchases')
      .select('id, tier, status, createdAt')
      .eq('userId', user.id)
      .eq('status', 'completed')
      .limit(1);

    // Also check by email if no purchase found
    if ((!purchases || purchases.length === 0) && user.email) {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email);

      if (users && users.length > 0) {
        const { data: emailPurchases } = await supabase
          .from('purchases')
          .select('id, tier, status, createdAt')
          .eq('userId', users[0].id)
          .eq('status', 'completed')
          .limit(1);

        purchases = emailPurchases;
      }
    }

    if (purchases && purchases.length > 0) {
      const purchase = purchases[0];
      const tier = purchase.tier || 'insight';
      return res.status(200).json({
        tier: tier,
        isPremium: true,
        purchaseDate: purchase.createdAt
      });
    }

    return res.status(200).json({ tier: 'free', isPremium: false, reason: 'no_purchase' });
  } catch (error) {
    console.error('Premium status check error:', error);
    return res.status(200).json({ tier: 'free', isPremium: false, reason: 'error' });
  }
}
