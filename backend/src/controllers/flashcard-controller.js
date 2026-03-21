// /api/v1/flashcard routes
import { flashcardService } from "../services/flashcard-service.js";
import { AppError } from "../utils/errors.js";

export const flashcardController = {
  async list(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const { due, sessionId, status, page, limit } = req.query;

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
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const stats = await flashcardService.getStats(req.userId);

      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
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
      const result = await flashcardService.review(
        req.userId,
        req.params.id,
        rating,
      );

      return res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
