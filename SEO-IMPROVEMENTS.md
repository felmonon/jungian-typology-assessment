# SEO Improvements Summary

This document tracks the current static SEO improvements for TypeJung.

## What Changed

- Added high-intent static landing pages for:
  - `/jungian-test`
  - `/mbti-alternative`
  - `/inferior-function-test`
  - `/cognitive-function-test`
- Added structured landing-page data in `scripts/seo-data.mjs`.
- Updated static generation so the new pages are built from shared data.
- Updated sitemap generation so the new URLs stay in `public/sitemap.xml`.
- Cleaned stale legal and docs copy to use TypeJung naming, one-time CAD pricing, and a real support contact.

## Existing Static Pages

### Cognitive Functions

- `/functions/te` - Extraverted Thinking
- `/functions/ti` - Introverted Thinking
- `/functions/fe` - Extraverted Feeling
- `/functions/fi` - Introverted Feeling
- `/functions/se` - Extraverted Sensing
- `/functions/si` - Introverted Sensing
- `/functions/ne` - Extraverted Intuition
- `/functions/ni` - Introverted Intuition

### Personality Types

- `/types/intj`, `/types/intp`, `/types/entj`, `/types/entp`
- `/types/infj`, `/types/infp`, `/types/enfj`, `/types/enfp`
- `/types/istj`, `/types/isfj`, `/types/estj`, `/types/esfj`
- `/types/istp`, `/types/isfp`, `/types/estp`, `/types/esfp`

### Blog Pages

- `/blog/`
- `/blog/singer-loomis-vs-mbti`
- `/blog/understanding-the-grip`

## Sitemap

The generated sitemap currently includes 38 URLs:

- Main pages: 7
- Blog pages: 3
- High-intent landing pages: 4
- Function pages: 8
- Type pages: 16

## Build Process

The relevant package scripts are:

```json
"generate:static": "npx tsx scripts/generate-static-pages.ts",
"generate:sitemap": "npx tsx scripts/generate-sitemap.ts",
"build": "npm run generate:static && vite build && npm run generate:sitemap"
```

## Next Steps

1. Deploy the generated static pages.
2. Submit `https://typejung.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
3. Inspect the four new landing page URLs after deployment to confirm indexing eligibility.
