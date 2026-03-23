import { chatService } from "../services/chat-service.js";

export const chatController = {
  async listConversations(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await chatService.listConversations(req.userId, {
        page,
        limit,
      });
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async createConversation(req, res, next) {
    try {
      const conversation = await chatService.createConversation(req.userId);
      return res.status(201).json({
        status: "success",
        data: {
          id: conversation.id,
          title: null,
          createdAt: conversation.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await chatService.getMessages(req.userId, req.params.id, {
        page,
        limit,
      });
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { content } = req.body;
      const result = await chatService.sendMessage(
        req.userId,
        req.params.id,
        content,
      );
      return res.status(200).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },
};
