'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import AppNavigation from '@/components/layout/AppNavigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Profile page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-brand-cream">
      <AppNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an error while loading this profile.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-brand-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
            
            <Link
              href="/"
              className="bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go home
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-gray-600">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </main>
    </div>
  )
}