// routes for auth related endpoints
import { Router } from "express";
import { authController } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";
import { csrf } from "../middlewares/csrf.js";

const router = Router();

router.get("/csrf-token", authController.csrfToken);

router.post(
  "/signup",
  csrf,
  validate({
    name: { required: true, minLength: 1, maxLength: 100 },
    email: { required: true, type: "email" },
    password: { required: true, minLength: 8, maxLength: 128 },
  }),
  authController.signup,
);

router.post(
  "/login",
  csrf,
  validate({
    email: { required: true, type: "email" },
    password: { required: true },
  }),
  authController.login,
);

router.post(
  "/google",
  csrf,
  validate({
    code: { required: true },
  }),
  authController.google,
);

router.post("/refresh", authController.refresh);

router.post("/logout", auth, authController.logout);

router.post("/logout-all", auth, authController.logoutAll);

export default router;
