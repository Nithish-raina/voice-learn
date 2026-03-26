import { embeddingService } from "./embedding-service.js";
import { pineconeIndex } from "../lib/pinecone-client.js";
import logger from "../lib/logger.js";

export const ragService = {
  async query(userId, question, { topK = 8, filter } = {}) {
    logger.debug({ userId, topK, questionLength: question?.length }, "RAG query started");
    const startTime = Date.now();

    let vector;
    try {
      vector = await embeddingService.embedText(question);
    } catch (error) {
      logger.error({ err: error, userId }, "RAG embedding failed for query");
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
      logger.error({ err: error, userId }, "Pinecone query failed");
      throw new Error("Unable to search your knowledge base right now.");
    }

    const matchCount = results?.matches?.length || 0;
    const elapsed = Date.now() - startTime;
    logger.info({ userId, matchCount, elapsedMs: elapsed }, "RAG query completed");

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
