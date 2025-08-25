import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare, hash } from 'bcryptjs'
import prisma from './prisma'

/**
 * Authentication Configuration
 * 
 * This file contains the NextAuth configuration and authentication utilities
 * for the QuillTip platform.
 */

// Salt rounds for bcrypt password hashing
const SALT_ROUNDS = 10

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * NextAuth configuration options with enhanced production reliability
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Invalid credentials')
          }

          // Add database connection retry logic
          let user;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              user = await prisma.user.findUnique({
                where: {
                  email: credentials.email
                }
              })
              break;
            } catch (dbError) {
              retryCount++;
              if (retryCount >= maxRetries) {
                console.error('Database connection failed during auth:', dbError)
                throw new Error('Authentication service temporarily unavailable')
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            }
          }

          if (!user || !user.hashedPassword) {
            throw new Error('Invalid credentials')
          }

          // Verify password
          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            throw new Error('Invalid credentials')
          }

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            image: user.avatar
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
    // Add error handling callback
    async signIn({ user }) {
      return !!user
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced error handling
  events: {
    async signIn({ user, isNewUser }) {
      console.log(`User ${user.email} signed in (new user: ${isNewUser})`)
    },
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.email}`)
    },
    async session({ session }) {
      // Session keepalive logging in development only
      if (process.env.NODE_ENV === 'development') {
        console.log(`Session active for: ${session?.user?.email}`)
      }
    }
  },
  
  // Production-specific settings
  ...(process.env.NODE_ENV === 'production' && {
    useSecureCookies: true,
    cookies: {
      sessionToken: {
        name: 'next-auth.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: true, // Require HTTPS in production
        },
      },
    },
  }),
}

