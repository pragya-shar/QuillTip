import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * NextAuth Route Handler
 * 
 * This file exports the NextAuth handler for both GET and POST requests.
 * The configuration is imported from lib/auth.ts to keep it centralized.
 */

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }