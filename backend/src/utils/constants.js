export const RATE_LIMITS = {
  maxSessionSeconds: 300,
  maxDailySeconds: 1800,
};

export const SM2_DEFAULTS = {
  easeFactor: 2.5,
  intervalDays: 1,
};

export const SESSION_STATUS = {
  RECORDING: "recording",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  ABANDONED: "abandoned",
};

export const FLASHCARD_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
};

export const JWT_CONFIG = {
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
};

export const CSRF_TTL = 24 * 60 * 60; // 1 day in seconds

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};
