// cache repository for caching data in redis
import { redis } from "../lib/redis-client.js";

export const cacheRepository = {
  async get(key) {
    return redis.get(key);
  },

  async set(key, value) {
    return redis.set(key, value);
  },

  async setWithTTL(key, value, ttlSeconds) {
    return redis.set(key, value, "EX", ttlSeconds);
  },

  async incrby(key, amount) {
    return redis.incrby(key, amount);
  },

  async delete(key) {
    return redis.del(key);
  },

  async getTTL(key) {
    return redis.ttl(key);
  },
};
