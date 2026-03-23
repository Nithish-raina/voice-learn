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
    try {
      const hash = hashToken(token);
      await redis.set(tokenKey(userId, hash), "1", "EX", REFRESH_TOKEN_TTL);
    } catch (error) {
      console.error("[TokenRepo] Failed to store refresh token:", error.message);
      throw new Error("Unable to complete authentication. Please try again.");
    }
  },

  async verifyRefreshToken(userId, token) {
    try {
      const hash = hashToken(token);
      const exists = await redis.exists(tokenKey(userId, hash));
      return exists === 1;
    } catch (error) {
      console.error("[TokenRepo] Failed to verify refresh token:", error.message);
      return false;
    }
  },

  async deleteRefreshToken(userId, token) {
    try {
      const hash = hashToken(token);
      await redis.del(tokenKey(userId, hash));
    } catch (error) {
      console.error("[TokenRepo] Failed to delete refresh token:", error.message);
    }
  },

  async deleteAllRefreshTokens(userId) {
    try {
      const pattern = `refresh:${userId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("[TokenRepo] Failed to delete all refresh tokens:", error.message);
    }
  },
};
