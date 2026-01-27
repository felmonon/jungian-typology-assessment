import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both GET (query param) and POST (body)
  // Frontend sends sessionId (camelCase), also support session_id (snake_case)
  const session_id = req.method === 'GET'
    ? req.query.session_id
    : (req.body?.sessionId || req.body?.session_id);

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', session);
      return res.status(response.status).json({ error: session.error?.message || 'Stripe error' });
    }

    if (session.payment_status === 'paid') {
      const tier = session.metadata?.tier || 'insight';
      return res.status(200).json({
        success: true,
        paid: true,
        tier,
        metadata: { tier },
        customerEmail: session.customer_details?.email,
      });
    } else {
      return res.status(200).json({
        success: true,
        paid: false,
        status: session.payment_status,
      });
    }
  } catch (error: any) {
    console.error('Session verification error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to verify session'
    });
  }
}
