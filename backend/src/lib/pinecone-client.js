// pinecone client singleton instance
import { Pinecone } from "@pinecone-database/pinecone";
import logger from "./logger.js";

if (!process.env.PINECONE_API_KEY) {
  logger.error("PINECONE_API_KEY is not configured");
}

if (!process.env.PINECONE_INDEX) {
  logger.error("PINECONE_INDEX is not configured");
}

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const pineconeIndex = pc.index(process.env.PINECONE_INDEX);
