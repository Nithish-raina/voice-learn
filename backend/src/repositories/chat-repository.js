import { prisma } from "../lib/prisma-client.js";

export const chatRepository = {
  async createConversation(userId) {
    return prisma.chatConversation.create({
      data: { userId },
    });
  },

  async findConversations(userId, { page, limit }) {
    const [conversations, totalItems] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, role: true },
          },
        },
      }),
      prisma.chatConversation.count({ where: { userId } }),
    ]);

    return { conversations, totalItems };
  },

  async findConversationById(id) {
    return prisma.chatConversation.findUnique({ where: { id } });
  },

  async updateConversationTitle(id, title) {
    return prisma.chatConversation.update({ where: { id }, data: { title } });
  },

  async createMessage(data) {
    return prisma.chatMessage.create({ data });
  },

  async findMessages(conversationId, { page, limit }) {
    const [messages, totalItems] = await Promise.all([
      prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.chatMessage.count({ where: { conversationId } }),
    ]);

    return { messages, totalItems };
  },

  async getMessageCount(conversationId) {
    return prisma.chatMessage.count({ where: { conversationId } });
  },

  async getConversationCount(userId) {
    return prisma.chatConversation.count({ where: { userId } });
  },

  async getUserMessageCount(conversationId) {
    return prisma.chatMessage.count({
      where: { conversationId, role: "user" },
    });
  },
};
