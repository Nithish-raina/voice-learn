import { Queue } from "bullmq";
import { bullConnection } from "./redis-client.js";
import logger from "./logger.js";

export const ragQueue = new Queue("rag-indexing", {
  connection: bullConnection,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 100,
    },
    removeOnFail: {
      age: 86400,
      count: 200,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

ragQueue.on("error", (err) => {
  logger.error({ err }, "RAG queue error");
});
