import "dotenv/config";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { ragIndexingService } from "./src/services/rag-indexing-service.js";
import { ragIndexJobsRepository } from "./src/repositories/rag-index-jobs-repository.js";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "rag-indexing",
  async (job) => {
    const { sessionId } = job.data;
    console.log(`\n[Worker] Processing job ${job.id} — session: ${sessionId}`);

    // Find the rag index job record
    const ragJob = await ragIndexJobsRepository.findBySessionId(sessionId);

    if (ragJob) {
      await ragIndexJobsRepository.update(ragJob.id, {
        status: "indexing",
        startedAt: new Date(),
      });
    }

    try {
      const result = await ragIndexingService.indexSession(sessionId);

      // Update job status to completed
      if (ragJob) {
        await ragIndexJobsRepository.update(ragJob.id, {
          status: "completed",
          chunksIndexed: result.chunksIndexed,
          completedAt: new Date(),
        });
      }

      console.log(
        `[Worker] Job ${job.id} completed — ${result.chunksIndexed} chunks indexed`,
      );
      return result;
    } catch (error) {
      console.error(`[Worker] Job ${job.id} failed:`, error.message);

      // Update job status to failed
      if (ragJob) {
        await ragIndexJobsRepository.update(ragJob.id, {
          status: "failed",
          errorMessage: error.message,
          completedAt: new Date(),
        });
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  },
);

worker.on("completed", (job, result) => {
  console.log(`[Worker] Job ${job.id} finished successfully:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job.id} failed permanently:`, err.message);
});

worker.on("error", (err) => {
  console.error("[Worker] Worker error:", err.message);
});

console.log("[Worker] RAG indexing worker started, waiting for jobs...");
