// /api/v1/auth routes
import { authService } from "../services/auth-service.js";
import { COOKIE_OPTIONS, CSRF_TTL } from "../utils/constants.js";

export const authController = {
  async signup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.signup({ name, email, password });

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
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

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
      next(error);
    }
  },

  async google(req, res, next) {
    try {
      const { code } = req.body;
      const result = await authService.googleAuth({ code });

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
      next(error);
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await authService.refresh(refreshToken);

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
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      await authService.logout(req.userId, refreshToken);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
      });

      return res.status(200).json({
        status: "success",
        data: {
          message: "Logged out",
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.userId);

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
      });

      return res.status(200).json({
        status: "success",
        data: {
          message: "Logged out from all devices",
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async csrfToken(req, res, next) {
    try {
      const token = await authService.generateCsrfToken();

      res.cookie("csrfToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: CSRF_TTL * 1000,
        path: "/",
      });

      return res.status(200).json({
        status: "success",
        data: { message: "CSRF token set" },
      });
    } catch (error) {
      next(error);
    }
  },
};
