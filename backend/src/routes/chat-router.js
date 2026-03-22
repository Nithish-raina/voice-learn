import { Router } from "express";
import { chatController } from "../controllers/chat-controller.js";
import { validate } from "../middlewares/validate.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/conversations", auth, chatController.listConversations);
router.post("/conversations", auth, chatController.createConversation);
router.get("/conversations/:id/messages", auth, chatController.getMessages);
router.post(
  "/conversations/:id/messages",
  auth,
  validate({ content: { required: true, minLength: 1 } }),
  chatController.sendMessage,
);

export default router;
