// Labels and small formatting helpers shared by the results page and its parts.
import type { AttitudeDirection, FunctionChannel } from '../data/depthAssessment';
import { discountedPriceLabel } from '../data/discount';
import { type PaidTierId, PRICING } from '../data/pricing';
import type { DepthAssessmentResult } from '../utils/depthScoring';

export const paidTierPrice = (tier: PaidTierId) =>
  discountedPriceLabel(PRICING[tier].amount);

export const positionLabels = {
  dominant: 'Dominant',
  auxiliary: 'Auxiliary',
  tertiary: 'Tertiary',
  inferior: 'Inferior',
} as const;

const functionCodeByChannel: Record<
  FunctionChannel,
  Record<AttitudeDirection, string>
> = {
  thinking: {
    introverted: 'Ti',
    extraverted: 'Te',
  },
  feeling: {
    introverted: 'Fi',
    extraverted: 'Fe',
  },
  sensation: {
    introverted: 'Si',
    extraverted: 'Se',
  },
  intuition: {
    introverted: 'Ni',
    extraverted: 'Ne',
  },
};

export const getFunctionCode = (
  channel: FunctionChannel,
  attitude: AttitudeDirection,
) => functionCodeByChannel[channel]?.[attitude] ?? 'unknown';

// Function code (for example "Ni") at a stack position, or null when absent.
export const stackPositionCode = (
  results: DepthAssessmentResult,
  position: 'dominant' | 'inferior',
) => {
  const item = results.hierarchy.find((entry) => entry.position === position);
  return item ? getFunctionCode(item.channel, item.attitude) : null;
};

export const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return 'Recently completed';
  }
};
