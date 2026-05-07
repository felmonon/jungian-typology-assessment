import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { getSessionUser } from '../_lib/auth.js';
import { generateGeminiText } from '../_lib/gemini.js';

interface FunctionScore {
  function: string;
  score: number;
  rawPreference?: number;
  rawInferior?: number;
  normalized?: number;
}

interface Stack {
  dominant: FunctionScore;
  auxiliary: FunctionScore;
  tertiary: FunctionScore;
  inferior: FunctionScore;
  resultVersion?: string;
  depthResult?: any;
}

interface AnalysisInput {
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore?: number;
  isUndifferentiated?: boolean;
  resultVersion?: string;
  depthResult?: any;
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

const SECTION_KEYS = [
  'overview',
  'functionAnalysis',
  'archetypes',
  'theGrip',
  'relationships',
  'career',
  'individuation',
  'shadow',
  'growth',
  'dreams',
] as const;

type SectionKey = typeof SECTION_KEYS[number];

const CHANNEL_NAMES: Record<string, string> = {
  thinking: 'Thinking',
  feeling: 'Feeling',
  sensation: 'Sensation',
  intuition: 'Intuition',
};

function actionName(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

function formatScoresForPrompt(input: AnalysisInput): string {
  const sortedScores = [...input.scores].sort((a, b) => b.score - a.score);
  const scoresList = sortedScores
    .map((s, i) => `${i + 1}. ${FUNCTION_NAMES[s.function] || s.function} (${s.function}): ${s.score.toFixed(1)}%`)
    .join('\n');

  const stackInfo = `
Cognitive Stack:
- Dominant: ${FUNCTION_NAMES[input.stack.dominant.function] || input.stack.dominant.function} (${input.stack.dominant.function}) - ${input.stack.dominant.score.toFixed(1)}%
- Auxiliary: ${FUNCTION_NAMES[input.stack.auxiliary.function] || input.stack.auxiliary.function} (${input.stack.auxiliary.function}) - ${input.stack.auxiliary.score.toFixed(1)}%
- Tertiary: ${FUNCTION_NAMES[input.stack.tertiary.function] || input.stack.tertiary.function} (${input.stack.tertiary.function}) - ${input.stack.tertiary.score.toFixed(1)}%
- Inferior: ${FUNCTION_NAMES[input.stack.inferior.function] || input.stack.inferior.function} (${input.stack.inferior.function}) - ${input.stack.inferior.score.toFixed(1)}%`;

  const attitude = (input.attitudeScore || 0) > 0 ? 'Extraverted' : 'Introverted';
  const depth = input.depthResult || input.stack?.depthResult;
  const depthBlock = depth ? `
Depth Energy Map:
- Dominant channel: ${depth.dominant}
- Auxiliary channel: ${depth.auxiliary}
- Inferior channel: ${depth.inferior}
- Reliability: ${depth.reliability?.score}% (${depth.reliability?.label})
- Developmental edge: ${depth.narrative?.developmentalEdge}
- Complex vulnerability: ${depth.narrative?.complexVulnerability}
` : '';

  return `
Assessment Results:
${scoresList}

${stackInfo}

Overall Attitude: ${attitude} (score: ${(input.attitudeScore || 0).toFixed(1)})
Differentiation Status: ${input.isUndifferentiated ? 'Undifferentiated (scores are relatively even)' : 'Differentiated'}
${depthBlock}
`;
}

function extractJson(text: string): Record<string, string> | null {
  try {
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function getDepth(input: AnalysisInput): any {
  return input.depthResult || input.stack?.depthResult || null;
}

function fallbackFreeAnalysis(input: AnalysisInput): string {
  const depth = getDepth(input);
  const dominant = depth?.dominant ? CHANNEL_NAMES[depth.dominant] || depth.dominant : FUNCTION_NAMES[input.stack.dominant.function] || input.stack.dominant.function;
  const auxiliary = depth?.auxiliary ? CHANNEL_NAMES[depth.auxiliary] || depth.auxiliary : FUNCTION_NAMES[input.stack.auxiliary.function] || input.stack.auxiliary.function;
  const inferior = depth?.inferior ? CHANNEL_NAMES[depth.inferior] || depth.inferior : FUNCTION_NAMES[input.stack.inferior.function] || input.stack.inferior.function;
  const edge = depth?.narrative?.developmentalEdge || `Your developmental work sits around ${inferior}, the channel with the least conscious energy in this result.`;
  const vulnerability = depth?.narrative?.complexVulnerability || 'Stress is most likely to pull attention into the inferior channel before you can respond from your stronger functions.';

  return `Your energy map is led by ${dominant}, supported by ${auxiliary}. This means your strongest movement is not a fixed personality label but a repeated channel of attention, judgment, and effort. The important tension is the opposite pole: ${inferior}. ${edge} ${vulnerability} Use the result as a practice map. When stress rises, notice whether you are trying to solve the situation only through the dominant channel. The useful move is to give the inferior function a small, concrete role before it takes over in a primitive form.`;
}

function fallbackPremiumAnalysis(input: AnalysisInput): Record<SectionKey, string> {
  const free = fallbackFreeAnalysis(input);
  const depth = getDepth(input);
  const dominant = depth?.dominant ? CHANNEL_NAMES[depth.dominant] || depth.dominant : FUNCTION_NAMES[input.stack.dominant.function] || input.stack.dominant.function;
  const inferior = depth?.inferior ? CHANNEL_NAMES[depth.inferior] || depth.inferior : FUNCTION_NAMES[input.stack.inferior.function] || input.stack.inferior.function;
  const edge = depth?.narrative?.developmentalEdge || `Developing ${inferior} without abandoning ${dominant}.`;
  const practice = depth?.narrative?.practice || 'Use one small embodied practice each day, then reassess after the pattern has had time to shift.';

  return {
    overview: free,
    functionAnalysis: `Your hierarchy shows ${dominant} carrying the most conscious energy while ${inferior} holds the least differentiated material. Read the stack as a tension map rather than a rank of traits. The dominant channel gives competence and identity; the auxiliary supports it; the tertiary is available but uneven; the inferior asks for slow development.`,
    archetypes: `The dominant function often behaves like the heroic stance of the ego: it is the mode you trust first. The inferior carries the counter-image. It can appear through projection, attraction, embarrassment, or sudden intensity. Development means learning to relate to that material without letting it overthrow the whole system.`,
    theGrip: `Under pressure, ${inferior} may stop being subtle and become absolute. You may overreact to signals that normally seem minor, then try to regain control through ${dominant}. Recovery starts with slowing the body, naming the trigger, and choosing one grounded action before interpreting the whole situation.`,
    relationships: `Relationship triggers are important here because the inferior function often appears through other people. Notice where attraction, irritation, or shame has more charge than the situation deserves. That charge is usually information about the undeveloped channel, not proof that the relationship must be forced into a conclusion.`,
    career: `Work will feel best when ${dominant} has real room to operate, but it will become brittle if the environment never asks you to develop ${inferior}. Look for roles where your strongest channel is valued while feedback, pacing, embodiment, or values are not ignored.`,
    individuation: edge,
    shadow: `The shadow pattern is most likely to gather around ${inferior}. You may reject this function in yourself, then meet it outside as fascination or contempt. The task is not to become the opposite of yourself. The task is to make enough room for the weak channel that it no longer needs to erupt.`,
    growth: practice,
    dreams: `Dreams may show the inferior function indirectly: unfamiliar places, charged figures, body states, conflict scenes, or images that carry the missing attitude. Record the feeling tone first, then ask what part of the psyche is asking for attention rather than trying to decode the image too quickly.`,
  };
}

async function handleFreeAnalysis(req: VercelRequest, res: VercelResponse) {
  const { scores, stack, attitudeScore, isUndifferentiated, resultVersion, depthResult } = req.body as AnalysisInput;

  if (!scores || !stack) {
    return res.status(400).json({ error: 'Invalid assessment data format' });
  }

  const prompt = `You are an expert in Jungian psychology, depth typology, and cognitive function development. Based on the following TypeJung depth assessment results, provide a brief but insightful personalized analysis.

${formatScoresForPrompt({ scores, stack, attitudeScore: attitudeScore || 0, isUndifferentiated: isUndifferentiated || false, resultVersion, depthResult })}

Write a personalized analysis in 150-200 words that:
1. Identifies where their psychic energy flows most strongly
2. Names the inferior-function developmental edge without reducing them to a four-letter label
3. Offers one practical observation about how they likely experience stress, the body, or value

Keep the tone direct, psychologically grounded, and useful. Use second person ("you"). Do not mention that this is a free or limited analysis. Do not use bullet points, headers, or any markdown formatting like asterisks. Write in plain flowing paragraphs only.`;

  const analysis = await generateGeminiText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 500,
  }).catch((error) => {
    console.error('Using fallback free analysis:', error?.message || error);
    return fallbackFreeAnalysis({ scores, stack, attitudeScore, isUndifferentiated, resultVersion, depthResult });
  });

  return res.status(200).json({ analysis });
}

async function handlePremiumAnalysis(req: VercelRequest, res: VercelResponse) {
  const user = await getSessionUser(req.headers.cookie);
  if (!user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
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

  const { unlockDate, scores, stack, attitudeScore, isUndifferentiated, depthResult } = req.body || {};
  if (!hasPremiumAccess && unlockDate) {
    const hoursSinceUnlock = (Date.now() - new Date(unlockDate).getTime()) / (1000 * 60 * 60);
    hasPremiumAccess = hoursSinceUnlock < 24;
  }

  if (!hasPremiumAccess) {
    return res.status(403).json({ error: 'Premium access required' });
  }

  if (!scores || !stack) {
    return res.status(400).json({ error: 'Invalid assessment data format' });
  }

  const prompt = `You are an expert in Jungian depth typology. Create a premium TypeJung report from this result.

Return valid JSON only with these exact string keys:
${SECTION_KEYS.join(', ')}

Each value should be 120-180 words, direct, psychologically grounded, and second-person.

Compatibility scores:
${JSON.stringify({ scores, stack, attitudeScore, isUndifferentiated }, null, 2)}

Depth energy map:
${JSON.stringify(depthResult || stack.depthResult || null, null, 2)}
`;

  const text = await generateGeminiText(prompt, {
    temperature: 0.65,
    maxOutputTokens: 3600,
    responseMimeType: 'application/json',
  }).catch((error) => {
    console.error('Using fallback premium analysis:', error?.message || error);
    return '';
  });

  const parsed = extractJson(text);
  const fallback = fallbackPremiumAnalysis({ scores, stack, attitudeScore, isUndifferentiated, depthResult });

  const analysis = SECTION_KEYS.reduce((acc, key) => {
    acc[key] = typeof parsed?.[key] === 'string' ? parsed[key] : fallback[key];
    return acc;
  }, {} as Record<SectionKey, string>);

  return res.status(200).json({ analysis });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const action = actionName(req.query.action);
    if (action === 'free-analysis') {
      return await handleFreeAnalysis(req, res);
    }

    if (action === 'premium-analysis') {
      return await handlePremiumAnalysis(req, res);
    }

    return res.status(404).json({ error: 'AI action not found' });
  } catch (error: any) {
    console.error('AI route error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate analysis',
    });
  }
}
