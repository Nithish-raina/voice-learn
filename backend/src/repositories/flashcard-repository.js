import { prisma } from "../lib/prisma-client.js";

export const flashcardRepository = {
  async createMany(data) {
    return prisma.flashcard.createMany({ data });
  },

  async findById(id) {
    return prisma.flashcard.findUnique({ where: { id } });
  },

  async findByUserId(userId, { due, sessionId, status, page, limit }) {
    const where = { userId };

    if (due) {
      where.nextReviewAt = { lte: new Date() };
      where.status = "active";
    }

    if (sessionId) {
      where.sessionId = sessionId;
    }

    if (status) {
      where.status = status;
    } else if (!due) {
      where.status = "active";
    }

    const [flashcards, totalItems] = await Promise.all([
      prisma.flashcard.findMany({
        where,
        orderBy: { createdAt: "asc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          session: {
            select: { topic: true },
          },
        },
      }),
      prisma.flashcard.count({ where }),
    ]);

    return { flashcards, totalItems };
  },

  async findBySessionId(sessionId) {
    return prisma.flashcard.findMany({
      where: { sessionId, status: "active" },
      orderBy: { createdAt: "asc" },
    });
  },

  async update(id, data) {
    return prisma.flashcard.update({ where: { id }, data });
  },

  async countDue(userId) {
    return prisma.flashcard.count({
      where: {
        userId,
        status: "active",
        nextReviewAt: { lte: new Date() },
      },
    });
  },

  async countUpcoming(userId) {
    return prisma.flashcard.count({
      where: {
        userId,
        status: "active",
        nextReviewAt: { gt: new Date() },
        intervalDays: { lt: 30 },
      },
    });
  },

  async countMastered(userId) {
    return prisma.flashcard.count({
      where: {
        userId,
        status: "active",
        intervalDays: { gte: 30 },
      },
    });
  },

  async countTotal(userId) {
    return prisma.flashcard.count({
      where: { userId, status: "active" },
    });
  },
};
