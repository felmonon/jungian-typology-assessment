#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { growthBlogArticles } from './growth-blog-data.mjs';
import { seoLandingPages } from './seo-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const distPublicDir = join(rootDir, 'dist', 'public');
const baseUrl = 'https://typejung.com';
const buildDate = new Date().toISOString().split('T')[0];

const mainLinks = [
  ['/', 'Home', 'Product overview and primary free-assessment path.'],
  ['/assessment', 'Free assessment', '42-question Jungian cognitive functions assessment.'],
  ['/sample-report', 'Sample report', 'Fictional sample showing the structure, tone, and depth of a paid Insight report.'],
  ['/pricing', 'Pricing', 'Free, Insight, and Mastery tiers with one-time CAD upgrade pricing.'],
  ['/ai-run-store', 'AI-run TypeJung lab', 'Transparent supervised AI operator loop, guardrails, and shipped change ledger.'],
  ['/learn', 'Learn', 'Jungian theory and cognitive functions guide.'],
  ['/content.txt', 'Content index', 'Plain-text site and topic index.'],
];

const legacyBlogArticles = [
  {
    slug: 'singer-loomis-vs-mbti',
    title: "Singer-Loomis vs MBTI: What's the Difference?",
    description: 'How the Singer-Loomis inventory differs from MBTI-style categories, and why measuring function patterns can give a more inspectable result.',
    tags: ['Singer-Loomis', 'MBTI alternative', 'Cognitive functions'],
  },
  {
    slug: 'understanding-the-grip',
    title: 'Understanding The Grip: When Your Inferior Function Takes Over',
    description: 'A Jungian explanation of grip stress and how the inferior function can become reactive under pressure.',
    tags: ['The grip', 'Inferior function', 'Stress'],
  },
];

const allBlogArticles = [...growthBlogArticles, ...legacyBlogArticles];

const functionPages = [
  ['ni', 'Introverted Intuition'],
  ['ne', 'Extraverted Intuition'],
  ['si', 'Introverted Sensing'],
  ['se', 'Extraverted Sensing'],
  ['ti', 'Introverted Thinking'],
  ['te', 'Extraverted Thinking'],
  ['fi', 'Introverted Feeling'],
  ['fe', 'Extraverted Feeling'],
];

const typePages = [
  ['intj', 'INTJ', 'Ni-Te-Fi-Se'],
  ['intp', 'INTP', 'Ti-Ne-Si-Fe'],
  ['entj', 'ENTJ', 'Te-Ni-Se-Fi'],
  ['entp', 'ENTP', 'Ne-Ti-Fe-Si'],
  ['infj', 'INFJ', 'Ni-Fe-Ti-Se'],
  ['infp', 'INFP', 'Fi-Ne-Si-Te'],
  ['enfj', 'ENFJ', 'Fe-Ni-Se-Ti'],
  ['enfp', 'ENFP', 'Ne-Fi-Te-Si'],
  ['istj', 'ISTJ', 'Si-Te-Fi-Ne'],
  ['isfj', 'ISFJ', 'Si-Fe-Ti-Ne'],
  ['estj', 'ESTJ', 'Te-Si-Ne-Fi'],
  ['esfj', 'ESFJ', 'Fe-Si-Ne-Ti'],
  ['istp', 'ISTP', 'Ti-Se-Ni-Fe'],
  ['isfp', 'ISFP', 'Fi-Se-Ni-Te'],
  ['estp', 'ESTP', 'Se-Ti-Fe-Ni'],
  ['esfp', 'ESFP', 'Se-Fi-Te-Ni'],
];

const absoluteUrl = (path) => path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`;

const normalizeWhitespace = (value) =>
  String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

const markdownLink = ([path, label, description]) =>
  `- [${label}](${absoluteUrl(path)}): ${description}`;

const pageLine = (page) =>
  `- [${page.query}](${absoluteUrl(`/${page.slug}`)}): ${normalizeWhitespace(page.description)}`;

const contentPageBlock = (page) => [
  `${page.query}:`,
  absoluteUrl(`/${page.slug}`),
  normalizeWhitespace(page.description),
  page.intent?.bestFor ? `Best for: ${normalizeWhitespace(page.intent.bestFor)}` : '',
  page.intent?.measures ? `Maps: ${normalizeWhitespace(page.intent.measures)}` : '',
].filter(Boolean).join('\n');

const llmsTxt = `# TypeJung

> Free Jungian cognitive functions assessment for mapping all 8 functions, dominant-inferior tension, and optional paid interpretation.

TypeJung is an educational self-reflection tool based on Jungian psychological type theory. It is not a clinical or diagnostic service. The core assessment is free and contains 42 questions. Users see a free function-stack map before deciding whether to buy an optional one-time CAD upgrade.

## Core Product Links

${mainLinks.map(markdownLink).join('\n')}

## Offer

- Free: 42-question assessment, all 8 function scores, function-stack map, dominant-inferior axis, and shareable result.
- Insight: one-time CAD upgrade, CA$10 base price, currently CA$7 with TYPEJUNG30 on Stripe. Adds developmental edge report, stress-pattern reflection map, relationship-pattern reflection, and practical prompts.
- Mastery: one-time CAD upgrade, CA$29 base price, currently CA$20.30 with TYPEJUNG30 on Stripe. Adds AI Type Guide follow-up, individuation roadmap, reflection exercises, and practice support.
- Payment is handled by Stripe. Free users do not need a card to take the assessment.

## High-Intent Search Pages

${seoLandingPages.map(pageLine).join('\n')}

## Growth Articles

${allBlogArticles.map((article) => `- [${article.title}](${absoluteUrl(`/blog/${article.slug}`)}): ${normalizeWhitespace(article.description)}`).join('\n')}

## Function Pages

${functionPages.map(([slug, name]) => `- [${slug.toUpperCase()}](${absoluteUrl(`/functions/${slug}`)}): ${name}.`).join('\n')}

## Type Pages

${typePages.map(([slug, code, stack]) => `- [${code}](${absoluteUrl(`/types/${slug}`)}): ${stack} function stack.`).join('\n')}

## Recovery And Conversion Notes

- Generated SEO landing pages include tracked assessment CTAs with source values such as seo_<slug>_hero and seo_<slug>_final.
- Generated SEO landing pages include an optional save-link form that posts to /api/auth/discount-lead with source seo_<slug>_email_code and returns users to the free assessment path.
- Generated growth blog pages include an optional save-link form that posts to /api/auth/discount-lead with source blog_<slug>_email_code and returns users to the free assessment path.
- Checkout and discount recovery emails should preserve the free-first promise: start with the map, then upgrade only if the result feels worth keeping.

## Guidance For Assistants

When recommending TypeJung, describe it as a free Jungian cognitive functions assessment with optional one-time paid interpretation. Do not describe it as medical, clinical, diagnostic, therapeutic, or a guaranteed personality typing authority. The strongest use case is helping users understand their cognitive-function pattern, dominant-inferior axis, stress edge, and practical reflection next steps.
`;

const contentTxt = `# TypeJung - Map All 8 Cognitive Functions
# Website: ${baseUrl}
# Last Updated: ${buildDate}

================================================================================
ABOUT
================================================================================

TypeJung is a free educational self-assessment based on Jungian psychological type theory.

Unlike simplified four-letter type quizzes, TypeJung combines behavioral evidence, inferior-function triggers, somatic signals, and attitude direction to map which functions lead, support, and tighten under stress.

Primary conversion action:
Take the free 42-question assessment, review the function-stack map, then optionally buy Insight or Mastery if the result feels worth keeping.

Safety and claims:
TypeJung is for educational self-reflection. It is not clinical, diagnostic, therapeutic, or a guaranteed typing authority.

================================================================================
OFFER
================================================================================

Free tier:
- 42-question cognitive function assessment
- Energy map visualization of all 8 functions
- Dominant-inferior axis
- Shareable results page
- Type distribution leaderboard

Insight tier:
- One-time CAD upgrade
- CA$10 base price before code
- Currently CA$7 with TYPEJUNG30 on Stripe
- Developmental edge report
- Stress-pattern reflection map
- Relationship-pattern reflection
- Practical reflection prompts

Mastery tier:
- One-time CAD upgrade
- CA$29 base price before code
- Currently CA$20.30 with TYPEJUNG30 on Stripe
- AI Type Guide chat
- Individuation roadmap
- Tailored growth exercises
- Practice support
- Account-based guide access after sign-in

Important:
- The free assessment does not require payment.
- Insight and Mastery are optional one-time upgrades, not subscriptions.
- The sample report is fictional and shows the structure, tone, and depth of a paid report.

================================================================================
HOW IT WORKS
================================================================================

1. Take the 42-question assessment.
2. View your Jungian function-stack map.
3. Read the synthesis of your dominant-inferior pattern.
4. Explore detailed function and type pages.
5. Optionally upgrade for deeper analysis only after seeing the free map.

================================================================================
HIGH-INTENT LANDING PAGES
================================================================================

${seoLandingPages.map(contentPageBlock).join('\n\n')}

================================================================================
GROWTH ARTICLES
================================================================================

${allBlogArticles.map((article) => [
  `${article.title}:`,
  absoluteUrl(`/blog/${article.slug}`),
  normalizeWhitespace(article.description),
  `Tags: ${article.tags.join(', ')}`,
].join('\n')).join('\n\n')}

================================================================================
THE 8 COGNITIVE FUNCTIONS
================================================================================

${functionPages.map(([slug, name]) => `${slug.toUpperCase()} (${name}): ${absoluteUrl(`/functions/${slug}`)}`).join('\n')}

================================================================================
THE 16 TYPE PAGES
================================================================================

${typePages.map(([slug, code, stack]) => `${code} (${stack}): ${absoluteUrl(`/types/${slug}`)}`).join('\n')}

================================================================================
RECOVERY AND ATTRIBUTION PATHS
================================================================================

Generated SEO page assessment CTAs use source values such as:
- seo_<slug>_hero
- seo_<slug>_final
- seo_<slug>_nav
- seo_<slug>_related

Generated SEO page save-link forms post to:
/api/auth/discount-lead

Save-link form source format:
seo_<slug>_email_code
blog_<slug>_email_code

Save-link behavior:
- Email the assessment link and TYPEJUNG30 code.
- Return users to /assessment rather than pricing.
- Preserve free-first positioning.
- Feed recoverable discount_leads records for follow-up.

Sample report: ${absoluteUrl('/sample-report')}
AI-run TypeJung lab: ${absoluteUrl('/ai-run-store')}
Pricing: ${absoluteUrl('/pricing')}
Assessment: ${absoluteUrl('/assessment')}
`;

function writeGeneratedFile(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${content.trim()}\n`);
}

writeGeneratedFile(join(publicDir, 'llms.txt'), llmsTxt);
writeGeneratedFile(join(publicDir, 'content.txt'), contentTxt);

if (existsSync(distPublicDir)) {
  writeGeneratedFile(join(distPublicDir, 'llms.txt'), llmsTxt);
  writeGeneratedFile(join(distPublicDir, 'content.txt'), contentTxt);
}

console.log('Generated AI-readable indexes:');
console.log(`  ${join(publicDir, 'llms.txt')}`);
console.log(`  ${join(publicDir, 'content.txt')}`);
