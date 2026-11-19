import { PREMIUM_REPORT_KEYS, type PremiumAnalysis } from './premium-report.js';

export type PremiumReportKey = (typeof PREMIUM_REPORT_KEYS)[number];

// Shared by the results page and the preview endpoint so the titles a reader
// sees before purchase match the sections in the report they unlock.
export const PREMIUM_REPORT_SECTION_TITLES: Record<PremiumReportKey, string> = {
  overview: 'Pattern synthesis',
  functionAnalysis: 'Function dynamics',
  archetypes: 'Archetypal pattern',
  theGrip: 'Grip sequence and recovery',
  relationships: 'Relationship pattern and repair',
  career: 'Work conditions and friction',
  individuation: 'Individuation path',
  shadow: 'Shadow triggers and integration',
  growth: 'Growth practices',
  dreams: 'Dream reflection prompts',
};

// The grip section works through the dominant-inferior stress edge, the part
// of the free map readers most often ask about, so it is the one shown whole.
export const FEATURED_PREVIEW_SECTION: PremiumReportKey = 'theGrip';

export const PREVIEW_OPENER_MAX_CHARS = 220;

export type ReportPreviewSection = { key: PremiumReportKey; title: string; opener: string };

export type ReportPreview = {
  featured: { key: PremiumReportKey; title: string; body: string };
  sections: ReportPreviewSection[];
};

/** First sentence of a section, capped so a long sentence cannot carry the section. */
export function firstSentence(text: string, maxChars = PREVIEW_OPENER_MAX_CHARS): string {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const match = trimmed.match(/^.+?[.!?]["')\]]?(?=\s|$)/);
  const sentence = match ? match[0] : trimmed;
  if (sentence.length <= maxChars) return sentence;
  const cut = sentence.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:]+$/, '')}…`;
}

/**
 * The only report text that may leave the server before purchase: one section
 * in full and one opening sentence for each of the others.
 */
export function buildReportPreview(report: PremiumAnalysis): ReportPreview {
  return {
    featured: {
      key: FEATURED_PREVIEW_SECTION,
      title: PREMIUM_REPORT_SECTION_TITLES[FEATURED_PREVIEW_SECTION],
      body: report[FEATURED_PREVIEW_SECTION],
    },
    sections: PREMIUM_REPORT_KEYS
      .filter((key) => key !== FEATURED_PREVIEW_SECTION)
      .map((key) => ({ key, title: PREMIUM_REPORT_SECTION_TITLES[key], opener: firstSentence(report[key]) })),
  };
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Client-side guard for the preview response; anything else falls back to the old offer. */
export function readReportPreview(value: unknown): ReportPreview | null {
  if (!isPlainObject(value) || !isPlainObject(value.featured) || !Array.isArray(value.sections)) return null;
  const { featured } = value;
  if (featured.key !== FEATURED_PREVIEW_SECTION || typeof featured.body !== 'string' || !featured.body.trim()) return null;
  const sections: ReportPreviewSection[] = [];
  for (const item of value.sections) {
    if (!isPlainObject(item) || typeof item.opener !== 'string') return null;
    const key = item.key as PremiumReportKey;
    if (!PREMIUM_REPORT_KEYS.includes(key) || key === FEATURED_PREVIEW_SECTION) return null;
    sections.push({ key, title: PREMIUM_REPORT_SECTION_TITLES[key], opener: item.opener.slice(0, PREVIEW_OPENER_MAX_CHARS + 1) });
  }
  if (sections.length !== PREMIUM_REPORT_KEYS.length - 1) return null;
  return {
    featured: { key: FEATURED_PREVIEW_SECTION, title: PREMIUM_REPORT_SECTION_TITLES[FEATURED_PREVIEW_SECTION], body: featured.body },
    sections,
  };
}
