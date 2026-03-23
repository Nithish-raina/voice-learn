// rag index jobs repository for managing RAG index jobs in the database
import { prisma } from "../lib/prisma-client.js";

export const ragIndexJobsRepository = {
  async create(data) {
    return prisma.ragIndexJob.create({ data });
  },

  async update(id, data) {
    return prisma.ragIndexJob.update({ where: { id }, data });
  },

  async findBySessionId(sessionId) {
    return prisma.ragIndexJob.findUnique({ where: { sessionId } });
  },
};
