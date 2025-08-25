import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()
    
    // Log error details for monitoring
    console.error('Client Error Report:', {
      timestamp: new Date().toISOString(),
      error: errorData.error,
      stack: errorData.stack,
      digest: errorData.digest,
      url: errorData.url,
      userAgent: errorData.userAgent,
      serverTimestamp: errorData.timestamp,
    })
    
    // In production, you could send this to external monitoring services like:
    // - Sentry
    // - DataDog
    // - LogRocket
    // - Custom logging service
    
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with external error monitoring service
      // Example: await sendToSentry(errorData)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully' 
    }, { 
      status: 200 
    })
  } catch (error) {
    console.error('Failed to log client error:', error)
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to log error' 
    }, { 
      status: 500 
    })
  }
}

// Export runtime configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'