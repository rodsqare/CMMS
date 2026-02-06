import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient
}

// Initialize Prisma Client
// Prisma 7 reads datasource configuration from prisma.config.ts automatically
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
