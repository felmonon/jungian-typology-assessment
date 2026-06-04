#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { growthBlogArticles } from './growth-blog-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicBlogDir = join(__dirname, '..', 'public', 'blog');
const baseUrl = 'https://typejung.com';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const articleSchema = (article) => JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      datePublished: article.date,
      dateModified: '2026-05-18',
      author: {
        '@type': 'Organization',
        name: 'TypeJung',
        url: baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'TypeJung',
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

const fontLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">`;

const style = `
    :root {
      --jung-base: #fafaf8;
      --jung-surface: #ffffff;
      --jung-surface-alt: #f4f4f2;
      --jung-dark: #1a1a1a;
      --jung-secondary: #555d56;
      --jung-muted: #666666;
      --jung-border: #d4d4d2;
      --jung-border-light: #e8e8e6;
      --jung-accent: #2d5a3d;
      --jung-accent-hover: #234832;
      --jung-accent-light: #e8f1ea;
      --jung-accent-muted: #7fa085;
      --jung-gold: #a17932;
      --space-page: clamp(20px, 4vw, 56px);
      --shadow-sm: 0 1px 2px 0 rgb(29 38 32 / 0.05);
      --shadow-md: 0 12px 30px -20px rgb(29 38 32 / 0.35);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--jung-base);
      color: var(--jung-dark);
      font-family: "Source Serif 4", Georgia, serif;
      line-height: 1.72;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    a { color: var(--jung-accent); text-decoration-thickness: 0.08em; text-underline-offset: 0.18em; }
    .site-header {
      border-bottom: 1px solid var(--jung-border-light);
      background: color-mix(in srgb, var(--jung-surface) 92%, transparent);
    }
    .site-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      max-width: 1160px;
      margin: 0 auto;
      padding: 16px var(--space-page);
      font-family: "Space Grotesk", sans-serif;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--jung-dark);
      text-decoration: none;
    }
    .brand-mark {
      width: 42px;
      height: 42px;
      border: 1px solid var(--jung-border);
      border-radius: 8px;
      background: var(--jung-surface);
      box-shadow: var(--shadow-sm);
    }
    .brand-name {
      display: block;
      color: var(--jung-dark);
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.38rem;
      font-weight: 700;
      line-height: 1;
      letter-spacing: 0;
    }
    .brand-subtitle {
      display: block;
      margin-top: 3px;
      color: var(--jung-muted);
      font-size: 0.76rem;
      line-height: 1;
    }
    .nav-links {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
    .nav-links a {
      min-height: 40px;
      display: inline-flex;
      align-items: center;
      border-radius: 8px;
      padding: 0 13px;
      color: var(--jung-secondary);
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
    }
    .nav-links a:hover { background: var(--jung-accent-light); color: var(--jung-accent); }
    .nav-links .primary-link {
      background: var(--jung-accent);
      color: #ffffff;
    }
    .nav-links .primary-link:hover { background: var(--jung-accent-hover); color: #ffffff; }
    main {
      max-width: 1160px;
      margin: 0 auto;
      padding: clamp(40px, 7vw, 80px) var(--space-page) 56px;
    }
    .article-main { max-width: 860px; }
    .breadcrumb {
      margin-bottom: 24px;
      color: var(--jung-muted);
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.9rem;
    }
    .breadcrumb a { color: var(--jung-accent); text-decoration: none; font-weight: 600; }
    .eyebrow {
      margin: 0 0 14px;
      color: var(--jung-accent);
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      max-width: 950px;
      margin: 0 0 18px;
      color: var(--jung-dark);
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(2.65rem, 8vw, 5.4rem);
      font-weight: 700;
      letter-spacing: 0;
      line-height: 0.96;
    }
    .article-main h1 { font-size: clamp(2.35rem, 6vw, 4.4rem); line-height: 1.02; }
    h2 {
      margin: 52px 0 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--jung-border);
      color: var(--jung-dark);
      font-family: "Fraunces", Georgia, serif;
      font-size: clamp(1.55rem, 3.4vw, 2.25rem);
      line-height: 1.08;
    }
    h3 {
      margin-top: 30px;
      color: var(--jung-dark);
      font-family: "Fraunces", Georgia, serif;
      font-size: 1.24rem;
      line-height: 1.25;
    }
    p, li { color: var(--jung-secondary); font-size: 1.06rem; }
    .subtitle {
      max-width: 760px;
      margin: 0 0 24px;
      color: var(--jung-secondary);
      font-size: clamp(1.15rem, 2.5vw, 1.38rem);
      line-height: 1.58;
    }
    .meta {
      color: var(--jung-muted);
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 0; }
    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      border-radius: 999px;
      background: var(--jung-accent-light);
      color: var(--jung-accent);
      padding: 0 11px;
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .cta {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 22px;
      align-items: center;
      margin: 36px 0 46px;
      border: 1px solid color-mix(in srgb, var(--jung-accent-muted) 50%, white);
      border-radius: 8px;
      background: var(--jung-accent-light);
      padding: clamp(22px, 4vw, 34px);
    }
    .cta h2 {
      margin: 0 0 8px;
      padding: 0;
      border: 0;
      font-size: clamp(1.55rem, 3vw, 2.1rem);
    }
    .cta p { margin: 0; max-width: 680px; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      border-radius: 8px;
      background: var(--jung-accent);
      color: #ffffff;
      padding: 0 18px;
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }
    .btn:hover { background: var(--jung-accent-hover); color: #ffffff; }
    .blog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 310px), 1fr));
      gap: 18px;
      margin: 34px 0 0;
    }
    .blog-card {
      display: flex;
      min-height: 100%;
      flex-direction: column;
      border: 1px solid var(--jung-border-light);
      border-radius: 8px;
      background: var(--jung-surface);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .blog-card h2 {
      margin: 10px 0 12px;
      padding: 0;
      border: 0;
      font-size: 1.45rem;
      line-height: 1.13;
    }
    .blog-card h2 a { color: var(--jung-dark); text-decoration: none; }
    .blog-card h2 a:hover { color: var(--jung-accent); }
    .blog-card p:not(.meta) { margin-top: 0; }
    .blog-card .tag-row { margin-top: auto; padding-top: 10px; }
    .article-content {
      border-top: 1px solid var(--jung-border-light);
      margin-top: 34px;
      padding-top: 8px;
    }
    .article-content section p { max-width: 760px; }
    .related {
      margin-top: 46px;
      border: 1px solid var(--jung-border-light);
      border-radius: 8px;
      background: var(--jung-surface);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .related h2 { margin-top: 0; }
    .site-footer {
      max-width: 1160px;
      margin: 0 auto;
      padding: 28px var(--space-page) 40px;
      border-top: 1px solid var(--jung-border-light);
      color: var(--jung-muted);
      font-family: "Space Grotesk", sans-serif;
      font-size: 0.92rem;
    }
    .site-footer a { color: var(--jung-secondary); text-decoration: none; }
    @media (max-width: 760px) {
      .site-nav { align-items: flex-start; flex-direction: column; }
      .nav-links { justify-content: flex-start; }
      .nav-links a { padding: 0 10px; }
      .cta { grid-template-columns: 1fr; }
      .btn { width: 100%; }
    }
`;

const renderHeader = () => `
  <header class="site-header">
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="/" aria-label="TypeJung home">
        <img class="brand-mark" src="/favicon.svg" alt="">
        <span>
          <span class="brand-name">TypeJung</span>
          <span class="brand-subtitle">Energy map assessment</span>
        </span>
      </a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/learn">Learn</a>
        <a href="/blog/">Blog</a>
        <a href="/pricing">Pricing</a>
        <a class="primary-link" href="/assessment">Take assessment</a>
      </div>
    </nav>
  </header>`;

const renderFooter = () => `
  <footer class="site-footer">
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a></p>
  </footer>`;

const renderArticle = (article) => `<!DOCTYPE html>
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
${fontLinks}
  <script type="application/ld+json">
${articleSchema(article)}
  </script>
  <style>${style}</style>
</head>
<body>
${renderHeader()}
  <main class="article-main">
    <div class="breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${escapeHtml(article.title)}</div>
    <article>
    <p class="meta">${escapeHtml(article.date)} &bull; ${escapeHtml(article.readTime)}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="subtitle">${escapeHtml(article.description)}</p>
    <div class="tag-row">${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>

    <section class="cta">
      <div>
        <h2>See your own Jungian energy map</h2>
        <p>Take the free 42-question TypeJung assessment before you keep comparing type descriptions. The result shows your dominant pattern, inferior-function pressure, and growth edge.</p>
      </div>
      <a class="btn" href="/assessment">Take the free assessment</a>
    </section>

    <div class="article-content">
    ${article.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n      ')}
    </section>`).join('\n')}
    </div>
    </article>

  <aside class="related">
    <h2>Related TypeJung guides</h2>
    <ul>
      ${article.related.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('\n      ')}
    </ul>
  </aside>
  </main>
${renderFooter()}
</body>
</html>
`;

const renderIndex = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeJung Blog - Jungian Psychology, Cognitive Functions & Personal Growth</title>
  <meta name="description" content="Explore Jungian psychology, cognitive functions, personality types, mistyping, inferior functions, shadow work, and personal growth.">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${baseUrl}/blog/">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/blog/">
  <meta property="og:title" content="TypeJung Blog - Jungian Psychology & Cognitive Functions">
  <meta property="og:description" content="Explore Jungian psychology, cognitive functions, mistyping, inferior functions, and shadow work.">
  <meta property="og:image" content="${baseUrl}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
${fontLinks}
  <style>
${style}
  </style>
</head>
<body>
${renderHeader()}
<main>
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; Blog</div>
  <p class="eyebrow">TypeJung journal</p>
  <h1>TypeJung Blog</h1>
  <p class="subtitle">Jungian psychology, cognitive functions, mistyping, inferior functions, and shadow work.</p>

  <section class="cta">
    <div>
      <h2>Start with your own map</h2>
      <p>The articles are more useful when you can compare them to your own dominant-inferior pattern.</p>
    </div>
    <a class="btn" href="/assessment">Take the free assessment</a>
  </section>

  <div class="blog-grid">
${growthBlogArticles.map((article) => `
    <article class="blog-card">
      <p class="meta">${escapeHtml(article.date)} &bull; ${escapeHtml(article.readTime)}</p>
      <h2><a href="/blog/${article.slug}">${escapeHtml(article.title)}</a></h2>
      <p>${escapeHtml(article.description)}</p>
      <div class="tag-row">${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
    </article>`).join('\n')}
    <article class="blog-card">
      <p class="meta">January 2026 &bull; 12 min read</p>
      <h2><a href="/blog/singer-loomis-vs-mbti">Singer-Loomis vs MBTI: What's the Difference?</a></h2>
      <p>Why measuring all 8 cognitive functions independently provides more accurate results than forced-choice dichotomies.</p>
      <div class="tag-row"><span class="tag">Methodology</span><span class="tag">Research</span></div>
    </article>
    <article class="blog-card">
      <p class="meta">January 2026 &bull; 10 min read</p>
      <h2><a href="/blog/understanding-the-grip">Understanding "The Grip": When Your Inferior Function Takes Over</a></h2>
      <p>What happens when stress triggers your least developed cognitive function, and how to recognize and recover from grip experiences.</p>
      <div class="tag-row"><span class="tag">Stress</span><span class="tag">Growth</span></div>
    </article>
  </div>
</main>
${renderFooter()}
</body>
</html>
`;

mkdirSync(publicBlogDir, { recursive: true });

for (const article of growthBlogArticles) {
  writeFileSync(join(publicBlogDir, `${article.slug}.html`), renderArticle(article));
  console.log(`Generated blog article: /blog/${article.slug}`);
}

writeFileSync(join(publicBlogDir, 'index.html'), renderIndex());
console.log(`Generated growth blog index with ${growthBlogArticles.length + 2} articles.`);
