'use client';

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
      title: "Create Your Account",
      description: "Sign up in seconds and set up your writer profile",
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02", 
      icon: Edit3,
      title: "Write & Publish",
      description: "Use our powerful editor to create and publish your content",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      icon: Globe,
      title: "Share Your Work",
      description: "Your content gets a unique URL to share with your audience",
      color: "from-orange-500 to-red-500"
    },
    {
      number: "04",
      icon: Coins,
      title: "Earn Instantly",
      description: "Readers tip and highlight, you get paid in real-time",
      color: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              How QuillTip Works
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From idea to income in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative z-10">
                  {/* Step Number */}
                  <div className="text-5xl font-bold text-gray-100 mb-4">
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-20 hidden lg:block">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Visual Demo */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 border border-blue-100">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  See It In Action
                </span>
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Watch how writers are already earning sustainable income through direct reader support. 
                No algorithms, no middlemen, just pure creator-reader connection.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Average tip: $0.50 - $5.00
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Settlement time: 3-5 seconds
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  Platform fee: Less than 1%
                </li>
              </ul>
            </div>
            
            {/* Mock Transaction Feed */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">Live Tips</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                {[
                  { amount: "+2.50 XLM", user: "Reader123", time: "2 sec ago" },
                  { amount: "+5.00 XLM", user: "BookLover", time: "15 sec ago" },
                  { amount: "+1.00 XLM", user: "Anonymous", time: "1 min ago" },
                  { amount: "+10.00 XLM", user: "SuperFan", time: "2 min ago" }
                ].map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{transaction.user}</div>
                        <div className="text-xs text-gray-500">{transaction.time}</div>
                      </div>
                    </div>
                    <span className="text-green-600 font-semibold">{transaction.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a 
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl text-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            Start Writing & Earning Today
            <ArrowRight className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  );
}