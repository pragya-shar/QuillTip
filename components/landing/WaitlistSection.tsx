'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual endpoint later
    try {
      // TODO: Replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-brand-blue to-brand-accent">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span className="text-sm font-medium">Limited Early Access</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-quill-900 mb-4">
              Be Among the First Writers
            </h2>
            <p className="text-xl text-quill-600 max-w-2xl mx-auto">
              Join our exclusive waitlist and get early access to QuillTip when we launch. 
              Shape the future of publishing with us.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center">
              <div className="bg-brand-blue/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-blue font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-quill-900 mb-1">Early Access</h3>
              <p className="text-sm text-quill-600">
                Be the first to experience QuillTip&apos;s revolutionary platform
              </p>
            </div>
            <div className="text-center">
              <div className="bg-brand-blue/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-blue font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-quill-900 mb-1">Founding Member Perks</h3>
              <p className="text-sm text-quill-600">
                Lifetime benefits and reduced fees for early supporters
              </p>
            </div>
            <div className="text-center">
              <div className="bg-brand-blue/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-blue font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-quill-900 mb-1">Shape the Platform</h3>
              <p className="text-sm text-quill-600">
                Your feedback will directly influence our development
              </p>
            </div>
          </div>

          {/* Email Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-quill-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 border-2 border-quill-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-blue text-white font-bold px-6 py-3 rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
              )}
              <p className="mt-4 text-xs text-quill-500 text-center">
                No spam, ever. We&apos;ll only email you when QuillTip is ready.
              </p>
            </form>
          ) : (
            <div className="max-w-md mx-auto text-center">
              <div className="bg-green-50 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-quill-900 mb-2">
                  Welcome to the Waitlist!
                </h3>
                <p className="text-quill-600">
                  You&apos;re all set! We&apos;ll notify you as soon as QuillTip launches. 
                  Get ready to revolutionize your writing journey.
                </p>
              </div>
            </div>
          )}

          {/* Social Proof */}
          <div className="mt-10 pt-8 border-t border-quill-200">
            <div className="text-center">
              <p className="text-sm text-quill-600 mb-2">Join writers from</p>
              <div className="flex flex-wrap justify-center gap-6 items-center opacity-60">
                <span className="text-quill-700 font-medium">Medium</span>
                <span className="text-quill-700 font-medium">Substack</span>
                <span className="text-quill-700 font-medium">WordPress</span>
                <span className="text-quill-700 font-medium">Ghost</span>
                <span className="text-quill-700 font-medium">Dev.to</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}