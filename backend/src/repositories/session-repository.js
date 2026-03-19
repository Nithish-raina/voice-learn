// session repository for managing session data in the database
import { prisma } from "../lib/prisma-client.js";

export const sessionRepository = {
  async create(data) {
    return prisma.session.create({ data });
  },

  async findById(id) {
    return prisma.session.findUnique({
      where: { id },
      include: {
        flashcards: {
          where: { status: "active" },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async findByUserId(userId, { subject, search, sort, page, limit }) {
    const where = { userId };

    if (subject) {
      where.subject = subject;
    }

    if (search) {
      where.topic = { contains: search, mode: "insensitive" };
    }

    // Only show completed sessions in lists
    where.status = "completed";

    const orderBy = {};
    switch (sort) {
      case "score_desc":
        orderBy.score = "desc";
        break;
      case "score_asc":
        orderBy.score = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [sessions, totalItems] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          topic: true,
          subject: true,
          score: true,
          durationSeconds: true,
          createdAt: true,
        },
      }),
      prisma.session.count({ where }),
    ]);

    return { sessions, totalItems };
  },

  async update(id, data) {
    return prisma.session.update({ where: { id }, data });
  },

  async count(where) {
    return prisma.session.count({ where });
  },

  async aggregate(where) {
    return prisma.session.aggregate({
      where,
      _avg: { score: true },
      _sum: { durationSeconds: true },
      _count: true,
    });
  },

  async groupByDate(userId, days) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.session.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        status: "completed",
        createdAt: { gte: since },
      },
      _count: true,
    });
  },

  async getRecentByUserId(userId, limit) {
    return prisma.session.findMany({
      where: { userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        topic: true,
        subject: true,
        score: true,
        durationSeconds: true,
        createdAt: true,
      },
    });
  },

  async getDistinctTopicCount(userId) {
    const result = await prisma.session.findMany({
      where: { userId, status: "completed" },
      distinct: ["topic"],
      select: { topic: true },
    });
    return result.length;
  },

  async getTopicAttemptCounts(userId) {
    return prisma.session.groupBy({
      by: ["topic"],
      where: { userId, status: "completed" },
      _count: true,
      _max: { score: true },
    });
  },
};
