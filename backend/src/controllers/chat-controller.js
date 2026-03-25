import { chatService } from "../services/chat-service.js";
import logger from "../lib/logger.js";

export const chatController = {
  async listConversations(req, res, next) {
    try {
      const { page, limit } = req.query;
      logger.debug({ userId: req.userId, page, limit }, "List conversations request");
      const result = await chatService.listConversations(req.userId, {
        page,
        limit,
      });
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "List conversations failed");
      next(error);
    }
  },

  async createConversation(req, res, next) {
    try {
      logger.info({ userId: req.userId }, "Create conversation request");
      const conversation = await chatService.createConversation(req.userId);
      logger.info({ userId: req.userId, conversationId: conversation.id }, "Conversation created");
      return res.status(201).json({
        status: "success",
        data: {
          id: conversation.id,
          title: null,
          createdAt: conversation.createdAt,
        },
      });
    } catch (error) {
      logger.error({ userId: req.userId, err: error }, "Create conversation failed");
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { page, limit } = req.query;
      const conversationId = req.params.id;
      logger.debug({ userId: req.userId, conversationId, page, limit }, "Get messages request");
      const result = await chatService.getMessages(req.userId, conversationId, {
        page,
        limit,
      });
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      logger.error({ userId: req.userId, conversationId: req.params?.id, err: error }, "Get messages failed");
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { content } = req.body;
      const conversationId = req.params.id;
      logger.info({ userId: req.userId, conversationId, contentLength: content?.length }, "Send message request");
      const result = await chatService.sendMessage(
        req.userId,
        conversationId,
        content,
      );
      logger.info({ userId: req.userId, conversationId, hasSources: !!result.assistantMessage.sources }, "Message sent successfully");
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      logger.error({ userId: req.userId, conversationId: req.params?.id, err: error }, "Send message failed");
      next(error);
    }
  },
};
