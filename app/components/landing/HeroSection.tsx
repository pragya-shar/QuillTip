'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, PenTool } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70" />
      
      {/* Animated background circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Powered by Stellar Blockchain
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Where Your Words
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Earn Their Worth
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                A decentralized publishing platform where readers directly support writers 
                through microtips, making quality content sustainable.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Writing Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                Learn More
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100%</div>
                <div className="text-sm text-gray-600">Content<br />Ownership</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Instant</div>
                <div className="text-sm text-gray-600">Stellar<br />Payments</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Direct</div>
                <div className="text-sm text-gray-600">Reader<br />Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl overflow-hidden">
              {/* Mock editor interface */}
              <div className="absolute inset-4 bg-white rounded-2xl shadow-inner p-8">
                <div className="flex items-center gap-2 mb-6">
                  <PenTool className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-700">QuillTip Editor</span>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-3 bg-yellow-200 rounded w-2/3 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
                
                {/* Floating tip indicators */}
                <div className="absolute top-32 right-8 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
                  +0.5 XLM
                </div>
                <div className="absolute bottom-24 left-12 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-bounce" style={{ animationDelay: '1s' }}>
                  💬 Great insight!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}