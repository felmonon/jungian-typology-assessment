import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error: oauthError } = req.query;

  if (oauthError) {
    return res.redirect(302, `/login?error=${encodeURIComponent(oauthError as string)}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(302, '/login?error=missing_code');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!clientId || !clientSecret) {
    return res.redirect(302, '/login?error=oauth_not_configured');
  }

  if (!sessionSecret) {
    console.error('SESSION_SECRET not configured');
    return res.redirect(302, '/login?error=server_error');
  }

  try {
    // Determine the callback URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const callbackUrl = `${protocol}://${host}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect(302, '/login?error=token_exchange_failed');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info');
      return res.redirect(302, '/login?error=userinfo_failed');
    }

    const googleUser = await userInfoResponse.json();
    const { email, given_name, family_name, picture } = googleUser;

    if (!email) {
      return res.redirect(302, '/login?error=no_email');
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
    );

    // Find or create user
    let { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    let user;

    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
      // Update profile info if changed
      await supabase
        .from('users')
        .update({
          first_name: given_name || user.first_name,
          last_name: family_name || user.last_name,
          profile_image_url: picture || user.profile_image_url,
        })
        .eq('id', user.id);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          first_name: given_name || '',
          last_name: family_name || '',
          profile_image_url: picture || null,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Failed to create user:', createError);
        return res.redirect(302, '/login?error=user_creation_failed');
      }

      user = newUser;
    }

    // Generate session
    const sessionId = generateSessionId();
    const signedSessionId = signSessionId(sessionId, sessionSecret);

    // Session expiry (30 days from now)
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30);

    // Session data (matching passport format)
    const sessionData = {
      cookie: {
        originalMaxAge: 30 * 24 * 60 * 60 * 1000,
        expires: expireDate.toISOString(),
        httpOnly: true,
        path: '/',
      },
      passport: {
        user: user.id,
      },
    };

    // Store session in database
    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert({
        sid: sessionId,
        sess: sessionData,
        expire: expireDate.toISOString(),
      });

    if (sessionError) {
      console.error('Failed to create session:', sessionError);
      return res.redirect(302, '/login?error=session_failed');
    }

    // Set session cookie
    const cookieOptions = [
      `connect.sid=${signedSessionId}`,
      'Path=/',
      'HttpOnly',
      `Expires=${expireDate.toUTCString()}`,
      'SameSite=Lax',
    ];

    // Add Secure flag in production
    if (protocol === 'https') {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    // Redirect to home or intended destination
    return res.redirect(302, '/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.redirect(302, '/login?error=callback_failed');
  }
}
