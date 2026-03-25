// /api/v1/flashcard routes
import { flashcardService } from "../services/flashcard-service.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export const flashcardController = {
  async list(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const { due, sessionId, status, page, limit } = req.query;
      logger.debug({ userId: req.userId, due, sessionId, status, page, limit }, "Flashcard list request");

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

      if (status && !["active", "archived"].includes(status)) {
        throw new AppError(
          "Status must be one of: active, archived",
          400,
          "INVALID_STATUS",
        );
      }

      const result = await flashcardService.list(req.userId, {
        due,
        sessionId,
        status,
        page,
        limit,
      });

      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Flashcard list failed");
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      logger.debug({ userId: req.userId }, "Flashcard stats request");
      const stats = await flashcardService.getStats(req.userId);

      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Flashcard stats failed");
      next(error);
    }
  },

  async review(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      if (!req.params.id) {
        throw new AppError(
          "Flashcard ID is required",
          400,
          "MISSING_FLASHCARD_ID",
        );
      }

      const { rating } = req.body;
      const flashcardId = req.params.id;
      logger.info({ userId: req.userId, flashcardId, rating }, "Flashcard review request");

      const result = await flashcardService.review(
        req.userId,
        flashcardId,
        rating,
      );

      logger.info({ userId: req.userId, flashcardId, nextReviewAt: result.nextReviewAt, intervalDays: result.intervalDays }, "Flashcard reviewed");
      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error({ userId: req.userId, flashcardId: req.params?.id, err: error }, "Flashcard review failed");
      next(error);
    }
  },
};
