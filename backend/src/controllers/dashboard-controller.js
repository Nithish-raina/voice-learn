// /api/v1/dashboard routes
import { dashboardService } from "../services/dashboard-service.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export const dashboardController = {
  async getDashboard(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      logger.debug({ userId: req.userId }, "Get dashboard request");
      const data = await dashboardService.getDashboard(req.userId);

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Get dashboard failed");
      next(error);
    }
  },
};
