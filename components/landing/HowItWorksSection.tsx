'use client';

import Link from 'next/link';
import {
  UserPlus,
  Edit3,
  Globe,
  Coins,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Sign Up",
      description: "Create your account and connect your Stellar wallet in seconds",
      color: "from-neutral-700 to-neutral-800"
    },
    {
      number: "02",
      icon: Edit3,
      title: "Write",
      description: "Craft compelling content with our intuitive rich text editor",
      color: "from-neutral-800 to-neutral-900"
    },
    {
      number: "03",
      icon: Globe,
      title: "Publish",
      description: "Share your work with the world instantly on the blockchain",
      color: "from-neutral-600 to-neutral-700"
    },
    {
      number: "04",
      icon: Coins,
      title: "Earn",
      description: "Receive instant tips from engaged readers who value your work",
      color: "from-neutral-900 to-black"
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

  const stepVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section id="how-it-works" className="py-32 px-8 bg-gradient-to-b from-neutral-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-neutral-100/30 to-transparent rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-neutral-100/40 to-transparent rounded-full filter blur-3xl" />

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
            <Sparkles className="w-4 h-4 text-neutral-700" />
            <span className="text-sm font-medium text-neutral-700 tracking-wide">
              SIMPLE PROCESS
            </span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-neutral-900">
              Start Earning in
            </span>
            <br />
            <span className="text-neutral-700">
              Four Simple Steps
            </span>
          </h2>
          <p className="text-base text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Join thousands of writers monetizing their content with QuillTip
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-[140px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent hidden lg:block" />

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={stepVariants}
                className="relative group"
              >
                {/* Step Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-neutral-200/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative z-10 h-full">
                  {/* Step Number with Gradient Background */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-light text-white">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 mt-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-700 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Progress indicator */}
                  <div className="absolute bottom-6 left-8 right-8 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${step.color}`}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: '100%' } : { width: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.15 }}
                    />
                  </div>
                </div>

                {/* Arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="absolute top-[140px] -right-4 transform -translate-y-1/2 z-20 hidden lg:block"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
                  >
                    <ArrowRight className="w-6 h-6 text-neutral-400" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-3 bg-neutral-900 text-white px-10 py-5 rounded-xl text-base font-medium tracking-wide hover:bg-neutral-800 hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            Start Writing & Earning Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}