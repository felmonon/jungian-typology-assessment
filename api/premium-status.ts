import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';

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

    const user = await getSessionUserFromCookie(req.headers.cookie, supabase);

    if (!user) {
      return res.status(200).json({ tier: 'free', isPremium: false, reason: 'not_authenticated' });
    }

    // Check for purchase by user ID
    let { data: purchases } = await supabase
      .from('purchases')
      .select('id, tier, status, createdAt:created_at')
      .eq('user_id', user.id)
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
          .select('id, tier, status, createdAt:created_at')
          .eq('user_id', users[0].id)
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
