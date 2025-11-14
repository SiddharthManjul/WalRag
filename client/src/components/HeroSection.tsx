"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 w-full h-full bg-background">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block"
          >
            <div className="px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 backdrop-blur-sm">
              <span className="text-sm font-medium bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Decentralized Storage Meets AI
              </span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="block text-foreground">The Future of</span>
            <span className="block bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Intelligent Storage
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto text-xl text-muted-foreground"
          >
            Storarc combines the power of decentralized storage with AI-powered
            retrieval. Store your data on Walrus, query it with natural language,
            and let blockchain ensure your ownership.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="px-8 py-4 rounded-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
              Get Started Free
            </button>
            <button className="px-8 py-4 rounded-full border-2 border-border bg-background/50 backdrop-blur-sm text-foreground font-semibold text-lg hover:bg-accent transition-all duration-300 hover:scale-105">
              View Documentation
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Decentralized
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Instant
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                AI Retrieval
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                Secure
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Blockchain Verified
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center p-2"
        >
          <motion.div className="w-1 h-3 bg-linear-to-b from-blue-500 to-purple-600 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}
