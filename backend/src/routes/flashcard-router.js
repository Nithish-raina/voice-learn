// routes for flashcard related endpoints
import { Router } from "express";
import { flashcardController } from "../controllers/flashcard-controller.js";
import { validate } from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/", auth, flashcardController.list);

router.get("/stats", auth, flashcardController.getStats);

router.patch(
  "/:id/review",
  auth,
  validate({
    rating: { required: true },
  }),
  flashcardController.review,
);

export default router;
