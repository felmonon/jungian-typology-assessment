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
const cachedTemplates = new Map<string, { html: string; at: number }>();

// The shell origin comes from the deployment's own environment, never from
// request headers, so a forged Host or X-Forwarded-Host cannot make this
// function fetch (and cache) another site's page. Production uses the canonical
// site; a preview uses its own deployment URL, which Vercel sets. Request
// headers are read only in local development, and only for loopback hosts.
export function shellOrigin(req: VercelRequest, env: NodeJS.ProcessEnv = process.env): string {
  if (env.VERCEL_ENV === 'production') return SITE_URL;
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (!env.VERCEL) {
    const host = String(req.headers.host || '').trim().toLowerCase();
    if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  }
  return SITE_URL;
}

export async function loadShellTemplate(origin: string, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const cached = cachedTemplates.get(origin);
  if (cached && Date.now() - cached.at < TEMPLATE_TTL_MS) return cached.html;
  try {
    const response = await fetchImpl(`${origin}/index.html`, { headers: { accept: 'text/html' } });
    if (!response.ok) return null;
    const html = await response.text();
    if (!/<div id="root">/i.test(html)) return null;
    cachedTemplates.set(origin, { html, at: Date.now() });
    return html;
  } catch {
    return null;
  }
}

export function resetShellTemplateCache() {
  cachedTemplates.clear();
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
