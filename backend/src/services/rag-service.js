import { embeddingService } from "./embedding-service.js";
import { pineconeIndex } from "../lib/pinecone-client.js";

export const ragService = {
  async query(userId, question, { topK = 8, filter } = {}) {
    let vector;
    try {
      vector = await embeddingService.embedText(question);
    } catch (error) {
      console.error("[RAG] Embedding failed for query:", error.message);
      throw new Error("Unable to search your knowledge base right now.");
    }

    const namespace = pineconeIndex.namespace(userId);

    const queryOptions = {
      vector,
      topK,
      includeMetadata: true,
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    let results;
    try {
      results = await namespace.query(queryOptions);
    } catch (error) {
      console.error("[RAG] Pinecone query failed:", error.message);
      throw new Error("Unable to search your knowledge base right now.");
    }

    if (!results?.matches) {
      return [];
    }

    return results.matches.map((match) => ({
      text: match.metadata?.text || "",
      type: match.metadata?.type || "unknown",
      sessionId: match.metadata?.sessionId || null,
      topic: match.metadata?.topic || "",
      score: match.score,
    }));
  },
};
