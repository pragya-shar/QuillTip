'use client';

import { TrendingDown, DollarSign, MessageCircle, Eye } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-quill-900 mb-4">
            The Problem with Traditional Publishing
          </h2>
          <p className="text-xl text-quill-600 max-w-3xl mx-auto">
            Writers face unprecedented challenges in today&apos;s digital landscape, 
            while readers struggle to meaningfully support the content they value.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-quill-50 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <TrendingDown className="w-8 h-8 text-red-500 mr-3" />
              <h3 className="text-2xl font-bold text-quill-900">Declining Revenue</h3>
            </div>
            <p className="text-quill-600 mb-4">
              Traditional publishing platforms take 30-50% cuts while ad revenue plummets. 
              Writers earn pennies per thousand views, making sustainable income nearly impossible.
            </p>
            <div className="text-sm text-red-600 font-semibold">
              Average writer earns less than $100/month despite quality content
            </div>
          </div>

          <div className="bg-quill-50 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <DollarSign className="w-8 h-8 text-orange-500 mr-3" />
              <h3 className="text-2xl font-bold text-quill-900">Payment Friction</h3>
            </div>
            <p className="text-quill-600 mb-4">
              Readers want to support writers but face complex payment systems, 
              high minimum contributions, and lengthy subscription commitments.
            </p>
            <div className="text-sm text-orange-600 font-semibold">
              73% of readers would tip if it were easier and more affordable
            </div>
          </div>

          <div className="bg-quill-50 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="text-2xl font-bold text-quill-900">Lost Engagement</h3>
            </div>
            <p className="text-quill-600 mb-4">
              Meaningful discussions happen in isolated comment sections. 
              The connection between specific content moments and reader thoughts is broken.
            </p>
            <div className="text-sm text-blue-600 font-semibold">
              Most valuable feedback never reaches the writer
            </div>
          </div>

          <div className="bg-quill-50 p-8 rounded-xl">
            <div className="flex items-center mb-4">
              <Eye className="w-8 h-8 text-purple-500 mr-3" />
              <h3 className="text-2xl font-bold text-quill-900">Audience Disconnect</h3>
            </div>
            <p className="text-quill-600 mb-4">
              Writers can&apos;t see which parts of their content truly resonate. 
              Analytics show views but miss the emotional impact and reader insights.
            </p>
            <div className="text-sm text-purple-600 font-semibold">
              Writers guess what readers value most
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-brand-blue to-brand-accent p-8 rounded-xl text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            It&apos;s Time for a Better Way
          </h3>
          <p className="text-xl mb-6 opacity-90">
            QuillTip solves these problems with blockchain-powered microtips and highlight-based engagement
          </p>
          <div className="text-sm opacity-75 font-handwritten text-lg">
            Where every highlight becomes valuable feedback, and every tip supports creative freedom
          </div>
        </div>
      </div>
    </section>
  );
}