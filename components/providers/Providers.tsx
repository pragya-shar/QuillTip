'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from './AuthContext'

/**
 * Providers Component
 * 
 * Wraps the application with all necessary providers for authentication
 * and session management. This ensures proper session persistence and
 * auth state management throughout the app.
 */

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}