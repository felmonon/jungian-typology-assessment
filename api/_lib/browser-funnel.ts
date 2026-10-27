import type { SupabaseClient } from '@supabase/supabase-js';

const WINDOW_DAYS = 30;
const PAGE_SIZE = 1000;
const MAX_EVENTS = 20_000;
const EVENT_NAMES = ['site_visited', 'assessment_started', 'assessment_completed', 'results_premium_preview_viewed', 'checkout_session_created', 'purchase'];

export type BrowserFunnelEvent = {
  event_id: string;
  event_name: string;
  anonymous_id?: string | null;
  occurred_at: string;
  checkout_intent_id?: string | null;
  stripe_session_id?: string | null;
  purchase_id?: string | null;
};
type VerifiedPurchase = { id: string; stripe_session_id: string; status: string; amount: number; tier: string };
type VerifiedIntent = { id: string; stripe_session_id: string; created_at: string };

export type BrowserFunnelSummary = {
  status: 'available' | 'unavailable' | 'partial';
  windowStart: string;
  windowEnd: string;
  stages: { key: string; label: string; browsers: number; previousRate: number | null }[];
  completingBrowsers: number;
  payingCompletingBrowsers: number;
  completionToPaidRate: number | null;
  visitTrackingFirstSeen: string | null;
};

export function summarizeBrowserFunnel(
  events: BrowserFunnelEvent[],
  purchases: VerifiedPurchase[],
  intents: VerifiedIntent[],
  now = new Date(),
): BrowserFunnelSummary {
  const end = now.getTime();
  const start = end - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const paidBySession = new Map(purchases
    .filter((row) => row.status === 'completed' && row.amount > 0 && ['insight', 'mastery'].includes(row.tier))
    .map((row) => [row.stripe_session_id, row]));
  const intentBySession = new Map(intents.map((row) => [row.stripe_session_id, row]));
  const byBrowser = new Map<string, BrowserFunnelEvent[]>();
  const seenEvents = new Set<string>();
  let visitTrackingFirstSeen: string | null = null;

  for (const event of [...events].sort((a, b) => Date.parse(a.occurred_at) - Date.parse(b.occurred_at))) {
    const time = Date.parse(event.occurred_at);
    if (!event.anonymous_id || !EVENT_NAMES.includes(event.event_name) || !Number.isFinite(time)
      || time < start || time > end || seenEvents.has(event.event_id)) continue;
    seenEvents.add(event.event_id);

    if (event.event_name === 'checkout_session_created') {
      const intent = intentBySession.get(event.stripe_session_id || '');
      if (!intent || intent.id !== event.checkout_intent_id
        || event.event_id !== `checkout_session_created:${event.stripe_session_id}`) continue;
    }
    if (event.event_name === 'purchase') {
      const paid = paidBySession.get(event.stripe_session_id || '');
      const intent = intentBySession.get(event.stripe_session_id || '');
      // Legacy client submissions cannot establish a paid conversion. Match the
      // canonical event to the private purchase and checkout-intent tables.
      if (!paid || paid.id !== event.purchase_id || !intent || intent.id !== event.checkout_intent_id
        || event.event_id !== `purchase:${event.stripe_session_id}`
        || Date.parse(intent.created_at) > time) continue;
    }
    if (event.event_name === 'site_visited' && !visitTrackingFirstSeen) visitTrackingFirstSeen = event.occurred_at;
    const history = byBrowser.get(event.anonymous_id) || [];
    history.push(event);
    byBrowser.set(event.anonymous_id, history);
  }

  const labels = ['Visited', 'Started test', 'Completed test', 'Viewed offer', 'Checkout ready', 'Paid'];
  const counts = EVENT_NAMES.map(() => 0);
  let completingBrowsers = 0;
  let payingCompletingBrowsers = 0;
  for (const history of byBrowser.values()) {
    let previousTime = -Infinity;
    for (let stage = 0; stage < EVENT_NAMES.length; stage += 1) {
      const next = history.find((event) => event.event_name === EVENT_NAMES[stage]
        && Date.parse(event.occurred_at) >= previousTime);
      if (!next) break;
      counts[stage] += 1;
      previousTime = Date.parse(next.occurred_at);
    }
    const completion = history.find((event) => event.event_name === 'assessment_completed');
    if (completion) {
      completingBrowsers += 1;
      if (history.some((event) => event.event_name === 'purchase'
        && Date.parse(event.occurred_at) >= Date.parse(completion.occurred_at))) payingCompletingBrowsers += 1;
    }
  }
  return {
    status: 'available',
    windowStart: new Date(start).toISOString(),
    windowEnd: now.toISOString(),
    stages: EVENT_NAMES.map((key, index) => ({
      key, label: labels[index], browsers: counts[index],
      previousRate: index > 0 && counts[index - 1] > 0 ? counts[index] / counts[index - 1] : null,
    })),
    completingBrowsers,
    payingCompletingBrowsers,
    completionToPaidRate: completingBrowsers > 0 ? payingCompletingBrowsers / completingBrowsers : null,
    visitTrackingFirstSeen,
  };
}

export async function loadBrowserFunnel(supabase: SupabaseClient, now = new Date()): Promise<BrowserFunnelSummary> {
  const empty = summarizeBrowserFunnel([], [], [], now);
  try {
    const events: BrowserFunnelEvent[] = [];
    let partial = false;
    for (let offset = 0; offset <= MAX_EVENTS; offset += PAGE_SIZE) {
      const { data, error } = await supabase.from('funnel_events')
        .select('event_id,event_name,anonymous_id,occurred_at,checkout_intent_id,stripe_session_id,purchase_id')
        .in('event_name', EVENT_NAMES)
        .gte('occurred_at', empty.windowStart).lte('occurred_at', empty.windowEnd)
        .order('occurred_at', { ascending: true }).order('event_id', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      if (offset === MAX_EVENTS) { partial = Boolean(data?.length); break; }
      events.push(...(data || []) as BrowserFunnelEvent[]);
      if (!data || data.length < PAGE_SIZE) break;
    }
    const sessions = Array.from(new Set(events.map((event) => event.stripe_session_id).filter((id): id is string => Boolean(id))));
    const purchases: VerifiedPurchase[] = [];
    const intents: VerifiedIntent[] = [];
    for (let offset = 0; offset < sessions.length; offset += 200) {
      const ids = sessions.slice(offset, offset + 200);
      const [paid, checkout] = await Promise.all([
        supabase.from('purchases').select('id,stripe_session_id,status,amount,tier').in('stripe_session_id', ids).eq('status', 'completed').gt('amount', 0),
        supabase.from('checkout_intents').select('id,stripe_session_id,created_at').in('stripe_session_id', ids),
      ]);
      if (paid.error) throw paid.error;
      if (checkout.error) throw checkout.error;
      purchases.push(...(paid.data || []) as VerifiedPurchase[]);
      intents.push(...(checkout.data || []) as VerifiedIntent[]);
    }
    const summary = summarizeBrowserFunnel(events, purchases, intents, now);
    return { ...summary, status: partial ? 'partial' : 'available' };
  } catch {
    // A missing table or failed read is unavailable data, never zero conversion.
    return { ...empty, status: 'unavailable' };
  }
}
