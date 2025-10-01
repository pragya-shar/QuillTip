'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { Value } from 'convex/values'
import { api } from '@/convex/_generated/api'

/**
 * Custom hook for Convex authentication
 * 
 * Provides authentication state and methods using Convex Auth.
 * Integrates with Convex backend for user management and sessions.
 */

export interface User {
  _id: string
  username?: string
  email?: string
  name?: string | null
  image?: string | null
  isEmailVerified?: boolean
  phone?: string
  isAnonymous?: boolean
  stellarAddress?: string | null
  bio?: string
  avatar?: string
  nftsCreated?: number
  nftsOwned?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (provider: string, params?: FormData | Record<string, Value>) => Promise<{ signingIn: boolean, redirect?: URL }>
  signOut: () => Promise<void>
}

/**
 * Custom hook to access Convex auth
 * Uses Convex Auth hooks for authentication state and actions
 */
export function useAuth(): AuthContextType {
  const { signIn, signOut } = useAuthActions()
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser)
  
  // Loading is true if auth is loading or if we're authenticated but user data is still loading
  const isLoading = authLoading || (isAuthenticated && user === undefined)
  
  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    signIn,
    signOut
  }
}