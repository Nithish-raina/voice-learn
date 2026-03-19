// routes for dashboard related endpoints
import { Router } from "express";
import { dashboardController } from "../controllers/dashboard-controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/", auth, dashboardController.getDashboard);

export default router;
