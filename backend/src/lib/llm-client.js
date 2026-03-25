import Anthropic from "@anthropic-ai/sdk";
import { AppError } from "../utils/errors.js";
import logger from "./logger.js";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callLLM({
  model = "claude-haiku-4-5",
  system,
  prompt,
  maxTokens = 2000,
}) {
  const startTime = Date.now();
  logger.debug({ model, maxTokens, promptLength: prompt?.length }, "LLM call started");

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
      logger.error({ err: error, model }, "LLM rate limit exceeded");
      throw new AppError("Service is temporarily busy. Please try again shortly.", 503, "LLM_RATE_LIMITED");
    }
    if (error instanceof Anthropic.AuthenticationError) {
      logger.error({ err: error, model }, "LLM authentication failed");
      throw new AppError("Service configuration error. Please contact support.", 500, "LLM_AUTH_ERROR");
    }
    if (error instanceof Anthropic.APIConnectionError) {
      logger.error({ err: error, model }, "LLM connection failed");
      throw new AppError("Unable to reach analysis service. Please try again.", 503, "LLM_CONNECTION_ERROR");
    }
    logger.error({ err: error, model }, "LLM API call failed");
    throw new AppError("Analysis service is currently unavailable. Please try again.", 503, "LLM_UNAVAILABLE");
  }

  const content = response.content?.[0];
  if (!content || !content.text) {
    logger.error({ model }, "LLM empty response received");
    throw new AppError("Received an empty response from analysis service.", 502, "LLM_EMPTY_RESPONSE");
  }

  const elapsed = Date.now() - startTime;
  const inputTokens = response.usage?.input_tokens;
  const outputTokens = response.usage?.output_tokens;
  logger.info({ model, elapsedMs: elapsed, inputTokens, outputTokens, responseLength: content.text.length }, "LLM call completed");

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
