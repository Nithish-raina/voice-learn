// redis client singleton instance
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const bullConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export { redis, bullConnection };
