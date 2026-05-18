# TypeJung SEO Status

**Date:** May 18, 2026
**Status:** Static SEO pages and sitemap generation are in place

## Current Coverage

TypeJung now has crawlable static HTML for the core SEO surface:

| Area | URLs |
| --- | ---: |
| Main app pages | 7 |
| Blog pages | 3 |
| High-intent landing pages | 4 |
| Cognitive function pages | 8 |
| Personality type pages | 16 |
| **Total in sitemap** | **38** |

## High-Intent Landing Pages

These pages target bottom-of-funnel and comparison searches with useful copy, canonical tags, internal links, and FAQ schema:

- `/jungian-test`
- `/mbti-alternative`
- `/inferior-function-test`
- `/cognitive-function-test`

Each page links users into the assessment, Learn content, and pricing. Pricing copy uses the current one-time CAD tiers: Free, Insight at CA$19, and Mastery at CA$39.

## Static Generation

The build flow generates static pages before Vite builds and regenerates the sitemap afterward:

```bash
npm run generate:static
npm run generate:sitemap
npm run build
```

`scripts/generate-static-pages.ts` emits static HTML into `public/` for functions, types, and high-intent landing pages. `scripts/generate-sitemap.ts` includes those URLs in `public/sitemap.xml`.

## Notes

- Static SEO pages are educational self-exploration pages, not clinical or diagnostic content.
- Legal pages now use TypeJung naming and remove placeholder contact copy.
- Search Console and Bing Webmaster Tools still need live verification after deploy.
