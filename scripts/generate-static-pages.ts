#!/usr/bin/env node
/**
 * Static HTML Page Generator for TypeJung SEO
 * Generates individual HTML files for all functions and types
 */

import { functionSEO, functionData, typeSEO, typeData } from '../data/seo-config.js';
import { seoLandingPages } from './seo-data.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const siteConfig = {
  url: 'https://typejung.com',
  name: 'TypeJung',
  description: 'Free Jungian self-assessment that maps cognitive functions, energy flow, and stress patterns for educational self-reflection',
};

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderJsonLd = (value: unknown): string =>
  JSON.stringify(value, null, 2).replace(/</g, '\\u003c');

const absoluteUrl = (path: string): string =>
  path === '/' ? `${siteConfig.url}/` : `${siteConfig.url}${path}`;

const breadcrumbSchema = (items: Array<{ name: string; path: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const coreClusterLinks = [
  {
    href: '/jungian-cognitive-functions-test',
    label: 'Jungian cognitive functions test',
    description: 'Map the full function-attitude pattern behind a likely type result.',
  },
  {
    href: '/jungian-test',
    label: 'Jungian test',
    description: 'Start with the broad Jungian assessment page and compare type, function, and stress evidence.',
  },
  {
    href: '/cognitive-function-test',
    label: 'Cognitive function test',
    description: 'See how TypeJung scores Ni, Ne, Si, Se, Ti, Te, Fi, and Fe independently.',
  },
  {
    href: '/mbti-alternative',
    label: 'MBTI alternative',
    description: 'Compare TypeJung against label-first MBTI-style quizzes and four-letter tests.',
  },
  {
    href: '/inferior-function-test',
    label: 'Inferior function test',
    description: 'Use the dominant-inferior axis to understand stress, grip patterns, and development.',
  },
];

// Common head template
const getHead = (title: string, description: string, path: string, keywords?: string[]) => `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml((keywords && keywords.length > 0 ? keywords : ['Jung personality test', 'cognitive functions', title.split(' - ')[0].toLowerCase(), 'psychological types']).join(', '))}">
<meta name="author" content="TypeJung">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${siteConfig.url}${path}">
<meta property="og:type" content="article">
<meta property="og:url" content="${siteConfig.url}${path}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${siteConfig.url}/og-image.png">
<meta property="og:site_name" content="TypeJung">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${siteConfig.url}/og-image.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
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
  }
  * { box-sizing: border-box; }
  body {
    font-family: "Space Grotesk", Verdana, sans-serif;
    line-height: 1.75;
    color: var(--jung-dark);
    max-width: 980px;
    margin: 0 auto;
    padding: 32px 20px 48px;
    background:
      linear-gradient(180deg, rgba(244,244,242,0.72) 0%, rgba(250,250,248,0) 360px),
      var(--jung-base);
  }
  h1, h2, h3 { font-family: "Fraunces", Georgia, serif; font-weight: 600; letter-spacing: 0; }
  h1 { color: var(--jung-dark); font-size: clamp(2.35rem, 7vw, 4.4rem); line-height: 0.98; margin: 0 0 0.35em; }
  h2 { color: var(--jung-dark); border-bottom: 1px solid var(--jung-border); padding-bottom: 12px; margin-top: 48px; font-size: clamp(1.55rem, 3.5vw, 2.25rem); line-height: 1.1; }
  h3 { color: var(--jung-dark); margin-top: 30px; font-size: 1.2rem; line-height: 1.25; }
  p, li { color: var(--jung-secondary); font-family: "Source Serif 4", Georgia, serif; }
  a { color: var(--jung-accent); text-decoration-thickness: 0.08em; text-underline-offset: 0.18em; }
  .subtitle { color: var(--jung-secondary); font-family: "Source Serif 4", Georgia, serif; font-size: clamp(1.1rem, 2.6vw, 1.35rem); line-height: 1.65; margin-bottom: 22px; }
  .breadcrumb { color: var(--jung-muted); margin-bottom: 28px; font-size: 0.92rem; }
  .breadcrumb a { color: var(--jung-accent); text-decoration: none; font-weight: 600; }
  .eyebrow { color: var(--jung-accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.78rem; margin-bottom: 14px; }
  .cta-box { background: var(--jung-dark); color: white; padding: clamp(24px, 5vw, 40px); border-radius: 8px; margin: 38px 0; border: 1px solid var(--jung-dark); box-shadow: 0 24px 60px -36px rgb(29 38 32 / 0.55); }
  .cta-box p, .cta-box h2, .cta-box h3 { color: white; }
  .cta-box h2 { border: 0; margin-top: 0; padding-bottom: 0; }
  .cta-box h3 { margin-top: 0; }
  .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 12px 22px; background: var(--jung-accent); color: white; text-decoration: none; border-radius: 8px; font-weight: 700; box-shadow: 0 18px 50px -34px rgb(47 111 88 / 0.7); }
  .btn:hover { background: var(--jung-accent-hover); }
  .text-link { color: var(--jung-accent-light); font-weight: 700; margin-left: 16px; }
  .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin: 20px 0; }
  .related-card { background: var(--jung-surface); padding: 16px; border-radius: 8px; border: 1px solid var(--jung-border-light); box-shadow: 0 1px 2px 0 rgb(29 38 32 / 0.05); }
  .related-card a { color: var(--jung-dark); text-decoration: none; font-weight: 700; }
  .intent-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin: 28px 0 32px; }
  .intent-card { background: var(--jung-surface); border: 1px solid var(--jung-border-light); border-radius: 8px; padding: 18px; box-shadow: 0 1px 2px 0 rgb(29 38 32 / 0.05); }
  .intent-card strong { display: block; margin-bottom: 7px; font-family: "Space Grotesk", Verdana, sans-serif; color: var(--jung-dark); font-size: 0.86rem; text-transform: uppercase; letter-spacing: 0.06em; }
  .intent-card span { display: block; color: var(--jung-secondary); font-family: "Source Serif 4", Georgia, serif; line-height: 1.6; }
  .cluster-nav { background: color-mix(in srgb, var(--jung-accent-light) 48%, white); border: 1px solid color-mix(in srgb, var(--jung-accent-muted) 55%, white); border-radius: 8px; padding: 18px; margin: 28px 0 36px; }
  .cluster-nav h2 { border: 0; margin: 0 0 12px; padding: 0; font-size: 1.12rem; font-family: "Space Grotesk", Verdana, sans-serif; }
  .cluster-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
  .cluster-link { display: block; min-height: 100%; padding: 14px; border-radius: 8px; background: rgba(255,255,255,0.72); border: 1px solid var(--jung-border-light); color: var(--jung-dark); text-decoration: none; }
  .cluster-link strong { display: block; margin-bottom: 6px; font-family: "Space Grotesk", Verdana, sans-serif; }
  .cluster-link span { display: block; color: var(--jung-secondary); font-family: "Source Serif 4", Georgia, serif; font-size: 0.95rem; line-height: 1.45; }
  .context-links { margin: 18px 0 0; padding: 14px 16px; background: var(--jung-surface); border: 1px solid var(--jung-border-light); border-radius: 8px; }
  .context-links strong { display: block; margin-bottom: 8px; font-family: "Space Grotesk", Verdana, sans-serif; font-size: 0.86rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--jung-muted); }
  .context-links ul { margin: 0; padding-left: 20px; }
  .context-links li { margin: 4px 0; }
  .faq-item { background: var(--jung-surface); padding: 18px; border-radius: 8px; margin-bottom: 14px; border: 1px solid var(--jung-border-light); }
  .faq-item h3 { margin: 0 0 8px; font-size: 1.05rem; }
  .comparison-table { width: 100%; border-collapse: collapse; margin: 22px 0; background: var(--jung-surface); border: 1px solid var(--jung-border); border-radius: 8px; overflow: hidden; }
  .comparison-table th { background: var(--jung-dark); color: white; padding: 13px; text-align: left; }
  .comparison-table td { padding: 13px; border-bottom: 1px solid var(--jung-border-light); vertical-align: top; color: var(--jung-secondary); }
  .comparison-table tr:nth-child(even) { background: var(--jung-surface-alt); }
  .trait-list { columns: 2; column-gap: 30px; }
  .trait-list li { break-inside: avoid; margin-bottom: 10px; }
  footer { margin-top: 50px; padding-top: 22px; border-top: 1px solid var(--jung-border); color: var(--jung-muted); text-align: center; }
  nav { background: rgba(255,255,255,0.88); padding: 12px; border: 1px solid var(--jung-border); border-radius: 8px; margin-bottom: 30px; box-shadow: 0 1px 2px 0 rgb(29 38 32 / 0.05); }
  nav a { color: var(--jung-secondary); text-decoration: none; margin-right: 18px; font-weight: 700; font-size: 0.92rem; }
  nav a:hover { color: var(--jung-accent); }
  @media (max-width: 640px) {
    body { padding: 20px 16px 40px; }
    nav { display: flex; flex-wrap: wrap; gap: 10px 14px; }
    nav a { margin-right: 0; }
    .intent-grid { grid-template-columns: 1fr; }
    .trait-list { columns: 1; }
    .text-link { display: inline-block; margin: 14px 0 0; }
  }
</style>
`;

function renderIntentPanel(page: any) {
  if (!page.intent) return '';

  return `<section class="intent-grid" aria-label="Quick assessment fit">
    <div class="intent-card">
      <strong>Best for</strong>
      <span>${escapeHtml(page.intent.bestFor)}</span>
    </div>
    <div class="intent-card">
      <strong>Measures</strong>
      <span>${escapeHtml(page.intent.measures)}</span>
    </div>
    <div class="intent-card">
      <strong>Privacy</strong>
      <span>${escapeHtml(page.intent.privacy)}</span>
    </div>
  </section>`;
}

function renderClusterNav(currentSlug: string) {
  const links = coreClusterLinks.filter(link => link.href !== `/${currentSlug}`);

  return `<section class="cluster-nav" aria-label="Jungian test topic cluster">
    <h2>Related Jungian assessment guides</h2>
    <div class="cluster-grid">
      ${links.map((link) => `<a class="cluster-link" href="${escapeHtml(link.href)}"><strong>${escapeHtml(link.label)}</strong><span>${escapeHtml(link.description)}</span></a>`).join('\n      ')}
    </div>
  </section>`;
}

function renderLandingSection(section: any) {
  const paragraphs = section.body
    .map((paragraph: string) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n  ');
  const bullets = section.bullets
    ? `<ul>\n    ${section.bullets.map((item: string) => `<li>${escapeHtml(item)}</li>`).join('\n    ')}\n  </ul>`
    : '';
  const table = section.table
    ? `<table class="comparison-table">
    <thead>
      <tr>${section.table.headers.map((header: string) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${section.table.rows.map((row: string[]) => `<tr>${row.map((cell: string) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('\n      ')}
    </tbody>
  </table>`
    : '';
  const links = section.links
    ? `<div class="context-links">
    <strong>Useful next reads</strong>
    <ul>
      ${section.links.map((link: any) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('\n      ')}
    </ul>
  </div>`
    : '';
  const sectionContent = [paragraphs, bullets, table, links].filter(Boolean).join('\n  ');

  return `<section>
  <h2>${escapeHtml(section.heading)}</h2>
  ${sectionContent}
</section>`;
}

function generateLandingPage(page: any) {
  const path = `/${page.slug}`;
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: page.query, path },
  ]);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${siteConfig.url}${path}`,
    inLanguage: 'en',
    dateModified: '2026-05-18',
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
    },
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${getHead(page.title, page.description, path, page.keywords)}
<script type="application/ld+json">
${renderJsonLd(webPageSchema)}
</script>
<script type="application/ld+json">
${renderJsonLd(breadcrumbs)}
</script>
<script type="application/ld+json">
${renderJsonLd(faqSchema)}
</script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/learn">Learn</a>
    <a href="/pricing">Pricing</a>
    <a href="/blog/">Blog</a>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> › ${escapeHtml(page.query)}
  </div>

  <header>
    <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
    <h1>${escapeHtml(page.h1)}</h1>
    ${page.intro.map((paragraph: string) => `<p class="subtitle">${escapeHtml(paragraph)}</p>`).join('\n    ')}
  </header>

  ${renderIntentPanel(page)}

  ${renderClusterNav(page.slug)}

  ${page.sections.map(renderLandingSection).join('\n\n  ')}

  <div class="cta-box">
    <h2>Start with your own function profile</h2>
    <p>Take the free TypeJung assessment first. If the core map feels useful, Insight is a one-time CA$10 report and Mastery is a one-time CA$29 upgrade with the AI Type Coach and practice tools.</p>
    <p>
      <a href="/assessment" class="btn">Take the Free Assessment</a>
      <a href="/pricing" class="text-link">See pricing</a>
    </p>
  </div>

  <section>
    <h2>Frequently Asked Questions</h2>
    ${page.faqs.map((faq: any) => `<div class="faq-item">
      <h3>${escapeHtml(faq.question)}</h3>
      <p>${escapeHtml(faq.answer)}</p>
    </div>`).join('\n    ')}
  </section>

  <section>
    <h2>Related TypeJung Pages</h2>
    <div class="related-grid">
      ${page.relatedLinks.map((link: any) => `<div class="related-card"><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></div>`).join('\n      ')}
    </div>
  </section>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
  </footer>
</body>
</html>`;

  return html.replace(/^[ \t]+$/gm, '');
}

// Generate function page HTML
function generateFunctionPage(fn: string) {
  const seo = functionSEO[fn];
  const data = functionData[fn];
  const path = `/functions/${fn}`;
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Learn Jungian typology', path: '/learn' },
    { name: data.fullName, path },
  ]);
  
  const oppositeMap: Record<string, string> = {
    ni: 'ne', ne: 'ni', si: 'se', se: 'si',
    ti: 'te', te: 'ti', fi: 'fe', fe: 'fi'
  };
  const oppositeFn = oppositeMap[fn];
  const oppositeSeo = functionSEO[oppositeFn];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${getHead(seo.title, seo.description, path)}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${seo.name}",
  "description": "${seo.description}",
  "url": "${siteConfig.url}${path}",
  "dateModified": "2026-05-18",
  "author": { "@type": "Organization", "name": "TypeJung" },
  "publisher": { "@type": "Organization", "name": "TypeJung", "logo": { "@type": "ImageObject", "url": "${siteConfig.url}/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "${siteConfig.url}${path}" }
}
</script>
<script type="application/ld+json">
${renderJsonLd(breadcrumbs)}
</script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/learn">Learn</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/pricing">Pricing</a>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/learn">Learn</a> › ${data.fullName}
  </div>

  <h1>${data.fullName}</h1>
  <p class="subtitle">${data.archetype} | ${data.category} Function | ${data.motto}</p>

  <p>${data.description}</p>

  <h2>Core Characteristics</h2>
  <ul>
    ${data.characteristics.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>Strengths</h2>
  <ul>
    ${data.strengths.map(s => `<li>${s}</li>`).join('\n    ')}
  </ul>

  <h2>Challenges & Growth Areas</h2>
  <ul>
    ${data.challenges.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>The Grip: ${data.code} Under Stress</h2>
  <p>${data.inTheGrip}</p>

  <h2>Personality Types with ${data.code}</h2>
  
  <h3>Dominant ${data.code}</h3>
  <div class="related-grid">
    ${data.dominantIn.map(type => {
      const typeKey = type.toLowerCase();
      const typeInfo = typeSEO[typeKey];
      return `<div class="related-card">
        <a href="/types/${typeKey}">${type}</a> - ${typeInfo?.name?.split(' - ')[1] || 'Personality Type'}
      </div>`;
    }).join('\n    ')}
  </div>

  <h3>Auxiliary ${data.code}</h3>
  <div class="related-grid">
    ${data.auxiliaryIn.map(type => {
      const typeKey = type.toLowerCase();
      const typeInfo = typeSEO[typeKey];
      return `<div class="related-card">
        <a href="/types/${typeKey}">${type}</a> - ${typeInfo?.name?.split(' - ')[1] || 'Personality Type'}
      </div>`;
    }).join('\n    ')}
  </div>

  <h2>Opposite Function</h2>
  <p>The opposite of ${data.fullName} is <a href="/functions/${oppositeFn}">${oppositeSeo.name}</a>. While ${data.code} focuses on ${data.category === 'Perceiving' ? 'perceiving information through ' + (fn.startsWith('n') ? 'intuition' : 'sensing') : 'making decisions through ' + (fn.startsWith('t') ? 'thinking' : 'feeling')}, ${oppositeSeo.name.split(' ')[0]} takes the opposite approach.</p>

  <div class="cta-box">
    <h3>Discover Your ${data.code} Score</h3>
    <p>Take the free 42-question assessment to see how ${data.fullName} appears in your TypeJung energy map, including function strength, attitude direction, and stress-edge context.</p>
    <p><a href="/assessment" class="btn">Take the Free Assessment</a></p>
  </div>

  <h2>Explore Other Cognitive Functions</h2>
  <div class="related-grid">
    ${['ni','ne','si','se','ti','te','fi','fe'].filter(f => f !== fn).map(f => {
      const fSeo = functionSEO[f];
      return `<div class="related-card">
        <a href="/functions/${f}">${fSeo.name}</a>
      </div>`;
    }).join('\n    ')}
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
  </footer>

</body>
</html>`;

  return html;
}

// Generate type page HTML
function generateTypePage(type: string) {
  const seo = typeSEO[type];
  const data = typeData[type];
  const path = `/types/${type}`;
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Learn Jungian typology', path: '/learn' },
    { name: `${data.code} Personality Type`, path },
  ]);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${getHead(seo.title, seo.description, path)}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${data.code} - ${data.name}",
  "description": "${seo.description}",
  "url": "${siteConfig.url}${path}",
  "dateModified": "2026-05-18",
  "author": { "@type": "Organization", "name": "TypeJung" },
  "publisher": { "@type": "Organization", "name": "TypeJung", "logo": { "@type": "ImageObject", "url": "${siteConfig.url}/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "${siteConfig.url}${path}" }
}
</script>
<script type="application/ld+json">
${renderJsonLd(breadcrumbs)}
</script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/learn">Learn</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/pricing">Pricing</a>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/learn">Learn</a> › ${data.code} Personality Type
  </div>

  <h1>${data.code} - ${data.name}</h1>
  <p class="subtitle">${data.nickname} | ${data.stack.join('-')} Function Stack</p>

  <p>${data.description}</p>

  <h2>Cognitive Function Stack</h2>
  <p>The ${data.code} type uses these cognitive functions in order of development:</p>
  <ol>
    ${data.stack.map((fn, i) => {
      const fnLower = fn.toLowerCase();
      const position = i === 0 ? 'Dominant' : i === 1 ? 'Auxiliary' : i === 2 ? 'Tertiary' : 'Inferior';
      return `<li><strong><a href="/functions/${fnLower}">${fn}</a></strong> - ${position} (${functionData[fnLower].archetype})</li>`;
    }).join('\n    ')}
  </ol>

  <h2>Key Strengths</h2>
  <ul>
    ${data.strengths.map(s => `<li>${s}</li>`).join('\n    ')}
  </ul>

  <h2>Growth Challenges</h2>
  <ul>
    ${data.challenges.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>${data.code} in Relationships</h2>
  <p>${data.inRelationships}</p>

  <h2>Under Stress (The Grip)</h2>
  <p>${data.underStress}</p>

  <h2>Individuation Notes</h2>
  <p>${data.growthPath}</p>

  <h2>Well-Known ${data.code}s</h2>
  <p>${data.famousExamples.join(', ')}</p>

  <div class="cta-box">
    <h3>Are You an ${data.code}?</h3>
    <p>Take our free Jungian cognitive function assessment to discover your true type. Unlike simplified 4-letter tests, we measure all 8 functions on a spectrum.</p>
    <p><a href="/assessment" class="btn">Take the Free Assessment</a></p>
  </div>

  <h2>Related Personality Types</h2>
  <div class="related-grid">
    ${['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']
      .filter(t => t !== type)
      .slice(0, 7)
      .map(t => {
        const tData = typeData[t];
        return `<div class="related-card">
          <a href="/types/${t}">${tData.code}</a> - ${tData.name}
        </div>`;
      }).join('\n    ')}
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
  </footer>

</body>
</html>`;

  return html;
}

// Main execution
console.log('🚀 Generating static HTML pages for SEO...\n');

// Generate function pages
console.log('Generating function pages...');
for (const fn of ['ni', 'ne', 'si', 'se', 'ti', 'te', 'fi', 'fe']) {
  const html = generateFunctionPage(fn);
  const path = `${__dirname}/../public/functions/${fn}/index.html`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log(`  ✅ /functions/${fn}/index.html`);
}

// Generate type pages
console.log('\nGenerating type pages...');
for (const type of ['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']) {
  const html = generateTypePage(type);
  const path = `${__dirname}/../public/types/${type}/index.html`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log(`  ✅ /types/${type}/index.html`);
}

// Generate high-intent SEO landing pages
console.log('\nGenerating high-intent landing pages...');
for (const page of seoLandingPages) {
  const html = generateLandingPage(page);
  const path = `${__dirname}/../public/${page.slug}/index.html`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log(`  ✅ /${page.slug}/index.html`);
}

console.log(`\n✨ Generated ${24 + seoLandingPages.length} static HTML pages for SEO!`);
console.log('\nNext steps:');
console.log('  1. Run your build process');
console.log('  2. Deploy to Vercel');
console.log('  3. Submit updated sitemap to Google Search Console');
