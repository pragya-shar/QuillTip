import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

/**
 * Prisma Client Singleton with Enhanced Production Support
 * 
 * This ensures we don't create multiple database connections during development
 * with hot reloading. In production, we'll create optimized connections for serverless.
 * 
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : process.env.NODE_ENV === 'production' 
        ? ['error'] 
        : ['error', 'warn'],
    
    // Optimized for serverless environments
    transactionOptions: {
      timeout: process.env.NODE_ENV === 'production' ? 10000 : 15000, // Shorter timeout for serverless
      maxWait: process.env.NODE_ENV === 'production' ? 5000 : 10000,
    },
    
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Additional connection configuration for production reliability
    ...(process.env.NODE_ENV === 'production' && {
      errorFormat: 'minimal',
    }),
  })

  // Add connection error handling
  client.$connect().catch((error) => {
    console.error('Failed to connect to database:', error)
  })

  return client
}

export const prisma = global.prisma || createPrismaClient()

// Enhanced connection management for production
if (process.env.NODE_ENV === 'production') {
  // In production, we want to reuse the connection
  if (!global.prisma) {
    global.prisma = prisma
  }
} else {
  // In development, store the client globally to prevent multiple instances
  global.prisma = prisma
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

export default prisma