import type { VercelRequest, VercelResponse } from '@vercel/node';
import { suppressEmail, verifyUnsubscribeToken } from '../../server/email-suppression.js';
import { hasSupabaseAdminConfig } from './supabase.js';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} | TypeJung</title>
</head>
<body style="margin:0;background:#FAFAF8;font-family:Inter,Arial,sans-serif;color:#121512;">
<main style="max-width:520px;margin:64px auto;padding:0 16px;">
<h1 style="font-size:26px;line-height:1.2;margin:0 0 16px;">${escapeHtml(title)}</h1>
${bodyHtml}
<p style="margin-top:32px;"><a href="/" style="color:#224A31;">Back to TypeJung</a></p>
</main>
</body>
</html>`;
}

function sendPage(res: VercelResponse, status: number, title: string, bodyHtml: string) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).send(renderPage(title, bodyHtml));
}

const paragraph = (text: string) => `<p style="color:#4B524C;font-size:16px;line-height:1.7;">${text}</p>`;

// GET shows a confirm button rather than unsubscribing, so link scanners that
// prefetch email links cannot opt someone out. POST performs it; mail clients
// use the same POST for RFC 8058 one-click unsubscribe.
export async function handleUnsubscribe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawToken = Array.isArray(req.query.token) ? req.query.token[0] : req.query.token;
  const email = verifyUnsubscribeToken(rawToken);

  if (!email) {
    return sendPage(res, 400, 'This unsubscribe link is not valid',
      paragraph('The link may have been cut off by your email app. Open the most recent TypeJung email and use its unsubscribe link, or reply to that email and we will remove you by hand.'));
  }

  if (req.method === 'GET') {
    const action = `/api/unsubscribe?token=${encodeURIComponent(rawToken as string)}`;
    return sendPage(res, 200, 'Unsubscribe from TypeJung emails',
      paragraph(`Stop reminder, discount and follow-up emails to <strong>${escapeHtml(email)}</strong>. Receipts and reports you request will still arrive.`)
      + `<form method="post" action="${escapeHtml(action)}"><button type="submit" style="border:0;border-radius:8px;background:#224A31;color:#fff;font-weight:700;font-size:16px;padding:12px 18px;cursor:pointer;">Unsubscribe</button></form>`);
  }

  if (!hasSupabaseAdminConfig()) {
    return sendPage(res, 503, 'Unsubscribe is unavailable right now',
      paragraph('Please try again later, or reply to the email and we will remove you by hand.'));
  }

  await suppressEmail(email, 'unsubscribe', 'unsubscribe_link');

  return sendPage(res, 200, 'You are unsubscribed',
    paragraph(`TypeJung will not send more reminder, discount or follow-up emails to <strong>${escapeHtml(email)}</strong>.`));
}
