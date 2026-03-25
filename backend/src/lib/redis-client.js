// redis client singleton instance
import Redis from "ioredis";
import logger from "./logger.js";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    logger.warn({ delay, attempt: times }, "Redis reconnecting");
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});

const bullConnection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

bullConnection.on("error", (err) => {
  logger.error({ err }, "Redis Bull connection error");
});

export { redis, bullConnection };
