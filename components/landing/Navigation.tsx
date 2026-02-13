'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, PenTool, Zap, Highlighter, HelpCircle, FileText, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavDropdownItem {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

interface NavDropdown {
  label: string;
  items: NavDropdownItem[];
}

const navDropdowns: NavDropdown[] = [
  {
    label: "Product",
    items: [
      { icon: PenTool, title: "Write", description: "Rich editor with markdown support", href: "#features" },
      { icon: Zap, title: "Earn", description: "Get tipped instantly via Stellar", href: "#how-it-works" },
      { icon: Highlighter, title: "Highlights", description: "Readers tip specific passages", href: "#features" },
    ]
  },
  {
    label: "Resources",
    items: [
      { icon: HelpCircle, title: "FAQ", description: "Answers to common questions", href: "#faq" },
      { icon: FileText, title: "Getting Started", description: "Wallet setup & tipping guide", href: "/guide" },
      { icon: Shield, title: "Security", description: "Blockchain security info", href: "#faq" },
    ]
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
      setIsOpen(false);
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg border-b border-neutral-200/60 shadow-sm'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <div className="container mx-auto max-w-7xl px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <PenTool className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-2xl font-semibold text-neutral-900">
              QuillTip
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8" ref={navRef}>
            <Link
              href="/articles"
              className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors duration-300"
            >
              Articles
            </Link>
            {navDropdowns.map((dropdown) => (
              <div key={dropdown.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === dropdown.label ? null : dropdown.label)}
                  className="flex items-center gap-1 text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors duration-300"
                >
                  {dropdown.label}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openDropdown === dropdown.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openDropdown === dropdown.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-neutral-200/60 overflow-hidden"
                    >
                      <div className="p-2">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={(e) => {
                              handleSmoothScroll(e, item.href);
                              setOpenDropdown(null);
                            }}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                              <item.icon className="w-5 h-5 text-neutral-700" />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{item.title}</p>
                              <p className="text-sm text-neutral-500">{item.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link
              href="/login"
              className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors duration-300"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-800 hover:shadow-lg transition-all duration-300"
            >
              Try on Testnet
              <motion.span
                className="inline-block"
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} className="text-neutral-900" />
            ) : (
              <Menu size={24} className="text-neutral-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden border-t border-neutral-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-6 space-y-6">
                <Link
                  href="/articles"
                  className="flex items-center gap-3 py-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Articles
                </Link>
                {navDropdowns.map((dropdown, dropdownIndex) => (
                  <motion.div
                    key={dropdown.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: dropdownIndex * 0.1 }}
                  >
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      {dropdown.label}
                    </p>
                    <div className="space-y-1">
                      {dropdown.items.map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="flex items-center gap-3 py-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                          onClick={(e) => {
                            handleSmoothScroll(e, item.href);
                            setIsOpen(false);
                          }}
                        >
                          <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-neutral-600" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: navDropdowns.length * 0.1 }}
                  className="pt-4 space-y-3 border-t border-neutral-200"
                >
                  <Link
                    href="/login"
                    className="block text-neutral-600 hover:text-neutral-900 font-medium transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors text-center font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Try on Testnet →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}