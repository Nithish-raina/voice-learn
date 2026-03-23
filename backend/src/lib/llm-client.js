import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../utils/errors.js";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callLLM({
  model = "claude-haiku-4-5",
  system,
  prompt,
  maxTokens = 2000,
}) {
  let response;
  try {
    response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error("[LLM] Rate limit exceeded:", error.message);
      throw new AppError("Service is temporarily busy. Please try again shortly.", 503, "LLM_RATE_LIMITED");
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[LLM] Authentication failed:", error.message);
      throw new AppError("Service configuration error. Please contact support.", 500, "LLM_AUTH_ERROR");
    }
    if (error instanceof Anthropic.APIConnectionError) {
      console.error("[LLM] Connection failed:", error.message);
      throw new AppError("Unable to reach analysis service. Please try again.", 503, "LLM_CONNECTION_ERROR");
    }
    console.error("[LLM] API call failed:", error.message);
    throw new AppError("Analysis service is currently unavailable. Please try again.", 503, "LLM_UNAVAILABLE");
  }

  const content = response.content?.[0];
  if (!content || !content.text) {
    console.error("[LLM] Empty response received");
    throw new AppError("Received an empty response from analysis service.", 502, "LLM_EMPTY_RESPONSE");
  }

  let text = content.text;

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
