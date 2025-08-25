import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Enhanced health check for production diagnostics
export async function GET() {
  const startTime = Date.now()
  const healthData: any = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV,
    deployment: {
      vercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION || 'unknown',
    },
  }

  try {
    // Test database connection with timeout
    const dbStartTime = Date.now()
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout after 5s')), 5000)
      )
    ])
    const dbResponseTime = Date.now() - dbStartTime
    
    healthData.database = {
      status: 'Connected',
      responseTime: `${dbResponseTime}ms`,
    }

    // Test user table access
    try {
      const userCount = await prisma.user.count()
      healthData.database.userCount = userCount
    } catch (dbError) {
      healthData.database.tableAccess = 'Error accessing user table'
    }

  } catch (error) {
    console.error('Database health check failed:', error)
    healthData.status = 'ERROR'
    healthData.database = {
      status: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Environment variables check
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  healthData.environment_variables = {}
  requiredEnvVars.forEach(envVar => {
    healthData.environment_variables[envVar] = process.env[envVar] ? 'Set' : 'Missing'
  })

  // Check for missing critical env vars
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  if (missingEnvVars.length > 0) {
    healthData.status = 'WARNING'
    healthData.missing_env_vars = missingEnvVars
  }

  // Performance metrics
  healthData.performance = {
    totalResponseTime: `${Date.now() - startTime}ms`,
    memory: process.memoryUsage ? {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    } : 'Not available'
  }

  // Runtime information
  healthData.runtime = {
    node: process.version,
    platform: process.platform,
    uptime: `${Math.round(process.uptime())}s`,
  }

  const status = healthData.status === 'ERROR' ? 500 : 
                healthData.status === 'WARNING' ? 200 : 200

  return NextResponse.json(healthData, { status })
}

// Force dynamic rendering for health checks
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'