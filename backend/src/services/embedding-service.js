import OpenAI from "openai";
import logger from "../lib/logger.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const embeddingService = {
  async embedText(text) {
    logger.debug({ textLength: text?.length }, "Embedding single text");
    const startTime = Date.now();
    try {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      const elapsed = Date.now() - startTime;
      logger.debug({ elapsedMs: elapsed, dimensions: result.data[0].embedding.length }, "Text embedded");
      return result.data[0].embedding;
    } catch (error) {
      logger.error({ err: error }, "Failed to embed text");
      throw new Error("Embedding service is unavailable. Please try again.");
    }
  },

  async embedBatch(texts) {
    logger.debug({ batchSize: texts.length }, "Embedding batch");
    const startTime = Date.now();
    try {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });
      const elapsed = Date.now() - startTime;
      logger.info({ batchSize: texts.length, elapsedMs: elapsed }, "Batch embedded");
      return result.data.map((d) => d.embedding);
    } catch (error) {
      logger.error({ err: error, batchSize: texts.length }, "Failed to embed batch");
      throw new Error("Embedding service is unavailable. Please try again.");
    }
  },
};
