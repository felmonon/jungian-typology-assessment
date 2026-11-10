#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { growthBlogArticles } from './growth-blog-data.mjs';
import { standaloneAnalyticsSnippet, writeTrafficAttributionScript } from './standalone-analytics.mjs';
import { writeGeneratedFile } from './stable-dates.mjs';
import { shellFooter, shellHead, shellHeader, shellScripts } from './site-shell.mjs';

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
writeTrafficAttributionScript();

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
  </script>`;

const renderArticle = (article) => {
  const sourceBase = `blog_${article.slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${shellHead({ title: `${article.title} | TypeJung`, description: article.description, path: `/blog/${article.slug}`, keywords: article.tags })}
<script type="application/ld+json">
${articleSchema(article)}
</script>
${standaloneAnalyticsSnippet}
</head>
<body>
${shellHeader({ ctaSource: sourceFor(sourceBase, 'nav') })}
<main id="main-content" class="page page-narrow">
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

</main>
${shellFooter()}
${shellScripts}
${discountLeadScript}
</body>
</html>
`;
};

const renderIndex = () => `<!DOCTYPE html>
<html lang="en">
<head>
${shellHead({ title: 'Jungian Psychology and Cognitive Functions Blog | TypeJung', description: 'Explore Jungian psychology, cognitive functions, personality types, mistyping, inferior functions, shadow work, and personal growth.', path: '/blog/', ogType: 'website' })}
${standaloneAnalyticsSnippet}
</head>
<body>
${shellHeader({ ctaSource: sourceFor('blog_index', 'nav') })}
<main id="main-content" class="page">
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

</main>
${shellFooter()}
${shellScripts}
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

// These two indexed articles predate this generator. Their editorial HTML is
// kept as written; only the head, header and footer are replaced so they match
// the rest of the site. The transform is safe to run repeatedly.
const decodeEntities = (value) => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function reshellLegacyArticle(html, slug) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const breadcrumb = html.match(/<div class="breadcrumb">[\s\S]*?<\/div>/)?.[0];
  const article = html.match(/<article>[\s\S]*<\/article>/)?.[0];
  if (!title || !description || !breadcrumb || !article) throw new Error(`Legacy blog article ${slug} is missing an expected part`);
  return `<!DOCTYPE html>
<html lang="en">
<head>
${shellHead({ title: decodeEntities(title), description: decodeEntities(description), path: `/blog/${slug}` })}
${standaloneAnalyticsSnippet}
</head>
<body>
${shellHeader({ ctaSource: sourceFor(`blog_${slug}`, 'nav') })}
<main id="main-content" class="page page-narrow">
  ${breadcrumb}

  ${article.replace(/ style="margin-top: 0; color: white;"/g, '')}
</main>
${shellFooter()}
${shellScripts}
</body>
</html>
`;
}

for (const slug of ['singer-loomis-vs-mbti', 'understanding-the-grip']) {
  const file = join(publicBlogDir, `${slug}.html`);
  writeFileSync(file, reshellLegacyArticle(readFileSync(file, 'utf8'), slug));
}
