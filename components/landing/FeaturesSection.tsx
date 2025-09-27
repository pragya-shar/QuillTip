'use client';

import {
  Edit3,
  DollarSign,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Edit3,
      title: "Rich Editor",
      description: "Code blocks, media embeds, markdown.",
      gradient: "from-slate-700 to-slate-800"
    },
    {
      icon: DollarSign,
      title: "Instant Tips",
      description: "Get paid in 3-5 seconds via Stellar.",
      gradient: "from-slate-800 to-slate-900"
    },
    {
      icon: MessageSquare,
      title: "Interactive",
      description: "Readers highlight and comment.",
      gradient: "from-slate-600 to-slate-700"
    },
    {
      icon: Shield,
      title: "100% Ownership",
      description: "Your content, your rules.",
      gradient: "from-slate-700 to-slate-800"
    },
    {
      icon: TrendingUp,
      title: "Real Analytics",
      description: "Track earnings and engagement.",
      gradient: "from-slate-800 to-slate-900"
    },
    {
      icon: Zap,
      title: "No Minimums",
      description: "Withdraw any amount instantly.",
      gradient: "from-slate-900 to-black"
    }
  ];

  return (
    <section id="features" className="py-32 px-8 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light tracking-tight mb-6">
            <span className="text-slate-900">
              Built for Writers
            </span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-lg p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] rounded-lg transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-lg font-medium text-slate-900 mb-3 group-hover:text-slate-700 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm font-light leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}