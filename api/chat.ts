import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser } from './_lib/auth.js';
import { generateGeminiText } from './_lib/gemini.js';
import { findCompletedPurchaseForUser } from './_lib/purchases.js';
import { enforceRateLimit } from './_lib/rate-limit.js';
import { getSupabaseAdminClient } from './_lib/supabase.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message?: string;
  history?: ChatMessage[];
  userProfile?: {
    dominantFunction: string;
    auxiliaryFunction: string;
    tertiaryFunction: string;
    inferiorFunction: string;
    scores: Array<{ function: string; score: number }>;
    attitudeScore: number;
  };
}

const FUNCTION_NAMES: Record<string, string> = {
  Te: 'Extraverted Thinking',
  Ti: 'Introverted Thinking',
  Fe: 'Extraverted Feeling',
  Fi: 'Introverted Feeling',
  Se: 'Extraverted Sensing',
  Si: 'Introverted Sensing',
  Ne: 'Extraverted Intuition',
  Ni: 'Introverted Intuition',
};

function fallbackChatResponse(profile: ChatRequest['userProfile'], message: string): string {
  if (!profile) {
    return 'I can answer once your TypeJung profile is attached to the request.';
  }

  const dominant = FUNCTION_NAMES[profile.dominantFunction] || profile.dominantFunction;
  const inferior = FUNCTION_NAMES[profile.inferiorFunction] || profile.inferiorFunction;

  return `I cannot reach the live AI provider right now, but your saved profile still gives a useful reflection direction. Your dominant channel is ${dominant}, so your first move is likely to trust that way of organizing experience. The growth question is usually carried by ${inferior}. For this question, ask where you may be relying too heavily on your strongest function, then give the inferior function one small concrete role. If the question is about stress, treat this as self-observation rather than diagnosis. If it is about relationships or work, use the result to name patterns and questions to explore, not as professional advice or a rule for what to do.`;
}

function cleanResponse(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-•]\s*/gm, '')
    .replace(/^\d+\.\s*/gm, '')
    .trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (enforceRateLimit(req, res, {
    keyPrefix: 'ai:chat',
    limit: 30,
    windowMs: 60 * 60 * 1000,
    message: 'Too many guide messages. Please wait and try again.',
  })) return;

  try {
    const user = await getSessionUser(req.headers.cookie);
    if (!user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { message, history = [], userProfile } = (req.body || {}) as ChatRequest;
    if (!message?.trim() || !userProfile) {
      return res.status(400).json({ error: 'Message and user profile are required' });
    }

    const supabase = getSupabaseAdminClient();

    const purchase = await findCompletedPurchaseForUser(supabase, user);
    const hasMasteryAccess = purchase?.tier === 'mastery';

    if (!hasMasteryAccess) {
      return res.status(403).json({ error: 'Mastery access required for the AI Type Guide' });
    }

    const sortedScores = [...userProfile.scores].sort((a, b) => b.score - a.score);
    const scoresText = sortedScores
      .map((s) => `${FUNCTION_NAMES[s.function] || s.function} (${s.function}): ${s.score.toFixed(1)}%`)
      .join(', ');
    const attitude = userProfile.attitudeScore > 0 ? 'Extraverted' : 'Introverted';
    const recentHistory = history.slice(-8).map((msg) => `${msg.role}: ${msg.content}`).join('\n');

    const prompt = `You are the TypeJung AI Type Guide: an educational self-reflection companion for a user's Jungian function-stack map. Help the user understand their result, inferior-function development, stress reflection patterns, and practical observation prompts.

User profile:
- Dominant: ${FUNCTION_NAMES[userProfile.dominantFunction] || userProfile.dominantFunction} (${userProfile.dominantFunction})
- Auxiliary: ${FUNCTION_NAMES[userProfile.auxiliaryFunction] || userProfile.auxiliaryFunction} (${userProfile.auxiliaryFunction})
- Tertiary: ${FUNCTION_NAMES[userProfile.tertiaryFunction] || userProfile.tertiaryFunction} (${userProfile.tertiaryFunction})
- Inferior: ${FUNCTION_NAMES[userProfile.inferiorFunction] || userProfile.inferiorFunction} (${userProfile.inferiorFunction})
- Overall attitude: ${attitude}
- Scores: ${scoresText}

Recent conversation:
${recentHistory || 'No previous messages.'}

User asks:
${message.trim()}

Rules:
Only answer questions about their type, self-reflection, stress observation, somatic patterns, relationships, work themes, or individuation. If the question is unrelated, briefly redirect to their TypeJung result. Use second person. Keep the answer practical and psychologically grounded in 150-300 words. Do not use markdown, bullet points, numbered lists, or headings. Do not provide therapy, diagnosis, treatment advice, crisis advice, career counseling, legal advice, financial advice, or relationship directives. When the user asks about relationships or work, frame your answer as reflection questions, communication patterns, and possible areas to observe. If they describe danger, self-harm, abuse, a medical issue, or a crisis, tell them this tool is not appropriate for that situation and encourage contacting qualified local support or emergency services.`;

    const responseText = await generateGeminiText(prompt, {
      temperature: 0.7,
      maxOutputTokens: 900,
    }).catch((error) => {
      console.error('Using fallback chat response:', error?.message || error);
      return fallbackChatResponse(userProfile, message.trim());
    });
    return res.status(200).json({ response: cleanResponse(responseText) });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate response' });
  }
}
