export type DiscountLeadFollowupDestination = 'assessment' | 'checkout' | 'sample_report';

export type DiscountLeadAttribution = {
  utmSource?: string | null;
  utmCampaign?: string | null;
  parentSource?: string | null;
  sourceChain?: string | null;
};

const cleanAttributionToken = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);

  return cleaned || undefined;
};

const cleanSourceChain = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const tokens = value
    .split('>')
    .map((token) => cleanAttributionToken(token))
    .filter((token): token is string => Boolean(token));
  const uniqueTokens = Array.from(new Set(tokens));
  const cleaned = uniqueTokens.join('>').slice(0, 240);

  return cleaned || undefined;
};

const assessmentReturnSources = new Set([
  'assessment_progress_email_code',
  'assessment_midpoint_email_code',
  'home_hero_email_code',
  'exit_popup_email_code',
  'sample_report_email_code',
  'pricing_upgrade_prompt',
]);

export function isAssessmentReturnSource(source: string): boolean {
  return (
    assessmentReturnSources.has(source)
    || (source.startsWith('seo_') && source.endsWith('_email_code'))
    || (source.startsWith('blog_') && source.endsWith('_email_code'))
  );
}

export function isAssessmentProgressReturnSource(source: string): boolean {
  return source === 'assessment_progress_email_code' || source === 'assessment_midpoint_email_code';
}

export function isResultUpgradeSource(source: string): boolean {
  return source.startsWith('results_');
}

export function isCheckoutReturnSource(source: string): boolean {
  return source.includes('checkout') || source.includes('recovery');
}

export function getDiscountLeadFollowupDestination(
  source: string,
  hasTierIntent: boolean,
): DiscountLeadFollowupDestination {
  if (hasTierIntent && (isCheckoutReturnSource(source) || isResultUpgradeSource(source))) {
    return 'checkout';
  }

  if (isAssessmentReturnSource(source)) {
    return 'assessment';
  }

  return 'sample_report';
}

export function discountLeadAttributionParams(
  attribution: DiscountLeadAttribution = {},
  fallbackCampaign = 'discount_recovery',
): Record<string, string> {
  const utmSource = cleanAttributionToken(attribution.utmSource);
  const utmCampaign = cleanAttributionToken(attribution.utmCampaign) || cleanAttributionToken(fallbackCampaign);
  const parentSource = cleanAttributionToken(attribution.parentSource);
  const sourceChain = cleanSourceChain(attribution.sourceChain);

  return {
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(parentSource ? { parent_source: parentSource } : {}),
    ...(sourceChain ? { source_chain: sourceChain } : {}),
  };
}
