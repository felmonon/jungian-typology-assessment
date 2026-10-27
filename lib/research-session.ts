import { isResearchBrowserId, RESEARCH_SOURCE, RESEARCH_CAMPAIGN, RESEARCH_BROWSER_ID_PREFIX } from '../shared/research-traffic';

const STORAGE_KEY = 'typejung_research_browser_v1';

declare global {
  interface Window { __typejungResearchAnonymousId?: string; }
}

/** A separate, tab-scoped study identity; never replaces the customer's stored ID. */
export function researchAnonymousId(createToken: () => string = () => window.crypto?.randomUUID?.()
  || `anon_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (isResearchBrowserId(window.__typejungResearchAnonymousId)) return window.__typejungResearchAnonymousId;
  try {
    const existing = window.sessionStorage?.getItem(STORAGE_KEY);
    if (isResearchBrowserId(existing)) {
      window.__typejungResearchAnonymousId = existing!;
      return existing!;
    }
  } catch { /* In-memory identity still covers this document and SPA navigation. */ }

  const query = new URLSearchParams(window.location.search);
  if (query.get('utm_source') !== RESEARCH_SOURCE || query.get('utm_campaign') !== RESEARCH_CAMPAIGN) return undefined;
  const id = `${RESEARCH_BROWSER_ID_PREFIX}${createToken()}`;
  window.__typejungResearchAnonymousId = id;
  try { window.sessionStorage?.setItem(STORAGE_KEY, id); } catch { /* Do not override storage restrictions. */ }
  return id;
}
