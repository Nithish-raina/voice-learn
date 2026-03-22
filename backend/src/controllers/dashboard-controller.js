// /api/v1/dashboard routes
import { dashboardService } from "../services/dashboard-service.js";
import { AppError } from "../utils/errors.js";

export const dashboardController = {
  async getDashboard(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const data = await dashboardService.getDashboard(req.userId);

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
