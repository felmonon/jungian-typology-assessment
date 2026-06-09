export type AssessmentEntryContext = {
  category: 'mistype' | 'type_compare' | 'dominant_function' | 'stress_edge' | 'alternative' | 'creator_review' | 'function_map';
  eyebrow: string;
  title: string;
  body: string;
};

export type AssessmentEntryContextHints = {
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

const normalizeSourceWithHints = (source?: string | null, hints: AssessmentEntryContextHints = {}): string =>
  [
    source,
    hints.parentSource,
    hints.utmCampaign,
    hints.utmSource,
    hints.sourceChain,
  ].map(normalizeSource).filter(Boolean).join('_');

export function assessmentEntryContextFromSource(
  source?: string | null,
  hints: AssessmentEntryContextHints = {},
): AssessmentEntryContext | null {
  const normalized = normalizeSourceWithHints(source, hints);
  if (!normalized) return null;

  if (
    normalized.includes('creator_review')
    || normalized.includes('creator_preview')
    || normalized.includes('creator_outreach')
  ) {
    return {
      category: 'creator_review',
      eyebrow: 'Creator review path',
      title: 'Take the same free map your audience would see.',
      body: 'Answer normally, then judge whether the free result is clear, cautious, and useful enough for your readers or viewers. Paid interpretation stays optional after the map earns interest.',
    };
  }

  if (
    normalized.includes('mbti_mistype')
    || normalized.includes('mistype')
    || normalized.includes('mbti_keeps_changing')
  ) {
    return {
      category: 'mistype',
      eyebrow: 'Mistype check',
      title: 'Answer from the pattern, not the label you want to prove.',
      body: 'The result will compare function order, answer consistency, and the dominant-inferior edge so you can inspect why competing MBTI labels keep showing up.',
    };
  }

  if (normalized.includes('_vs_')) {
    return {
      category: 'type_compare',
      eyebrow: 'Type comparison',
      title: 'Use this as evidence between nearby labels.',
      body: 'Answer for what repeats in real situations. The map will make the leading function, support function, and stress edge easier to compare after the assessment.',
    };
  }

  if (normalized.includes('dominant_function') || /_(ni|ne|si|se|ti|te|fi|fe)_dominant_test/.test(normalized)) {
    return {
      category: 'dominant_function',
      eyebrow: 'Dominant function check',
      title: 'Look for what leads consistently, not what sounds impressive.',
      body: 'A high score is only useful inside the full map. TypeJung compares the likely lead function with support and inferior-function pressure before naming the pattern.',
    };
  }

  if (normalized.includes('inferior_function') || normalized.includes('shadow_work')) {
    return {
      category: 'stress_edge',
      eyebrow: 'Stress edge check',
      title: 'Stress answers count, but they are not the whole type.',
      body: 'Answer pressure questions from repeated patterns rather than one bad day. The result separates dominant energy from inferior-function strain for self-reflection.',
    };
  }

  if (normalized.includes('_alternative')) {
    return {
      category: 'alternative',
      eyebrow: 'Alternative test route',
      title: 'Start with the free map before comparing tools.',
      body: 'You will see all 8 function-attitudes and the likely dominant-inferior axis first. Paid interpretation stays optional until the result feels worth keeping.',
    };
  }

  if (normalized.startsWith('seo_') || normalized.startsWith('blog_')) {
    return {
      category: 'function_map',
      eyebrow: 'Function-map route',
      title: 'This starts with evidence, not a paywall.',
      body: 'Complete the free 42-question map first. Then use the visible function pattern to decide whether any deeper report is useful.',
    };
  }

  return null;
}
