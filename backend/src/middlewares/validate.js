import { AppError } from "../utils/errors.js";

export function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, checks] of Object.entries(rules)) {
      const value = req.body[field];

      if (
        checks.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }

      if (value === undefined || value === null) continue;

      if (checks.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({ field, message: "Invalid email format" });
        }
      }

      if (checks.minLength && value.length < checks.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${checks.minLength} characters`,
        });
      }

      if (checks.maxLength && value.length > checks.maxLength) {
        errors.push({
          field,
          message: `${field} must be at most ${checks.maxLength} characters`,
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: errors,
        },
      });
    }

    next();
  };
}
