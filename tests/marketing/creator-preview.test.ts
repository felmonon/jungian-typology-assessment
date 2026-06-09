import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { seoLandingPages } from '../../scripts/seo-data.mjs';

const priorityACreatorSources = new Set([
  'joyce_meng',
  'personality_hacker',
  'geek_psychology',
  'dear_kristin',
  'psychology_junkie',
  'practical_typing',
  'our_human_minds',
  'ennpey',
  'cognitive_personality_theory',
  'type_in_mind',
  'love_who',
]);

describe('creator preview growth page', () => {
  it('defines a free-first creator review page with safe claims', () => {
    const page = seoLandingPages.find((landingPage) => landingPage.slug === 'creator-preview');

    expect(page).toBeDefined();
    expect(page?.h1).toBe('A review path for typology creators');
    expect(page?.saveLink).toMatchObject({
      title: 'Send yourself the review path',
      button: 'Email the review path',
      tier: 'mastery',
    });
    expect(page?.creatorKit).toMatchObject({
      title: 'Safe mention kit after review',
      publicPath: '/mbti-mistype-test',
      defaultCampaign: 'creator_outreach_2026_05',
    });
    expect(page?.creatorKit?.snippets).toHaveLength(4);
    expect(page?.creatorKit?.snippets.every((snippet) => snippet.copy.includes('{public_link}'))).toBe(true);
    expect(JSON.stringify(page?.creatorKit?.snippets)).toContain('not diagnosis');
    expect(JSON.stringify(page?.creatorKit?.snippets)).toContain('not a typing authority');
    expect(page?.intent.privacy).toContain('No payment is required');
    expect(page?.faqs.map((faq) => faq.question)).toContain('Can I describe TypeJung as a typing authority?');
    expect(page?.relatedLinks.map((link) => link.href)).toEqual(expect.arrayContaining([
      '/assessment',
      '/sample-report',
      '/pricing',
    ]));
  });

  it('routes priority A creator outreach through the review page without marking sends complete', () => {
    const csv = readFileSync(join(process.cwd(), 'marketing/launch/creator-outreach.csv'), 'utf8');
    const rows = csv.trim().split('\n').slice(1).map((line) => {
      const fields = line.split(',');
      return {
        target: fields[0],
        pitchPage: fields[4],
        utmSource: fields[7],
        priority: fields[9],
        status: fields[11],
      };
    });
    const creatorRows = rows.filter((row) => priorityACreatorSources.has(row.utmSource));

    expect(creatorRows).toHaveLength(priorityACreatorSources.size);
    for (const row of creatorRows) {
      expect(row.priority).toBe('A');
      expect(row.pitchPage, row.target).toBe('https://typejung.com/creator-preview');
      expect(row.status, row.target).toBe('not_contacted');
    }
  });
});
