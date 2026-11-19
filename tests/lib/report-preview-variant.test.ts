import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assignReportPreviewVariant,
  REPORT_PREVIEW_VARIANT_STORAGE_KEY,
  reportPreviewOfferProperties,
  resetReportPreviewVariantMemory,
} from '../../lib/report-preview-variant';
import { RESULT_OFFER_VERSION } from '../../lib/result-stress-preview';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
  };
}

beforeEach(() => resetReportPreviewVariantMemory());

describe('report preview A/B assignment', () => {
  it.each([
    [0, 'preview_v2'],
    [0.4999, 'preview_v2'],
    [0.5, 'control'],
    [0.99, 'control'],
  ] as const)('splits 50/50: a draw of %s assigns %s', (draw, expected) => {
    expect(assignReportPreviewVariant(memoryStorage(), () => draw)).toBe(expected);
  });

  it('persists the first assignment and keeps it on later visits', () => {
    const storage = memoryStorage();
    const first = assignReportPreviewVariant(storage, () => 0.1);
    resetReportPreviewVariantMemory();
    const later = assignReportPreviewVariant(storage, () => 0.9);

    expect(first).toBe('preview_v2');
    expect(later).toBe('preview_v2');
    expect(storage.values.get(REPORT_PREVIEW_VARIANT_STORAGE_KEY)).toBe('preview_v2');
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  it('reassigns when the stored value is not a known arm', () => {
    const storage = memoryStorage({ [REPORT_PREVIEW_VARIANT_STORAGE_KEY]: 'tampered' });
    expect(assignReportPreviewVariant(storage, () => 0.7)).toBe('control');
    expect(storage.values.get(REPORT_PREVIEW_VARIANT_STORAGE_KEY)).toBe('control');
  });

  it('stays stable within the page when storage throws', () => {
    const broken = {
      getItem: vi.fn(() => { throw new Error('SecurityError'); }),
      setItem: vi.fn(() => { throw new Error('QuotaExceededError'); }),
    };
    const random = vi.fn().mockReturnValueOnce(0.2).mockReturnValueOnce(0.8);

    expect(assignReportPreviewVariant(broken, random)).toBe('preview_v2');
    expect(assignReportPreviewVariant(broken, random)).toBe('preview_v2');
    expect(random).toHaveBeenCalledTimes(1);
  });

  it('works with no storage at all', () => {
    expect(assignReportPreviewVariant(null, () => 0.6)).toBe('control');
  });

  it('roughly halves a large population', () => {
    let previews = 0;
    for (let index = 0; index < 2000; index += 1) {
      resetReportPreviewVariantMemory();
      if (assignReportPreviewVariant(memoryStorage()) === 'preview_v2') previews += 1;
    }
    expect(previews).toBeGreaterThan(850);
    expect(previews).toBeLessThan(1150);
  });

  it('keeps the existing offer_version for control so its series continues', () => {
    expect(reportPreviewOfferProperties('control')).toEqual({ offer_version: RESULT_OFFER_VERSION, offer_variant: 'control' });
    expect(reportPreviewOfferProperties('preview_v2')).toEqual({ offer_version: 'report-preview-v2', offer_variant: 'preview_v2' });
  });
});
