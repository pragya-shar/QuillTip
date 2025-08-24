import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/health') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle dynamic routes for Vercel deployment
  const segments = pathname.split('/').filter(Boolean)
  
  if (segments.length === 1) {
    // Single segment: /username -> profile page
    const username = segments[0]
    
    if (!username) {
      return NextResponse.next()
    }
    
    // Skip if it's a known static route
    if (['login', 'register', 'dashboard', 'create', 'settings', 'about'].includes(username.toLowerCase())) {
      return NextResponse.next()
    }
    
    // For Vercel, ensure proper headers for dynamic routes
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('X-Vercel-Dynamic-Route', 'username')
    response.headers.set('X-Username', username)
    response.headers.set('Vary', 'Accept-Encoding')
    
    return response
  }
  
  if (segments.length === 2) {
    // Two segments: /username/slug -> article page
    const [username, slug] = segments
    
    if (!username || !slug) {
      return NextResponse.next()
    }
    
    // Skip if first segment is a known static route
    if (['api', '_next', 'dashboard'].includes(username.toLowerCase())) {
      return NextResponse.next()
    }
    
    // For Vercel, ensure proper headers for dynamic routes
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('X-Accel-Buffering', 'no') // Disable nginx buffering
    response.headers.set('X-Vercel-Dynamic-Route', 'username-slug')
    response.headers.set('X-Username', username)
    response.headers.set('X-Slug', slug)
    response.headers.set('Vary', 'Accept-Encoding')
    
    return response
  }
  
  // Let other routes pass through
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
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}