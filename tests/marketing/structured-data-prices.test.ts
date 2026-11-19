import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRICING } from '../../data/pricing';
import { PAGE_SEO } from '../../hooks/useSEO';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

const jsonLdBlocks = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));

describe('structured data prices', () => {
  it('lists the Offer prices people actually pay', () => {
    const app = jsonLdBlocks(read('index.html')).find((block) => block['@type'] === 'WebApplication');
    expect(app).toBeDefined();
    const offers = Object.fromEntries(app.offers.map((offer: any) => [offer.name, offer]));

    for (const tier of ['free', 'insight', 'mastery'] as const) {
      const offer = offers[PRICING[tier].name];
      expect(offer).toBeDefined();
      expect(Number(offer.price)).toBe(PRICING[tier].amount);
      expect(offer.priceCurrency).toBe(PRICING[tier].currency);
    }
  });

  it('keeps every JSON-LD block on the home page free of the old discount maths', () => {
    const html = read('index.html');
    for (const block of jsonLdBlocks(html)) {
      expect(JSON.stringify(block)).not.toMatch(/20\.30|TYPEJUNG30/);
    }
    expect(html).not.toMatch(/CA\$20\.30|CA\$29|CA\$10 regular/);
  });
});

describe('pricing copy', () => {
  it('names the list prices in the pricing page metadata', () => {
    for (const text of [PAGE_SEO.pricing.title, PAGE_SEO.pricing.description]) {
      expect(text).toContain(PRICING.insight.price);
      expect(text).not.toMatch(/20\.30|TYPEJUNG30|30%/);
    }
    expect(PAGE_SEO.pricing.title).toContain(PRICING.mastery.price);
  });

  it('does not advertise TYPEJUNG30 on the Pricing or Checkout pages', () => {
    for (const path of ['pages/Pricing.tsx', 'pages/Checkout.tsx']) {
      const source = read(path);
      expect(source).not.toMatch(/EMAIL_CAPTURE_OFFER|TYPEJUNG30|discountedPriceLabel|offer applied|Regular price/);
    }
  });

  it('keeps generator data on the new prices', () => {
    for (const path of [
      'scripts/seo-data.mjs',
      'scripts/generate-static-pages.ts',
      'scripts/generate-ai-index.mjs',
      'scripts/generate-spa-route-html.mjs',
    ]) {
      expect(read(path)).not.toMatch(/CA\$20\.30|CA\$29\b|CA\$10 base/);
    }
  });
});
