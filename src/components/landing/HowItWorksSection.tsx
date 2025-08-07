'use client';

import { Edit3, Highlighter, Zap, Heart } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-quill-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-quill-900 mb-4">
            How QuillTip Works
          </h2>
          <p className="text-xl text-quill-600 max-w-3xl mx-auto">
            A simple, powerful workflow that transforms how writers connect with readers
            through meaningful engagement and instant support.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center mb-6">
                <div className="bg-brand-blue text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                  1
                </div>
                <div className="bg-brand-blue/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <Edit3 className="w-8 h-8 text-brand-blue" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-quill-900 mb-4">
                Write & Publish
              </h3>
              <p className="text-lg text-quill-600 mb-4">
                Create compelling content using our advanced rich-text editor. 
                Format your articles with precision, add images, and craft stories that resonate.
              </p>
              <ul className="text-quill-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mr-3"></div>
                  Rich text editor with advanced formatting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mr-3"></div>
                  Image uploads and media embedding
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-blue rounded-full mr-3"></div>
                  SEO optimization and metadata control
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-quill-200">
                <div className="bg-quill-100 rounded-lg p-4 mb-4">
                  <div className="h-4 bg-quill-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-quill-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-quill-200 rounded w-5/6"></div>
                </div>
                <div className="flex space-x-2 mb-4">
                  <div className="bg-brand-blue/20 rounded px-3 py-1 text-sm text-brand-blue font-medium">B</div>
                  <div className="bg-brand-blue/20 rounded px-3 py-1 text-sm text-brand-blue font-medium">I</div>
                  <div className="bg-brand-blue/20 rounded px-3 py-1 text-sm text-brand-blue font-medium">Link</div>
                </div>
                <div className="text-sm text-quill-500">Professional editor experience</div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center mb-6">
                <div className="bg-brand-accent text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                  2
                </div>
                <div className="bg-brand-accent/10 rounded-full w-16 h-16 flex items-center justify-center">
                  <Highlighter className="w-8 h-8 text-brand-accent" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-quill-900 mb-4">
                Readers Highlight
              </h3>
              <p className="text-lg text-quill-600 mb-4">
                Readers discover your content and highlight the passages that resonate most. 
                Each highlight captures their genuine reaction and creates engagement opportunities.
              </p>
              <ul className="text-quill-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-accent rounded-full mr-3"></div>
                  Precise text selection and highlighting
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-accent rounded-full mr-3"></div>
                  Public or private highlight options
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-brand-accent rounded-full mr-3"></div>
                  Comments and thoughts on specific passages
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-quill-200">
                <div className="space-y-3">
                  <div className="h-3 bg-quill-200 rounded w-full"></div>
                  <div className="h-3 bg-yellow-200 rounded w-3/4"></div>
                  <div className="h-3 bg-quill-200 rounded w-full"></div>
                  <div className="h-3 bg-blue-200 rounded w-5/6"></div>
                  <div className="h-3 bg-quill-200 rounded w-full"></div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="text-sm text-yellow-700 font-medium">Reader highlight</div>
                  <div className="text-xs text-yellow-600 mt-1">&ldquo;This insight changed my perspective!&rdquo;</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                  3
                </div>
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-quill-900 mb-4">
                Instant Micro-Tips
              </h3>
              <p className="text-lg text-quill-600 mb-4">
                When readers find value, they can instantly tip you with blockchain-powered 
                micro-payments. No subscriptions, no minimums – just direct support.
              </p>
              <ul className="text-quill-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Tips as low as $0.01 with minimal fees
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  3-5 second settlement on Stellar network
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Direct wallet-to-wallet transfers
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-quill-200">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-green-700">Tip this highlight</div>
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex space-x-2 mb-3">
                    <button className="bg-green-100 hover:bg-green-200 rounded px-3 py-1 text-sm text-green-700 font-medium">$0.25</button>
                    <button className="bg-green-100 hover:bg-green-200 rounded px-3 py-1 text-sm text-green-700 font-medium">$1.00</button>
                    <button className="bg-green-100 hover:bg-green-200 rounded px-3 py-1 text-sm text-green-700 font-medium">$5.00</button>
                  </div>
                  <div className="text-xs text-green-600">Instant settlement • &lt;$0.01 fee</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center mb-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mr-4">
                  4
                </div>
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-quill-900 mb-4">
                Build Community
              </h3>
              <p className="text-lg text-quill-600 mb-4">
                See which parts of your content resonate most, engage with reader insights, 
                and build a community around shared ideas and meaningful conversations.
              </p>
              <ul className="text-quill-600 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Analytics on most-highlighted passages
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Direct engagement with reader feedback
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Community of readers who support your work
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl p-8 shadow-lg border border-quill-200">
                <div className="mb-4">
                  <div className="text-sm font-medium text-quill-700 mb-2">Most Highlighted</div>
                  <div className="bg-purple-50 rounded p-3 border border-purple-200">
                    <div className="text-sm text-purple-800">&ldquo;The key insight that changed everything...&rdquo;</div>
                    <div className="text-xs text-purple-600 mt-1">142 highlights • $47.50 in tips</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-red-500 mr-2" />
                    <div className="text-sm text-quill-600">Sarah: &ldquo;This helped me so much!&rdquo;</div>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-red-500 mr-2" />
                    <div className="text-sm text-quill-600">Mike: &ldquo;Exactly what I needed to hear&rdquo;</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center bg-gradient-to-r from-brand-blue to-brand-accent p-8 rounded-xl text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Writing?
          </h3>
          <p className="text-xl mb-6 opacity-90">
            Join the future of publishing where every word matters and every reader can make a difference
          </p>
          <button className="bg-white text-brand-blue font-bold px-8 py-3 rounded-lg hover:bg-quill-50 transition-colors">
            Start Writing Today
          </button>
        </div>
      </div>
    </section>
  );
}