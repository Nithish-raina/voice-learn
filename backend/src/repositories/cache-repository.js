// cache repository for caching data in redis
import { redis } from "../lib/redis-client.js";
import logger from "../lib/logger.js";

export const cacheRepository = {
  async get(key) {
    try {
      return await redis.get(key);
    } catch (error) {
      logger.error({ err: error, key }, "Failed to get cache key");
      return null;
    }
  },

  async set(key, value) {
    try {
      return await redis.set(key, value);
    } catch (error) {
      logger.error({ err: error, key }, "Failed to set cache key");
    }
  },

  async setWithTTL(key, value, ttlSeconds) {
    try {
      return await redis.set(key, value, "EX", ttlSeconds);
    } catch (error) {
      logger.error({ err: error, key, ttlSeconds }, "Failed to set cache key with TTL");
    }
  },

  async incrby(key, amount) {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      logger.error({ err: error, key }, "Failed to increment cache key");
      return null;
    }
  },

  async delete(key) {
    try {
      return await redis.del(key);
    } catch (error) {
      logger.error({ err: error, key }, "Failed to delete cache key");
    }
  },

  async getTTL(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error({ err: error, key }, "Failed to get TTL for cache key");
      return -1;
    }
  },
};
