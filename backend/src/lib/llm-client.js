import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callLLM({
  model = "claude-haiku-4-5",
  system,
  prompt,
  maxTokens = 2000,
}) {
  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  let text = response.content[0].text;

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  // Try to parse as JSON, return raw text if not JSON
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Fast model for simple extraction tasks
export async function callFastLLM({ system, prompt, maxTokens = 1500 }) {
  return callLLM({
    model: "claude-haiku-4-5",
    system,
    prompt,
    maxTokens,
  });
}
