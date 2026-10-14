#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { growthBlogArticles } from './growth-blog-data.mjs';
import { standaloneAnalyticsSnippet, withStandaloneAnalytics } from './standalone-analytics.mjs';
import { writeGeneratedFile } from './stable-dates.mjs';
import { STATIC_BASE_CSS, STATIC_FONT_LINKS } from './static-page-style.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicBlogDir = join(__dirname, '..', 'public', 'blog');
const baseUrl = 'https://typejung.com';
const sameAs = [
  'https://x.com/typejung',
  'https://www.reddit.com/user/typejung',
  'https://github.com/felmonon/jungian-typology-assessment',
  'https://github.com/felmonon',
  'https://www.linkedin.com/in/felmonfekadu/',
];
const buildDate = new Date().toISOString().split('T')[0];

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const sourceSlug = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const sourceFor = (sourceBase, placement) =>
  `${sourceSlug(sourceBase)}_${sourceSlug(placement)}`.slice(0, 80);

const withSource = (href, sourceBase, placement) => {
  const conversionPaths = ['/assessment', '/pricing', '/sample-report'];
  const [path] = href.split('?');

  if (!conversionPaths.includes(path)) return href;

  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}source=${encodeURIComponent(sourceFor(sourceBase, placement))}`;
};

const articleSchema = (article) => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: buildDate,
      author: {
        '@type': 'Organization',
        name: 'TypeJung',
        url: baseUrl,
        sameAs,
      },
      publisher: {
        '@type': 'Organization',
        name: 'TypeJung',
        url: baseUrl,
        sameAs,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
        },
      },
      mainEntityOfPage: `${baseUrl}/blog/${article.slug}`,
      image: `${baseUrl}/og-image.png`,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog/` },
        { '@type': 'ListItem', position: 3, name: article.title, item: `${baseUrl}/blog/${article.slug}` },
      ],
    },
  ],
}, null, 2);

const style = STATIC_BASE_CSS;

const renderSaveLinkPanel = (sourceBase, idBase = sourceBase) => `<section class="save-link-panel" aria-labelledby="${escapeHtml(sourceSlug(idBase))}-save-link-title">
    <h2 id="${escapeHtml(sourceSlug(idBase))}-save-link-title">Want to take the free map later?</h2>
    <p>Email yourself the assessment link and TYPEJUNG30 code. Start with the free result, then decide after the map.</p>
    <form class="save-link-form" data-discount-lead-form data-source="${escapeHtml(sourceFor(sourceBase, 'email_code'))}" data-tier="insight">
      <label class="sr-only" for="${escapeHtml(sourceSlug(idBase))}-save-link-email">Email address</label>
      <div class="save-link-form-row">
        <input id="${escapeHtml(sourceSlug(idBase))}-save-link-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
        <button type="submit">Email the free link</button>
      </div>
      <input class="honeypot" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="save-link-status" aria-live="polite"></p>
    </form>
  </section>`;

const landingAttributionScript = `<script>
    (() => {
      const cleanToken = (value, maxLength = 100) => {
        if (typeof value !== 'string') return '';
        return value
          .trim()
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, maxLength);
      };
      const cleanSourceChain = (value) => {
        if (typeof value !== 'string') return '';
        return Array.from(new Set(value
          .split('>')
          .map((token) => cleanToken(token, 80))
          .filter(Boolean)))
          .join('>')
          .slice(0, 240);
      };
      const appendSourceChain = (...values) => {
        return Array.from(new Set(values.flatMap((value) => {
          const chain = cleanSourceChain(value);
          return chain ? chain.split('>') : [];
        }))).join('>').slice(0, 240);
      };
      const currentParams = new URLSearchParams(window.location.search);
      const currentSource = cleanToken(currentParams.get('source'), 80);
      const currentParentSource = cleanToken(currentParams.get('parent_source'), 80);
      const currentSourceChain = appendSourceChain(
        currentParams.get('source_chain'),
        currentParentSource,
        currentSource,
      );
      const preservedKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_content', 'utm_term', 'ref', 'shared_result', 'parent_source'];
      const preserved = new URLSearchParams();
      preservedKeys.forEach((key) => {
        const value = cleanToken(currentParams.get(key));
        if (value) preserved.set(key, value);
      });
      if (currentSourceChain) preserved.set('source_chain', currentSourceChain);
      const hasPreserved = Array.from(preserved.keys()).length > 0;
      if (!hasPreserved && !currentSource) return;

      document.querySelectorAll('a[href]').forEach((link) => {
        const rawHref = link.getAttribute('href') || '';
        if (!rawHref.startsWith('/') || rawHref.startsWith('//') || rawHref.startsWith('/api/')) return;

        const url = new URL(rawHref, window.location.origin);
        preserved.forEach((value, key) => {
          if (!url.searchParams.has(key)) url.searchParams.set(key, value);
        });

        const linkSource = cleanToken(url.searchParams.get('source'), 80);
        if (currentSource && linkSource && linkSource !== currentSource && !url.searchParams.has('parent_source')) {
          url.searchParams.set('parent_source', currentSource);
        }
        if (currentSource && !linkSource) {
          url.searchParams.set('source', currentSource);
        }
        const finalSource = cleanToken(url.searchParams.get('source'), 80);
        const finalSourceChain = appendSourceChain(
          currentSourceChain,
          finalSource && finalSource !== currentSource ? finalSource : '',
        );
        if (finalSourceChain) url.searchParams.set('source_chain', finalSourceChain);

        link.setAttribute('href', url.pathname + url.search + url.hash);
      });
    })();
  </script>`;

const discountLeadScript = `
  <script>
    (() => {
      const attributionPayload = () => {
        const params = new URLSearchParams(window.location.search);
        const cleanToken = (value) => {
          if (typeof value !== 'string') return '';
          return value
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 100);
        };
        const cleanSourceChain = (value) => {
          if (typeof value !== 'string') return '';
          return Array.from(new Set(value
            .split('>')
            .map((token) => cleanToken(token).slice(0, 80))
            .filter(Boolean)))
            .join('>')
            .slice(0, 240);
        };
        const utmSource = cleanToken(params.get('utm_source'));
        const utmCampaign = cleanToken(params.get('utm_campaign'));
        const parentSource = cleanToken(params.get('parent_source')) || cleanToken(params.get('source'));
        const sourceChain = cleanSourceChain(params.get('source_chain'));

        return {
          ...(utmSource ? { utmSource } : {}),
          ...(utmCampaign ? { utmCampaign } : {}),
          ...(parentSource ? { parentSource } : {}),
          ...(sourceChain ? { sourceChain } : {}),
        };
      };
      const forms = document.querySelectorAll('[data-discount-lead-form]');
      forms.forEach((form) => {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          const email = form.querySelector('input[name="email"]')?.value || '';
          const website = form.querySelector('input[name="website"]')?.value || '';
          const button = form.querySelector('button[type="submit"]');
          const status = form.querySelector('.save-link-status');
          const source = form.getAttribute('data-source') || 'blog_email_code';
          const tierIntent = form.getAttribute('data-tier') || 'insight';

          if (status) status.textContent = 'Sending the link...';
          if (button) button.disabled = true;

          try {
            const response = await fetch('/api/auth/discount-lead', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ email, website, source, tierIntent, ...attributionPayload() }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Could not send the link.');
            if (status) status.textContent = 'Sent. Check your inbox for the free assessment link and code.';
            form.setAttribute('data-sent', 'true');
          } catch (error) {
            if (status) status.textContent = error.message || 'Could not send the link. Try again in a moment.';
            if (button) button.disabled = false;
          }
        });
      });
    })();
  </script>
${landingAttributionScript}`;

const renderNav = (sourceBase = 'blog') => `
  <nav>
    <a href="/">Home</a>
    <a href="${escapeHtml(withSource('/assessment', sourceBase, 'nav'))}">Take Assessment</a>
    <a href="/jungian-cognitive-functions-test">Jungian Cognitive Functions Test</a>
    <a href="/jungian-test">Jungian Test</a>
    <a href="/mbti-alternative">MBTI Alternative</a>
    <a href="/blog/">Blog</a>
  </nav>`;

const renderArticle = (article) => {
  const sourceBase = `blog_${article.slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title)} | TypeJung</title>
  <meta name="description" content="${escapeHtml(article.description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${baseUrl}/blog/${article.slug}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${baseUrl}/blog/${article.slug}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(article.description)}">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${STATIC_FONT_LINKS}
  <script type="application/ld+json">
${articleSchema(article)}
  </script>
  <style>${style}</style>
${standaloneAnalyticsSnippet}
</head>
<body>
${renderNav(sourceBase)}
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${escapeHtml(article.title)}</div>
  <article>
    <p class="meta">${escapeHtml(article.date)} &bull; ${escapeHtml(article.readTime)}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="subtitle">${escapeHtml(article.description)}</p>
    <div>${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>

    <section class="cta">
      <h2>See your own Jungian function-stack map</h2>
      <p>Take the free 42-question TypeJung assessment before you keep comparing type descriptions. The result shows your dominant pattern, inferior-function pressure, and growth edge.</p>
      <a class="btn" href="${escapeHtml(withSource('/assessment', sourceBase, 'article_cta'))}">Take the free assessment</a>
      <a class="secondary-link" href="${escapeHtml(withSource('/sample-report', sourceBase, 'article_sample'))}">View sample report</a>
    </section>
    ${renderSaveLinkPanel(sourceBase, article.slug)}

    ${article.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n      ')}
    </section>`).join('\n')}
  </article>

  <aside class="related">
    <h2>Related TypeJung guides</h2>
    <ul>
      <li><a href="/jungian-cognitive-functions-test">Jungian cognitive functions test</a></li>
      ${article.related.map(([href, label]) => `<li><a href="${escapeHtml(withSource(href, sourceBase, 'related'))}">${escapeHtml(label)}</a></li>`).join('\n      ')}
    </ul>
  </aside>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a></p>
  </footer>
${discountLeadScript}
</body>
</html>
`;
};

const renderIndex = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jungian Psychology and Cognitive Functions Blog | TypeJung</title>
  <meta name="description" content="Explore Jungian psychology, cognitive functions, personality types, mistyping, inferior functions, shadow work, and personal growth.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${baseUrl}/blog/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/blog/">
  <meta property="og:title" content="Jungian Psychology and Cognitive Functions Blog | TypeJung">
  <meta property="og:description" content="Explore Jungian psychology, cognitive functions, mistyping, inferior functions, and shadow work.">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${STATIC_FONT_LINKS}
  <style>
${style}
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 4px; margin: 32px 0; }
    .blog-card { background: var(--jung-surface); padding: 24px; }
    .blog-card h2 { margin: 0 0 2px; font-size: 1.4rem; letter-spacing: -0.02em; }
    .blog-card h2 a { display: block; padding-block: 10px; color: var(--jung-dark); text-decoration: none; }
    .blog-card h2 a:hover { text-decoration: underline; }
  </style>
${standaloneAnalyticsSnippet}
</head>
<body>
${renderNav('blog_index')}
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; Blog</div>
  <h1>TypeJung Blog</h1>
  <p class="subtitle">Jungian psychology, cognitive functions, mistyping, inferior functions, and shadow work.</p>

  <section class="cta">
    <h2>Start with your own map</h2>
    <p>The articles are more useful when you can compare them to your own dominant-inferior pattern.</p>
    <a class="btn" href="${escapeHtml(withSource('/assessment', 'blog_index', 'hero'))}">Take the free assessment</a>
    <a class="secondary-link" href="${escapeHtml(withSource('/sample-report', 'blog_index', 'hero_sample'))}">View sample report</a>
  </section>
${renderSaveLinkPanel('blog_index', 'blog-index')}

  <div class="blog-grid">
${growthBlogArticles.map((article) => `
    <article class="blog-card">
      <p class="meta">${escapeHtml(article.date)} &bull; ${escapeHtml(article.readTime)}</p>
      <h2><a href="/blog/${article.slug}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.description)}</p>
      <div>${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
    </article>`).join('\n')}
    <article class="blog-card">
      <p class="meta">January 2026 &bull; 12 min read</p>
      <h2><a href="/blog/singer-loomis-vs-mbti">Singer-Loomis vs MBTI: What's the Difference?</a></h2>
      <p>Why mapping all 8 cognitive functions can provide more inspectable results than forced-choice dichotomies.</p>
      <span class="tag">Methodology</span><span class="tag">Research</span>
    </article>
    <article class="blog-card">
      <p class="meta">January 2026 &bull; 10 min read</p>
      <h2><a href="/blog/understanding-the-grip">Understanding "The Grip": When Your Inferior Function Takes Over</a></h2>
      <p>What happens when stress pressures your least developed cognitive function, and how to recognize and recover from grip experiences.</p>
      <span class="tag">Stress</span><span class="tag">Growth</span>
    </article>
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a></p>
  </footer>
${discountLeadScript}
</body>
</html>
`;

mkdirSync(publicBlogDir, { recursive: true });

for (const article of growthBlogArticles) {
  writeGeneratedFile(join(publicBlogDir, `${article.slug}.html`), renderArticle(article));
  console.log(`Generated blog article: /blog/${article.slug}`);
}

writeFileSync(join(publicBlogDir, 'index.html'), renderIndex());

// These two indexed articles predate this generator. Preserve their editorial
// HTML while keeping their analytics coverage consistent and idempotent.
for (const slug of ['singer-loomis-vs-mbti', 'understanding-the-grip']) {
  const file = join(publicBlogDir, `${slug}.html`);
  writeFileSync(file, withStandaloneAnalytics(readFileSync(file, 'utf8')));
}
console.log(`Generated growth blog index with ${growthBlogArticles.length + 2} articles.`);
