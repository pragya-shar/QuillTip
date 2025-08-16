'use client';

import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  ExternalLink,
  Heart
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Roadmap', href: '#roadmap' }
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' }
    ],
    resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'API', href: '#api' },
      { name: 'Support', href: '#support' },
      { name: 'Status', href: '#status' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'License', href: '#license' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'GitHub', icon: Github, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' }
  ];

  return (
    <footer className="bg-quill-900 text-white">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-2xl font-bold font-handwritten">QuillTip</h3>
              <p className="text-quill-400 mt-2">
                Empowering writers with blockchain-powered micro-tipping and 
                revolutionary content monetization.
              </p>
            </div>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="bg-quill-800 hover:bg-quill-700 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-quill-200">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-quill-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-quill-200">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-quill-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-quill-200">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-quill-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    {link.name}
                    {link.name === 'API' && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-quill-200">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-quill-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-quill-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-quill-200 mb-1">Stay Updated</h4>
              <p className="text-quill-400 text-sm">
                Get the latest updates on QuillTip development and launches
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-quill-500" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-quill-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
                />
              </div>
              <button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-quill-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-quill-400 text-sm">
              <span>© {currentYear} QuillTip. Built with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for writers everywhere</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-quill-400 hover:text-white transition-colors">
                System Status
              </a>
              <span className="text-quill-600">•</span>
              <a href="#" className="text-quill-400 hover:text-white transition-colors">
                Changelog
              </a>
              <span className="text-quill-600">•</span>
              <a href="#" className="text-quill-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}