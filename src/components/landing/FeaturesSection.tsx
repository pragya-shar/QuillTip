'use client';

import { 
  Edit3, 
  DollarSign, 
  Sparkles,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Edit3,
      title: "Professional Editor",
      description: "Rich text editing with code blocks, media embeds, and markdown support. Everything you need to create stunning content.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: DollarSign,
      title: "Instant Micropayments",
      description: "Readers can tip as little as $0.01 using Stellar blockchain. Get paid instantly with minimal fees.",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Highlight & Discuss",
      description: "Readers highlight text and leave contextual comments. Turn your content into a conversation.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Own Your Content",
      description: "100% ownership of your work. No platform lock-in. Export anytime. Your content, your rules.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics That Matter",
      description: "See which parts resonate most. Track tips, highlights, and engagement in real-time.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "3-5 second payment settlement. No waiting weeks for payouts. Money flows as fast as ideas.",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <section id="features" className="py-24 px-8 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Core Features
            </span>
          </div>
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Everything You Need to
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create, Publish & Earn
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A complete platform designed for the modern creator economy
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 border border-blue-100">
            <h3 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ready to Transform Your Writing Career?
              </span>
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join the next generation of writers who are building sustainable careers on their own terms.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Your Journey
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}