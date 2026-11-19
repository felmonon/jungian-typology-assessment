#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { PRICING } from '../data/pricing.ts';
import { discountedPriceLabel } from '../data/discount.ts';
import { DEBRIEF_OFFER } from '../data/debrief.ts';
import { REPORT_SAMPLE_EXCERPTS } from '../data/report-sample.ts';
import { SUPPORT_EMAIL } from '../data/support.ts';
import { lastCommitDate } from './stable-dates.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist', 'public');
const baseUrl = 'https://typejung.com';

// Prices always come from the shared constants the app uses.
const insightOffer = discountedPriceLabel(PRICING.insight.amount);
const masteryOffer = discountedPriceLabel(PRICING.mastery.amount);

// The legal pages are prebuilt from their own source so the static text can
// never drift from what the app shows. Headings become sections; paragraphs
// and list items become their text.
const LEGAL_EXPRESSIONS = {
  'PRICING.insight.price': PRICING.insight.price,
  'PRICING.mastery.price': PRICING.mastery.price,
  "' '": ' ',
};

const decodeJsxText = (value) =>
  value
    .replace(/&apos;|&rsquo;/g, '\u2019')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

function legalPage(file) {
  const source = readFileSync(join(rootDir, file), 'utf8');
  const updated = source.match(/Last updated:\s*([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1];
  const sections = [];
  let current = { heading: undefined, blocks: [] };
  for (const match of source.matchAll(/<(h[1-3]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const [, tag, inner] = match;
    let unknown = false;
    const text = decodeJsxText(
      inner
        .replace(/\{([^}]*)\}/g, (_m, expr) => {
          const key = expr.trim();
          if (key in LEGAL_EXPRESSIONS) return LEGAL_EXPRESSIONS[key];
          unknown = true;
          return '';
        })
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    );
    if (unknown) {
      console.warn(`${file}: skipped a ${tag} with an expression the prebuild cannot evaluate`);
      continue;
    }
    if (!text || tag === 'h1' || /^Last updated:/.test(text)) continue;
    if (tag === 'h2' || tag === 'h3') {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: text, blocks: [] };
    } else {
      // Kept in source order so a lead-in line stays above its list.
      current.blocks.push({ tag, text });
    }
  }
  sections.push(current);
  return { updated: updated ? new Date(`${updated} UTC`).toISOString().slice(0, 10) : undefined, sections };
}

const privacy = legalPage('pages/PrivacyPolicy.tsx');
const terms = legalPage('pages/TermsOfService.tsx');

const routePages = [
  {
    path: '/assessment',
    sources: ['pages/Assessment.tsx', 'data/questions.ts', 'data/depthAssessment.ts'],
    updated: '2026-11-09',
    title: 'Take the Free Jungian Cognitive Function Assessment | TypeJung',
    description:
      'When your MBTI result keeps changing, take a free Jungian function-stack assessment that maps all 8 functions, stress edge, and attitude direction.',
    h1: 'Map the function pattern underneath your type',
    cta: 'Start the free assessment',
    body: [
      'TypeJung maps self-reported patterns across all 8 Jungian cognitive functions through scenario-based questions instead of reducing you immediately to a four-letter label.',
      'The free result shows the core function-stack map first. Paid Insight and Mastery reports are optional one-time CAD upgrades after you can see whether the result feels useful.',
      'This page is the best starting point if you are comparing Jungian tests, MBTI alternatives, inferior-function tests, or cognitive-function tests.',
    ],
  },
  {
    path: '/learn',
    sources: ['pages/LearnTheory.tsx'],
    updated: '2026-11-10',
    title: 'Learn Jungian Psychology and Cognitive Functions | TypeJung',
    description:
      'Learn Carl Jung typology, the 8 cognitive functions, introversion and extraversion, inferior-function stress, and individuation through TypeJung guides.',
    h1: 'Learn Jungian psychology and cognitive functions',
    cta: 'Take the assessment',
  },
  {
    path: '/pricing',
    title: `Pricing: Free Map, Insight ${PRICING.insight.price}, Mastery ${PRICING.mastery.price} | TypeJung`,
    description:
      `Start with the free TypeJung assessment, then add Insight for ${PRICING.insight.price} or Mastery for ${PRICING.mastery.price}. One-time CAD, no code needed.`,
    h1: 'Start free. Choose your depth.',
    cta: 'Start the free assessment',
    sources: ['pages/Pricing.tsx', 'data/pricing.ts', 'data/discount.ts'],
    updated: '2026-11-09',
    body: [
      'Simple, one-time pricing. Read your result first. Add a deeper interpretation when you want to explore what it could mean in your life.',
    ],
    sections: [
      {
        heading: `Your free map: ${PRICING.free.price}, always free`,
        paragraphs: ['A place to begin. Find the pattern in your answers and see whether it resonates. No payment needed to see your result.'],
        items: ['All 42 questions', 'Function-stack map and growth edge', 'Introductory interpretation', 'No signup or card required'],
      },
      {
        heading: `Insight: ${PRICING.insight.price} one time, CAD`,
        paragraphs: [
          `Understand your result. A personal report to connect the map to your everyday life.`,
        ],
        items: [
          'Everything in your free map',
          'Ten sections written for your result',
          'Stress, relationships, work, and growth',
          'The Function Stack in Depth guide (PDF)',
        ],
      },
      {
        heading: `Mastery: ${PRICING.mastery.price} once`,
        paragraphs: [
          `For continued reflection. Everything in Insight, plus the AI Type Guide, growth exercises, and an individuation roadmap. An account is required for guide access.`,
          'Payments in Canadian dollars. No subscription. 7-day refund policy.',
        ],
      },
      {
        heading: 'Compare everything included',
        items: [
          '42-question assessment and function map: Free, Insight, Mastery',
          'Ten personalized interpretation sections: Insight, Mastery',
          'The Function Stack in Depth guide (PDF): Insight, Mastery',
          'AI Type Guide and practice tools: Mastery',
          'Saved assessment history (account required): Free, Insight, Mastery',
        ],
      },
      {
        heading: 'Good to know before you buy',
        paragraphs: [
          'How is my report written? The paid report uses AI to interpret your assessment result across ten sections. It is an educational reflection tool. Read it critically and compare it with your own experience.',
          'What happens after payment? Stripe confirms payment, then returns you to TypeJung to generate your report from the map saved in this browser. Use the purchase email when signing in to restore paid access. Keep your receipt.',
          `Do I need a discount code? No. Insight is ${PRICING.insight.price} and Mastery is ${PRICING.mastery.price}, one time. Review the final amount on Stripe before paying.`,
          `What if the report is not useful? Email ${SUPPORT_EMAIL} within 7 days of purchase with your Stripe receipt to request a refund.`,
        ],
      },
    ],
    links: [
      ['/sample-report', 'Read the sample report first'],
      ['/debrief', 'Read about the Personal Type Debrief'],
    ],
  },
  {
    path: '/sample-report',
    title: 'Sample Paid Report | TypeJung',
    description:
      'Preview a fictional TypeJung paid report before you buy: developmental edge, stress and relationship-pattern reflection, practices, and AI guide examples.',
    h1: 'From a function map to moments you recognize.',
    cta: 'Start with my free map',
    sources: ['pages/SampleReport.tsx', 'data/report-sample.ts'],
    updated: '2026-10-14',
    body: [
      'Inside an Insight report. Read four illustrative excerpts below. Your paid report contains ten AI-generated sections based on your own assessment result.',
      'Ti · Ne · Si · Fe. Fictional example, not your personal result. Educational self-reflection: this is a format example, not a diagnosis or a customer testimonial.',
    ],
    sections: [
      ...REPORT_SAMPLE_EXCERPTS.map((excerpt) => ({
        heading: `${excerpt.number} / ${excerpt.category}: ${excerpt.title}`,
        paragraphs: [...excerpt.paragraphs, `Try this: ${excerpt.practice}`],
      })),
      {
        heading: 'What could your map help you notice?',
        paragraphs: [
          'Insight includes ten sections: overview, function dynamics, archetypes, stress, relationships, work, individuation, shadow, growth, and dream reflection. The Function Stack in Depth PDF guide is also included.',
          `${insightOffer} once · CAD · No subscription · 7-day refund policy. Free map first.`,
        ],
      },
    ],
    links: [['/pricing', 'Compare pricing options']],
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
    path: '/debrief',
    title: 'Personal Type Debrief - Founder-Reviewed Breakdown | TypeJung',
    description:
      'Still stuck between two types? Get a founder-reviewed Personal Type Debrief of your TypeJung map, likely mistypes, and stress edge, delivered within 72 hours.',
    h1: 'Still stuck between two types?',
    cta: 'Take the free map first',
    body: [
      'The Personal Type Debrief is a founder-reviewed interpretation of your TypeJung result for people who have the free map but are still unsure how to read it.',
      'It includes a likely mistype comparison, a dominant-inferior breakdown in plain language, and a stress-edge explanation tied to your specific result, delivered as a short video or written breakdown within 72 hours.',
      `It is a one-time ${DEBRIEF_OFFER.price} service limited to a few per week, and it is educational self-reflection rather than a clinical or diagnostic assessment. Start with the free function-stack map first if you have not taken it yet.`,
    ],
    sources: ['pages/Debrief.tsx', 'data/debrief.ts'],
    updated: '2026-10-14',
  },
  {
    path: '/methodology',
    sources: ['pages/Methodology.tsx'],
    updated: '2026-10-14',
    title: 'Methodology - How the Function-Stack Map Is Built | TypeJung',
    description:
      'How TypeJung groups 42 prompts into four evidence layers, infers the dominant and inferior functions, scores reliability, and what it does not claim.',
    h1: 'How TypeJung reads 42 answers into a function-stack map',
    cta: 'Start the free assessment',
    body: [
      'The assessment gathers four kinds of evidence — behavioural scenarios, inferior-function stress signals, somatic indicators, and Jungian attitude direction — and looks for the function pattern they agree on, instead of asking you to self-label.',
      'The strongest function channel becomes the candidate dominant; the inferior is detected from stress triggers opposite the dominant rather than simply the lowest score; attitude direction then orients the stack into function-attitude codes. A near-even attitude split is reported as balanced.',
      'Every result carries a reliability label — High, Moderate, or Exploratory — based on how much the four layers agreed. TypeJung is educational self-reflection, not a clinical or diagnostic assessment, and a function-stack code is a working hypothesis, not a fixed identity.',
    ],
  },
  {
    path: '/leaderboard',
    sources: ['pages/Leaderboard.tsx'],
    updated: '2026-11-10',
    title: 'Community Jungian Function Results | TypeJung',
    description:
      'Explore community TypeJung function-stack map patterns across cognitive functions, dominant-inferior axes, and Jungian typology results.',
    h1: 'Community Jungian function results',
    cta: 'Take your assessment',
  },
  {
    path: '/about',
    title: 'About TypeJung: Free Jungian Function-Stack Map',
    description:
      'TypeJung is a sourced library of Carl Jung\'s ideas and a free map of your own function pattern. Why it is not another MBTI clone, and what it does not claim.',
    h1: 'About TypeJung',
    cta: 'Get my free map',
    sources: ['pages/About.tsx'],
    updated: '2026-11-10',
    sections: [
      {
        heading: "Jung's warning: typology isn't a game",
        paragraphs: [
          'Carl Jung never wanted his ideas turned into quick labels or fixed categories. In 1934 he called that kind of classification a childish parlour game, and wrote: "My typology is far rather a critical apparatus serving to sort out and organize the welter of empirical material, but not in any sense to stick labels on people at first sight." (Foreword to the Argentine edition of Psychological Types, 1934.)',
          'Jung used typology to help people understand natural one-sidedness (biases in how we think and perceive) and grow beyond it through individuation: becoming a more whole, unique self. Popular tools often focus on fun labels. This site returns to Jung: reflection on strengths, blind spots, and psychological balance.',
        ],
      },
      {
        heading: 'How this assessment differs',
        paragraphs: [
          'TypeJung combines scenario answers, stress-pattern prompts, body-signal prompts, and an introversion/extraversion measure to propose a function-stack pattern. No forced four-letter box. Just a clearer map of the pattern in your answers.',
        ],
        items: [
          'Four channels, inferred stack: thinking, feeling, sensation, and intuition scores combine with attitude direction to derive the eight-function display.',
          'Nuanced results: the map keeps relative channel scores visible. Its function-attitude values are derived, not eight independent measurements.',
          'Focus on growth: highlights unconscious blind spots (the inferior function) for self-awareness.',
        ],
      },
      {
        heading: 'Our methodology: theory-informed, not diagnostic',
        paragraphs: [
          "We draw from Jung's writings and Marie-Louise von Franz's lectures on typology. The current scoring method is an educational self-reflection framework, not a clinical instrument.",
          'The 42-question assessment scores thinking, feeling, sensation, and intuition using behavioral, stress, and body-signal answers. Six attitude prompts separately estimate an introversion/extraversion direction. The eight-function view is an interpretation of the channel scores, not eight separate test scales: read it as a hypothesis.',
          'Following von Franz, questions on stress reactivity, emotional touchiness, and rigid behaviors can point toward the inferior function, the least conscious function in this framework. A mismatch between what you report and the suggested stack may reflect context, question wording, or limits in the scoring rules. Do not assume the test is right when your experience disagrees.',
        ],
      },
      {
        heading: 'Why this matters: one-sidedness and growth',
        paragraphs: [
          'Jung saw type as a problematic bias: strengths create blind spots. The goal is individuation, bringing the opposites into a fuller whole. Low scores mark a growth edge; high scores mark strengths to watch for one-sidedness.',
        ],
      },
      {
        heading: 'Honest limitations',
        items: [
          'Persona problem: self-report captures the conscious image, not the full unconscious. It is a mirror for reflection, not an X-ray or clinical assessment.',
          'Type is not static: results are a snapshot.',
          'Consistency is not accuracy: the consistency percentage is a rule-based agreement signal across answer layers, not the probability that your type is correct.',
          'Not diagnosis: educational and reflective only. It is not medical, mental-health, or diagnostic advice.',
        ],
      },
      {
        heading: 'How AI is used here',
        paragraphs: ['TypeJung is a small independent project, and AI tools do real work in it.'],
        items: [
          'Paid reports: Insight and Mastery reports are generated by AI from your own assessment answers. The free map and its scores come from fixed scoring rules.',
          'The Jung Library: entries are drafted with AI assistance. Every quotation and citation is then checked against a published source before it goes live.',
          "The site itself: code, copy and analytics are maintained with AI coding tools under the owner's supervision. Changes to prices, legal copy or anything paid need the owner's approval.",
          'What is never allowed: invented testimonials, rankings, customer stories or clinical claims, and any exposure of private emails, payments or customer data.',
        ],
      },
      {
        heading: 'Primary sources and credits',
        items: [
          'C.G. Jung: Psychological Types (CW 6, 1921).',
          "Marie-Louise von Franz and James Hillman: Lectures on Jung's Typology (1971).",
          'June Singer and Mary Loomis: Singer-Loomis Inventory research (1984).',
          'John Beebe: archetypal extensions (2016).',
        ],
        paragraphs: ['TypeJung is independent and is not affiliated with the Jung family or any Jungian institute.'],
      },
    ],
    links: [
      ['/jung/editorial-standards', 'Editorial standards'],
      ['/methodology', 'Methodology'],
      ['/learn', 'Learn the theory'],
    ],
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | TypeJung',
    description: 'How TypeJung handles assessment data, account data, payments, and privacy controls.',
    h1: 'Privacy Policy',
    cta: 'Start the free assessment',
    sources: ['pages/PrivacyPolicy.tsx'],
    updated: privacy.updated,
    contentDate: privacy.updated,
    body: privacy.updated ? [`Last updated: ${privacy.updated}.`] : [],
    sections: privacy.sections,
  },
  {
    path: '/terms',
    title: 'Terms of Service | TypeJung',
    description: 'Terms and conditions for using TypeJung, including free assessment access, paid reports, and account features.',
    h1: 'Terms of Service',
    cta: 'Start the free assessment',
    sources: ['pages/TermsOfService.tsx'],
    updated: terms.updated,
    contentDate: terms.updated,
    body: terms.updated ? [`Last updated: ${terms.updated}.`] : [],
    sections: terms.sections,
  },
];

const guideLinks = [
  ['/jung', 'The Jung Library'],
  ['/jung/quotes', 'Carl Jung Quotes, With Sources'],
  ['/jung/where-to-start', 'Where to Start With Jung'],
  ['/jungian-test', 'Jungian Test'],
  ['/jungian-typology', 'Jungian Typology Guide'],
  ['/cognitive-functions', 'Cognitive Functions Guide'],
  ['/mbti-alternative', 'MBTI Alternative'],
  ['/inferior-function-test', 'Inferior Function Test'],
  ['/cognitive-function-test', 'Cognitive Function Test'],
  ['/cognitive-functions-test', 'Cognitive Functions Test'],
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

// A page's date is the day its content last changed: the date the page states
// (legal pages), else the last commit to the source files it is built from,
// else the date recorded with the page for builds without full git history.
const pageDate = (page) => page.contentDate || (page.sources && lastCommitDate(page.sources, rootDir)) || page.updated;

const pageJsonLd = (page) => {
  const url = `${baseUrl}${page.path}`;
  const dateModified = pageDate(page);
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
          ...(dateModified ? { dateModified } : {}),
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

const renderBlocks = (blocks) => {
  const html = [];
  let list = [];
  const flush = () => {
    if (list.length) html.push(`<ul>${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
    list = [];
  };
  for (const block of blocks) {
    if (block.tag === 'li') {
      list.push(block.text);
    } else {
      flush();
      html.push(`<p>${escapeHtml(block.text)}</p>`);
    }
  }
  flush();
  return html;
};

const renderSection = (section) => [
  section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : '',
  ...renderBlocks(section.blocks || []),
  ...(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
  section.items?.length ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '',
].filter(Boolean).join('\n        ');

const buildNoscript = (page) => `
    <noscript>
      <main style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: 'Schibsted Grotesk', 'Helvetica Neue', Arial, sans-serif; line-height: 1.8; color: #202230;">
        <nav style="margin-bottom: 24px;"><a href="/">Home</a> &gt; ${escapeHtml(routeLabel(page.path))}</nav>
        <h1 style="font-size: 2.35em; color: #202230; margin-bottom: 12px;">${escapeHtml(page.h1)}</h1>
        <p style="font-size: 1.18em; color: #515566; margin-bottom: 24px;">${escapeHtml(page.description)}</p>
        ${(page.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
        ${(page.sections || []).map(renderSection).join('\n        ')}
        ${page.links ? `<ul>${page.links.map(([href, label]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join('')}</ul>` : ''}
        <p><a href="${page.path === '/pricing' ? '/pricing' : '/assessment'}" style="display: inline-block; padding: 14px 24px; background: #202230; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">${escapeHtml(page.cta)}</a></p>
        <section style="margin-top: 36px;">
          <h2 style="color: #202230; border-bottom: 1px solid #dce0eb; padding-bottom: 8px;">Popular TypeJung guides</h2>
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
