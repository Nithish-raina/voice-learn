// global error handler middleware
import { AppError } from "../utils/errors.js";
import logger from "../lib/logger.js";

export function errorHandler(err, req, res, next) {
  // Prisma unique constraint violation
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return res.status(409).json({
      status: "error",
      error: {
        code: "DUPLICATE_ENTRY",
        message: `A record with this ${field} already exists`,
      },
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      status: "error",
      error: {
        code: "NOT_FOUND",
        message: "Record not found",
      },
    });
  }

  // Our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token",
      },
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token has expired",
      },
    });
  }

  // Unknown errors
  logger.error({ err }, "Unhandled error");
  return res.status(500).json({
    status: "error",
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
}
