import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../_lib/supabase.js';
import {
  fallbackShareHtml,
  injectShareMeta,
  isShareSlug,
  shareAssessmentHref,
  shareMeta,
  shareStackFrom,
  SITE_URL,
  type ShareStack,
} from './_meta.js';

// vercel.json rewrites /share/:slug here (as /api/share/:slug?view=page, served by api/share/[slug].ts). The
// browser URL does not change, so the SPA still reads ?utm_campaign=... and the
// friend_compare attribution keeps working.

const TEMPLATE_TTL_MS = 5 * 60 * 1000;
let cachedTemplate: { html: string; at: number } | null = null;

// Only fetch the shell from hosts that are this site. A forged Host header
// falls back to production instead of making the function fetch elsewhere.
function shellOrigin(req: VercelRequest): string {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  if (/^(www\.)?typejung\.com$/.test(host) || /^[a-z0-9-]+\.vercel\.app$/.test(host)) return `https://${host}`;
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  return SITE_URL;
}

export async function loadShellTemplate(origin: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  if (cachedTemplate && Date.now() - cachedTemplate.at < TEMPLATE_TTL_MS) return cachedTemplate.html;
  try {
    const response = await fetchImpl(`${origin}/index.html`, { headers: { accept: 'text/html' } });
    if (!response.ok) return null;
    const html = await response.text();
    if (!/<div id="root">/i.test(html)) return null;
    cachedTemplate = { html, at: Date.now() };
    return html;
  } catch {
    return null;
  }
}

export function resetShellTemplateCache() {
  cachedTemplate = null;
}

async function findStack(slug: string): Promise<{ found: boolean; stack: ShareStack | null }> {
  if (!hasSupabaseAdminConfig()) return { found: true, stack: null };
  const { data, error } = await getSupabaseAdminClient()
    .from('assessment_results')
    .select('stack')
    .eq('share_slug', slug)
    .limit(1);
  if (error) {
    console.error('Share page lookup failed:', error.message);
    return { found: true, stack: null };
  }
  if (!data || data.length === 0) return { found: false, stack: null };
  return { found: true, stack: shareStackFrom(data[0]?.stack) };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const slug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
  const campaign = Array.isArray(req.query.utm_campaign) ? req.query.utm_campaign[0] : req.query.utm_campaign;

  let status = 200;
  let stack: ShareStack | null = null;
  if (!isShareSlug(slug)) {
    status = 404;
  } else {
    try {
      const lookup = await findStack(slug);
      if (!lookup.found) status = 404;
      stack = lookup.stack;
    } catch (error) {
      console.error('Share page lookup failed:', error);
    }
  }

  const safeSlug = isShareSlug(slug) ? slug : 'unknown';
  const meta = shareMeta(safeSlug, stack);
  const assessmentHref = shareAssessmentHref(safeSlug, campaign);
  const template = await loadShellTemplate(shellOrigin(req));
  const html = template ? injectShareMeta(template, meta, assessmentHref) : fallbackShareHtml(meta, assessmentHref);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  // Results do not change after they are shared; a short CDN cache keeps
  // repeated unfurls off the database.
  res.setHeader('Cache-Control', status === 200 ? 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400' : 'public, max-age=0, s-maxage=60');
  return res.status(status).send(html);
}
