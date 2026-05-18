import { describe, expect, it } from 'vitest';
import { cleanEnvValue } from '../../server/env';

describe('server env helpers', () => {
  it('trims whitespace and copied literal newline suffixes', () => {
    expect(cleanEnvValue('  live_value\\n\\n ')).toBe('live_value');
  });

  it('returns undefined for blank values', () => {
    expect(cleanEnvValue('  ')).toBeUndefined();
    expect(cleanEnvValue(undefined)).toBeUndefined();
  });
});
