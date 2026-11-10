// One shell for every standalone HTML page TypeJung generates: the Jung
// Library, landing pages, function and type pages, the blog and the 404 page.
// It mirrors the app header and footer (components/layout/Layout.tsx) and is
// styled by public/site.css, so static pages and the app read as one site.
import { standaloneAnalyticsSnippet } from './standalone-analytics.mjs';

export const SITE = {
  url: 'https://typejung.com',
  name: 'TypeJung',
  supportEmail: 'support@typejung.com',
  description: 'Jung, made usable: a sourced library of Carl Jung\'s ideas, a free function-stack map, and careful practices for educational self-reflection.',
  sameAs: [
    'https://x.com/typejung',
    'https://www.reddit.com/user/typejung',
    'https://github.com/felmonon/jungian-typology-assessment',
    'https://github.com/felmonon',
    'https://www.linkedin.com/in/felmonfekadu/',
  ],
};

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const absoluteUrl = (path) => (path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`);

/** A JSON-LD script tag. `<` is escaped so content can never close the tag. */
export const jsonLd = (value) =>
  `<script type="application/ld+json">\n${JSON.stringify(value, null, 2).replace(/</g, '\\u003c')}\n</script>`;

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  sameAs: SITE.sameAs,
};

const NAV = [
  { key: 'library', href: '/jung', label: 'Jung Library' },
  { key: 'method', href: '/methodology', label: 'How it works' },
  { key: 'sample', href: '/sample-report', label: 'Sample report' },
  { key: 'pricing', href: '/pricing', label: 'Pricing' },
];

const FOOTER = [
  {
    title: 'Jung Library',
    links: [
      ['/jung', 'All concepts'],
      ['/jung/glossary', 'Glossary'],
      ['/jung/quotes', 'Quotes, with sources'],
      ['/jung/where-to-start', 'Where to start reading'],
      ['/jung/books', 'Book guides'],
      ['/jung/life', 'Jung\'s life'],
    ],
  },
  {
    title: 'Your map',
    links: [
      ['/assessment', 'Free assessment'],
      ['/sample-report', 'Sample report'],
      ['/pricing', 'Pricing'],
      ['/methodology', 'Methodology'],
      ['/cognitive-functions', 'The eight functions'],
      ['/guides', 'All guides'],
    ],
  },
  {
    title: 'Good to know',
    links: [
      ['/about', 'About TypeJung'],
      ['/jung/editorial-standards', 'Editorial standards'],
      ['/blog', 'Blog'],
      ['/privacy', 'Privacy'],
      ['/terms', 'Terms'],
      [`mailto:${SITE.supportEmail}`, 'Support'],
    ],
  },
];

/**
 * Head tags shared by every standalone page.
 * @param {{ title: string, description: string, path: string, keywords?: string[], ogType?: string, noindex?: boolean }} options
 */
export function shellHead({ title, description, path, keywords = [], ogType = 'article', noindex = false }) {
  const url = absoluteUrl(path);
  const keywordTag = keywords.length
    ? `\n<meta name="keywords" content="${escapeHtml(keywords.join(', '))}">`
    : '';
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">${keywordTag}
<meta name="author" content="TypeJung">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta property="og:type" content="${escapeHtml(ogType)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${SITE.url}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="TypeJung">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${SITE.url}/og-image.png">
<meta name="twitter:site" content="@typejung">
<meta name="theme-color" content="#4144b8">
<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=folded-compass-1">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=folded-compass-1">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=folded-compass-1">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/schibsted-latin-1.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/site.css">`;
}

const mapCta = (source, className = 'btn btn-sm') =>
  `<a class="${className}" href="/assessment?source=${escapeHtml(source)}" data-map-cta data-source="${escapeHtml(source)}">Get my free map</a>`;

/** @param {{ active?: string, ctaSource?: string }} [options] */
export function shellHeader({ active = '', ctaSource = 'shell_header' } = {}) {
  const link = (item) =>
    `<a href="${item.href}"${item.key === active ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>`;
  return `<a class="skip-link" href="#main-content">Skip to content</a>
<header class="shell-header" data-shell-header>
  <div class="wrap shell-header-inner">
    <a class="shell-brand" href="/" aria-label="TypeJung home">
      <img src="/logo.svg?v=folded-compass-1" width="40" height="40" alt="">
      <span>TypeJung</span>
    </a>
    <nav class="shell-nav" aria-label="Main">
      ${NAV.map(link).join('\n      ')}
    </nav>
    <div class="shell-actions">
      <a class="shell-signin" href="/auth">Sign in</a>
      <a class="btn btn-sm shell-cta" href="/assessment?source=${escapeHtml(ctaSource)}" data-map-cta data-source="${escapeHtml(ctaSource)}" data-label-map="My map" data-label-resume="Resume"><span class="cta-long">Get my free map</span><span class="cta-short">Free map</span></a>
      <button class="shell-menu-toggle" type="button" aria-expanded="false" aria-controls="shell-mobile-menu" aria-label="Toggle menu" data-shell-toggle>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <div class="wrap shell-mobile" id="shell-mobile-menu">
    ${NAV.map(link).join('\n    ')}
    <a href="/cognitive-functions">The eight functions</a>
    <a href="/auth">Sign in</a>
  </div>
</header>`;
}

export function shellFooter() {
  const column = (group) => `<nav aria-label="${escapeHtml(group.title)}">
      <h2>${escapeHtml(group.title)}</h2>
      <ul>
        ${group.links.map(([href, label]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('\n        ')}
      </ul>
    </nav>`;
  return `<footer class="shell-footer">
  <div class="wrap shell-footer-grid">
    <div>
      <a class="shell-brand" href="/" aria-label="TypeJung home">
        <img src="/logo.svg?v=folded-compass-1" width="40" height="40" alt="">
        <span>TypeJung</span>
      </a>
      <p>Jung, made usable. A sourced library of his ideas and a free map of your own function pattern, for educational self-reflection.</p>
    </div>
    ${FOOTER.map(column).join('\n    ')}
  </div>
  <div class="wrap shell-footer-base">
    <span>&copy; 2026 TypeJung. Independent. Not affiliated with the Jung family or any Jungian institute.</span>
    <span>Educational, not clinical. Not a substitute for professional care.</span>
  </div>
</footer>`;
}

/**
 * Behavior shared by every standalone page: the mobile menu, the map button
 * that knows whether this browser has a saved or unfinished map, and campaign
 * parameters carried onto internal links.
 */
export const shellScripts = `<script data-typejung-shell>
(() => {
  const header = document.querySelector('[data-shell-header]');
  const toggle = document.querySelector('[data-shell-toggle]');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  try {
    const saved = JSON.parse(localStorage.getItem('jungian_assessment_results') || 'null');
    const hasMap = Boolean(saved && typeof saved === 'object' && saved.version === 'depth-energy-map');
    let unfinished = false;
    if (!hasMap) {
      const progress = JSON.parse(localStorage.getItem('jungian_depth_assessment_progress') || 'null');
      const answers = progress && typeof progress.answers === 'object' && progress.answers ? progress.answers : {};
      unfinished = Object.keys(answers).some((key) => answers[key]);
    }
    if (hasMap || unfinished) {
      document.querySelectorAll('[data-map-cta]').forEach((link) => {
        const source = link.getAttribute('data-source') || 'shell';
        if (hasMap) {
          link.textContent = link.getAttribute('data-label-map') || 'My map';
          link.setAttribute('href', '/results');
        } else {
          link.textContent = link.getAttribute('data-label-resume') || 'Resume my map';
          link.setAttribute('href', '/assessment?source=' + encodeURIComponent(source + '_resume'));
        }
      });
      document.documentElement.setAttribute('data-map-state', hasMap ? 'saved' : 'unfinished');
    }
  } catch {
    // Storage can be unavailable; the default button still works.
  }

  const clean = (value, max = 100) => typeof value === 'string'
    ? value.trim().replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, max)
    : '';
  const chainOf = (...values) => Array.from(new Set(values.flatMap((value) =>
    typeof value === 'string' ? value.split('>').map((token) => clean(token, 80)).filter(Boolean) : []))).join('>').slice(0, 240);
  const params = new URLSearchParams(window.location.search);
  const currentSource = clean(params.get('source'), 80);
  const currentChain = chainOf(params.get('source_chain'), params.get('parent_source'), currentSource);
  const carried = new URLSearchParams();
  ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'ref', 'shared_result', 'parent_source'].forEach((key) => {
    const value = clean(params.get(key));
    if (value) carried.set(key, value);
  });
  if (currentChain) carried.set('source_chain', currentChain);
  if (!currentSource && Array.from(carried.keys()).length === 0) return;

  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href') || '';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/api/')) return;
    const url = new URL(raw, window.location.origin);
    carried.forEach((value, key) => { if (!url.searchParams.has(key)) url.searchParams.set(key, value); });
    const linkSource = clean(url.searchParams.get('source'), 80);
    if (currentSource && linkSource && linkSource !== currentSource && !url.searchParams.has('parent_source')) {
      url.searchParams.set('parent_source', currentSource);
    }
    if (currentSource && !linkSource) url.searchParams.set('source', currentSource);
    const finalSource = clean(url.searchParams.get('source'), 80);
    const finalChain = chainOf(currentChain, finalSource && finalSource !== currentSource ? finalSource : '');
    if (finalChain) url.searchParams.set('source_chain', finalChain);
    link.setAttribute('href', url.pathname + url.search + url.hash);
  });
})();
</script>`;

/**
 * A complete standalone document.
 * @param {{ head: string, main: string, active?: string, ctaSource?: string, schemas?: object[], scripts?: string, mainClass?: string }} options
 */
export function shellDocument({ head, main, active = '', ctaSource, schemas = [], scripts = '', mainClass = '' }) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${head}
${schemas.map(jsonLd).join('\n')}
${standaloneAnalyticsSnippet}
</head>
<body>
${shellHeader({ active, ctaSource })}
<main id="main-content"${mainClass ? ` class="${mainClass}"` : ''}>
${main}
</main>
${shellFooter()}
${shellScripts}${scripts ? `\n${scripts}` : ''}
</body>
</html>
`;
  return html.replace(/^[ \t]+$/gm, '');
}

export { mapCta };
