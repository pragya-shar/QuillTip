'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, PenTool, Zap, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with Parallax */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-neutral-100" />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-neutral-200/40 to-neutral-300/20 rounded-full filter blur-3xl"
        animate={{
          y: scrollY * 0.5,
          scale: 1 + scrollY * 0.0005
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-neutral-300/30 to-neutral-400/10 rounded-full filter blur-3xl"
        animate={{
          y: -scrollY * 0.3,
          scale: 1 + scrollY * 0.0003
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />

      <div className="container mx-auto max-w-7xl px-8 relative z-10">
        <motion.div
          className="grid lg:grid-cols-2 gap-20 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Enhanced Content */}
          <div className="space-y-10">
            {/* Enhanced Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-neutral-700" />
                  <span className="text-sm font-medium text-neutral-700 tracking-wide">
                    POWERED BY STELLAR
                  </span>
                </div>
                <div className="w-px h-4 bg-neutral-300" />
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-neutral-600">LIVE</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Headline with Staggered Animation */}
            <motion.div variants={itemVariants} className="space-y-8">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <motion.span
                  className="block text-neutral-900 mb-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Write.
                </motion.span>
                <motion.span
                  className="block text-neutral-800 mb-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  Publish.
                </motion.span>
                <motion.span
                  className="block text-neutral-900"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  Earn.
                </motion.span>
              </h1>

              <motion.p
                className="text-lg text-neutral-700 leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                The decentralized platform where readers reward writers instantly through
                <span className="font-bold text-neutral-900"> micro-tips</span> and
                <span className="font-bold text-neutral-900"> highlights</span>.
              </motion.p>
            </motion.div>

            {/* Enhanced CTA with Multiple Options */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-xl text-base font-medium tracking-wide hover:bg-neutral-800 hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                Start Writing Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <Link
                href="#demo"
                className="group inline-flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm text-neutral-900 px-8 py-4 rounded-xl text-base font-medium tracking-wide border border-neutral-200 hover:bg-white hover:shadow-lg transition-all duration-500"
              >
                Watch Demo
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </Link>
            </motion.div>

            {/* Enhanced Metrics with Icons */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 pt-8">
              <div className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
                  <span className="text-3xl font-bold text-neutral-900 group-hover:scale-110 transition-transform">97.5%</span>
                </div>
                <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide">TO AUTHORS</p>
              </div>

              <div className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
                  <span className="text-3xl font-bold text-neutral-900 group-hover:scale-110 transition-transform">3s</span>
                </div>
                <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide">SETTLEMENT</p>
              </div>

              <div className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" />
                  <span className="text-3xl font-bold text-neutral-900 group-hover:scale-110 transition-transform">$0.01</span>
                </div>
                <p className="text-xs text-neutral-600 font-bold uppercase tracking-wide">MIN TIP</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Enhanced Visual with Scroll Animation */}
          <motion.div
            className="relative"
            variants={itemVariants}
            style={{
              y: scrollY * 0.1
            }}
          >
            <div className="relative w-full h-[700px] bg-gradient-to-br from-white to-neutral-100 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200/50">
              {/* Enhanced Editor Interface */}
              <div className="absolute inset-6 bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-6 h-6 text-neutral-700" />
                    <span className="text-xl font-medium text-neutral-900">QuillTip Editor</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-6">
                  <motion.div
                    className="h-4 bg-neutral-200 rounded w-2/3"
                    initial={{ width: 0 }}
                    animate={{ width: '66.666667%' }}
                    transition={{ duration: 1.5, delay: 1.2 }}
                  />
                  <motion.div
                    className="h-4 bg-neutral-200 rounded w-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 1.4 }}
                  />
                  <motion.div
                    className="h-4 bg-neutral-200 rounded w-5/6"
                    initial={{ width: 0 }}
                    animate={{ width: '83.333333%' }}
                    transition={{ duration: 1.5, delay: 1.6 }}
                  />
                  <motion.div
                    className="h-4 bg-gradient-to-r from-yellow-200 to-yellow-300 rounded w-3/4 relative"
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    transition={{ duration: 1.5, delay: 1.8 }}
                  >
                    <motion.div
                      className="absolute -right-2 -top-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.2 }}
                    />
                  </motion.div>
                  <motion.div
                    className="h-4 bg-neutral-200 rounded w-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, delay: 2.0 }}
                  />
                  <motion.div
                    className="h-4 bg-neutral-200 rounded w-4/5"
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 1.5, delay: 2.2 }}
                  />
                </div>

                {/* Floating Tip Notifications */}
                <motion.div
                  className="absolute top-32 right-8 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    +0.5 XLM
                  </div>
                </motion.div>

                <motion.div
                  className="absolute bottom-24 left-8 bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg border border-neutral-200"
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 3.0, duration: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    &ldquo;Great insight!&rdquo;
                  </div>
                </motion.div>
              </div>

              {/* Subtle Pattern Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-neutral-50/10 to-neutral-100/20 pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}