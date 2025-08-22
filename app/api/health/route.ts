import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test database connection with timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ])
    
    // Test Prisma client version
    const userCount = await prisma.user.count()
    const articleCount = await prisma.article.count()
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        status: 'Connected',
        users: userCount,
        articles: articleCount,
        testQuery: 'Success'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Missing',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
        DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      },
      deployment: {
        vercel: process.env.VERCEL ? 'Yes' : 'No',
        region: process.env.VERCEL_REGION || 'Unknown',
        deployment_url: process.env.VERCEL_URL || 'Unknown'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        status: 'Disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Missing',
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
        DIRECT_URL: process.env.DIRECT_URL ? 'Set' : 'Missing',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing',
      },
      deployment: {
        vercel: process.env.VERCEL ? 'Yes' : 'No',
        region: process.env.VERCEL_REGION || 'Unknown',
        deployment_url: process.env.VERCEL_URL || 'Unknown'
      }
    }, { status: 500 })
  }
}