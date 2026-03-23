import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const embeddingService = {
  async embedText(text) {
    try {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return result.data[0].embedding;
    } catch (error) {
      console.error("[Embedding] Failed to embed text:", error.message);
      throw new Error("Embedding service is unavailable. Please try again.");
    }
  },

  async embedBatch(texts) {
    try {
      const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
      });
      return result.data.map((d) => d.embedding);
    } catch (error) {
      console.error(`[Embedding] Failed to embed batch of ${texts.length} texts:`, error.message);
      throw new Error("Embedding service is unavailable. Please try again.");
    }
  },
};
