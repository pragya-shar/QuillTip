'use client';

import Link from 'next/link';
import { 
  UserPlus,
  Edit3,
  Globe,
  Coins,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up",
      color: "from-slate-700 to-slate-800"
    },
    {
      number: "02",
      icon: Edit3,
      title: "Write",
      color: "from-slate-800 to-slate-900"
    },
    {
      number: "03",
      icon: Globe,
      title: "Publish",
      color: "from-slate-600 to-slate-700"
    },
    {
      number: "04",
      icon: Coins,
      title: "Earn",
      color: "from-slate-900 to-black"
    }
  ];

  return (
    <section id="how-it-works" className="py-32 px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light tracking-tight mb-12">
            <span className="text-slate-900">
              How It Works
            </span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 transform -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 relative z-10">
                  {/* Step Number */}
                  <div className="text-4xl font-light text-slate-100 mb-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-medium text-slate-900">
                    {step.title}
                  </h3>
                </div>
                
                {/* Arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-20 hidden lg:block">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-lg text-base font-light tracking-wide hover:bg-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Writing & Earning Today
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </section>
  );
}