import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import { getUncachableStripeClient } from './stripeClient';
import { setupAuth, registerAuthRoutes } from './server/integrations/auth';
import { registerResultsRoutes } from './server/routes/results';
import { registerAdminRoutes } from './server/routes/admin';
import { sendPdfEmail } from './server/resend';
import { db } from './server/db';
import { purchases, users } from './shared/schema';
import { eq } from 'drizzle-orm';
import { generateFreeAnalysis, generatePremiumAnalysis } from './server/ai-analysis';
import { z } from 'zod';

const analysisInputSchema = z.object({
  scores: z.array(z.object({
    function: z.string(),
    score: z.number(),
    rawPreference: z.number(),
    rawInferior: z.number(),
    normalized: z.number(),
  })),
  stack: z.object({
    dominant: z.object({ function: z.string(), score: z.number(), rawPreference: z.number(), rawInferior: z.number(), normalized: z.number() }),
    auxiliary: z.object({ function: z.string(), score: z.number(), rawPreference: z.number(), rawInferior: z.number(), normalized: z.number() }),
    tertiary: z.object({ function: z.string(), score: z.number(), rawPreference: z.number(), rawInferior: z.number(), normalized: z.number() }),
    inferior: z.object({ function: z.string(), score: z.number(), rawPreference: z.number(), rawInferior: z.number(), normalized: z.number() }),
  }),
  attitudeScore: z.number().optional(),
  isUndifferentiated: z.boolean().optional(),
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const checkoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many checkout attempts, please try again later.' },
});

const emailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Email rate limit reached. You can send up to 2 emails per day.' },
});

const aiAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI analysis rate limit reached. Please try again later.' },
});

async function startServer() {
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = await getUncachableStripeClient();
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        Array.isArray(sig) ? sig[0] : sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      if (session.payment_status === 'paid') {
        try {
          const customerEmail = session.customer_details?.email;
          let userId: string | null = null;

          if (customerEmail) {
            const [user] = await db.select().from(users).where(eq(users.email, customerEmail));
            if (user) {
              userId = user.id;
            }
          }

          let tier = session.metadata?.tier || null;
          if (!tier && session.line_items?.data?.[0]?.price?.id) {
            const priceId = session.line_items.data[0].price.id;
            if (priceId === process.env.STRIPE_MASTERY_PRICE_ID) {
              tier = 'mastery';
            } else if (priceId === process.env.STRIPE_INSIGHT_PRICE_ID) {
              tier = 'insight';
            }
          }
          if (!tier) {
            tier = 'insight';
          }

          await db.insert(purchases).values({
            userId: userId,
            stripeSessionId: session.id,
            stripeCustomerId: session.customer || null,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            status: 'completed',
            tier: tier,
          });

          console.log(`Purchase recorded for session ${session.id} with tier ${tier}`);
        } catch (err) {
          console.error('Failed to record purchase:', err);
        }
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as any;
      const sessionId = charge.payment_intent;
      
      try {
        await db.update(purchases)
          .set({ status: 'refunded' })
          .where(eq(purchases.stripeSessionId, sessionId));
        console.log(`Purchase refunded for session ${sessionId}`);
      } catch (err) {
        console.error('Failed to update refund status:', err);
      }
    }

    return res.status(200).json({ received: true });
  });

  app.use(express.json({ limit: '50mb' }));
  app.use('/api/', globalLimiter);

  await setupAuth(app);
  registerAuthRoutes(app);
  registerResultsRoutes(app);
  registerAdminRoutes(app);

  app.get('/api/premium-status', async (req: any, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(200).json({ tier: 'free', isPremium: false, reason: 'not_authenticated' });
      }

      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!userId && !userEmail) {
        return res.status(200).json({ tier: 'free', isPremium: false, reason: 'no_user_info' });
      }

      let purchase = null;
      
      if (userId) {
        const [userPurchase] = await db.select()
          .from(purchases)
          .where(eq(purchases.userId, userId));
        purchase = userPurchase;
      }

      if (!purchase && userEmail) {
        const [user] = await db.select().from(users).where(eq(users.email, userEmail));
        if (user) {
          const [emailPurchase] = await db.select()
            .from(purchases)
            .where(eq(purchases.userId, user.id));
          purchase = emailPurchase;
        }
      }

      if (purchase && purchase.status === 'completed') {
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
      return res.status(500).json({ tier: 'free', isPremium: false, reason: 'error' });
    }
  });

  app.post('/api/create-checkout-session', checkoutLimiter, async (req: any, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const { priceId, tier } = req.body;

      let resolvedPriceId = priceId;
      let resolvedTier = tier || 'insight';
      
      if (tier === 'insight') {
        resolvedPriceId = process.env.STRIPE_INSIGHT_PRICE_ID;
      } else if (tier === 'mastery') {
        resolvedPriceId = process.env.STRIPE_MASTERY_PRICE_ID;
      }
      
      if (!resolvedPriceId) {
        resolvedPriceId = process.env.STRIPE_PRICE_ID;
      }

      const origin = req.headers.origin || req.headers.host || 'http://localhost:5000';
      const baseUrl = origin.startsWith('http') ? origin : 'https://' + origin;

      const sessionParams: any = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: resolvedPriceId,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/#/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/#/results`,
        metadata: {
          product: 'jungian_assessment_premium',
          tier: resolvedTier,
        },
      };

      if (req.isAuthenticated && req.isAuthenticated() && req.user?.email) {
        sessionParams.customer_email = req.user.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return res.status(200).json({
        sessionId: session.id,
        url: session.url
      });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to create checkout session'
      });
    }
  });

  app.post('/api/verify-session', async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return res.status(200).json({
        paid: session.payment_status === 'paid',
        status: session.payment_status,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
      });
    } catch (error: any) {
      console.error('Session verification error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to verify session'
      });
    }
  });

  app.post('/api/send-pdf-email', emailLimiter, async (req: any, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(403).json({ error: 'User email not found' });
      }

      const { pdfBase64, userName, dominantFunction } = req.body;

      if (!pdfBase64) {
        return res.status(400).json({ error: 'PDF data is required' });
      }

      if (pdfBase64.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'PDF too large' });
      }

      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      
      await sendPdfEmail(
        userEmail,
        pdfBuffer, 
        userName || 'Explorer',
        dominantFunction || 'Unknown'
      );

      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error: any) {
      console.error('Email sending error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to send email'
      });
    }
  });

  app.post('/api/ai/free-analysis', aiAnalysisLimiter, async (req: any, res) => {
    try {
      const parseResult = analysisInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid assessment data format' });
      }

      const { scores, stack, attitudeScore, isUndifferentiated } = parseResult.data;

      const analysis = await generateFreeAnalysis({
        scores,
        stack,
        attitudeScore: attitudeScore || 0,
        isUndifferentiated: isUndifferentiated || false,
      });

      return res.status(200).json({ analysis });
    } catch (error: any) {
      console.error('Free AI analysis error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate analysis'
      });
    }
  });

  app.post('/api/ai/premium-analysis', aiAnalysisLimiter, async (req: any, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = req.user?.id;
      const userEmail = req.user?.email;

      let hasPremiumAccess = false;
      
      if (userId) {
        const [userPurchase] = await db.select()
          .from(purchases)
          .where(eq(purchases.userId, userId));
        if (userPurchase && userPurchase.status === 'completed') {
          hasPremiumAccess = true;
        }
      }

      if (!hasPremiumAccess && userEmail) {
        const [user] = await db.select().from(users).where(eq(users.email, userEmail));
        if (user) {
          const [emailPurchase] = await db.select()
            .from(purchases)
            .where(eq(purchases.userId, user.id));
          if (emailPurchase && emailPurchase.status === 'completed') {
            hasPremiumAccess = true;
          }
        }
      }

      // Check if user claims recent purchase (grace period for webhook delays)
      const { unlockDate } = req.body;
      if (!hasPremiumAccess && unlockDate) {
        const hoursSinceUnlock = (Date.now() - new Date(unlockDate).getTime()) / (1000 * 60 * 60);
        if (hoursSinceUnlock < 24) {
          hasPremiumAccess = true;
        }
      }

      if (!hasPremiumAccess) {
        return res.status(403).json({ error: 'Premium access required' });
      }

      const parseResult = analysisInputSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid assessment data format' });
      }

      const { scores, stack, attitudeScore, isUndifferentiated } = parseResult.data;

      const analysis = await generatePremiumAnalysis({
        scores,
        stack,
        attitudeScore: attitudeScore || 0,
        isUndifferentiated: isUndifferentiated || false,
      });

      return res.status(200).json({ analysis });
    } catch (error: any) {
      console.error('Premium AI analysis error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate premium analysis'
      });
    }
  });

  const publicDir = path.join(__dirname, 'dist', 'public');
  app.use(express.static(publicDir));

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(publicDir, 'index.html'));
    } else {
      next();
    }
  });

  const PORT = parseInt(process.env.PORT || '5000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
