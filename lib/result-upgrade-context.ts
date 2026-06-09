export type ResultUpgradeContext = {
  category: 'mistype' | 'type_compare' | 'dominant_function' | 'stress_edge' | 'alternative' | 'creator_review' | 'function_map';
  eyebrow: string;
  headline: string;
  stripBody: (tierName: string, dominantLabel: string, inferiorLabel: string) => string;
  previewTitle: (tierName: string) => string;
  previewBody: (tierName: string, dominantLabel: string, inferiorLabel: string) => string;
};

export type ResultUpgradeContextHints = {
  parentSource?: string | null;
  utmCampaign?: string | null;
  utmSource?: string | null;
  sourceChain?: string | null;
};

const normalizeSource = (source?: string | null): string =>
  String(source || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_');

const normalizeSourceWithHints = (source?: string | null, hints: ResultUpgradeContextHints = {}): string =>
  [
    source,
    hints.parentSource,
    hints.utmCampaign,
    hints.utmSource,
    hints.sourceChain,
  ].map(normalizeSource).filter(Boolean).join('_');

export function resultUpgradeContextFromSource(
  source?: string | null,
  hints: ResultUpgradeContextHints = {},
): ResultUpgradeContext | null {
  const normalized = normalizeSourceWithHints(source, hints);
  if (!normalized) return null;

  if (
    normalized.includes('creator_review')
    || normalized.includes('creator_preview')
    || normalized.includes('creator_outreach')
  ) {
    return {
      category: 'creator_review',
      eyebrow: 'Creator review follow-through',
      headline: 'Review the paid report only if the free map would help your audience.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `Your free result is the trust test. ${tierName} shows how TypeJung explains the ${dominantLabel} to ${inferiorLabel} axis in more depth so you can judge whether the paid side stays clear, cautious, and useful before mentioning it publicly.`,
      previewTitle: (tierName) => `What ${tierName} adds for creator review.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} expands the ${dominantLabel} to ${inferiorLabel} pattern with stress, relationship, and practice context. Use it as a private review layer after the free map, not as a claim that TypeJung proves anyone's final type.`,
    };
  }

  if (
    normalized.includes('mbti_mistype')
    || normalized.includes('mistype')
    || normalized.includes('mbti_keeps_changing')
  ) {
    return {
      category: 'mistype',
      eyebrow: 'Mistype follow-through',
      headline: 'Use the paid report only if this map explains the competing labels.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `Your free map shows the evidence behind the label. ${tierName} turns the ${dominantLabel} to ${inferiorLabel} axis into a deeper read on why nearby types can feel partly true, where stress distorts self-reporting, and what to watch next.`,
      previewTitle: (tierName) => `What ${tierName} adds to the mistype question.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} does not claim to prove a final MBTI type. It gives a clearer interpretation of the ${dominantLabel} to ${inferiorLabel} pattern so you can compare the result against real behavior, stress, and relationships.`,
    };
  }

  if (normalized.includes('_vs_')) {
    return {
      category: 'type_compare',
      eyebrow: 'Type comparison follow-through',
      headline: 'Use the report to compare the functions behind the two labels.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `Your free result gives one side of the comparison. ${tierName} explains the ${dominantLabel} to ${inferiorLabel} pattern in more detail so nearby labels can be judged by function evidence, not stereotype fit.`,
      previewTitle: (tierName) => `What ${tierName} adds to the comparison.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} expands the stress, relationship, and practice signals behind ${dominantLabel} to ${inferiorLabel}, giving you better evidence for comparing close type hypotheses.`,
    };
  }

  if (normalized.includes('dominant_function') || /_(ni|ne|si|se|ti|te|fi|fe)_dominant_test/.test(normalized)) {
    return {
      category: 'dominant_function',
      eyebrow: 'Dominant function follow-through',
      headline: 'Use the report to test whether this lead function holds up.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `The free map names the likely lead and edge. ${tierName} gives a deeper read on how ${dominantLabel} leads, how ${inferiorLabel} creates pressure, and where the pattern can be mistaken for something else.`,
      previewTitle: (tierName) => `What ${tierName} adds to the dominant-function read.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} connects the ${dominantLabel} lead with ${inferiorLabel} pressure so the result is easier to inspect beyond one attractive function description.`,
    };
  }

  if (normalized.includes('inferior_function') || normalized.includes('shadow_work')) {
    return {
      category: 'stress_edge',
      eyebrow: 'Stress edge follow-through',
      headline: 'Use the report if the stress edge felt recognizable.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `Your free map names the ${dominantLabel} to ${inferiorLabel} tension. ${tierName} adds a deeper, non-clinical read on stress-pattern reflection, relationship reactions, and practical observation points.`,
      previewTitle: (tierName) => `What ${tierName} adds to the stress-edge read.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} keeps the focus educational: what tends to pull ${dominantLabel} into ${inferiorLabel} pressure, how that can show up with people, and what small practices make the pattern easier to observe.`,
    };
  }

  if (normalized.includes('_alternative')) {
    return {
      category: 'alternative',
      eyebrow: 'Alternative-test follow-through',
      headline: 'Compare the result before you pay for interpretation.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `You came from a comparison route, so the free map does the first trust test. If the ${dominantLabel} to ${inferiorLabel} pattern feels useful, ${tierName} adds the deeper interpretation without turning this into a subscription.`,
      previewTitle: (tierName) => `What ${tierName} adds after the free comparison.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `${tierName} expands the result you already saw instead of asking you to trust a tool comparison blindly. Use it only if the ${dominantLabel} to ${inferiorLabel} map feels worth keeping.`,
    };
  }

  if (normalized.startsWith('seo_') || normalized.startsWith('blog_')) {
    return {
      category: 'function_map',
      eyebrow: 'Function-map follow-through',
      headline: 'Upgrade only if the free function map earned it.',
      stripBody: (tierName, dominantLabel, inferiorLabel) =>
        `Your free result shows the map. ${tierName} adds the meaning behind the ${dominantLabel} to ${inferiorLabel} pattern: stress-pattern reflection, relationship patterns, and practical next steps.`,
      previewTitle: (tierName) => `What ${tierName} adds to this exact axis.`,
      previewBody: (tierName, dominantLabel, inferiorLabel) =>
        `The free map tells you the pattern. ${tierName} turns that pattern into a deeper read on stress, relationships, and practice for ${dominantLabel} to ${inferiorLabel}.`,
    };
  }

  return null;
}
