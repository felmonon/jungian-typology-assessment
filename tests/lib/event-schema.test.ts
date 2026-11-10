import { describe, expect, it } from 'vitest';
import { eventSchema, flag, listOf, numberBetween, text } from '../../lib/event-schema';

describe('eventSchema', () => {
  const item = eventSchema({ item_id: text(1, 100), quantity: numberBetween(1, 99, false, true) });
  const schema = eventSchema({
    plan: text(1, 50),
    value: numberBetween(0, 10000),
    currency: text(3, 3, true),
    saved: flag(true),
    items: listOf(item, 1, 10, true),
  });

  it('accepts valid parameters and ignores fields it does not know', () => {
    expect(schema.safeParse({ plan: 'insight', value: 7, currency: 'CAD', saved: true, extra: 'ignored' }).success).toBe(true);
    expect(schema.safeParse({ plan: 'insight', value: 7, items: [{ item_id: 'insight', quantity: 1 }] }).success).toBe(true);
  });

  it('treats a missing optional field as valid and a missing required field as invalid', () => {
    expect(schema.safeParse({ plan: 'insight', value: 7 }).success).toBe(true);
    const result = schema.safeParse({ value: 7 });
    expect(result.success).toBe(false);
    expect(result.error.format()).toEqual({ plan: 'Required' });
  });

  it('rejects wrong types, out-of-range values and null', () => {
    expect(schema.safeParse({ plan: '', value: 7 }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: -1 }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: Number.NaN }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: 7, currency: 'CA' }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: 7, saved: null }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: 7, items: [] }).success).toBe(false);
    expect(schema.safeParse({ plan: 'insight', value: 7, items: [{ item_id: 'insight', quantity: 1.5 }] }).success).toBe(false);
  });

  it('rejects anything that is not a plain object', () => {
    for (const value of [null, undefined, 'text', 3, []]) {
      expect(schema.safeParse(value).success).toBe(false);
    }
  });
});
