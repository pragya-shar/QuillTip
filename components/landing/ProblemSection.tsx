'use client';

import { TrendingDown, DollarSign, MessageCircle, Eye, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    {
      icon: TrendingDown,
      title: "Declining Revenue",
      description: "Traditional platforms take 30-50% cuts while ad revenue plummets. Writers earn pennies per thousand views, making sustainable income nearly impossible.",
      stat: "Average writer earns less than $100/month despite quality content",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50/50"
    },
    {
      icon: DollarSign,
      title: "Payment Friction",
      description: "Readers want to support writers but face complex payment systems, high minimum contributions, and lengthy subscription commitments.",
      stat: "73% of readers would tip if it were easier and more affordable",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50/50"
    },
    {
      icon: MessageCircle,
      title: "Lost Engagement",
      description: "Meaningful discussions happen in isolated comment sections. The connection between specific content moments and reader thoughts is broken.",
      stat: "Most valuable feedback never reaches the writer",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50/50"
    },
    {
      icon: Eye,
      title: "Audience Disconnect",
      description: "Writers can't see which parts of their content truly resonate. Analytics show views but miss the emotional impact and reader insights.",
      stat: "Writers guess what readers value most",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50/50"
    }
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
    <section className="py-32 px-8 bg-gradient-to-b from-white to-neutral-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-br from-red-100/20 to-transparent rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-100/20 to-transparent rounded-full filter blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-100/80 backdrop-blur-sm rounded-full border border-red-200/60 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="w-4 h-4 text-red-700" />
            <span className="text-sm font-medium text-red-700 tracking-wide">
              THE CHALLENGE
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-neutral-900">
              The Problem with
            </span>
            <br />
            <span className="text-neutral-700">
              Traditional Publishing
            </span>
          </h2>
          <p className="text-base text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            Writers face unprecedented challenges while readers struggle to meaningfully support the content they value
          </p>
        </motion.div>

        {/* Problems Grid */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`group relative ${problem.bgColor} backdrop-blur-sm p-8 rounded-2xl border border-neutral-200/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}
            >
              {/* Icon */}
              <motion.div
                className={`w-14 h-14 bg-gradient-to-br ${problem.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <problem.icon className="w-7 h-7 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold text-neutral-900 mb-4">
                {problem.title}
              </h3>
              <p className="text-neutral-700 leading-relaxed mb-6">
                {problem.description}
              </p>

              {/* Stat Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${problem.color} text-white rounded-lg text-sm font-medium shadow-md`}>
                <AlertCircle className="w-4 h-4" />
                {problem.stat}
              </div>

              {/* Decorative corner accent */}
              <div className={`absolute top-4 right-4 w-3 h-3 bg-gradient-to-br ${problem.color} rounded-full opacity-50`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 p-12 rounded-3xl text-white shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/20 to-transparent" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full filter blur-3xl" />

          <div className="relative z-10">
            <h3 className="text-2xl lg:text-3xl font-bold mb-6">
              It&apos;s Time for a Better Way
            </h3>
            <p className="text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
              QuillTip solves these problems with blockchain-powered micro-tips and highlight-based engagement
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">
                Where every highlight becomes valuable feedback, and every tip supports creative freedom
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}