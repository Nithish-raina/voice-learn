// /api/v1/insight routes
import { insightService } from "../services/insight-service.js";

export const insightController = {
  async getInsights(req, res, next) {
    try {
      const data = await insightService.getInsights(req.userId);

      return res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
