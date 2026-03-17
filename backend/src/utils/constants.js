export const RATE_LIMITS = {
  maxSessionSeconds: 600,
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
