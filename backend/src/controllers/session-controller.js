// /api/v1/session routes
import { sessionService } from "../services/session-service.js";
import { rateLimitService } from "../services/ratelimit-service.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export const sessionController = {
  async create(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const { topic, subject, difficulty } = req.body;
      logger.info({ userId: req.userId, topic, subject, difficulty }, "Session create request received");

      if (!topic || !subject) {
        throw new AppError(
          "Topic and subject are required",
          400,
          "MISSING_FIELDS",
        );
      }

      // Check rate limits
      const { maxRecordingSeconds } = await rateLimitService.checkLimits(
        req.userId,
      );
      logger.debug({ userId: req.userId, maxRecordingSeconds }, "Rate limit check passed");

      // Create session
      const result = await sessionService.create(req.userId, {
        topic,
        subject,
        difficulty,
      });

      logger.info({ userId: req.userId, sessionId: result.sessionId, topic }, "Session created");
      return res.status(201).json({
        status: "success",
        data: {
          sessionId: result.sessionId,
          maxRecordingSeconds,
          websocketUrl: result.websocketUrl,
        },
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Session create failed");
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      if (!req.params.id) {
        throw new AppError("Session ID is required", 400, "MISSING_SESSION_ID");
      }

      logger.debug({ userId: req.userId, sessionId: req.params.id }, "Session getById request");
      const session = await sessionService.getById(req.userId, req.params.id);

      return res.status(200).json({
        status: "success",
        data: session,
      });
    } catch (error) {
      logger.error({ userId: req.userId, sessionId: req.params?.id, err: error }, "Session getById failed");
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const { subject, search, sort, page, limit } = req.query;
      logger.debug({ userId: req.userId, subject, search, sort, page, limit }, "Session list request");

      // Validate pagination parameters
      if (page) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
          throw new AppError(
            "Page must be a positive integer",
            400,
            "INVALID_PAGE_NUMBER",
          );
        }
      }

      if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
          throw new AppError(
            "Limit must be between 1 and 50",
            400,
            "INVALID_LIMIT_NUMBER",
          );
        }
      }

      const result = await sessionService.list(req.userId, {
        subject,
        search,
        sort,
        page,
        limit,
      });

      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Session list failed");
      next(error);
    }
  },
};
