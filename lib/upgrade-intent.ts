import { isPaidTierId, type PaidTierId } from '../data/pricing';

export const UPGRADE_INTENT_STORAGE_KEY = 'typejung_upgrade_intent';

const MAX_INTENT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type UpgradeIntent = {
  tier: PaidTierId;
  source: string;
  createdAt: string;
};

export function readUpgradeIntent(): UpgradeIntent | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(UPGRADE_INTENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !isPaidTierId(parsed.tier)) {
      localStorage.removeItem(UPGRADE_INTENT_STORAGE_KEY);
      return null;
    }

    const createdAt = typeof parsed.createdAt === 'string' ? parsed.createdAt : '';
    const createdAtTime = Date.parse(createdAt);
    if (!Number.isFinite(createdAtTime) || Date.now() - createdAtTime > MAX_INTENT_AGE_MS) {
      localStorage.removeItem(UPGRADE_INTENT_STORAGE_KEY);
      return null;
    }

    return {
      tier: parsed.tier,
      source: typeof parsed.source === 'string' ? parsed.source : 'unknown',
      createdAt,
    };
  } catch {
    return null;
  }
}

export function writeUpgradeIntent(tier: PaidTierId, source: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(UPGRADE_INTENT_STORAGE_KEY, JSON.stringify({
      tier,
      source,
      createdAt: new Date().toISOString(),
    }));
  } catch {
    // Non-critical client-side convenience.
  }
}

export function clearUpgradeIntent(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(UPGRADE_INTENT_STORAGE_KEY);
  } catch {
    // Non-critical client-side convenience.
  }
}
