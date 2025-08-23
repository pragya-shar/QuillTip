'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { PenSquare, Home, User, LogOut, FileText, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function AppNavigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-blue">QuillTip</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            {/* Common links for all users */}
            <Link 
              href="/" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                isActive('/') ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              href="/articles" 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                isActive('/articles') ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Articles</span>
            </Link>
            
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/write" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive('/write') ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
                  }`}
                >
                  <PenSquare className="w-4 h-4" />
                  <span>Write</span>
                </Link>
                <Link 
                  href="/drafts" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    isActive('/drafts') ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Drafts</span>
                </Link>
                <Link 
                  href={`/${session.user?.email?.split('@')[0] || 'profile'}`} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    pathname.startsWith('/profile') ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-brand-blue transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}