'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, PenTool } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50" />
      
      {/* Static background decoration */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-slate-100 rounded-full filter blur-3xl opacity-30" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-100 rounded-full filter blur-3xl opacity-20" />
      
      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
              <Sparkles className="w-4 h-4 text-slate-900" />
              <span className="text-sm font-medium text-slate-900 tracking-wide uppercase">
                Powered by Stellar Blockchain
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="text-slate-900 font-light tracking-tight">
                  Write. Publish. Earn Instantly.
                </span>
              </h1>
              <p className="text-lg text-slate-600 font-light leading-relaxed max-w-xl">
                Readers tip writers directly on Stellar blockchain.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-lg text-base font-light tracking-wide hover:bg-slate-800 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Writing Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-2xl font-light text-slate-900">97.5%</div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="text-2xl font-light text-slate-900">3-5 sec</div>
              <div className="w-px h-6 bg-slate-300" />
              <div className="text-2xl font-light text-slate-900">$0.01+</div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative w-full h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Mock editor interface */}
              <div className="absolute inset-4 bg-white rounded-xl shadow-sm p-8">
                <div className="flex items-center gap-2 mb-6">
                  <PenTool className="w-5 h-5 text-slate-900" />
                  <span className="font-handwritten text-2xl text-slate-900">QuillTip Editor</span>
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-yellow-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-4/5" />
                </div>
                
                {/* Floating tip indicators */}
                <div className="absolute top-32 right-8 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs font-light tracking-wide">
                  +0.5 XLM
                </div>
                <div className="absolute bottom-24 left-12 bg-slate-800 text-white px-3 py-1.5 rounded-md text-xs font-light tracking-wide">
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