// Share-preview tags for /share/:slug.
//
// Link unfurlers (Slack, X, iMessage, Facebook) do not run JavaScript, so the
// SPA's useSEO tags never reach them. api/share/page.ts serves the built
// index.html with these tags already in the head. Real visitors get the same
// SPA shell and the app takes over as usual.
//
// Only the function stack is used. Scores, ids, user ids and timestamps never
// go into the page.

export const SITE_URL = 'https://typejung.com';

const FUNCTION_CODES = new Set(['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe']);

// Share slugs are 8 random bytes in base64url (11 characters). Anything that
// could not be a slug is rejected before it reaches the database.
export const isShareSlug = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{4,64}$/.test(value);

export interface ShareStack {
  dominant: string;
  auxiliary?: string;
  tertiary?: string;
  inferior: string;
}

type StackSlot = { function?: unknown } | null | undefined;

const codeOf = (slot: StackSlot): string | undefined => {
  const code = slot && typeof slot === 'object' ? slot.function : undefined;
  return typeof code === 'string' && FUNCTION_CODES.has(code) ? code : undefined;
};

/** Pulls the four stack positions out of a stored result, or null if they are not valid function codes. */
export function shareStackFrom(stack: unknown): ShareStack | null {
  if (!stack || typeof stack !== 'object') return null;
  const value = stack as Record<string, StackSlot>;
  const dominant = codeOf(value.dominant);
  const inferior = codeOf(value.inferior);
  if (!dominant || !inferior) return null;
  return {
    dominant,
    auxiliary: codeOf(value.auxiliary),
    tertiary: codeOf(value.tertiary),
    inferior,
  };
}

export interface ShareMeta {
  title: string;
  socialTitle: string;
  description: string;
  url: string;
  image: string;
}

export function shareMeta(slug: string, stack: ShareStack | null): ShareMeta {
  const url = `${SITE_URL}/share/${encodeURIComponent(slug)}`;
  const image = `${SITE_URL}/og-image.png`;

  if (!stack) {
    const socialTitle = 'A shared TypeJung function-stack map — compare your map';
    return {
      title: `${socialTitle} | TypeJung`,
      socialTitle,
      description: 'Someone shared their TypeJung function-stack map. Take the free 42-question assessment and compare your own pattern.',
      url,
      image,
    };
  }

  const socialTitle = `${stack.dominant}-dominant · ${stack.inferior} stress edge — compare your map`;
  const order = [stack.dominant, stack.auxiliary, stack.tertiary, stack.inferior].filter(Boolean).join('-');
  return {
    title: `${socialTitle} | TypeJung`,
    socialTitle,
    description: `A shared TypeJung map: ${order} stack, with ${stack.dominant} leading and ${stack.inferior} as the stress edge. Take the free 42-question assessment and compare your own function pattern.`,
    url,
    image,
  };
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function setTag(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}">`;
  const pattern = new RegExp(`<meta\\s+${attr}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function shareNoscript(meta: ShareMeta, assessmentHref: string): string {
  return `<noscript>
      <main style="max-width: 720px; margin: 0 auto; padding: 40px 20px; font-family: 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #202230;">
        <p><a href="/">TypeJung</a></p>
        <h1>${escapeHtml(meta.socialTitle)}</h1>
        <p>${escapeHtml(meta.description)}</p>
        <p><a href="${escapeHtml(assessmentHref)}">Take the free assessment and compare</a></p>
      </main>
    </noscript>`;
}

/**
 * Builds the CTA link the shared page's noscript fallback offers. It keeps the
 * visitor's utm_campaign (friend_compare from the results share) the same way
 * the SPA's buildSharedResultHref does.
 */
export function shareAssessmentHref(slug: string, campaign: unknown): string {
  const clean = typeof campaign === 'string' ? campaign.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) : '';
  const params = new URLSearchParams({
    source: 'shared_result_cta',
    ref: 'shared_result',
    utm_campaign: clean || 'shared_result_compare',
    shared_result: slug,
  });
  return `/assessment?${params.toString()}`;
}

/** Puts the share tags into the built index.html. Everything else in the shell is left alone. */
export function injectShareMeta(template: string, meta: ShareMeta, assessmentHref = '/assessment'): string {
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = setTag(html, 'name', 'description', meta.description);
  html = setTag(html, 'name', 'robots', 'noindex, nofollow');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(meta.url)}">`);
  html = setTag(html, 'property', 'og:type', 'article');
  html = setTag(html, 'property', 'og:url', meta.url);
  html = setTag(html, 'property', 'og:title', meta.socialTitle);
  html = setTag(html, 'property', 'og:description', meta.description);
  html = setTag(html, 'property', 'og:image', meta.image);
  html = setTag(html, 'name', 'twitter:card', 'summary_large_image');
  html = setTag(html, 'name', 'twitter:url', meta.url);
  html = setTag(html, 'name', 'twitter:title', meta.socialTitle);
  html = setTag(html, 'name', 'twitter:description', meta.description);
  html = setTag(html, 'name', 'twitter:image', meta.image);
  // The homepage's noscript copy would describe the wrong page.
  html = html.replace(
    /(<body[^>]*>\s*)(?:<!--[\s\S]*?-->\s*)?<noscript>[\s\S]*?<\/noscript>/i,
    (_match, bodyOpen: string) => `${bodyOpen}${shareNoscript(meta, assessmentHref)}`,
  );
  return html;
}

/**
 * Used only when the built index.html cannot be loaded. It still carries the
 * tags for unfurlers, then loads the real SPA shell in place so the visitor
 * stays on the same URL.
 */
export function fallbackShareHtml(meta: ShareMeta, assessmentHref = '/assessment'): string {
  const head = injectShareMeta(
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
    <link rel="canonical" href="">
  </head>
  <body>
    <noscript></noscript>
    <script>fetch('/index.html').then(function (r) { return r.text(); }).then(function (h) { document.open(); document.write(h); document.close(); });</script>
  </body>
</html>`,
    meta,
    assessmentHref,
  );
  return head;
}
