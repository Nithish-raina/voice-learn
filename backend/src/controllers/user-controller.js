// /api/v1/user routes
import { userService } from "../services/user-service.js";
import { rateLimitService } from "../services/ratelimit-service.js";
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export const userController = {
  async getProfile(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      logger.debug({ userId: req.userId }, "Get profile request");
      const user = await userService.getProfile(req.userId);
      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Get profile failed");
      next(error);
    }
  },

  async getUsage(req, res, next) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401, "UNAUTHORIZED");
      }

      logger.debug({ userId: req.userId }, "Get usage request");
      const usage = await rateLimitService.getUsage(req.userId);
      return res.status(200).json({
        status: "success",
        data: usage,
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Get usage failed");
      next(error);
    }
  },
};
