import { readFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import handler, { resetShellTemplateCache } from '../../api/share/page';
import { injectShareMeta, shareMeta, shareStackFrom } from '../../api/share/_meta';
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from '../../api/_lib/supabase';
import { resolveApiRoute, compileApiRewrites, rewriteApiPath } from '../../scripts/dev-api';

vi.mock('../../api/_lib/supabase', () => ({
  getSupabaseAdminClient: vi.fn(),
  hasSupabaseAdminConfig: vi.fn(() => true),
}));

const root = join(__dirname, '..', '..');
const template = readFileSync(join(root, 'index.html'), 'utf8');
const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));

const stored = {
  id: '6f1c7d2e-private-row-id',
  user_id: 'user-private-id',
  scores: [{ function: 'Ni', score: 87 }],
  stack: {
    dominant: { function: 'Ni', score: 87 },
    auxiliary: { function: 'Fe', score: 71 },
    tertiary: { function: 'Ti', score: 52 },
    inferior: { function: 'Se', score: 19 },
  },
};

const tag = (html: string, attr: 'name' | 'property', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)">`))?.[1];

function useDatabase(rows: unknown[]) {
  const queries: { table: string; columns: string; column: string; value: unknown }[] = [];
  vi.mocked(getSupabaseAdminClient).mockReturnValue({
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: unknown) => ({
          limit: async () => {
            queries.push({ table, columns, column, value });
            return { data: rows, error: null };
          },
        }),
      }),
    }),
  } as any);
  return queries;
}

function response() {
  const res: any = { statusCode: 200, body: '', headers: {} };
  res.status = (status: number) => { res.statusCode = status; return res; };
  res.send = (body: string) => { res.body = body; return res; };
  res.setHeader = (key: string, value: string) => { res.headers[key.toLowerCase()] = value; };
  return res;
}

async function get(query: Record<string, string>) {
  const res = response();
  await handler({ method: 'GET', headers: { host: 'typejung.com' }, query } as any, res);
  return res;
}

beforeEach(() => {
  resetShellTemplateCache();
  vi.mocked(hasSupabaseAdminConfig).mockReturnValue(true);
  vi.stubGlobal('fetch', vi.fn(async () => new Response(template, { status: 200 })));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('share preview tags', () => {
  it('names the dominant function and the stress edge', () => {
    const meta = shareMeta('Ab3dE6gH9kL', shareStackFrom(stored.stack));
    expect(meta.socialTitle).toBe('Ni-dominant · Se stress edge — compare your map');
    expect(meta.url).toBe('https://typejung.com/share/Ab3dE6gH9kL');
  });

  it('replaces the homepage title, description, canonical, Open Graph and Twitter tags', () => {
    const meta = shareMeta('Ab3dE6gH9kL', shareStackFrom(stored.stack));
    const html = injectShareMeta(template, meta);

    expect(html).toContain('<title>Ni-dominant · Se stress edge — compare your map | TypeJung</title>');
    expect(html).toContain('<link rel="canonical" href="https://typejung.com/share/Ab3dE6gH9kL">');
    expect(tag(html, 'property', 'og:title')).toBe(meta.socialTitle);
    expect(tag(html, 'property', 'og:url')).toBe(meta.url);
    expect(tag(html, 'property', 'og:type')).toBe('article');
    expect(tag(html, 'property', 'og:description')).toContain('Ni-Fe-Ti-Se');
    expect(tag(html, 'name', 'twitter:title')).toBe(meta.socialTitle);
    expect(tag(html, 'name', 'twitter:description')).toBe(meta.description);
    expect(tag(html, 'name', 'description')).toBe(meta.description);
    expect(tag(html, 'name', 'robots')).toBe('noindex, nofollow');
    expect(html).not.toContain('Free Cognitive Function Test - MBTI Test Alternative');
    // Each tag appears once, and the SPA shell is untouched.
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('src="/index.tsx"');
  });

  it('rejects stack values that are not function codes', () => {
    expect(shareStackFrom({ dominant: { function: '<script>' }, inferior: { function: 'Se' } })).toBeNull();
    expect(shareStackFrom(null)).toBeNull();
    const html = injectShareMeta(template, shareMeta('Ab3dE6gH9kL', null));
    expect(tag(html, 'property', 'og:title')).toBe('A shared TypeJung function-stack map — compare your map');
  });
});

describe('/share/:slug', () => {
  it('is rewritten to the share page function, keeping the browser URL', () => {
    const rewrite = vercelConfig.rewrites.find((entry: { source: string }) => entry.source === '/share/:slug');
    expect(rewrite.destination).toBe('/api/share/page?slug=:slug');
    const rewritten = rewriteApiPath(compileApiRewrites(vercelConfig), '/share/Ab3dE6gH9kL');
    expect(rewritten).toBe('/api/share/page?slug=Ab3dE6gH9kL');
    expect(resolveApiRoute(join(root, 'api'), '/api/share/page')?.file).toMatch(/api\/share\/page\.ts$/);
    // The JSON API the SPA reads still resolves to the slug handler.
    expect(resolveApiRoute(join(root, 'api'), '/api/share/Ab3dE6gH9kL')?.file).toMatch(/\[slug\]\.ts$/);
  });

  it('serves the SPA shell with per-result tags and no private data', async () => {
    const queries = useDatabase([{ stack: stored.stack }]);
    const res = await get({ slug: 'Ab3dE6gH9kL', utm_campaign: 'friend_compare' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(res.body).toContain('Ni-dominant · Se stress edge — compare your map');
    expect(res.body).toContain('<div id="root"></div>');
    // Only the stack column is read, and no score, id or user id is written out.
    expect(queries).toEqual([{ table: 'assessment_results', columns: 'stack', column: 'share_slug', value: 'Ab3dE6gH9kL' }]);
    expect(res.body).not.toContain(stored.id);
    expect(res.body).not.toContain(stored.user_id);
    expect(res.body).not.toMatch(/\b87\b|\b71\b/);
    // The no-JS fallback keeps the friend_compare campaign on its CTA.
    expect(res.body).toContain('utm_campaign=friend_compare');
    expect(res.body).toContain('shared_result=Ab3dE6gH9kL');
  });

  it('returns 404 with generic tags for an unknown slug', async () => {
    useDatabase([]);
    const res = await get({ slug: 'Unknown1234' });
    expect(res.statusCode).toBe(404);
    expect(res.body).toContain('A shared TypeJung function-stack map — compare your map');
    expect(res.body).toContain('<div id="root"></div>');
  });

  it('never queries the database for something that is not a slug', async () => {
    const queries = useDatabase([{ stack: stored.stack }]);
    const res = await get({ slug: "x' or 1=1" });
    expect(res.statusCode).toBe(404);
    expect(queries).toHaveLength(0);
  });

  it('still carries the tags when the built shell cannot be fetched', async () => {
    useDatabase([{ stack: stored.stack }]);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 503 })));
    const res = await get({ slug: 'Ab3dE6gH9kL' });
    expect(res.statusCode).toBe(200);
    expect(tag(res.body, 'property', 'og:title')).toBe('Ni-dominant · Se stress edge — compare your map');
    expect(res.body).toContain("fetch('/index.html')");
  });
});
