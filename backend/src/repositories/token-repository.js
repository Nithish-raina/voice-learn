// token repository for managing refresh tokens in Redis
import crypto from "crypto";
import { redis } from "../lib/redis-client.js";

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

function tokenKey(userId, tokenHash) {
  return `refresh:${userId}:${tokenHash}`;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const tokenRepository = {
  async storeRefreshToken(userId, token) {
    const hash = hashToken(token);
    await redis.set(tokenKey(userId, hash), "1", "EX", REFRESH_TOKEN_TTL);
  },

  async verifyRefreshToken(userId, token) {
    const hash = hashToken(token);
    const exists = await redis.exists(tokenKey(userId, hash));
    return exists === 1;
  },

  async deleteRefreshToken(userId, token) {
    const hash = hashToken(token);
    await redis.del(tokenKey(userId, hash));
  },

  async deleteAllRefreshTokens(userId) {
    const pattern = `refresh:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};
