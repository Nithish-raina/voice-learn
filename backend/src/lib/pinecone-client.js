// pinecone client singleton instance
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  console.error("[Pinecone] PINECONE_API_KEY is not configured");
}

if (!process.env.PINECONE_INDEX) {
  console.error("[Pinecone] PINECONE_INDEX is not configured");
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const pineconeIndex = pc.index(process.env.PINECONE_INDEX);
