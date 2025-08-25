import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const errorData = await request.json()
    
    // Log the error with structured data
    console.error('Client-side error:', {
      ...errorData,
      serverTime: new Date().toISOString(),
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'referer': request.headers.get('referer'),
      }
    })

    // In production, you would send this to your monitoring service
    // Examples: Sentry, DataDog, LogRocket, etc.
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log client error:', error)
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'