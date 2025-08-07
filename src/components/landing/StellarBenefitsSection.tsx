'use client';

import { Zap, Shield, Globe, Coins } from 'lucide-react';

export default function StellarBenefitsSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-brand-blue to-brand-accent">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powered by Stellar Blockchain
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Experience the future of publishing with instant, low-cost transactions 
            and true decentralization.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Payments</h3>
            <p className="text-white/80 text-sm">
              Payments settle in 3-5 seconds, enabling real-time support for your favorite writers.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Micro Costs</h3>
            <p className="text-white/80 text-sm">
              Transaction fees under $0.01 make small tips economically viable for everyone.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">True Ownership</h3>
            <p className="text-white/80 text-sm">
              Your content and earnings are secured by blockchain technology, not platform policies.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-brand-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
            <p className="text-white/80 text-sm">
              Reach and support creators worldwide without banking restrictions or currency barriers.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white mb-1">3-5s</div>
            <div className="text-white/80 text-sm">Payment Settlement</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">$0.0001</div>
            <div className="text-white/80 text-sm">Average Transaction Fee</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">24/7</div>
            <div className="text-white/80 text-sm">Global Network Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}