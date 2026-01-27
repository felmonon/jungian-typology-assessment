import { z } from 'zod';
import { FunctionAttitude } from '../types';

// Valid function attitudes
const validFunctions: FunctionAttitude[] = ['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni'];

// Function score schema
const functionScoreSchema = z.object({
  function: z.enum(validFunctions as [string, ...string[]]),
  score: z.number().min(0).max(100),
  rawPreference: z.number(),
  rawInferior: z.number(),
  normalized: z.number(),
});

// Stack schema
const stackSchema = z.object({
  dominant: functionScoreSchema,
  auxiliary: functionScoreSchema,
  tertiary: functionScoreSchema,
  inferior: functionScoreSchema,
});

// Assessment progress schema
export const assessmentProgressSchema = z.object({
  answers: z.record(z.string(), z.number().min(1).max(5)),
  currentStep: z.number().min(0),
});

export type ValidatedAssessmentProgress = z.infer<typeof assessmentProgressSchema>;

// Assessment results schema
export const assessmentResultsSchema = z.object({
  scores: z.array(functionScoreSchema).length(8),
  dominant: functionScoreSchema,
  inferior: functionScoreSchema,
  stack: stackSchema,
  auxiliary: functionScoreSchema.optional(),
  differentiation: z.number(),
  isUndifferentiated: z.boolean(),
  attitudeScore: z.number(),
});

export type ValidatedAssessmentResults = z.infer<typeof assessmentResultsSchema>;

// Premium tier schema
export const premiumTierSchema = z.enum(['free', 'insight', 'mastery']);

// Safe localStorage parser with validation
export function safeParseLocalStorage<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T | null = null
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    
    if (!result.success) {
      console.warn(`Invalid data in localStorage key "${key}":`, result.error.format());
      return defaultValue;
    }
    
    return result.data;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Safe localStorage setter
export function safeSetLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error);
    return false;
  }
}

// Safe localStorage remover
export function safeRemoveLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error);
    return false;
  }
}

// Assessment storage keys
export const STORAGE_KEYS = {
  PROGRESS: 'jungian_assessment_progress',
  RESULTS: 'jungian_assessment_results',
  SHARE_SLUG: 'jungian_assessment_share_slug',
  TIER: 'jungian_assessment_tier',
  UNLOCKED: 'jungian_assessment_unlocked',
  UNLOCK_USER_ID: 'jungian_assessment_unlock_user_id',
  UNLOCK_DATE: 'jungian_assessment_unlock_date',
  SEND_EMAIL: 'jungian_assessment_send_email',
} as const;
