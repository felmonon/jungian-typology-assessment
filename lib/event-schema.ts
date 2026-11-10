// Small runtime checks for analytics event parameters. They replace a general
// validation library that was loading on every page for this one job.

type Field =
  | { type: 'string'; min: number; max: number; optional: boolean }
  | { type: 'number'; min: number; max: number; integer: boolean; optional: boolean }
  | { type: 'boolean'; optional: boolean }
  | { type: 'list'; item: EventSchema; min: number; max: number; optional: boolean };

export interface EventSchemaResult {
  success: boolean;
  error: { format: () => Record<string, string> };
}

export interface EventSchema {
  safeParse: (value: unknown) => EventSchemaResult;
}

/** A string whose length is between `min` and `max` characters. */
export const text = (min: number, max: number, optional = false): Field => ({ type: 'string', min, max, optional });

/** A finite number between `min` and `max`. */
export const numberBetween = (min: number, max: number, optional = false, integer = false): Field => ({
  type: 'number',
  min,
  max,
  integer,
  optional,
});

export const flag = (optional = false): Field => ({ type: 'boolean', optional });

export const listOf = (item: EventSchema, min: number, max: number, optional = false): Field => ({
  type: 'list',
  item,
  min,
  max,
  optional,
});

function issueFor(field: Field, value: unknown): string | null {
  if (value === undefined) return field.optional ? null : 'Required';

  if (field.type === 'string') {
    if (typeof value !== 'string') return 'Expected a string';
    if (value.length < field.min || value.length > field.max) return `Expected ${field.min} to ${field.max} characters`;
    return null;
  }

  if (field.type === 'number') {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'Expected a number';
    if (field.integer && !Number.isInteger(value)) return 'Expected a whole number';
    if (value < field.min || value > field.max) return `Expected ${field.min} to ${field.max}`;
    return null;
  }

  if (field.type === 'boolean') return typeof value === 'boolean' ? null : 'Expected true or false';

  if (!Array.isArray(value)) return 'Expected a list';
  if (value.length < field.min || value.length > field.max) return `Expected ${field.min} to ${field.max} items`;
  return value.every((entry) => field.item.safeParse(entry).success) ? null : 'One or more items are invalid';
}

/** Checks the listed fields of an object. Fields that are not listed are ignored. */
export function eventSchema(fields: Record<string, Field>): EventSchema {
  return {
    safeParse(value) {
      const issues: Record<string, string> = {};

      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        issues._ = 'Expected an object';
      } else {
        for (const [key, field] of Object.entries(fields)) {
          const issue = issueFor(field, (value as Record<string, unknown>)[key]);
          if (issue) issues[key] = issue;
        }
      }

      return { success: Object.keys(issues).length === 0, error: { format: () => issues } };
    },
  };
}
