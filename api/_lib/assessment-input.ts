import { isJsonObject, type JsonObject } from './request-body.js';

// The real results-page payload is a few kilobytes (the depth result travels
// twice: at the top level and inside the stack). Anything far beyond that is
// not a TypeJung result and never reaches a prompt.
export const MAX_AI_BODY_BYTES = 48 * 1024;
export const MAX_PROMPT_TEXT_CHARS = 600;

const FUNCTION_CODES = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'] as const;
const CHANNELS = ['thinking', 'feeling', 'sensation', 'intuition'] as const;
const ATTITUDES = ['introverted', 'extraverted'] as const;
const POSITIONS = ['dominant', 'auxiliary', 'tertiary', 'inferior'] as const;
const RELIABILITY_LABELS = ['High', 'Moderate', 'Exploratory'] as const;
const NARRATIVE_KEYS = ['energyMap', 'developmentalEdge', 'complexVulnerability', 'somaticSignature', 'practice'] as const;

type FunctionCode = (typeof FUNCTION_CODES)[number];
type Channel = (typeof CHANNELS)[number];
type Attitude = (typeof ATTITUDES)[number];
type Position = (typeof POSITIONS)[number];

export type CleanScore = { function: FunctionCode; score: number };

export type CleanDepth = {
  completedAt: string | null;
  dominant: Channel | null;
  auxiliary: Channel | null;
  tertiary: Channel | null;
  inferior: Channel | null;
  attitude: { dominant: Attitude | null; introverted: number | null; extraverted: number | null; balanced: boolean | null };
  hierarchy: Array<{ position: Position; channel: Channel; attitude: Attitude; score: number }>;
  energy: Array<{ channel: Channel; score: number }>;
  inferiorScores: Partial<Record<Channel, number>>;
  reliability: { score: number | null; label: (typeof RELIABILITY_LABELS)[number] | null };
  narrative: Partial<Record<(typeof NARRATIVE_KEYS)[number], string>>;
};

export type CleanAssessment = {
  scores: CleanScore[];
  stack: Record<Position, CleanScore> | null;
  attitudeScore: number;
  isUndifferentiated: boolean;
  depth: CleanDepth | null;
};

function oneOf<T extends string>(values: readonly T[], value: unknown): T | null {
  return typeof value === 'string' && (values as readonly string[]).includes(value) ? (value as T) : null;
}

function boundedNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(Math.min(max, Math.max(min, value)) * 10) / 10;
}

// Control characters and runs of whitespace are removed so a prompt line stays
// one line; length is capped so a field cannot carry instructions of its own.
export function promptText(value: unknown, maxChars = MAX_PROMPT_TEXT_CHARS): string | null {
  if (typeof value !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxChars);
  return cleaned || null;
}

function cleanScore(value: unknown): CleanScore | null {
  if (!isJsonObject(value)) return null;
  const code = oneOf(FUNCTION_CODES, value.function);
  const score = boundedNumber(value.score, 0, 100);
  return code && score !== null ? { function: code, score } : null;
}

function cleanCompletedAt(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function cleanDepth(value: unknown): CleanDepth | null {
  if (!isJsonObject(value)) return null;
  const attitude = isJsonObject(value.attitude) ? value.attitude : {};
  const reliability = isJsonObject(value.reliability) ? value.reliability : {};
  const narrative = isJsonObject(value.narrative) ? value.narrative : {};
  const inferiorScores = isJsonObject(value.inferiorScores) ? value.inferiorScores : {};

  const hierarchy = (Array.isArray(value.hierarchy) ? value.hierarchy.slice(0, POSITIONS.length) : []).flatMap((item) => {
    if (!isJsonObject(item)) return [];
    const position = oneOf(POSITIONS, item.position);
    const channel = oneOf(CHANNELS, item.channel);
    const direction = oneOf(ATTITUDES, item.attitude);
    const score = boundedNumber(item.score, 0, 100);
    return position && channel && direction && score !== null ? [{ position, channel, attitude: direction, score }] : [];
  });
  const energy = (Array.isArray(value.energy) ? value.energy.slice(0, CHANNELS.length) : []).flatMap((item) => {
    if (!isJsonObject(item)) return [];
    const channel = oneOf(CHANNELS, item.channel);
    const score = boundedNumber(item.score, 0, 100);
    return channel && score !== null ? [{ channel, score }] : [];
  });

  return {
    completedAt: cleanCompletedAt(value.completedAt),
    dominant: oneOf(CHANNELS, value.dominant),
    auxiliary: oneOf(CHANNELS, value.auxiliary),
    tertiary: oneOf(CHANNELS, value.tertiary),
    inferior: oneOf(CHANNELS, value.inferior),
    attitude: {
      dominant: oneOf(ATTITUDES, attitude.dominant),
      introverted: boundedNumber(attitude.introverted, 0, 100),
      extraverted: boundedNumber(attitude.extraverted, 0, 100),
      balanced: typeof attitude.balanced === 'boolean' ? attitude.balanced : null,
    },
    hierarchy,
    energy,
    inferiorScores: Object.fromEntries(CHANNELS.flatMap((channel) => {
      const score = boundedNumber(inferiorScores[channel], 0, 100);
      return score === null ? [] : [[channel, score]];
    })),
    reliability: {
      score: boundedNumber(reliability.score, 0, 100),
      label: oneOf(RELIABILITY_LABELS, reliability.label),
    },
    narrative: Object.fromEntries(NARRATIVE_KEYS.flatMap((key) => {
      const text = promptText(narrative[key]);
      return text ? [[key, text]] : [];
    })),
  };
}

export function bodyByteLength(body: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(body) ?? '', 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function isOversizedBody(body: unknown): boolean {
  return bodyByteLength(body) > MAX_AI_BODY_BYTES;
}

/**
 * Rebuilds the assessment from known fields only. Unknown keys, nested
 * objects in text positions, and out-of-range numbers never reach a prompt.
 */
export function sanitizeAssessmentInput(body: JsonObject): CleanAssessment {
  const rawScores = Array.isArray(body.scores) ? body.scores.slice(0, 16) : [];
  const seen = new Set<FunctionCode>();
  const scores = rawScores.flatMap((item) => {
    const score = cleanScore(item);
    if (!score || seen.has(score.function)) return [];
    seen.add(score.function);
    return [score];
  });

  const rawStack = isJsonObject(body.stack) ? body.stack : null;
  const stackEntries = rawStack ? POSITIONS.map((position) => [position, cleanScore(rawStack[position])] as const) : [];
  const stack = stackEntries.length && stackEntries.every(([, score]) => score)
    ? (Object.fromEntries(stackEntries) as Record<Position, CleanScore>)
    : null;

  return {
    scores,
    stack,
    attitudeScore: boundedNumber(body.attitudeScore, -100, 100) ?? 0,
    isUndifferentiated: body.isUndifferentiated === true,
    depth: cleanDepth(body.depthResult ?? rawStack?.depthResult),
  };
}
