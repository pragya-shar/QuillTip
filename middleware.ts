import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle dynamic article routes with proper headers
  if (pathname.match(/^\/[^\/]+\/[^\/]+$/)) {
    const response = NextResponse.next()
    
    // Add headers to improve RSC streaming reliability
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('X-Accel-Buffering', 'no') // Disable nginx buffering
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}