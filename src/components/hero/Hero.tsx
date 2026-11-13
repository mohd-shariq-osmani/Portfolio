"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ParticleGrid from "./ParticleGrid";
import { ArrowDown, Play } from "lucide-react";
import { scrollToTarget } from "@/lib/smoothScroll";

export default function Hero() {
  const [scanned, setScanned] = useState(false);

  const scrollToSection = (id: string) => {
    scrollToTarget(id);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-8 pt-28 pb-12 bg-black text-white overflow-x-hidden"
    >
      {/* Background Floating Monochrome Particle Network */}
      <ParticleGrid />

      {/* Subtle Monochrome Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/[0.04] blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center my-auto py-12">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-300 mb-8 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Crafting High-Performance Systems</span>
        </motion.div>

        {/* Name Typography with Horizontal Scanning Reveal */}
        <div className="relative mb-6 overflow-hidden select-none inline-block max-w-full px-3 sm:px-6 py-2">
          {/* Laser Scan Line */}
          <motion.div
            initial={{ left: "-10%", opacity: 0 }}
            animate={{ left: "115%", opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.4,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25,
            }}
            className="absolute top-0 bottom-0 w-[3px] z-20 pointer-events-none bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff,0_0_40px_#ffffff]"
          />
          {/* Laser Trailing Wash */}
          <motion.div
            initial={{ left: "-25%", opacity: 0 }}
            animate={{ left: "120%", opacity: [0, 0.35, 0.2, 0] }}
            transition={{
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25,
            }}
            className="absolute top-0 bottom-0 w-36 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md"
          />

          {/* Unmasked Typography with generous bounds */}
          <motion.h1
            initial={{
              clipPath: "inset(-20% 100% -20% -20%)",
              opacity: 0.75,
            }}
            animate={{
              clipPath: scanned ? "none" : "inset(-20% -20% -20% -20%)",
              opacity: 1,
            }}
            onAnimationComplete={() => setScanned(true)}
            transition={{
              duration: 1.35,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25,
            }}
            style={scanned ? { clipPath: "none" } : undefined}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.95] text-balance font-display text-white pr-2"
          >
            MOHD SHARIQ <br />
            <span className="text-mono-400">OSMANI</span>
          </motion.h1>
        </div>

        {/* Roles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono tracking-widest text-mono-300 uppercase mb-8"
        >
          <span className="px-3.5 py-1.5 rounded-lg bg-mono-950 border border-mono-800">
            Automation Engineer
          </span>
          <span className="text-mono-600 hidden sm:inline">•</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-mono-950 border border-mono-800">
            Full Stack Developer
          </span>
          <span className="text-mono-600 hidden sm:inline">•</span>
          <span className="px-3.5 py-1.5 rounded-lg bg-mono-950 border border-mono-800">
            AI Engineer
          </span>
        </motion.div>

        {/* Subtitle Statement */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
          className="text-base sm:text-xl text-mono-300 max-w-2xl font-light leading-relaxed mb-10 text-balance"
        >
          I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.
        </motion.p>

        {/* CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={() => scrollToSection("build-lab")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-mono-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 cursor-pointer select-none"
          >
            <Play size={15} className="fill-black" />
            <span>Launch Build Lab</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("projects")}
            className="w-full sm:w-auto px-8 py-3.5 bg-mono-950 text-mono-300 border border-mono-800 font-medium text-sm rounded-full hover:text-white hover:border-mono-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <span>Explore Work</span>
          </button>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="relative z-10 flex flex-col items-center gap-2 cursor-pointer pt-6"
        onClick={() => scrollToSection("projects")}
      >
        <span className="text-[10px] font-mono tracking-widest text-mono-400 uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="p-2 rounded-full border border-mono-800 bg-mono-950 text-mono-300"
        >
          <ArrowDown size={14} />
        </motion.div>
      </div>
    </section>
  );
}
