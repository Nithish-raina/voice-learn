import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const embeddingService = {
  async embedText(text) {
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return result.data[0].embedding;
  },

  async embedBatch(texts) {
    const result = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    return result.data.map((d) => d.embedding);
  },
};
