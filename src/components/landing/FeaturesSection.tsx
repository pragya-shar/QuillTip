'use client';

import { 
  Edit3, 
  Save, 
  Eye, 
  Share2, 
  DollarSign, 
  Users, 
  Search,
  Lock,
  Globe,
  Palette,
  Code,
  Image,
  Link2,
  FileText,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Cloud
} from 'lucide-react';

export default function FeaturesSection() {
  const featureCategories = [
    {
      title: "Advanced Editor",
      description: "Professional writing tools powered by TipTap",
      icon: Edit3,
      iconBg: "bg-brand-blue/10",
      iconColor: "text-brand-blue",
      features: [
        {
          icon: Palette,
          title: "Rich Text Formatting",
          description: "Headers, bold, italic, underline, lists, and more formatting options"
        },
        {
          icon: Code,
          title: "Code Blocks",
          description: "Syntax highlighting for over 100 programming languages"
        },
        {
          icon: Image,
          title: "Media Embedding",
          description: "Drag-and-drop images, YouTube videos, and tweet embeds"
        },
        {
          icon: Link2,
          title: "Smart Links",
          description: "Auto-preview for links with metadata extraction"
        }
      ]
    },
    {
      title: "Writing Experience",
      description: "Focus on your content, we handle the rest",
      icon: FileText,
      iconBg: "bg-brand-accent/10",
      iconColor: "text-brand-accent",
      features: [
        {
          icon: Save,
          title: "Auto-Save",
          description: "Never lose your work with automatic saving every 30 seconds"
        },
        {
          icon: Clock,
          title: "Draft Versioning",
          description: "Track changes and restore previous versions anytime"
        },
        {
          icon: Cloud,
          title: "Cloud Sync",
          description: "Access your drafts from any device, anywhere"
        },
        {
          icon: Sparkles,
          title: "Distraction-Free",
          description: "Clean, focused writing environment with zen mode"
        }
      ]
    },
    {
      title: "Publishing Power",
      description: "Reach your audience with optimized content",
      icon: Globe,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      features: [
        {
          icon: Search,
          title: "SEO Optimization",
          description: "Built-in SEO tools with meta tags and custom URLs"
        },
        {
          icon: Share2,
          title: "Instant Publishing",
          description: "One-click publish with scheduled posting options"
        },
        {
          icon: TrendingUp,
          title: "Analytics Dashboard",
          description: "Track views, engagement, and reader behavior"
        },
        {
          icon: Users,
          title: "Audience Insights",
          description: "Understand what resonates with your readers"
        }
      ]
    },
    {
      title: "Monetization",
      description: "Earn directly from your most engaged readers",
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      features: [
        {
          icon: Zap,
          title: "Instant Micro-Tips",
          description: "Receive tips as low as $0.01 with minimal fees"
        },
        {
          icon: Shield,
          title: "Blockchain Security",
          description: "Stellar-powered payments with 3-5 second settlement"
        },
        {
          icon: Eye,
          title: "Transparent Earnings",
          description: "Real-time dashboard showing all tips and highlights"
        },
        {
          icon: Lock,
          title: "No Platform Lock-in",
          description: "Direct wallet-to-wallet transfers, you own your earnings"
        }
      ]
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-quill-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-quill-600 max-w-3xl mx-auto">
            Professional tools, seamless publishing, and direct monetization – 
            all in one platform designed for modern creators.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-20">
          {featureCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="relative">
              {/* Category Header */}
              <div className="flex items-center mb-8">
                <div className={`${category.iconBg} rounded-full w-16 h-16 flex items-center justify-center mr-4`}>
                  <category.icon className={`w-8 h-8 ${category.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-quill-900">
                    {category.title}
                  </h3>
                  <p className="text-lg text-quill-600">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className="bg-quill-50 rounded-xl p-6 hover:bg-quill-100 transition-colors group"
                  >
                    <div className="flex items-start">
                      <div className="bg-white rounded-lg w-12 h-12 flex items-center justify-center mr-4 group-hover:shadow-md transition-shadow">
                        <feature.icon className="w-6 h-6 text-quill-700" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-quill-900 mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-quill-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-quill-900 mb-8 text-center">
            Plus Many More Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Custom themes",
              "Mobile responsive",
              "Comment system",
              "Email notifications",
              "RSS feeds",
              "API access",
              "Export options",
              "Team collaboration",
              "Content backup",
              "Reading time",
              "Table of contents",
              "Citation tools",
              "Markdown support",
              "Keyboard shortcuts",
              "Full-text search",
              "Tag management"
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-quill-50 rounded-lg px-4 py-3 text-center hover:bg-quill-100 transition-colors"
              >
                <span className="text-sm text-quill-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Comparison */}
        <div className="mt-20 bg-gradient-to-br from-quill-50 to-quill-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-quill-900 mb-6 text-center">
            Why QuillTip Beats Traditional Platforms
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="text-red-500 font-bold mb-2">❌ Traditional Platforms</div>
              <ul className="space-y-2 text-sm text-quill-600">
                <li>• High platform fees (15-30%)</li>
                <li>• Monthly subscriptions required</li>
                <li>• Limited reader engagement</li>
                <li>• Delayed payouts (30-60 days)</li>
                <li>• Platform owns the relationship</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-brand-blue to-brand-accent text-white rounded-xl p-6 md:scale-105 shadow-xl">
              <div className="font-bold mb-2">✨ QuillTip</div>
              <ul className="space-y-2 text-sm">
                <li>• Minimal fees (&lt;1%)</li>
                <li>• Pay-per-value model</li>
                <li>• Direct reader interaction</li>
                <li>• Instant payments (3-5 seconds)</li>
                <li>• You own everything</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="text-gray-500 font-bold mb-2">💤 Status Quo</div>
              <ul className="space-y-2 text-sm text-quill-600">
                <li>• Ad-supported content</li>
                <li>• Paywall friction</li>
                <li>• Email list dependency</li>
                <li>• Complex monetization</li>
                <li>• Fragmented tools</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Limited Early Access</span>
          </div>
          <h3 className="text-3xl font-bold text-quill-900 mb-4">
            Ready to Experience the Future of Publishing?
          </h3>
          <p className="text-lg text-quill-600 mb-8 max-w-2xl mx-auto">
            Join forward-thinking writers who are building sustainable careers with QuillTip&apos;s revolutionary platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-blue/90 transition-colors">
              Get Early Access
            </button>
            <button className="bg-white text-brand-blue font-bold px-8 py-3 rounded-lg border-2 border-brand-blue hover:bg-quill-50 transition-colors">
              View Live Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}