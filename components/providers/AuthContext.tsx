'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import type { User } from 'next-auth'

/**
 * Auth Context
 * 
 * Provides authentication state and methods throughout the application.
 * Integrates with NextAuth to manage user sessions and authentication status.
 */

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession()

  const signOut = async () => {
    await nextAuthSignOut({ callbackUrl: '/' })
  }

  const value: AuthContextType = {
    user: session?.user ? {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email!,
      name: session.user.name || null,
      image: session.user.image || null
    } : null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}