import { prisma } from "../lib/prisma-client.js";
import { embeddingService } from "./embedding-service.js";
import { pineconeIndex } from "../lib/pinecone-client.js";
import logger from "../lib/logger.js";

function chunkTranscript(transcript) {
  if (!transcript || transcript.trim().length === 0) return [];

  // Split by sentences
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length > 300) {
      if (current.trim()) chunks.push(current.trim());
      current = trimmed;
    } else {
      current += (current ? " " : "") + trimmed;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  // If no sentence splitting happened, chunk by word count
  if (chunks.length === 0 && transcript.trim().length > 0) {
    const words = transcript.trim().split(/\s+/);
    for (let i = 0; i < words.length; i += 50) {
      chunks.push(words.slice(i, i + 50).join(" "));
    }
  }

  return chunks;
}

export const ragIndexingService = {
  async indexSession(sessionId) {
    const log = logger.child({ sessionId });

    // Fetch session with flashcards
    let session;
    try {
      session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          flashcards: {
            where: { status: "active" },
          },
        },
      });
    } catch (error) {
      log.error({ err: error }, "Database error fetching session");
      throw new Error(`Failed to fetch session data for indexing`);
    }

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.status !== "completed") {
      throw new Error(
        `Session not completed: ${sessionId} (status: ${session.status})`,
      );
    }

    const userId = session.userId;
    const namespace = pineconeIndex.namespace(userId);
    const allChunks = [];
    const baseMetadata = {
      sessionId: session.id,
      topic: session.topic,
      subject: session.subject,
      date: session.createdAt.toISOString().split("T")[0],
    };

    // Chunk 1: Transcript chunks
    if (session.transcriptText) {
      const transcriptChunks = chunkTranscript(session.transcriptText);
      transcriptChunks.forEach((text, i) => {
        allChunks.push({
          id: `${sessionId}_transcript_${i}`,
          text,
          metadata: { ...baseMetadata, type: "transcript" },
        });
      });
    }

    // Chunk 2: Strengths
    if (session.strengths) {
      allChunks.push({
        id: `${sessionId}_strengths`,
        text: session.strengths,
        metadata: { ...baseMetadata, type: "strength" },
      });
    }

    // Chunk 3: Gaps
    if (session.gaps) {
      allChunks.push({
        id: `${sessionId}_gaps`,
        text: session.gaps,
        metadata: { ...baseMetadata, type: "gap" },
      });
    }

    // Chunk 4: Test yourself Q&As
    if (session.testYourselfQas && Array.isArray(session.testYourselfQas)) {
      session.testYourselfQas.forEach((qa, i) => {
        const text = `Question: ${qa.question}\nAnswer: ${qa.answer}`;
        allChunks.push({
          id: `${sessionId}_qa_${i}`,
          text,
          metadata: { ...baseMetadata, type: "qa" },
        });
      });
    }

    // Chunk 5: Flashcards
    if (session.flashcards && session.flashcards.length > 0) {
      session.flashcards.forEach((fc, i) => {
        const text = `Flashcard Question: ${fc.question}\nAnswer: ${fc.answer}`;
        allChunks.push({
          id: `${sessionId}_flashcard_${i}`,
          text,
          metadata: { ...baseMetadata, type: "flashcard" },
        });
      });
    }

    if (allChunks.length === 0) {
      log.info("No chunks to index");
      return { chunksIndexed: 0 };
    }

    // Embed all chunks in batches of 20
    log.info({ chunkCount: allChunks.length }, "Embedding chunks");
    const vectors = [];
    const batchSize = 20;

    for (let i = 0; i < allChunks.length; i += batchSize) {
      const batch = allChunks.slice(i, i + batchSize);
      const texts = batch.map((c) => c.text);

      let embeddings;
      try {
        embeddings = await embeddingService.embedBatch(texts);
      } catch (error) {
        log.error({ err: error, batch: i / batchSize + 1 }, "Embedding failed for batch");
        throw new Error(`Failed to generate embeddings for session ${sessionId}`);
      }

      batch.forEach((chunk, j) => {
        vectors.push({
          id: chunk.id,
          values: embeddings[j],
          metadata: {
            ...chunk.metadata,
            text: chunk.text,
          },
        });
      });
    }

    // Upsert to Pinecone
    log.info({ vectorCount: vectors.length, namespace: userId }, "Upserting vectors to Pinecone");

    // Pinecone upsert in batches of 100
    const upsertBatchSize = 100;
    for (let i = 0; i < vectors.length; i += upsertBatchSize) {
      const batch = vectors.slice(i, i + upsertBatchSize);
      try {
        await namespace.upsert({ records: batch });
      } catch (error) {
        log.error({ err: error, batch: i / upsertBatchSize + 1 }, "Pinecone upsert failed for batch");
        throw new Error(`Failed to index session ${sessionId} in knowledge base`);
      }
    }

    log.info({ chunksIndexed: vectors.length }, "Indexing complete");
    return { chunksIndexed: vectors.length };
  },
};
