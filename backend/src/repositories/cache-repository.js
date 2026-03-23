// cache repository for caching data in redis
import { redis } from "../lib/redis-client.js";

export const cacheRepository = {
  async get(key) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.error(`[Cache] Failed to get key "${key}":`, error.message);
      return null;
    }
  },

  async set(key, value) {
    try {
      return await redis.set(key, value);
    } catch (error) {
      console.error(`[Cache] Failed to set key "${key}":`, error.message);
    }
  },

  async setWithTTL(key, value, ttlSeconds) {
    try {
      return await redis.set(key, value, "EX", ttlSeconds);
    } catch (error) {
      console.error(`[Cache] Failed to set key "${key}" with TTL:`, error.message);
    }
  },

  async incrby(key, amount) {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error(`[Cache] Failed to increment key "${key}":`, error.message);
      return null;
    }
  },

  async delete(key) {
    try {
      return await redis.del(key);
    } catch (error) {
      console.error(`[Cache] Failed to delete key "${key}":`, error.message);
    }
  },

  async getTTL(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`[Cache] Failed to get TTL for key "${key}":`, error.message);
      return -1;
    }
  },
};
