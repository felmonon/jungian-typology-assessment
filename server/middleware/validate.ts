import type { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const formatted = result.error.flatten();
      return res.status(400).json({
        error: 'Validation failed',
        details: {
          fieldErrors: formatted.fieldErrors,
          formErrors: formatted.formErrors,
        },
      });
    }
    
    // Replace req.body with validated data
    req.body = result.data;
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Assessment result submission
  assessmentResult: z.object({
    scores: z.array(z.object({
      function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']),
      score: z.number().min(0).max(100),
      rawPreference: z.number(),
      rawInferior: z.number(),
      normalized: z.number(),
    })).length(8),
    stack: z.object({
      dominant: z.object({
        function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']),
        score: z.number().min(0).max(100),
        rawPreference: z.number(),
        rawInferior: z.number(),
        normalized: z.number(),
      }),
      auxiliary: z.object({
        function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']),
        score: z.number().min(0).max(100),
        rawPreference: z.number(),
        rawInferior: z.number(),
        normalized: z.number(),
      }),
      tertiary: z.object({
        function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']),
        score: z.number().min(0).max(100),
        rawPreference: z.number(),
        rawInferior: z.number(),
        normalized: z.number(),
      }),
      inferior: z.object({
        function: z.enum(['Te', 'Ti', 'Fe', 'Fi', 'Se', 'Si', 'Ne', 'Ni']),
        score: z.number().min(0).max(100),
        rawPreference: z.number(),
        rawInferior: z.number(),
        normalized: z.number(),
      }),
    }),
    attitudeScore: z.number(),
    isUndifferentiated: z.boolean(),
  }),

  // AI Analysis request
  aiAnalysis: z.object({
    scores: z.array(z.object({
      function: z.string(),
      score: z.number(),
      rawPreference: z.number(),
      rawInferior: z.number(),
      normalized: z.number(),
    })),
    stack: z.object({
      dominant: z.object({ function: z.string(), score: z.number() }),
      auxiliary: z.object({ function: z.string(), score: z.number() }),
      tertiary: z.object({ function: z.string(), score: z.number() }),
      inferior: z.object({ function: z.string(), score: z.number() }),
    }),
    attitudeScore: z.number().optional(),
    isUndifferentiated: z.boolean().optional(),
  }),

  // Chat message
  chatMessage: z.object({
    message: z.string().min(1).max(2000),
    history: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).max(50),
    userProfile: z.object({
      dominantFunction: z.string(),
      auxiliaryFunction: z.string(),
      tertiaryFunction: z.string(),
      inferiorFunction: z.string(),
      scores: z.array(z.object({ function: z.string(), score: z.number() })),
      attitudeScore: z.number(),
    }),
  }),

  // Checkout session
  checkoutSession: z.object({
    priceId: z.string().optional(),
    tier: z.enum(['insight', 'mastery']).optional(),
  }),

  // Verify session
  verifySession: z.object({
    sessionId: z.string().min(1),
  }),

  // Pagination params
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
