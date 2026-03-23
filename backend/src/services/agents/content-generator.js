import { callLLM } from "../../lib/llm-client.js";

export async function generateContent({
  concepts,
  factCheck,
  completeness,
  topic,
  difficulty,
}) {
  const system = `You are a learning content generator. Create test questions and flashcards based on a student's knowledge gaps. Return ONLY valid JSON with no markdown formatting.`;

  const prompt = `Based on this analysis of a student's explanation of "${topic}" at ${difficulty} level:

Concepts covered:
${concepts.concepts.map((c) => c.concept).join(", ")}

Missing concepts:
${JSON.stringify(completeness.missingConcepts, null, 2)}

Inaccuracies:
${JSON.stringify(factCheck.inaccuracies || [], null, 2)}

Generate:
1. 2-3 "test yourself" questions with detailed answers targeting their gaps
2. 3-5 flashcards (question + answer pairs) specifically targeting what they missed or got wrong

Return this exact JSON structure:
{
  "testYourselfQas": [
    {
      "question": "a probing question about their gaps",
      "answer": "detailed answer explaining the concept"
    }
  ],
  "flashcards": [
    {
      "question": "concise flashcard question",
      "answer": "concise but complete answer"
    }
  ]
}`;

  try {
    return await callLLM({ system, prompt, maxTokens: 1500 });
  } catch (error) {
    console.error("[ContentGenerator] Failed:", error.message);
    throw new Error("Failed to generate study content.");
  }
}
