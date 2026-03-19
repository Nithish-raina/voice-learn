import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "./constants.js";

const SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
if (!REFRESH_SECRET) {
  throw new Error(
    "JWT_REFRESH_SECRET environment variable is required. Do not reuse JWT_SECRET.",
  );
}

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, SECRET, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: JWT_CONFIG.refreshTokenExpiry,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}
