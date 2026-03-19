// CSRF protection middleware — verifies token from httpOnly cookie exists in Redis
import { redis } from "../lib/redis-client.js";
import { AppError } from "../utils/errors.js";
import { CSRF_TTL } from "../utils/constants.js";

export function csrfKey(token) {
  return `csrf:${token}`;
}

export async function csrf(req, res, next) {
  try {
    const token = req.cookies?.csrfToken;

    if (!token) {
      throw new AppError("CSRF token missing", 403, "CSRF_MISSING");
    }

    const exists = await redis.exists(csrfKey(token));
    if (!exists) {
      throw new AppError("CSRF token invalid or expired", 403, "CSRF_INVALID");
    }

    next();
  } catch (error) {
    next(error);
  }
}
