// /api/v1/auth routes
import { authService } from "../services/auth-service.js";
import { COOKIE_OPTIONS, CSRF_TTL } from "../utils/constants.js";
import logger from "../lib/logger.js";

export const authController = {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      logger.info({ email }, "Signup request received");
      const result = await authService.signup({ name, email, password });
      logger.info({ userId: result.user.id, email }, "Signup successful");

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

      return res.status(201).json({
        status: "success",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      logger.warn({ email: req.body?.email, err: error }, "Signup failed");
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      logger.info({ email }, "Login request received");
      const result = await authService.login({ email, password });
      logger.info({ userId: result.user.id, email }, "Login successful");

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

      return res.status(200).json({
        status: "success",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      logger.warn({ email: req.body?.email, err: error }, "Login failed");
      next(error);
    }
  },

  async google(req, res, next) {
    try {
      logger.info("Google auth request received");
      const { code } = req.body;
      const result = await authService.googleAuth({ code });
      logger.info(
        { userId: result.user.id, isNewUser: result.isNewUser },
        "Google auth successful",
      );

      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

      return res.status(200).json({
        status: "success",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: 900,
          isNewUser: result.isNewUser,
        },
      });
    } catch (error) {
      logger.warn({ err: error }, "Google auth failed");
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      logger.debug("Token refresh request received");
      const result = await authService.refresh(refreshToken);
      logger.debug("Token refresh successful");

      // Set the rotated refresh token
      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

      return res.status(200).json({
        status: "success",
        data: {
          accessToken: result.accessToken,
          expiresIn: 900,
        },
      });
    } catch (error) {
      logger.warn({ err: error }, "Token refresh failed");
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const { userId } = req;
      logger.info({ userId }, "Logout request received");
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(userId, refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      logger.info({ userId }, "Logout successful");
      return res.status(200).json({
        status: "success",
        data: {
          message: "Logged out",
        },
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Logout failed");
      next(error);
    }
  },

  async logoutAll(req, res, next) {
    try {
      const { userId } = req;
      logger.info({ userId }, "Logout all devices request received");
      await authService.logoutAll(userId);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      logger.info({ userId }, "Logout all devices successful");
      return res.status(200).json({
        status: "success",
        data: {
          message: "Logged out from all devices",
        },
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Logout all failed");
      next(error);
    }
  },

  async csrfToken(req, res, next) {
    try {
      logger.debug("CSRF token request received");
      const token = await authService.generateCsrfToken();

      res.cookie("csrfToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: CSRF_TTL * 1000,
        path: "/",
      });

      return res.status(200).json({
        status: "success",
        data: { message: "CSRF token set" },
      });
    } catch (error) {
      logger.error({ err: error }, "CSRF token generation failed");
      next(error);
    }
  },
};
