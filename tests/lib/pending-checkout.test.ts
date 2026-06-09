import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearPendingCheckout,
  pendingCheckoutRestartPath,
  readPendingCheckout,
  writePendingCheckout,
} from '../../lib/pending-checkout';

const STORAGE_KEY = 'typejung_pending_checkout';

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('pending checkout storage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it('stores and reads a valid Stripe checkout session', () => {
    writePendingCheckout({
      tier: 'mastery',
      url: 'https://checkout.stripe.com/c/pay/cs_live_123',
      sessionId: 'cs_live_123',
      source: 'checkout_review',
      attribution: {
        utmCampaign: 'creator_outreach_2026_05',
        utmSource: 'joyce_meng',
        parentSource: 'seo_mbti_mistype_test_hero',
        sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      },
    });

    expect(readPendingCheckout()).toMatchObject({
      tier: 'mastery',
      url: 'https://checkout.stripe.com/c/pay/cs_live_123',
      sessionId: 'cs_live_123',
      source: 'checkout_review',
      utmCampaign: 'creator_outreach_2026_05',
      utmSource: 'joyce_meng',
      parentSource: 'seo_mbti_mistype_test_hero',
      sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      status: 'open',
    });
    expect(readPendingCheckout()?.expiresAt).toBeTruthy();
  });

  it('uses a 24-hour fallback expiration when Stripe does not return one', () => {
    const beforeWrite = Date.now();

    writePendingCheckout({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_fallback',
      source: 'checkout_review',
    });

    const pending = readPendingCheckout();
    expect(pending?.status).toBe('open');

    const fallbackMs = Date.parse(pending?.expiresAt || '') - beforeWrite;
    expect(fallbackMs).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(fallbackMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000);
  });

  it('rejects non-Stripe URLs', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tier: 'insight',
      url: 'https://example.com/pay',
      createdAt: new Date().toISOString(),
      source: 'checkout_review',
    }));

    expect(readPendingCheckout()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clears stale sessions', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_old',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      source: 'checkout_review',
    }));

    expect(readPendingCheckout()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('keeps recently expired sessions so checkout can restart from the site', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_expired',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      source: 'checkout_review',
    }));

    expect(readPendingCheckout()).toMatchObject({
      tier: 'insight',
      status: 'expired',
      source: 'checkout_review',
    });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('treats legacy sessions without an expiration as restart-only', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_legacy',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: 'checkout_review',
    }));

    expect(readPendingCheckout()).toMatchObject({
      tier: 'insight',
      status: 'expired',
      source: 'checkout_review',
    });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('clears the stored pending checkout', () => {
    writePendingCheckout({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_456',
      source: 'checkout_review',
    });

    clearPendingCheckout();

    expect(readPendingCheckout()).toBeNull();
  });

  it('notifies listeners when stored checkout state changes', () => {
    const listener = vi.fn();
    window.addEventListener('typejung:pending-checkout-changed', listener);

    writePendingCheckout({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_event',
      source: 'checkout_review',
    });
    clearPendingCheckout();

    expect(listener).toHaveBeenCalledTimes(2);
    window.removeEventListener('typejung:pending-checkout-changed', listener);
  });

  it('builds restart checkout paths with the original recovery attribution', () => {
    writePendingCheckout({
      tier: 'insight',
      url: 'https://checkout.stripe.com/c/pay/cs_live_restart',
      source: 'custom_checkout_review_seo_mbti_mistype_test_hero',
      attribution: {
        utmCampaign: 'creator_outreach_2026_05',
        utmSource: 'joyce_meng',
        sharedResult: 'demo_compare',
        sourceChain: 'creator_review_invite>creator_safe_mention>seo_mbti_mistype_test_hero',
      },
    });

    const pending = readPendingCheckout();

    expect(pending && pendingCheckoutRestartPath(pending))
      .toBe('/checkout/insight?source=global_recovery_banner&restart=pending_checkout&utm_campaign=creator_outreach_2026_05&utm_source=joyce_meng&shared_result=demo_compare&source_chain=creator_review_invite%3Ecreator_safe_mention%3Eseo_mbti_mistype_test_hero&parent_source=custom_checkout_review_seo_mbti_mistype_test_hero');
  });
});
