// auth specific middlewares
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    logger.warn({ path: req.originalUrl }, "Missing or malformed access token");
    throw new AppError("Access token is required", 401, "UNAUTHORIZED");
  }

  const token = header.split(" ")[1];
  const decoded = verifyAccessToken(token);
  req.userId = decoded.userId;
  logger.debug({ userId: decoded.userId, path: req.originalUrl }, "Auth token verified");
  next();
}
