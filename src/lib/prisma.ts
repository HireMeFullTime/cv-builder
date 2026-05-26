import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prismaNew: PrismaClient };

const createPrismaClient = () => {
  console.log("Initializing Prisma Client... Cache busted!");
  const adapter = new PrismaPg({
    connectionString: process.env.PRISMA_DATABASE_URL!
  });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prismaNew || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaNew = prisma;