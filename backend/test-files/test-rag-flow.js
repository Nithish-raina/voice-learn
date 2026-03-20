import "dotenv/config";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function embed(text) {
  const result = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return result.data[0].embedding;
}

async function testRAGFlow() {
  try {
    const testVec = await embed("test");
    console.log("Embedding dimensions:", testVec.length);

    const index = pc.index(process.env.PINECONE_INDEX);
    const namespace = index.namespace("test_user_rag");

    const chunks = [
      {
        id: "chunk_001",
        text: "HTTP is a request response protocol. The browser sends a request and the server sends back a response. Think of it like ordering at a restaurant.",
        metadata: {
          type: "transcript",
          sessionId: "ses_001",
          topic: "How HTTP Works",
        },
      },
      {
        id: "chunk_002",
        text: "GET method is used to fetch data from the server. POST method is used to send data to the server like submitting a form.",
        metadata: {
          type: "transcript",
          sessionId: "ses_001",
          topic: "How HTTP Works",
        },
      },
      {
        id: "chunk_003",
        text: "Did not cover DNS resolution before TCP connection. HTTPS and TLS handshake was not explained. Status code categories were incomplete.",
        metadata: {
          type: "gap",
          sessionId: "ses_001",
          topic: "How HTTP Works",
        },
      },
      {
        id: "chunk_004",
        text: "Clear explanation of request response cycle. Good restaurant analogy. Correctly covered GET and POST methods.",
        metadata: {
          type: "strength",
          sessionId: "ses_001",
          topic: "How HTTP Works",
        },
      },
      {
        id: "chunk_005",
        text: "What is DNS and what role does it play before an HTTP request? DNS stands for Domain Name System and translates domain names to IP addresses.",
        metadata: {
          type: "flashcard",
          sessionId: "ses_001",
          topic: "How HTTP Works",
        },
      },
    ];

    console.log("Embedding", chunks.length, "chunks...");
    const vectors = [];
    for (const chunk of chunks) {
      const embedding = await embed(chunk.text);
      vectors.push({
        id: chunk.id,
        values: embedding,
        metadata: { ...chunk.metadata, text: chunk.text },
      });
    }

    console.log("Vectors count:", vectors.length);
    console.log("First vector values length:", vectors[0].values.length);

    await namespace.upsert({ records: vectors });
    console.log("Upserted", vectors.length, "vectors to Pinecone");

    console.log("Waiting for indexing...");
    await new Promise((r) => setTimeout(r, 3000));

    console.log("\n--- Simulating Chat Queries ---\n");

    const q1Vector = await embed("What gaps do I have in HTTP?");
    const results1 = await namespace.query({
      vector: q1Vector,
      topK: 3,
      includeMetadata: true,
    });
    console.log('Query: "What gaps do I have in HTTP?"');
    results1.matches.forEach((m, i) => {
      console.log(
        `  ${i + 1}. [${m.metadata.type}] Score: ${m.score.toFixed(3)} - ${m.metadata.text.substring(0, 70)}...`,
      );
    });

    const q2Vector = await embed("What do I understand well?");
    const results2 = await namespace.query({
      vector: q2Vector,
      topK: 3,
      includeMetadata: true,
    });
    console.log(`\nQuery: "What do I understand well?"`);
    results2.matches.forEach((m, i) => {
      console.log(
        `  ${i + 1}. [${m.metadata.type}] Score: ${m.score.toFixed(3)} - ${m.metadata.text.substring(0, 70)}...`,
      );
    });

    const q3Vector = await embed("What do I know about DNS?");
    const results3 = await namespace.query({
      vector: q3Vector,
      topK: 3,
      includeMetadata: true,
    });
    console.log(`\nQuery: "What do I know about DNS?"`);
    results3.matches.forEach((m, i) => {
      console.log(
        `  ${i + 1}. [${m.metadata.type}] Score: ${m.score.toFixed(3)} - ${m.metadata.text.substring(0, 70)}...`,
      );
    });

    const q4Vector = await embed("What are my weak areas?");
    const results4 = await namespace.query({
      vector: q4Vector,
      topK: 3,
      includeMetadata: true,
      filter: { type: { $in: ["gap", "flashcard"] } },
    });
    console.log(
      `\nQuery: "What are my weak areas?" (filtered: gaps and flashcards only)`,
    );
    results4.matches.forEach((m, i) => {
      console.log(
        `  ${i + 1}. [${m.metadata.type}] Score: ${m.score.toFixed(3)} - ${m.metadata.text.substring(0, 70)}...`,
      );
    });

    await namespace.deleteAll();
    console.log("\nCleanup done");

    console.log("\nFULL RAG FLOW IS WORKING PERFECTLY");
  } catch (error) {
    console.error("RAG flow test failed:", error.message);
  }
}

testRAGFlow();
