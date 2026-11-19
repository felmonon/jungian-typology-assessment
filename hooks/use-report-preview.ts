import { useCallback, useRef, useState } from 'react';
import { readReportPreview, type ReportPreview } from '../lib/report-preview';

export type ReportPreviewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; preview: ReportPreview }
  | { status: 'fallback'; reason: string };

export async function requestReportPreview(input: unknown, fetcher: typeof fetch = fetch): Promise<ReportPreviewState> {
  try {
    const response = await fetcher('/api/ai/report-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.available !== true) {
      const reason = typeof data?.reason === 'string' ? data.reason : `http_${response.status}`;
      return { status: 'fallback', reason: reason.slice(0, 60) };
    }
    const preview = readReportPreview(data.preview);
    return preview ? { status: 'ready', preview } : { status: 'fallback', reason: 'invalid_response' };
  } catch {
    return { status: 'fallback', reason: 'network_error' };
  }
}

/** One preview request per page; any failure leaves the previous offer in place. */
export function useReportPreview() {
  const [state, setState] = useState<ReportPreviewState>({ status: 'idle' });
  const requestedRef = useRef(false);

  const load = useCallback(async (input: unknown) => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    setState({ status: 'loading' });
    setState(await requestReportPreview(input));
  }, []);

  return { state, load };
}
