// /api/v1/user routes
import { userService } from "../services/user-service.js";
import { rateLimitService } from "../services/ratelimit-service.js";
import { AppError } from "../utils/errors.js";

export const userController = {
  async getProfile(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const user = await userService.getProfile(req.userId);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUsage(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      const usage = await rateLimitService.getUsage(req.userId);
      return res.status(200).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      next(error);
    }
  },
};
