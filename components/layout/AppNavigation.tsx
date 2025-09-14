'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthContext'
import { PenSquare, Home, User, LogOut, FileText, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { WalletConnectButton } from '@/components/stellar'

export default function AppNavigation() {
  const { user, isAuthenticated, signOut } = useAuth()
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
            
            {isAuthenticated ? (
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
                  href={`/${user?.username || 'profile'}`} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    pathname === `/${user?.username}` ? 'bg-gray-100 text-brand-blue' : 'text-gray-600 hover:text-brand-blue'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <div className="border-r border-gray-200 h-8 mx-2" />
                <WalletConnectButton size="sm" variant="outline" />
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <WalletConnectButton size="sm" variant="outline" />
                <div className="border-r border-gray-200 h-8 mx-2" />
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