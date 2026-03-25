import logger from "../lib/logger.js";

export function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      userId: req.userId || null,
    };

    if (res.statusCode >= 500) {
      logger.error(log, "request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(log, "request error");
    } else {
      logger.info(log, "request completed");
    }
  });

  next();
}
