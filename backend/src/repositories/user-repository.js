// user repository for managing user data in the database
import { prisma } from "../lib/prisma-client.js";

export const userRepository = {
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByGoogleId(googleId) {
    return prisma.user.findUnique({ where: { googleId } });
  },

  async create(data) {
    return prisma.user.create({ data });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },
};
