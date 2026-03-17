// routes for auth related endpoints
import { Router } from "express";
import { authController } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post(
  "/signup",
  validate({
    name: { required: true, minLength: 1, maxLength: 100 },
    email: { required: true, type: "email" },
    password: { required: true, minLength: 8, maxLength: 128 },
  }),
  authController.signup,
);

router.post(
  "/login",
  validate({
    email: { required: true, type: "email" },
    password: { required: true },
  }),
  authController.login,
);

router.post(
  "/google",
  validate({
    code: { required: true },
  }),
  authController.google,
);

router.post("/refresh", authController.refresh);

router.post("/logout", auth, authController.logout);

export default router;
