// /api/v1/dashboard routes
import { dashboardService } from "../services/dashboard-service.js";

export const dashboardController = {
  async getDashboard(req, res, next) {
    try {
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
