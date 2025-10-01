'use client';

import {
  Edit3,
  DollarSign,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Edit3,
      title: "Rich Editor",
      description: "Professional writing tools with code blocks, media embeds, and full markdown support.",
      gradient: "from-neutral-700 to-neutral-800"
    },
    {
      icon: DollarSign,
      title: "Instant Tips",
      description: "Receive payments in 3 seconds via Stellar blockchain with near-zero fees.",
      gradient: "from-neutral-800 to-neutral-900"
    },
    {
      icon: MessageSquare,
      title: "Interactive Reading",
      description: "Engage readers with highlight-to-tip functionality and rich commenting.",
      gradient: "from-neutral-600 to-neutral-700"
    },
    {
      icon: Shield,
      title: "100% Ownership",
      description: "Full control of your content. No platform lock-in, ever.",
      gradient: "from-neutral-700 to-neutral-800"
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Track earnings, engagement metrics, and audience growth in real time.",
      gradient: "from-neutral-800 to-neutral-900"
    },
    {
      icon: Zap,
      title: "No Minimums",
      description: "Withdraw any amount instantly. No thresholds, no waiting periods.",
      gradient: "from-neutral-900 to-black"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section id="features" className="py-32 px-8 bg-gradient-to-b from-white via-neutral-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-neutral-100/40 to-transparent rounded-full filter blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/80 backdrop-blur-sm rounded-full border border-neutral-200/60 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Zap className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-700 tracking-wide">
              POWERFUL FEATURES
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-neutral-900">
              Built for Writers,
            </span>
            <br />
            <span className="text-neutral-700">
              Designed for Readers
            </span>
          </h2>
          <p className="text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Everything you need to create, publish, and monetize your content on a decentralized platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/60 hover:border-neutral-300 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.02] rounded-2xl transition-opacity duration-500`} />

              {/* Icon */}
              <motion.div
                className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-lg font-bold text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-neutral-700 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative corner accent */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-neutral-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}