// service for handling business logic related to rate limiting
import { cacheRepository } from "../repositories/cache-repository.js";
import { RATE_LIMITS } from "../utils/constants.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

export const rateLimitService = {
  async getUsage(userId) {
    const key = `ratelimit:${userId}:daily`;
    const used = await cacheRepository.get(key);
    const usedSeconds = parseInt(used) || 0;
    const remaining = Math.max(0, RATE_LIMITS.maxDailySeconds - usedSeconds);

    logger.debug({ userId, usedSeconds, remaining }, "Usage retrieved");
    return {
      dailyLimitSeconds: RATE_LIMITS.maxDailySeconds,
      dailyUsedSeconds: usedSeconds,
      dailyRemainingSeconds: remaining,
      perSessionLimitSeconds: RATE_LIMITS.maxSessionSeconds,
      canRecord: remaining > 0,
    };
  },

  async checkLimits(userId) {
    const usage = await this.getUsage(userId);

    if (!usage.canRecord) {
      logger.warn({ userId, usedSeconds: usage.dailyUsedSeconds }, "Daily recording limit reached");
      throw new AppError(
        "You have used your daily recording limit. Resets at midnight.",
        429,
        "DAILY_LIMIT_REACHED",
      );
    }

    const maxRecordingSeconds = Math.min(
      RATE_LIMITS.maxSessionSeconds,
      usage.dailyRemainingSeconds,
    );

    if (maxRecordingSeconds <= 0) {
      logger.warn({ userId }, "Insufficient recording time remaining");
      throw new AppError(
        "Not enough recording time remaining. Resets at midnight.",
        429,
        "INSUFFICIENT_TIME",
      );
    }

    return { maxRecordingSeconds };
  },

  async recordUsage(userId, durationSeconds) {
    const key = `ratelimit:${userId}:daily`;
    const exists = await cacheRepository.get(key);

    if (exists === null) {
      const ttl = getSecondsUntilMidnight();
      await cacheRepository.setWithTTL(key, durationSeconds, ttl);
    } else {
      await cacheRepository.incrby(key, durationSeconds);
    }
    logger.info({ userId, durationSeconds }, "Usage recorded");
  },
};
