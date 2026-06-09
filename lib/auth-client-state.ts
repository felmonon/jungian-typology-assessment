const AUTH_SCOPED_LOCAL_STORAGE_KEYS = [
  'jungian_assessment_progress',
  'jungian_depth_assessment_progress',
  'jungian_assessment_results',
  'jungian_depth_results_history',
  'jungian_assessment_share_slug',
  'jungian_assessment_tier',
  'jungian_assessment_unlocked',
  'jungian_assessment_unlock_user_id',
  'jungian_assessment_unlock_date',
  'jungian_assessment_checkout_session_id',
  'jungian_assessment_send_email',
  'jungian_assessment_customer_email',
] as const;

const AUTH_SCOPED_STORAGE_PREFIXES = [
  'jungian_assessment_purchase_tracked_',
  'jungian_assessment_result_saved_',
  'typejung_lifecycle_email_',
  'typejung_results_viewed_',
] as const;

function removeMatchingStorageKeys(storage: Storage, keys: readonly string[], prefixes: readonly string[]) {
  keys.forEach((key) => storage.removeItem(key));

  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
      storage.removeItem(key);
    }
  }
}

export function clearAuthScopedClientState() {
  if (typeof window === 'undefined') return;

  try {
    removeMatchingStorageKeys(window.localStorage, AUTH_SCOPED_LOCAL_STORAGE_KEYS, AUTH_SCOPED_STORAGE_PREFIXES);
  } catch {
    // Storage access can fail in private or restricted browsing modes.
  }

  try {
    removeMatchingStorageKeys(window.sessionStorage, [], AUTH_SCOPED_STORAGE_PREFIXES);
  } catch {
    // Storage access can fail in private or restricted browsing modes.
  }

  window.dispatchEvent(new Event('typejung:auth-state-cleared'));
}
