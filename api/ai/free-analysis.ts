import type { VercelRequest, VercelResponse } from '@vercel/node';

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
}

interface AnalysisInput {
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore?: number;
  isUndifferentiated?: boolean;
}

const FUNCTION_NAMES: Record<string, string> = {
  Te: "Extraverted Thinking",
  Ti: "Introverted Thinking",
  Fe: "Extraverted Feeling",
  Fi: "Introverted Feeling",
  Se: "Extraverted Sensing",
  Si: "Introverted Sensing",
  Ne: "Extraverted Intuition",
  Ni: "Introverted Intuition",
};

function formatScoresForPrompt(input: AnalysisInput): string {
  const sortedScores = [...input.scores].sort((a, b) => b.score - a.score);
  const scoresList = sortedScores
    .map((s, i) => `${i + 1}. ${FUNCTION_NAMES[s.function] || s.function} (${s.function}): ${s.score.toFixed(1)}%`)
    .join("\n");

  const stackInfo = `
Cognitive Stack:
- Dominant: ${FUNCTION_NAMES[input.stack.dominant.function] || input.stack.dominant.function} (${input.stack.dominant.function}) - ${input.stack.dominant.score.toFixed(1)}%
- Auxiliary: ${FUNCTION_NAMES[input.stack.auxiliary.function] || input.stack.auxiliary.function} (${input.stack.auxiliary.function}) - ${input.stack.auxiliary.score.toFixed(1)}%
- Tertiary: ${FUNCTION_NAMES[input.stack.tertiary.function] || input.stack.tertiary.function} (${input.stack.tertiary.function}) - ${input.stack.tertiary.score.toFixed(1)}%
- Inferior: ${FUNCTION_NAMES[input.stack.inferior.function] || input.stack.inferior.function} (${input.stack.inferior.function}) - ${input.stack.inferior.score.toFixed(1)}%`;

  const attitude = (input.attitudeScore || 0) > 0 ? "Extraverted" : "Introverted";

  return `
Assessment Results:
${scoresList}

${stackInfo}

Overall Attitude: ${attitude} (score: ${(input.attitudeScore || 0).toFixed(1)})
Differentiation Status: ${input.isUndifferentiated ? "Undifferentiated (scores are relatively even)" : "Differentiated"}
`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scores, stack, attitudeScore, isUndifferentiated } = req.body as AnalysisInput;

    if (!scores || !stack) {
      return res.status(400).json({ error: 'Invalid assessment data format' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const prompt = `You are an expert in Jungian psychology and cognitive function typology. Based on the following Singer-Loomis assessment results, provide a brief but insightful personalized analysis.

${formatScoresForPrompt({ scores, stack, attitudeScore: attitudeScore || 0, isUndifferentiated: isUndifferentiated || false })}

Write a personalized analysis in 150-200 words that:
1. Identifies their dominant cognitive function and what it means for them
2. Provides one key insight about their psychological type
3. Offers one practical observation about how they likely experience the world

Keep the tone warm, encouraging, and psychologically grounded. Use second person ("you"). Do not mention that this is a free or limited analysis. Do not use bullet points, headers, or any markdown formatting like asterisks. Write in plain flowing paragraphs only.`;

    // Use fetch directly to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(500).json({ error: data.error?.message || 'AI service error' });
    }

    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate analysis at this time.";

    return res.status(200).json({ analysis });
  } catch (error: any) {
    console.error('Free AI analysis error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate analysis'
    });
  }
}
