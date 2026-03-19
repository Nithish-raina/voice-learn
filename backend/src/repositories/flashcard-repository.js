// flashcard repository for managing flashcard data in the database
import { prisma } from "../lib/prisma-client.js";

export const flashcardRepository = {
  async countDue(userId) {
    return prisma.flashcard.count({
      where: {
        userId,
        status: "active",
        nextReviewAt: { lte: new Date() },
      },
    });
  },

  async countTotal(userId) {
    return prisma.flashcard.count({
      where: { userId, status: "active" },
    });
  },
};
