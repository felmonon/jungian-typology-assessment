import { RESULT_OFFER_VERSION } from './result-stress-preview';

export const REPORT_PREVIEW_VARIANTS = ['preview_v2', 'control'] as const;
export type ReportPreviewVariant = (typeof REPORT_PREVIEW_VARIANTS)[number];

export const REPORT_PREVIEW_VARIANT_STORAGE_KEY = 'typejung_report_preview_variant';

// Control keeps the existing offer_version so its numbers continue the
// series already in funnel_events; the preview arm gets its own version.
export const REPORT_PREVIEW_OFFER_VERSIONS: Record<ReportPreviewVariant, string> = {
  control: RESULT_OFFER_VERSION,
  preview_v2: 'report-preview-v2',
};

type VariantStorage = Pick<Storage, 'getItem' | 'setItem'>;

let memoryVariant: ReportPreviewVariant | null = null;

export function isReportPreviewVariant(value: unknown): value is ReportPreviewVariant {
  return typeof value === 'string' && (REPORT_PREVIEW_VARIANTS as readonly string[]).includes(value);
}

function defaultStorage(): VariantStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/**
 * A stable 50/50 arm per anonymous visitor. The first assignment is stored in
 * localStorage; when storage is blocked the arm is kept in memory for the
 * page's lifetime so one visit never mixes both experiences.
 */
export function assignReportPreviewVariant(
  storage: VariantStorage | null = defaultStorage(),
  random: () => number = Math.random,
): ReportPreviewVariant {
  try {
    const stored = storage?.getItem(REPORT_PREVIEW_VARIANT_STORAGE_KEY);
    if (isReportPreviewVariant(stored)) {
      memoryVariant = stored;
      return stored;
    }
  } catch {
    // Fall through to the in-memory arm.
  }

  if (memoryVariant) return memoryVariant;

  const variant: ReportPreviewVariant = random() < 0.5 ? 'preview_v2' : 'control';
  memoryVariant = variant;
  try {
    storage?.setItem(REPORT_PREVIEW_VARIANT_STORAGE_KEY, variant);
  } catch {
    // Storage can be full or disabled; the in-memory arm still holds.
  }
  return variant;
}

export function reportPreviewOfferProperties(variant: ReportPreviewVariant) {
  return { offer_version: REPORT_PREVIEW_OFFER_VERSIONS[variant], offer_variant: variant };
}

/** Test hook: forget the in-memory arm. */
export function resetReportPreviewVariantMemory() {
  memoryVariant = null;
}
