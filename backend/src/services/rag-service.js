import { embeddingService } from "./embedding-service.js";
import { pineconeIndex } from "../lib/pinecone-client.js";

export const ragService = {
  async query(userId, question, { topK = 8, filter } = {}) {
    const vector = await embeddingService.embedText(question);
    const namespace = pineconeIndex.namespace(userId);

    const queryOptions = {
      vector,
      topK,
      includeMetadata: true,
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const results = await namespace.query(queryOptions);

    return results.matches.map((match) => ({
      text: match.metadata.text,
      type: match.metadata.type,
      sessionId: match.metadata.sessionId,
      topic: match.metadata.topic,
      score: match.score,
    }));
  },
};
