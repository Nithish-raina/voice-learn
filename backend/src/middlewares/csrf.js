// CSRF protection middleware — verifies token from httpOnly cookie exists in Redis
import { redis } from "../lib/redis-client.js";
import { AppError } from "../utils/errors.js";
import { CSRF_TTL } from "../utils/constants.js";
import logger from "../lib/logger.js";

export function csrfKey(token) {
  return `csrf:${token}`;
}

export async function csrf(req, res, next) {
  try {
    const token = req.cookies?.csrfToken;

    if (!token) {
      logger.warn({ path: req.originalUrl }, "CSRF token missing");
      throw new AppError("CSRF token missing", 403, "CSRF_MISSING");
    }

    const exists = await redis.exists(csrfKey(token));
    if (!exists) {
      logger.warn({ path: req.originalUrl }, "CSRF token invalid or expired");
      throw new AppError("CSRF token invalid or expired", 403, "CSRF_INVALID");
    }

    logger.debug({ path: req.originalUrl }, "CSRF token verified");
    next();
  } catch (error) {
    next(error);
  }
}
