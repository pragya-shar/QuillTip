'use client'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { WalletProvider } from './WalletProvider'
import { Toaster } from '@/components/ui/sonner'

/**
 * Global Providers
 *
 * Wraps the application with ConvexAuthProvider for authentication,
 * Convex database access, and Stellar wallet connection.
 * Provides real-time subscriptions and type-safe queries throughout the app.
 */

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ConvexAuthProvider client={convex}>
      <WalletProvider>
        {children}
        <Toaster />
      </WalletProvider>
    </ConvexAuthProvider>
  )
}