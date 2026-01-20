import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
    const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
    
    if (!apiKey || !baseUrl) {
      throw new Error("AI Integrations not configured");
    }
    
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: "",
        baseUrl,
      },
    });
  }
  return aiClient;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  userProfile: {
    dominantFunction: string;
    auxiliaryFunction: string;
    tertiaryFunction: string;
    inferiorFunction: string;
    scores: Array<{ function: string; score: number }>;
    attitudeScore: number;
  };
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

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { message, history, userProfile } = req.body as ChatRequest;

    if (!message || !userProfile) {
      return res.status(400).json({ error: "Message and user profile are required" });
    }

    const client = getAiClient();
    
    const sortedScores = [...userProfile.scores].sort((a, b) => b.score - a.score);
    const scoresText = sortedScores
      .map((s) => `${FUNCTION_NAMES[s.function]} (${s.function}): ${s.score.toFixed(1)}%`)
      .join(", ");

    const attitude = userProfile.attitudeScore > 0 ? "Extraverted" : "Introverted";

    const systemPrompt = `You are a Jungian psychology coach helping someone understand their cognitive function profile and how to grow. You speak in plain, warm, encouraging language without any markdown formatting, bullet points, or special symbols.

The user's profile:
- Dominant: ${FUNCTION_NAMES[userProfile.dominantFunction]} (${userProfile.dominantFunction})
- Auxiliary: ${FUNCTION_NAMES[userProfile.auxiliaryFunction]} (${userProfile.auxiliaryFunction})
- Tertiary: ${FUNCTION_NAMES[userProfile.tertiaryFunction]} (${userProfile.tertiaryFunction})
- Inferior: ${FUNCTION_NAMES[userProfile.inferiorFunction]} (${userProfile.inferiorFunction})
- Overall Attitude: ${attitude}
- All Scores: ${scoresText}

IMPORTANT RULES:
1. Only answer questions related to the user's Jungian type, cognitive functions, and personal growth/individuation
2. Never use markdown formatting like ** or * or # or - bullet points
3. Write in flowing paragraphs with plain text only
4. Keep responses conversational and practical (150-300 words)
5. If asked about unrelated topics, gently redirect to their type and growth
6. Focus on actionable self-improvement advice based on their specific function stack
7. Reference Jungian concepts like individuation, shadow work, and function development
8. Be encouraging but honest about growth challenges`;

    const conversationHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll help you explore your cognitive functions and personal growth journey in plain, conversational language." }] },
        ...conversationHistory,
        { role: "user", parts: [{ text: message }] },
      ],
      config: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const responseText = response.text || "I apologize, but I couldn't generate a response. Please try again.";
    
    const cleanedResponse = responseText
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^#+\s*/gm, "")
      .replace(/^[-•]\s*/gm, "")
      .replace(/^\d+\.\s*/gm, "")
      .trim();

    res.json({ response: cleanedResponse });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
}
