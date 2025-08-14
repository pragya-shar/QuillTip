import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Prisma Client Singleton
 * 
 * This ensures we don't create multiple database connections during development
 * with hot reloading. In production, we'll always create a new PrismaClient.
 * 
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma