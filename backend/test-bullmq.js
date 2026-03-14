import "dotenv/config";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

async function testBullMQ() {
  const queueName = "test-queue";

  const queue = new Queue(queueName, { connection });

  const worker = new Worker(
    queueName,
    async (job) => {
      console.log(
        "✅ Worker received job:",
        job.name,
        "- Data:",
        JSON.stringify(job.data),
      );
      return { processed: true };
    },
    { connection },
  );

  worker.on("completed", async (job, result) => {
    console.log(
      "✅ Job completed:",
      job.name,
      "- Result:",
      JSON.stringify(result),
    );

    await worker.close();
    await queue.close();
    await connection.quit();
    console.log("\n🎉 BULLMQ IS WORKING PERFECTLY");
  });

  worker.on("failed", (job, err) => {
    console.error("❌ Job failed:", err.message);
  });

  await queue.add("index_session", {
    sessionId: "ses_test123",
    userId: "usr_test123",
  });
  console.log("✅ Job added to queue");
}

testBullMQ();
