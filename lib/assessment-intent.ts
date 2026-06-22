// Self-reported reason a user came to the assessment ("what brought you here?").
// Captured on the preflight screen and used to personalize the result-page CTA,
// so the paid framing speaks to the actual question they arrived with.

export const ASSESSMENT_INTENT_STORAGE_KEY = 'typejung_assessment_intent';

const MAX_INTENT_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type AssessmentIntentId =
  | 'mbti_changes'
  | 'stuck_between'
  | 'dominant'
  | 'inferior_stress'
  | 'comparing';

export const ASSESSMENT_INTENTS: ReadonlyArray<{ id: AssessmentIntentId; label: string }> = [
  { id: 'mbti_changes', label: 'My MBTI keeps changing' },
  { id: 'stuck_between', label: 'I am stuck between two types' },
  { id: 'dominant', label: 'I want my dominant function' },
  { id: 'inferior_stress', label: 'I want my inferior / stress pattern' },
  { id: 'comparing', label: 'I am comparing TypeJung with another test' },
];

const INTENT_IDS = new Set<AssessmentIntentId>(ASSESSMENT_INTENTS.map((intent) => intent.id));

export function isAssessmentIntentId(value: unknown): value is AssessmentIntentId {
  return typeof value === 'string' && INTENT_IDS.has(value as AssessmentIntentId);
}

export type AssessmentIntent = {
  id: AssessmentIntentId;
  createdAt: string;
};

export function writeAssessmentIntent(id: AssessmentIntentId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      ASSESSMENT_INTENT_STORAGE_KEY,
      JSON.stringify({ id, createdAt: new Date().toISOString() } satisfies AssessmentIntent),
    );
  } catch {
    // Storage may be unavailable; personalization is best-effort.
  }
}

export function readAssessmentIntent(): AssessmentIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ASSESSMENT_INTENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !isAssessmentIntentId(parsed.id)) {
      localStorage.removeItem(ASSESSMENT_INTENT_STORAGE_KEY);
      return null;
    }

    const createdAt = typeof parsed.createdAt === 'string' ? parsed.createdAt : '';
    const createdAtTime = Date.parse(createdAt);
    if (!Number.isFinite(createdAtTime) || Date.now() - createdAtTime > MAX_INTENT_AGE_MS) {
      localStorage.removeItem(ASSESSMENT_INTENT_STORAGE_KEY);
      return null;
    }

    return { id: parsed.id, createdAt };
  } catch {
    return null;
  }
}

// One-line, result-page framing tied to the reason they came. `suggestDebrief`
// flags the segments where a human second read is the strongest next step.
export const INTENT_RESULT_FRAMING: Record<AssessmentIntentId, { line: string; suggestDebrief: boolean }> = {
  mbti_changes: {
    line: 'Because you came here because your MBTI keeps changing, the paid read focuses on the stable function pattern under the shifting labels.',
    suggestDebrief: false,
  },
  stuck_between: {
    line: 'Because you came here stuck between two types, the paid read focuses on where your stack actually separates the likely mistypes.',
    suggestDebrief: true,
  },
  dominant: {
    line: 'Because you came here for your dominant function, the paid read explains how that lead function drives the rest of your stack.',
    suggestDebrief: false,
  },
  inferior_stress: {
    line: 'Because you came here for your inferior and stress pattern, the paid read goes deepest on the developmental edge and stress reflection.',
    suggestDebrief: false,
  },
  comparing: {
    line: 'Because you came here comparing TypeJung with another test, the paid read shows what the function-stack interpretation adds over a four-letter result.',
    suggestDebrief: true,
  },
};
