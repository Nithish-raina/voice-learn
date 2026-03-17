import "dotenv/config";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function testRedis() {
  try {
    // Basic connectivity
    const pong = await redis.ping();
    console.log("Connected to Redis Cloud:", pong);

    // Set and get
    await redis.set("test:hello", "world");
    const value = await redis.get("test:hello");
    console.log("SET and GET:", value);

    // INCRBY (rate limiting pattern)
    await redis.set("test:counter", 0);
    await redis.incrby("test:counter", 154);
    await redis.incrby("test:counter", 200);
    const counter = await redis.get("test:counter");
    console.log("INCRBY counter:", counter, "(expected 354)");

    // TTL (daily rate limit reset pattern)
    await redis.set("test:expiring", "bye", "EX", 5);
    const ttl = await redis.ttl("test:expiring");
    console.log("TTL set:", ttl, "seconds remaining");

    // Full rate limit simulation
    const userId = "usr_test123";
    const key = `ratelimit:${userId}:daily`;

    // Simulate midnight expiry - set TTL to 60 seconds for testing
    await redis.set(key, 0, "EX", 60);
    await redis.incrby(key, 154);
    const used = await redis.get(key);
    const remaining = 1800 - parseInt(used);
    const keyTTL = await redis.ttl(key);
    console.log(
      "Rate limit - Used:",
      used,
      "Remaining:",
      remaining,
      "Resets in:",
      keyTTL,
      "s",
    );
    console.log("REDIS CLOUD IS WORKING PERFECTLY");
  } catch (error) {
    console.error("Redis test failed:", error.message);
  } finally {
    redis.disconnect();
  }
}

testRedis();
