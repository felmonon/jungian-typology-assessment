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

const style = `
    body { font-family: Georgia, serif; line-height: 1.8; color: #333; max-width: 980px; margin: 0 auto; padding: 40px 20px; background: #fafaf9; }
    h1 { color: #451a03; font-size: clamp(2.1rem, 7vw, 3.2rem); line-height: 1.05; margin-bottom: 0.35em; }
    h2 { color: #451a03; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-top: 42px; }
    h3 { color: #451a03; margin-top: 30px; }
    a { color: #9a3412; }
    .subtitle { color: #57534e; font-size: 1.22em; margin-bottom: 24px; }
    .meta { color: #78716c; font-size: 0.95em; }
    .breadcrumb { color: #78716c; margin-bottom: 20px; }
    .breadcrumb a { color: #b45309; text-decoration: none; }
    .tag { display: inline-block; background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 15px; font-size: 0.85em; margin: 4px 5px 4px 0; }
    .cta { background: #451a03; color: #fff; padding: 28px; border-radius: 8px; margin: 32px 0; }
    .cta h2 { color: #fff; border: 0; margin: 0 0 8px; padding: 0; }
    .cta p { color: rgba(255,255,255,.82); margin-bottom: 20px; }
    .btn { display: inline-block; padding: 12px 22px; background: #f59e0b; color: #1c1917; text-decoration: none; border-radius: 5px; font-weight: bold; }
    .secondary-link { display: inline-block; margin-left: 14px; color: #fff; font-weight: 700; }
    nav { background: #f5f5f4; padding: 18px; border-radius: 8px; margin-bottom: 30px; }
    nav a { color: #b45309; text-decoration: none; margin-right: 18px; font-weight: 500; }
    .related { background: #fff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 22px; margin-top: 38px; }
    footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e7e5e4; color: #78716c; text-align: center; }
    @media (max-width: 640px) { nav a { display: block; margin: 8px 0; } body { padding: 28px 16px; } }
`;

const renderNav = () => `
  <nav>
    <a href="/">Home</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/jungian-cognitive-functions-test">Jungian Cognitive Functions Test</a>
    <a href="/jungian-test">Jungian Test</a>
    <a href="/mbti-alternative">MBTI Alternative</a>
    <a href="/blog/">Blog</a>
  </nav>`;

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
  <script type="application/ld+json">
${articleSchema(article)}
  </script>
  <style>${style}</style>
</head>
<body>
${renderNav()}
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${escapeHtml(article.title)}</div>
  <article>
    <p class="meta">${escapeHtml(article.date)} &bull; ${escapeHtml(article.readTime)}</p>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="subtitle">${escapeHtml(article.description)}</p>
    <div>${article.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>

    <section class="cta">
      <h2>See your own Jungian energy map</h2>
      <p>Take the free 42-question TypeJung assessment before you keep comparing type descriptions. The result shows your dominant pattern, inferior-function pressure, and growth edge.</p>
      <a class="btn" href="/assessment">Take the free assessment</a>
      <a class="secondary-link" href="/jungian-cognitive-functions-test">Read the Jungian cognitive functions test guide</a>
    </section>

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
      ${article.related.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('\n      ')}
    </ul>
  </aside>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a></p>
  </footer>
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
  <style>
${style}
    .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 24px; margin: 30px 0; }
    .blog-card { background: white; padding: 24px; border-radius: 8px; border: 1px solid #e7e5e4; }
    .blog-card h2 { border: 0; padding: 0; margin: 8px 0 10px; font-size: 1.35rem; }
    .blog-card h2 a { color: #451a03; text-decoration: none; }
  </style>
</head>
<body>
${renderNav()}
  <div class="breadcrumb"><a href="/">Home</a> &rsaquo; Blog</div>
  <h1>TypeJung Blog</h1>
  <p class="subtitle">Jungian psychology, cognitive functions, mistyping, inferior functions, and shadow work.</p>

  <section class="cta">
    <h2>Start with your own map</h2>
    <p>The articles are more useful when you can compare them to your own dominant-inferior pattern.</p>
    <a class="btn" href="/assessment">Take the free assessment</a>
    <a class="secondary-link" href="/jungian-cognitive-functions-test">Read the Jungian cognitive functions test guide</a>
  </section>

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
      <p>Why measuring all 8 cognitive functions independently provides more accurate results than forced-choice dichotomies.</p>
      <span class="tag">Methodology</span><span class="tag">Research</span>
    </article>
    <article class="blog-card">
      <p class="meta">January 2026 &bull; 10 min read</p>
      <h2><a href="/blog/understanding-the-grip">Understanding "The Grip": When Your Inferior Function Takes Over</a></h2>
      <p>What happens when stress triggers your least developed cognitive function, and how to recognize and recover from grip experiences.</p>
      <span class="tag">Stress</span><span class="tag">Growth</span>
    </article>
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/">Home</a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a></p>
  </footer>
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
