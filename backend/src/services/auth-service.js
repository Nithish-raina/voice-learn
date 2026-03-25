// auth service for handling business logic related to authentication
import crypto from "crypto";
import { userRepository } from "../repositories/user-repository.js";
import { tokenRepository } from "../repositories/token-repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import logger from "../lib/logger.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import { redis } from "../lib/redis-client.js";
import { csrfKey } from "../middlewares/csrf.js";
import { CSRF_TTL } from "../utils/constants.js";

import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

export const authService = {
  async signup({ name, email, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "EMAIL_EXISTS",
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      name,
      email,
      passwordHash,
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await tokenRepository.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(
        "Email or password is incorrect",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    if (!user.passwordHash) {
      throw new AppError(
        "This account uses Google sign-in",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(
        "Email or password is incorrect",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await tokenRepository.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
    };
  },

  async googleAuth({ code }) {
    let googleUser;

    try {
      // Exchange auth code for tokens
      const { tokens } = await googleClient.getToken({
        code,
        redirect_uri:
          process.env.GOOGLE_REDIRECT_URI ||
          "http://localhost:5173/auth/google/callback",
      });

      // Verify the ID token to get user info
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      googleUser = ticket.getPayload();
    } catch (error) {
      throw new AppError(
        "Failed to verify Google credentials",
        401,
        "GOOGLE_AUTH_FAILED",
      );
    }

    const { sub: googleId, email, name, picture } = googleUser;

    // Check if user already exists with this Google ID
    let user = await userRepository.findByGoogleId(googleId);
    let isNewUser = false;

    if (!user) {
      // Check if email exists but with password auth
      const existingByEmail = await userRepository.findByEmail(email);

      if (existingByEmail) {
        // Link Google account to existing email account
        user = await userRepository.update(existingByEmail.id, { googleId });
      } else {
        // Create brand new user
        user = await userRepository.create({
          name: name || email.split("@")[0],
          email,
          googleId,
        });
        isNewUser = true;
      }
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await tokenRepository.storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
      refreshToken,
      isNewUser,
    };
  },

  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new AppError(
        "Refresh token is required",
        401,
        "REFRESH_TOKEN_MISSING",
      );
    }

    const decoded = verifyRefreshToken(oldRefreshToken);

    // Verify token exists in Redis (not revoked)
    const isValid = await tokenRepository.verifyRefreshToken(
      decoded.userId,
      oldRefreshToken,
    );
    if (!isValid) {
      throw new AppError("Refresh token has been revoked", 401, "TOKEN_REVOKED");
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new AppError("User not found", 401, "INVALID_TOKEN");
    }

    // Rotate: delete old token, issue new one
    await tokenRepository.deleteRefreshToken(decoded.userId, oldRefreshToken);

    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await tokenRepository.storeRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await tokenRepository.deleteRefreshToken(userId, refreshToken);
    }
  },

  async logoutAll(userId) {
    await tokenRepository.deleteAllRefreshTokens(userId);
  },

  async generateCsrfToken() {
    const token = crypto.randomBytes(32).toString("hex");
    try {
      await redis.set(csrfKey(token), "1", "EX", CSRF_TTL);
    } catch (error) {
      logger.error({ err: error }, "Failed to store CSRF token");
      throw new AppError("Unable to complete the request. Please try again.", 500, "CSRF_STORE_FAILED");
    }
    return token;
  },
};
