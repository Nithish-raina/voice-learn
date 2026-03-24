import { callLLM } from "../../lib/llm-client.js";

export async function generateScore({
  concepts,
  factCheck,
  completeness,
  topic,
  difficulty,
}) {
  const system = `You are a learning evaluator. Score an explanation and provide feedback. Return ONLY valid JSON with no markdown formatting. Never use the word "student" in your output — refer to the speaker as "you" instead.`;

  const prompt = `Evaluate this explanation of "${topic}" at ${difficulty} level.

Concepts they covered:
${JSON.stringify(concepts.concepts, null, 2)}

Fact check results:
${JSON.stringify(factCheck, null, 2)}

Completeness check:
${JSON.stringify(completeness, null, 2)}

Generate a score from 1-10 and brief feedback summaries.

Scoring guide:
- 9-10: Excellent coverage, accurate, good depth
- 7-8: Good coverage with minor gaps
- 5-6: Decent but significant gaps or some inaccuracies
- 3-4: Major gaps or several inaccuracies
- 1-2: Very incomplete or mostly inaccurate

Return this exact JSON structure:
{
  "score": number between 1 and 10,
  "strengths": "2-3 sentence summary of what they explained well",
  "gaps": "2-3 sentence summary of what they missed or got wrong"
}`;

  try {
    return await callLLM({ system, prompt, maxTokens: 500 });
  } catch (error) {
    console.error("[Scorer] Failed:", error.message);
    throw new Error("Failed to generate your score.");
  }
}
