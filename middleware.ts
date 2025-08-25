import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // This function will only be called if authenticated
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to all routes for now
        return true
      },
    },
  }
)

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