#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist', 'public');
const baseUrl = 'https://typejung.com';

const routePages = [
  {
    path: '/assessment',
    title: 'Take the Free Jungian Cognitive Function Assessment | TypeJung',
    description:
      'Take a free 42-question Jungian cognitive function assessment that maps all 8 functions, inferior-function pressure, somatic signals, and attitude direction.',
    h1: 'Take the free Jungian cognitive function assessment',
    cta: 'Start the free assessment',
    body: [
      'TypeJung measures all 8 Jungian cognitive functions through scenario-based questions instead of reducing you immediately to a four-letter label.',
      'The free result shows the core energy map first. Paid Insight and Mastery reports are optional one-time CAD upgrades after you can see whether the result feels useful.',
      'This page is the best starting point if you are comparing Jungian tests, MBTI alternatives, inferior-function tests, or cognitive-function tests.',
    ],
  },
  {
    path: '/learn',
    title: 'Learn Jungian Psychology and Cognitive Functions | TypeJung',
    description:
      'Learn Carl Jung typology, the 8 cognitive functions, introversion and extraversion, inferior-function stress, and individuation through TypeJung guides.',
    h1: 'Learn Jungian psychology and cognitive functions',
    cta: 'Take the assessment',
  },
  {
    path: '/pricing',
    title: 'TypeJung Pricing - Free, Insight, and Mastery Plans',
    description:
      'Start with the free TypeJung assessment, then unlock Insight for CA$10 or Mastery for CA$29 with transparent one-time CAD pricing.',
    h1: 'TypeJung pricing',
    cta: 'Compare plans',
  },
  {
    path: '/checkout/insight',
    title: 'Checkout - TypeJung Insight Package',
    description:
      'Review your TypeJung Insight order before continuing to secure Stripe payment.',
    h1: 'Checkout for TypeJung Insight',
    cta: 'Review checkout',
    noIndex: true,
  },
  {
    path: '/checkout/mastery',
    title: 'Checkout - TypeJung Mastery Package',
    description:
      'Review your TypeJung Mastery order before continuing to secure Stripe payment.',
    h1: 'Checkout for TypeJung Mastery',
    cta: 'Review checkout',
    noIndex: true,
  },
  {
    path: '/leaderboard',
    title: 'Community Jungian Function Results | TypeJung',
    description:
      'Explore community TypeJung energy map patterns across cognitive functions, dominant-inferior axes, and Jungian typology results.',
    h1: 'Community Jungian function results',
    cta: 'Take your assessment',
  },
  {
    path: '/about',
    title: 'About TypeJung - A Depth-Based Jungian Assessment',
    description:
      'TypeJung maps Jungian energy, inferior-function pressure, somatic signals, and attitude direction instead of forcing a shallow four-letter label.',
    h1: 'About TypeJung',
    cta: 'Start the free assessment',
  },
];

const guideLinks = [
  ['/jungian-test', 'Jungian Test'],
  ['/jungian-typology', 'Jungian Typology Guide'],
  ['/cognitive-functions', 'Cognitive Functions Guide'],
  ['/mbti-alternative', 'MBTI Alternative'],
  ['/inferior-function-test', 'Inferior Function Test'],
  ['/cognitive-function-test', 'Cognitive Function Test'],
  ['/jungian-cognitive-functions-test', 'Jungian Cognitive Functions Test'],
  ['/mbti-keeps-changing', 'Why MBTI Keeps Changing'],
  ['/shadow-work-test', 'Shadow Work Test'],
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const routeLabel = (path) =>
  path
    .replace('/', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const setTitle = (html, title) =>
  html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

const setMetaName = (html, name, content) => {
  const tag = `<meta name="${name}" content="${escapeHtml(content)}">`;
  const pattern = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
};

const setMetaProperty = (html, property, content) => {
  const tag = `<meta property="${property}" content="${escapeHtml(content)}">`;
  const pattern = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
};

const setCanonical = (html, url) => {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}">`;
  return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag);
};

const pageJsonLd = (page) => {
  const url = `${baseUrl}${page.path}`;
  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: page.title,
          description: page.description,
          isPartOf: {
            '@type': 'WebSite',
            name: 'TypeJung',
            url: baseUrl,
          },
          inLanguage: 'en',
          dateModified: '2026-05-18',
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${baseUrl}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: routeLabel(page.path),
              item: url,
            },
          ],
        },
      ],
    },
    null,
    2,
  );
};

const buildNoscript = (page) => `
    <noscript>
      <main style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: Georgia, serif; line-height: 1.8; color: #333;">
        <nav style="margin-bottom: 24px;"><a href="/">Home</a> &gt; ${escapeHtml(routeLabel(page.path))}</nav>
        <h1 style="font-size: 2.35em; color: #451a03; margin-bottom: 12px;">${escapeHtml(page.h1)}</h1>
        <p style="font-size: 1.18em; color: #57534e; margin-bottom: 24px;">${escapeHtml(page.description)}</p>
        ${(page.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
        <p><a href="${page.path === '/pricing' ? '/pricing' : '/assessment'}" style="display: inline-block; padding: 14px 24px; background: #451a03; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">${escapeHtml(page.cta)}</a></p>
        <section style="margin-top: 36px;">
          <h2 style="color: #451a03; border-bottom: 1px solid #e7e5e4; padding-bottom: 8px;">Popular TypeJung guides</h2>
          <ul style="columns: 2; column-gap: 30px;">
            ${guideLinks.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('\n            ')}
          </ul>
        </section>
      </main>
    </noscript>`;

const injectRouteJsonLd = (html, page) =>
  html.replace('</head>', `    <script type="application/ld+json">\n${pageJsonLd(page)}\n    </script>\n  </head>`);

const makeRouteHtml = (template, page) => {
  const url = `${baseUrl}${page.path}`;
  let html = template;

  html = setTitle(html, page.title);
  html = setMetaName(html, 'description', page.description);
  html = setMetaName(html, 'robots', page.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  html = setCanonical(html, url);
  html = setMetaProperty(html, 'og:url', url);
  html = setMetaProperty(html, 'og:title', page.title);
  html = setMetaProperty(html, 'og:description', page.description);
  html = setMetaName(html, 'twitter:url', url);
  html = setMetaName(html, 'twitter:title', page.title);
  html = setMetaName(html, 'twitter:description', page.description);
  html = html.replace(
    /(<body[^>]*>\s*)(?:<!--[\s\S]*?-->\s*)?<noscript>[\s\S]*?<\/noscript>/i,
    (_, bodyOpen) => `${bodyOpen}<!-- Page-specific Noscript for SEO -->\n${buildNoscript(page)}`,
  );
  html = injectRouteJsonLd(html, page);

  return html;
};

const template = readFileSync(join(distDir, 'index.html'), 'utf8');

for (const page of routePages) {
  const routeDir = join(distDir, page.path.slice(1));
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(join(routeDir, 'index.html'), makeRouteHtml(template, page));
  console.log(`Generated route HTML: ${page.path}`);
}

console.log(`Generated ${routePages.length} route-specific SPA HTML files.`);
