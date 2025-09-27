'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-3xl font-handwritten text-slate-900">QuillTip</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition">
              How It Works
            </Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
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
          <div className="md:hidden border-t border-slate-200">
            <div className="py-4 space-y-3">
              <Link href="#features" className="block text-slate-600 hover:text-slate-900 transition">
                Features
              </Link>
              <Link href="#how-it-works" className="block text-slate-600 hover:text-slate-900 transition">
                How It Works
              </Link>
              <Link href="/login" className="block text-slate-600 hover:text-slate-900 transition">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="block bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition text-center"
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