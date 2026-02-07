import { PrismaClient } from '@prisma/client'
import { initializeDatabase } from './db-init'

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient
  dbInitialized: boolean
}

// Initialize Prisma Client
// Prisma 5 reads datasource URL from schema.prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Initialize database tables on first connection
if (!globalForPrisma.dbInitialized) {
  initializeDatabase()
    .then(() => {
      globalForPrisma.dbInitialized = true
    })
    .catch((error) => {
      console.error('[PRISMA] Failed to initialize database:', error)
    })
}
