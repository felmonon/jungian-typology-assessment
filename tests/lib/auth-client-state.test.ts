import { beforeEach, describe, expect, it } from 'vitest';
import { clearAuthScopedClientState } from '../../lib/auth-client-state';

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

describe('clearAuthScopedClientState', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    });
  });

  it('removes TypeJung account-scoped local and session data', () => {
    localStorage.setItem('jungian_assessment_results', '{"dominant":"Ni"}');
    localStorage.setItem('jungian_depth_assessment_progress', '{"currentPage":2}');
    localStorage.setItem('jungian_assessment_tier', 'mastery');
    localStorage.setItem('jungian_assessment_checkout_session_id', 'cs_test_123');
    localStorage.setItem('jungian_assessment_transaction_id', 'pi_test_123');
    localStorage.setItem('jungian_assessment_result_saved_2026-05-18', 'true');
    localStorage.setItem('typejung_lifecycle_email_upgrade_abc', 'sent');
    localStorage.setItem('dark-mode', 'true');
    localStorage.setItem('typejung_discount_capture', '{"email":"person@example.com"}');
    sessionStorage.setItem('typejung_results_viewed_2026-05-18', 'true');

    clearAuthScopedClientState();

    expect(localStorage.getItem('jungian_assessment_results')).toBeNull();
    expect(localStorage.getItem('jungian_depth_assessment_progress')).toBeNull();
    expect(localStorage.getItem('jungian_assessment_tier')).toBeNull();
    expect(localStorage.getItem('jungian_assessment_checkout_session_id')).toBeNull();
    expect(localStorage.getItem('jungian_assessment_transaction_id')).toBeNull();
    expect(localStorage.getItem('jungian_assessment_result_saved_2026-05-18')).toBeNull();
    expect(localStorage.getItem('typejung_lifecycle_email_upgrade_abc')).toBeNull();
    expect(sessionStorage.getItem('typejung_results_viewed_2026-05-18')).toBeNull();
    expect(localStorage.getItem('dark-mode')).toBe('true');
    expect(localStorage.getItem('typejung_discount_capture')).toBeNull();
  });
});
