'use client'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'

/**
 * Convex Client Provider
 * 
 * Wraps the application with ConvexAuthProvider for authentication
 * and Convex database access. Provides real-time subscriptions and
 * type-safe queries throughout the app.
 */

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  )
}