'use client'

import { useSession } from 'next-auth/react'
import Navigation from '@/components/landing/Navigation';
import AppNavigation from '@/components/layout/AppNavigation';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { PenSquare, BookOpen, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavigation />
        <div className="pt-24 pb-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user?.name || session.user?.email}
              </h1>
              <p className="text-gray-600">Ready to write your next story?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Link href="/write" className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <PenSquare className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Write Article</h3>
                </div>
                <p className="text-gray-600">Create a new story with our powerful editor</p>
              </Link>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">My Articles</h3>
                </div>
                <p className="text-gray-600">View and manage your published content</p>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold ml-3">Analytics</h3>
                </div>
                <p className="text-gray-600">Track your article performance</p>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}