import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUserFromCookie } from './_lib/auth-utils.js';
import { findCompletedPurchaseForUser } from './_lib/purchases.js';
import { getSupabaseAdminClient } from './_lib/supabase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const user = await getSessionUserFromCookie(req.headers.cookie, supabase);

    if (!user) {
      return res.status(200).json({ tier: 'free', isPremium: false, reason: 'not_authenticated' });
    }

    const purchase = await findCompletedPurchaseForUser(supabase, user);

    if (purchase) {
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
