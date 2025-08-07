'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Edit3, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span className="text-sm font-medium text-brand-blue">
              Powered by Stellar Blockchain
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-quill-900 leading-tight">
              Where Your Words
              <span className="block text-brand-blue">
                Earn Their Worth
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-quill-600 max-w-3xl mx-auto">
              A decentralized publishing platform where readers directly support writers 
              through microtips, and every highlight becomes a conversation.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-accent transition-all transform hover:scale-105"
            >
              Start Writing Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-white text-brand-blue px-8 py-4 rounded-lg text-lg font-semibold border-2 border-brand-blue hover:bg-quill-50 transition-all"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Edit3 className="w-8 h-8 text-brand-accent" />
              </div>
              <div className="text-3xl font-bold text-quill-900">100%</div>
              <div className="text-sm text-quill-600">Ownership of Your Content</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-brand-accent" />
              </div>
              <div className="text-3xl font-bold text-quill-900">Instant</div>
              <div className="text-sm text-quill-600">Micropayments via Stellar</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-brand-accent" />
              </div>
              <div className="text-3xl font-bold text-quill-900">Direct</div>
              <div className="text-sm text-quill-600">Reader-to-Writer Support</div>
            </div>
          </div>

          {/* Early Access Note */}
          <div className="pt-8">
            <p className="text-sm text-quill-500 font-handwritten text-lg">
              Join the future of decentralized publishing — Early access now open!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}