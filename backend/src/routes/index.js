// base routes file
import { Router } from "express";
import authRouter from "./auth-router.js";
import userRouter from "./user-routes.js";
import sessionRouter from "./session-router.js";
import dashboardRouter from "./dashboard-router.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/dashboard", dashboardRouter);

export default router;
