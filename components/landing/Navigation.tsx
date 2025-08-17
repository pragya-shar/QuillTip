'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-quill-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-blue">QuillTip</span>
            <span className="text-sm text-brand-accent font-handwritten">beta</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-quill-600 hover:text-brand-blue transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-quill-600 hover:text-brand-blue transition">
              How It Works
            </Link>
            <Link href="/login" className="text-quill-600 hover:text-brand-blue transition">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-quill-100">
            <div className="py-4 space-y-3">
              <Link href="#features" className="block text-quill-600 hover:text-brand-blue transition">
                Features
              </Link>
              <Link href="#how-it-works" className="block text-quill-600 hover:text-brand-blue transition">
                How It Works
              </Link>
              <Link href="/login" className="block text-quill-600 hover:text-brand-blue transition">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="block bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-brand-accent transition text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}