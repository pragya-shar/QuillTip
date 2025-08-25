import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip processing for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }
  
  // Handle dynamic article routes (username/slug pattern)
  if (pathname.match(/^\/[^\/]+\/[^\/]+$/)) {
    const response = NextResponse.next()
    
    // Add headers for better caching and performance
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    response.headers.set('X-Route-Type', 'dynamic-article')
    
    return response
  }
  
  // Handle profile routes (username only)
  if (pathname.match(/^\/[^\/]+$/)) {
    const response = NextResponse.next()
    
    // Add headers for profile pages
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
    response.headers.set('X-Route-Type', 'user-profile')
    
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
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}