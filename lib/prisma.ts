import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient
}

// Initialize Prisma Client
// Prisma works directly with MySQL through the DATABASE_URL without needing an adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
