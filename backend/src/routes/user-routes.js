// routes for user related endpoints
import { Router } from "express";
import { userController } from "../controllers/user-controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/me", auth, userController.getProfile);
router.get("/me/usage", auth, userController.getUsage);

export default router;
