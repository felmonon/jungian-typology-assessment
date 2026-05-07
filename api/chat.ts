import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from './_lib/auth.js';
import { generateGeminiText } from './_lib/gemini.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message?: string;
  history?: ChatMessage[];
  unlockDate?: string;
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

  return `I cannot reach the live AI provider right now, but your saved profile still gives a useful direction. Your dominant channel is ${dominant}, so your first move is likely to trust that way of organizing experience. The growth question is usually carried by ${inferior}. For this question, start by asking where you are relying too heavily on your strongest function, then give the inferior function one small concrete role. If the question is about stress, slow the body before interpreting. If it is about relationships, look for the value or need underneath the reaction. If it is about work, choose the next action that lets your dominant strength operate without avoiding the weaker channel.`;
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

  try {
    const user = await getSessionUser(req.headers.cookie);
    if (!user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { message, history = [], userProfile, unlockDate } = (req.body || {}) as ChatRequest;
    if (!message?.trim() || !userProfile) {
      return res.status(400).json({ error: 'Message and user profile are required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!,
    );

    let hasPremiumAccess = false;
    const { data: purchases } = await supabase
      .from('purchases')
      .select('id, status, tier')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1);

    if (purchases && purchases.length > 0) {
      hasPremiumAccess = true;
    }

    if (!hasPremiumAccess && unlockDate) {
      const hoursSinceUnlock = (Date.now() - new Date(unlockDate).getTime()) / (1000 * 60 * 60);
      hasPremiumAccess = hoursSinceUnlock < 24;
    }

    if (!hasPremiumAccess) {
      return res.status(403).json({ error: 'Premium access required' });
    }

    const sortedScores = [...userProfile.scores].sort((a, b) => b.score - a.score);
    const scoresText = sortedScores
      .map((s) => `${FUNCTION_NAMES[s.function] || s.function} (${s.function}): ${s.score.toFixed(1)}%`)
      .join(', ');
    const attitude = userProfile.attitudeScore > 0 ? 'Extraverted' : 'Introverted';
    const recentHistory = history.slice(-8).map((msg) => `${msg.role}: ${msg.content}`).join('\n');

    const prompt = `You are the TypeJung premium coach. Help the user understand their Jungian energy map, inferior-function development, stress patterns, and practical growth.

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
Only answer questions about their type, growth, stress, somatic patterns, relationships, career, or individuation. If the question is unrelated, briefly redirect to their TypeJung result. Use second person. Keep the answer practical and psychologically grounded in 150-300 words. Do not use markdown, bullet points, numbered lists, or headings.`;

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
