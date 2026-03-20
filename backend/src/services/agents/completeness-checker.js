import { callFastLLM } from "../../lib/llm-client.js";

export async function checkCompleteness({ concepts, topic, difficulty }) {
  const system = `You are a completeness evaluator. Given a topic and difficulty level, identify important concepts that the student did NOT cover. Return ONLY valid JSON with no markdown formatting.`;

  const prompt = `The student was explaining "${topic}" at ${difficulty} level.

They covered these concepts:
${concepts.concepts.map((c) => c.concept).join(", ")}

What important concepts for "${topic}" at ${difficulty} level did they miss?

Return this exact JSON structure:
{
  "missingConcepts": [
    {
      "concept": "name of missing concept",
      "importance": "high" or "medium" or "low",
      "reason": "why this concept matters for this topic"
    }
  ],
  "depthAssessment": "brief assessment of how deep vs surface-level the explanation was"
}`;

  return callFastLLM({ system, prompt });
}
