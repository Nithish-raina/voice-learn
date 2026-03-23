import { callFastLLM } from "../../lib/llm-client.js";

export async function checkFacts({ concepts, topic, difficulty }) {
  const system = `You are a fact checker. Evaluate whether a student's explanations of concepts are accurate. Return ONLY valid JSON with no markdown formatting.`;

  const prompt = `The student was explaining "${topic}" at ${difficulty} level.

Here are the concepts they covered:
${JSON.stringify(concepts.concepts, null, 2)}

For each concept, evaluate if their explanation is factually correct. Flag any inaccuracies.

Return this exact JSON structure:
{
  "assessments": [
    {
      "concept": "concept name",
      "correct": true or false,
      "note": "brief explanation of accuracy or what was wrong"
    }
  ],
  "inaccuracies": ["list of specific incorrect claims, empty if all correct"]
}`;

  try {
    return await callFastLLM({ system, prompt });
  } catch (error) {
    console.error("[FactChecker] Failed:", error.message);
    throw new Error("Failed to verify the accuracy of your explanation.");
  }
}
