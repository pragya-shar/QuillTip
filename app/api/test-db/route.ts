import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic database connectivity
    const userCount = await prisma.user.count()
    
    // Get sample users to verify data
    const sampleUsers = await prisma.user.findMany({
      take: 5,
      select: {
        username: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ 
      status: 'connected', 
      userCount,
      sampleUsers,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
      }
    })
  } catch (error) {
    console.error('[Test-DB] Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        dbUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0
      }
    }, { status: 500 })
  }
}