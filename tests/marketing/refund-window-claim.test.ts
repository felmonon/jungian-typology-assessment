import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REFUND_WINDOW_DAYS } from '../../data/support';

// Copy regression check: every buyer-facing surface states the same refund window.
const surfaces = [
  'pages/CheckoutSuccess.tsx',
  'pages/Checkout.tsx',
  'pages/Pricing.tsx',
  'pages/Results.tsx',
  'pages/SampleReport.tsx',
  'pages/Home.tsx',
  'pages/TermsOfService.tsx',
  'api/create-checkout-session.ts',
  'server/resend.ts',
];

describe('refund window claim', () => {
  it('is seven days', () => {
    expect(REFUND_WINDOW_DAYS).toBe(7);
  });

  it.each(surfaces)('%s does not promise a different refund window', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    expect(source).not.toMatch(/\b(14|30|60|90)[- ]day (money-back|refund|guarantee)/i);
    expect(source).not.toMatch(/within (14|30|60|90) days/i);
  });
});
