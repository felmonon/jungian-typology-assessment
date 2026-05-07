import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const integrationApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
    const apiKey = integrationApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("AI service not configured. Please ensure GEMINI_API_KEY or AI_INTEGRATIONS_GEMINI_API_KEY is set.");
    }

    if (integrationApiKey && baseUrl) {
      aiClient = new GoogleGenAI({
        apiKey: integrationApiKey,
        httpOptions: {
          apiVersion: "",
          baseUrl,
        },
      });
      return aiClient;
    }
    
    aiClient = new GoogleGenAI({
      apiKey,
    });
  }
  return aiClient;
}

export interface FunctionScore {
  function: string;
  score: number;
  rawPreference: number;
  rawInferior: number;
  normalized: number;
}

export interface Stack {
  dominant: FunctionScore;
  auxiliary: FunctionScore;
  tertiary: FunctionScore;
  inferior: FunctionScore;
  resultVersion?: string;
  depthResult?: unknown;
}

export interface AnalysisInput {
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore: number;
  isUndifferentiated: boolean;
  resultVersion?: string;
  depthResult?: any;
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

const CHANNEL_NAMES: Record<string, string> = {
  thinking: "Thinking",
  feeling: "Feeling",
  sensation: "Sensation",
  intuition: "Intuition",
};

function fallbackFreeAnalysis(input: AnalysisInput): string {
  const depth = input.depthResult || (input.stack as any).depthResult;
  const dominant = depth?.dominant ? CHANNEL_NAMES[depth.dominant] || depth.dominant : FUNCTION_NAMES[input.stack.dominant.function] || input.stack.dominant.function;
  const auxiliary = depth?.auxiliary ? CHANNEL_NAMES[depth.auxiliary] || depth.auxiliary : FUNCTION_NAMES[input.stack.auxiliary.function] || input.stack.auxiliary.function;
  const inferior = depth?.inferior ? CHANNEL_NAMES[depth.inferior] || depth.inferior : FUNCTION_NAMES[input.stack.inferior.function] || input.stack.inferior.function;
  const edge = depth?.narrative?.developmentalEdge || `Your developmental work sits around ${inferior}, the channel with the least conscious energy in this result.`;
  const vulnerability = depth?.narrative?.complexVulnerability || "Stress is most likely to pull attention into the inferior channel before you can respond from your stronger functions.";

  return `Your energy map is led by ${dominant}, supported by ${auxiliary}. This means your strongest movement is not a fixed personality label but a repeated channel of attention, judgment, and effort. The important tension is the opposite pole: ${inferior}. ${edge} ${vulnerability} Use the result as a practice map. When stress rises, notice whether you are trying to solve the situation only through the dominant channel. The useful move is to give the inferior function a small, concrete role before it takes over in a primitive form.`;
}

function formatScoresForPrompt(input: AnalysisInput): string {
  const sortedScores = [...input.scores].sort((a, b) => b.score - a.score);
  const scoresList = sortedScores
    .map((s, i) => `${i + 1}. ${FUNCTION_NAMES[s.function]} (${s.function}): ${s.score.toFixed(1)}%`)
    .join("\n");

  const stackInfo = `
Cognitive Stack:
- Dominant: ${FUNCTION_NAMES[input.stack.dominant.function]} (${input.stack.dominant.function}) - ${input.stack.dominant.score.toFixed(1)}%
- Auxiliary: ${FUNCTION_NAMES[input.stack.auxiliary.function]} (${input.stack.auxiliary.function}) - ${input.stack.auxiliary.score.toFixed(1)}%
- Tertiary: ${FUNCTION_NAMES[input.stack.tertiary.function]} (${input.stack.tertiary.function}) - ${input.stack.tertiary.score.toFixed(1)}%
- Inferior: ${FUNCTION_NAMES[input.stack.inferior.function]} (${input.stack.inferior.function}) - ${input.stack.inferior.score.toFixed(1)}%`;

  const attitude = input.attitudeScore > 0 ? "Extraverted" : "Introverted";
  const depth = input.depthResult || (input.stack as any).depthResult;
  const depthBlock = depth ? `
Depth Energy Map:
- Dominant channel: ${depth.dominant}
- Auxiliary channel: ${depth.auxiliary}
- Inferior channel: ${depth.inferior}
- Reliability: ${depth.reliability?.score}% (${depth.reliability?.label})
- Developmental edge: ${depth.narrative?.developmentalEdge}
- Complex vulnerability: ${depth.narrative?.complexVulnerability}
` : "";

  return `
Assessment Results:
${scoresList}

${stackInfo}

Overall Attitude: ${attitude} (score: ${input.attitudeScore.toFixed(1)})
Differentiation Status: ${input.isUndifferentiated ? "Undifferentiated (scores are relatively even)" : "Differentiated"}
${depthBlock}
`;
}

export async function generateFreeAnalysis(input: AnalysisInput): Promise<string> {
  const prompt = `You are an expert in Jungian psychology, depth typology, and cognitive function development. Based on the following TypeJung depth assessment results, provide a brief but insightful personalized analysis.

${formatScoresForPrompt(input)}

Write a personalized analysis in 150-200 words that:
1. Identifies where their psychic energy flows most strongly
2. Names the inferior-function developmental edge without reducing them to a four-letter label
3. Offers one practical observation about how they likely experience stress, the body, or value

Keep the tone direct, psychologically grounded, and useful. Use second person ("you"). Do not mention that this is a free or limited analysis. Do not use bullet points, headers, or any markdown formatting like asterisks. Write in plain flowing paragraphs only.`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Error generating free analysis:", error);
    return fallbackFreeAnalysis(input);
  }
}

export async function generatePremiumAnalysis(input: AnalysisInput): Promise<{
  overview: string;
  functionAnalysis: string;
  archetypes: string;
  theGrip: string;
  relationships: string;
  career: string;
  individuation: string;
  shadow: string;
  growth: string;
  dreams: string;
}> {
  const basePrompt = formatScoresForPrompt(input);
  const dominantFn = input.stack.dominant.function;
  const auxiliaryFn = input.stack.auxiliary.function;
  const inferiorFn = input.stack.inferior.function;

  const sections = await Promise.all([
    generateSection("overview", basePrompt, dominantFn, auxiliaryFn),
    generateSection("functionAnalysis", basePrompt, dominantFn, auxiliaryFn),
    generateSection("archetypes", basePrompt, dominantFn, auxiliaryFn),
    generateSection("theGrip", basePrompt, dominantFn, inferiorFn),
    generateSection("relationships", basePrompt, dominantFn, auxiliaryFn),
    generateSection("career", basePrompt, dominantFn, auxiliaryFn),
    generateSection("individuation", basePrompt, dominantFn, inferiorFn),
    generateSection("shadow", basePrompt, dominantFn, inferiorFn),
    generateSection("growth", basePrompt, dominantFn, auxiliaryFn),
    generateSection("dreams", basePrompt, dominantFn, auxiliaryFn),
  ]);

  return {
    overview: sections[0],
    functionAnalysis: sections[1],
    archetypes: sections[2],
    theGrip: sections[3],
    relationships: sections[4],
    career: sections[5],
    individuation: sections[6],
    shadow: sections[7],
    growth: sections[8],
    dreams: sections[9],
  };
}

async function generateSection(
  section: string,
  basePrompt: string,
  dominant: string,
  secondary: string
): Promise<string> {
  const prompts: Record<string, string> = {
    overview: `You are an expert in Jungian analytical psychology. Based on these TypeJung depth assessment results, write a comprehensive psychological profile overview (300-400 words).

${basePrompt}

Write about:
- Their core psychological orientation and how ${FUNCTION_NAMES[dominant]} shapes their worldview
- The interplay between their functions and what makes their type unique
- Their natural strengths and areas of psychological development
- How their type processes information and makes decisions

Use second person ("you"). Write in flowing, insightful paragraphs. Be specific to their actual scores. Do not use any markdown formatting like asterisks or bold text - use plain text only.`,

    functionAnalysis: `You are an expert in Jungian cognitive functions. Provide a detailed analysis of each cognitive function in this person's stack (400-500 words).

${basePrompt}

For each function in their stack (dominant, auxiliary, tertiary, inferior):
- Explain how this function manifests at its position in their stack
- Describe specific behaviors and thought patterns
- Discuss the development level suggested by their scores

Use second person. Be psychologically grounded and specific to their scores. Do not use any markdown formatting - write in plain text paragraphs only.`,

    archetypes: `You are an expert in Jungian archetypes. Based on these results, describe the archetypal patterns in this person's psyche (300-350 words).

${basePrompt}

Discuss:
- The primary archetypes activated by their dominant function (${FUNCTION_NAMES[dominant]})
- How the Hero/Heroine archetype manifests through their dominant function
- The Parent archetype in relation to their auxiliary function
- The Child and Anima/Animus archetypes and their tertiary/inferior functions

Be specific about how these archetypes might appear in their life. Write in plain text without any markdown formatting.`,

    theGrip: `You are an expert in Jungian stress patterns. Describe "The Grip" experience for this person (300-350 words).

${basePrompt}

Their inferior function is ${FUNCTION_NAMES[secondary]}. Explain:
- What triggers their Grip experiences
- How they behave when their inferior function takes over
- Physical and emotional symptoms of being "in the Grip"
- Specific strategies for recognizing and recovering from Grip episodes
- How to prevent falling into the Grip

Be practical and specific to their function stack. Write in plain text without any markdown formatting.`,

    relationships: `You are an expert in Jungian relationship dynamics. Analyze this person's relationship patterns (350-400 words).

${basePrompt}

Cover:
- How their dominant ${FUNCTION_NAMES[dominant]} affects their communication style
- Their approach to intimacy and emotional connection
- Potential blind spots in relationships based on their inferior function
- Compatible types and why those connections work
- Practical advice for relationship growth

Be warm, specific, and constructive. Write in plain text without any markdown formatting.`,

    career: `You are an expert in Jungian typology and career counseling. Provide career guidance based on these results (350-400 words).

${basePrompt}

Include:
- Work environments where their dominant ${FUNCTION_NAMES[dominant]} thrives
- Specific career paths that align with their function stack
- Their natural professional strengths and potential challenges
- How to leverage their auxiliary function for career growth
- Warning signs of career misalignment with their type

Be specific and actionable. Write in plain text without any markdown formatting.`,

    individuation: `You are an expert in Jung's concept of individuation. Create a personalized individuation path (400-450 words).

${basePrompt}

Describe:
- Their current stage on the individuation journey based on their differentiation level
- How to develop their tertiary and inferior functions mindfully
- Specific exercises and practices for psychological growth
- Integration of shadow elements related to ${FUNCTION_NAMES[secondary]}
- Milestones to watch for on their individuation path

Be practical and encouraging. Write in plain text without any markdown formatting.`,

    shadow: `You are an expert in Jungian shadow work. Analyze this person's shadow dynamics (300-350 words).

${basePrompt}

Explore:
- How their inferior function ${FUNCTION_NAMES[secondary]} manifests in shadow form
- Projection patterns they may experience
- Triggers that activate shadow content
- Specific shadow integration exercises
- The gifts hidden within their shadow

Be insightful but compassionate. Write in plain text without any markdown formatting.`,

    growth: `You are an expert in psychological development. Provide a personal growth roadmap (350-400 words).

${basePrompt}

Include:
- Short-term development goals (next 3-6 months)
- Medium-term integration work (1-2 years)
- Long-term individuation objectives
- Daily practices to strengthen underutilized functions
- Books, resources, or modalities that support their growth path

Be practical and motivating. Write in plain text without any markdown formatting.`,

    dreams: `You are an expert in Jungian dream analysis. Provide dreamwork guidance tailored to their type (300-350 words).

${basePrompt}

Cover:
- Common dream themes for their type
- How their dominant ${FUNCTION_NAMES[dominant]} appears in dreams
- Symbols related to their inferior function that may appear
- A personalized dream journaling approach
- Active imagination techniques suited to their function stack

Be mystical yet practical. Write in plain text without any markdown formatting.`,
  };

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompts[section] }] }],
    });

    return response.text || "Unable to generate this section.";
  } catch (error) {
    console.error(`Error generating ${section}:`, error);
    return "This section could not be generated. Please try again.";
  }
}
