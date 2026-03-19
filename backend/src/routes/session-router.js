// routes for session related endpoints
import { Router } from "express";
import { sessionController } from "../controllers/session-controller.js";
import { validate } from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post(
  "/",
  auth,
  validate({
    topic: { required: true, minLength: 1, maxLength: 200 },
    subject: { required: true, minLength: 1 },
    difficulty: { required: true },
  }),
  sessionController.create,
);

router.get("/", auth, sessionController.list);

router.get("/:id", auth, sessionController.getById);

export default router;
