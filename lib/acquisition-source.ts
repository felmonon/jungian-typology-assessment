const STORAGE_KEY = 'typejung_acquisition_source';

const SOURCE_QUERY_KEYS = ['source', 'ref', 'utm_source', 'utm_campaign'];

export type AcquisitionSource = {
  source: string;
  entryPage: string;
  capturedAt: string;
  referrer?: string;
  ref?: string;
  utmCampaign?: string;
  utmSource?: string;
  sharedResult?: string;
  parentSource?: string;
  sourceChain?: string;
};

const cleanSourceToken = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return cleaned || null;
};

const cleanEntryPage = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '/';
  return value.trim().slice(0, 500);
};

const cleanReferrer = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  return value.trim().slice(0, 500);
};

const optionalToken = (value: unknown): string | undefined =>
  cleanSourceToken(value) || undefined;

const cleanSourceChain = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const tokens = value
    .split('>')
    .map((token) => cleanSourceToken(token))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || undefined;
};

const buildSourceChain = (
  ...values: Array<string | null | undefined>
): string | undefined => {
  const tokens = values.flatMap((value) => {
    const chain = cleanSourceChain(value);
    if (chain) return chain.split('>');
    const token = cleanSourceToken(value);
    return token ? [token] : [];
  });
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || undefined;
};

const attributionParamsFromStoredSource = (targetSource: string | null): Record<string, string> => {
  const acquisition = readAcquisitionSource();
  if (!acquisition) return {};

  const parentSource = acquisition.parentSource
    || (targetSource && acquisition.source !== targetSource ? acquisition.source : undefined);
  const sourceChain = buildSourceChain(
    acquisition.sourceChain,
    acquisition.parentSource,
    acquisition.source,
    targetSource && acquisition.source !== targetSource ? targetSource : undefined,
  );

  return {
    ...(acquisition.ref ? { ref: acquisition.ref } : {}),
    ...(acquisition.utmCampaign ? { utm_campaign: acquisition.utmCampaign } : {}),
    ...(acquisition.utmSource ? { utm_source: acquisition.utmSource } : {}),
    ...(acquisition.sharedResult ? { shared_result: acquisition.sharedResult } : {}),
    ...(parentSource ? { parent_source: parentSource } : {}),
    ...(sourceChain ? { source_chain: sourceChain } : {}),
  };
};

const attributionFromSearch = (search: string): Pick<AcquisitionSource, 'ref' | 'utmCampaign' | 'utmSource' | 'sharedResult' | 'parentSource' | 'sourceChain'> => {
  const params = new URLSearchParams(search || '');
  const currentSource = sourceFromSearch(search);
  const parentSource = optionalToken(params.get('parent_source'));
  const sourceChain = buildSourceChain(
    cleanSourceChain(params.get('source_chain')),
    parentSource,
    currentSource,
  );

  return {
    ...(optionalToken(params.get('ref')) ? { ref: optionalToken(params.get('ref')) } : {}),
    ...(optionalToken(params.get('utm_campaign')) ? { utmCampaign: optionalToken(params.get('utm_campaign')) } : {}),
    ...(optionalToken(params.get('utm_source')) ? { utmSource: optionalToken(params.get('utm_source')) } : {}),
    ...(optionalToken(params.get('shared_result')) ? { sharedResult: optionalToken(params.get('shared_result')) } : {}),
    ...(parentSource ? { parentSource } : {}),
    ...(sourceChain ? { sourceChain } : {}),
  };
};

export function readAcquisitionSource(): AcquisitionSource | null {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    const source = cleanSourceToken(parsed.source);
    if (!source) return null;

    return {
      source,
      entryPage: cleanEntryPage(parsed.entryPage),
      capturedAt: typeof parsed.capturedAt === 'string' ? parsed.capturedAt : new Date().toISOString(),
      referrer: cleanReferrer(parsed.referrer),
      ref: optionalToken(parsed.ref),
      utmCampaign: optionalToken(parsed.utmCampaign ?? parsed.utm_campaign),
      utmSource: optionalToken(parsed.utmSource ?? parsed.utm_source),
      sharedResult: optionalToken(parsed.sharedResult ?? parsed.shared_result),
      parentSource: optionalToken(parsed.parentSource ?? parsed.parent_source),
      sourceChain: cleanSourceChain(parsed.sourceChain ?? parsed.source_chain),
    };
  } catch {
    return null;
  }
}

export function sourceFromSearch(search: string): string | null {
  const params = new URLSearchParams(search || '');

  for (const key of SOURCE_QUERY_KEYS) {
    const source = cleanSourceToken(params.get(key));
    if (source) return source;
  }

  return null;
}

export function pathWithSource(
  path: string,
  source: string,
  extraParams: Record<string, string | null | undefined> = {},
): string {
  const [basePath, query = ''] = path.split('?');
  const params = new URLSearchParams(query);
  const cleanedSource = cleanSourceToken(source);

  if (cleanedSource) {
    params.set('source', cleanedSource);
  }

  Object.entries(attributionParamsFromStoredSource(cleanedSource)).forEach(([key, value]) => {
    if (!params.has(key)) {
      params.set(key, value);
    }
  });

  Object.entries(extraParams).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      params.set(key, value.trim());
    }
  });

  const serialized = params.toString();
  return serialized ? `${basePath}?${serialized}` : basePath;
}

export function captureAcquisitionSourceFromLocation(
  search: string,
  entryPage: string,
  referrer?: string,
): AcquisitionSource | null {
  if (typeof window === 'undefined') return null;

  const source = sourceFromSearch(search);
  if (!source) return readAcquisitionSource();

  const payload: AcquisitionSource = {
    source,
    entryPage: cleanEntryPage(entryPage),
    capturedAt: new Date().toISOString(),
    referrer: cleanReferrer(referrer),
    ...attributionFromSearch(search),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Attribution is useful but should never block the user journey.
  }

  return payload;
}

export function sourceForCheckout(defaultSource = 'custom_checkout_review'): string {
  const acquisition = readAcquisitionSource();
  if (!acquisition?.source) return defaultSource;

  return `${defaultSource}_${acquisition.source}`.slice(0, 80);
}
