'use client';

import { Zap, Shield, Globe, Coins, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function StellarBenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const benefits = [
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Payments settle in 3 seconds, enabling real-time support for your favorite writers",
      color: "from-yellow-400 to-yellow-500"
    },
    {
      icon: Coins,
      title: "Micro Costs",
      description: "Transaction fees under $0.01 make small tips economically viable for everyone",
      color: "from-green-400 to-green-500"
    },
    {
      icon: Shield,
      title: "True Ownership",
      description: "Your content and earnings are secured by blockchain, not platform policies",
      color: "from-blue-400 to-blue-500"
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Reach creators worldwide without banking restrictions or currency barriers",
      color: "from-purple-400 to-purple-500"
    }
  ];

  const stats = [
    { value: "3s", label: "Payment Settlement" },
    { value: "$0.0001", label: "Avg Transaction Fee" },
    { value: "24/7", label: "Global Network Uptime" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-32 px-8 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.03),transparent_50%)]" />

      {/* Floating particles effect */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
      <div className="absolute top-40 right-40 w-3 h-3 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto max-w-7xl relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white tracking-wide">
              BLOCKCHAIN POWERED
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
            Powered by
            <br />
            Stellar Blockchain
          </h2>
          <p className="text-base text-white/90 max-w-3xl mx-auto leading-relaxed">
            Experience the future of publishing with instant, low-cost transactions and true decentralization
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Icon */}
              <motion.div
                className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <benefit.icon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
            >
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/90 text-xs font-bold tracking-wide uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}