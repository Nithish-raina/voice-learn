import "dotenv/config";
import { Worker } from "bullmq";
import Redis from "ioredis";
import { ragIndexingService } from "./src/services/rag-indexing-service.js";
import { ragIndexJobsRepository } from "./src/repositories/rag-index-jobs-repository.js";
import logger from "./src/lib/logger.js";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    logger.warn({ delay, attempt: times }, "Worker Redis reconnecting");
    return delay;
  },
});

connection.on("error", (err) => {
  logger.error({ err }, "Worker Redis connection error");
});

connection.on("connect", () => {
  logger.info("Worker Redis connected");
});

const worker = new Worker(
  "rag-indexing",
  async (job) => {
    const { sessionId } = job.data;
    const log = logger.child({ jobId: job.id, sessionId });
    log.info("Processing job");

    let ragJob;
    try {
      ragJob = await ragIndexJobsRepository.findBySessionId(sessionId);
    } catch (error) {
      log.error({ err: error }, "Failed to find RAG job");
    }

    if (ragJob) {
      try {
        await ragIndexJobsRepository.update(ragJob.id, {
          status: "indexing",
          startedAt: new Date(),
        });
      } catch (error) {
        log.error({ err: error }, "Failed to update job status to indexing");
      }
    }

    try {
      const result = await ragIndexingService.indexSession(sessionId);

      // Update job status to completed
      if (ragJob) {
        try {
          await ragIndexJobsRepository.update(ragJob.id, {
            status: "completed",
            chunksIndexed: result.chunksIndexed,
            completedAt: new Date(),
          });
        } catch (error) {
          log.error({ err: error }, "Failed to update job status to completed");
        }
      }

      log.info({ chunksIndexed: result.chunksIndexed }, "Job completed");
      return result;
    } catch (error) {
      log.error({ err: error }, "Job failed");

      // Update job status to failed
      if (ragJob) {
        try {
          await ragIndexJobsRepository.update(ragJob.id, {
            status: "failed",
            errorMessage: error.message,
            completedAt: new Date(),
          });
        } catch (updateError) {
          log.error({ err: updateError }, "Failed to update job status to failed");
        }
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
  logger.info({ jobId: job.id, result }, "Job finished successfully");
});

worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, "Job failed permanently");
});

worker.on("error", (err) => {
  logger.error({ err }, "Worker error");
});

logger.info("RAG indexing worker started, waiting for jobs...");
