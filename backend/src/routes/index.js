// base routes file
import { Router } from "express";
import authRouter from "./auth-router.js";
import userRouter from "./user-routes.js";
import sessionRouter from "./session-router.js";
import dashboardRouter from "./dashboard-router.js";
import flashcardRouter from "./flashcard-router.js";
import insightRouter from "./insights-router.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/sessions", sessionRouter);
router.use("/dashboard", dashboardRouter);
router.use("/flashcards", flashcardRouter);
router.use("/insights", insightRouter);

export default router;
