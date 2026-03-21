// routes for insights related endpoints
import { Router } from "express";
import { insightController } from "../controllers/insight-controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/", auth, insightController.getInsights);

export default router;
