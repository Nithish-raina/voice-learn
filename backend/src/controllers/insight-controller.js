// /api/v1/insight routes
import { insightService } from "../services/insight-service.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export const insightController = {
  async getInsights(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      logger.debug({ userId: req.userId }, "Get insights request");
      const data = await insightService.getInsights(req.userId);

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Get insights failed");
      next(error);
    }
  },
};
