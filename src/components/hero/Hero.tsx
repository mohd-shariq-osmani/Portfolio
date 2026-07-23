"use client";

import { motion } from "framer-motion";
import ParticleGrid from "./ParticleGrid";
import { ArrowDown, Play } from "lucide-react";
import { scrollToTarget } from "@/lib/smoothScroll";

export default function Hero() {
  const scrollToSection = (id: string) => {
    scrollToTarget(id);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 sm:px-8 pt-28 pb-12 bg-black text-white overflow-x-hidden"
    >
      {/* Background Particle Grid */}
      <ParticleGrid />

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-mono-100/5 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center my-auto py-12">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-300 mb-8 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Crafting High-Performance Systems</span>
        </div>

        {/* Name Typography */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.9] text-balance mb-6 font-display text-white">
          MOHD SHARIQ <br />
          <span className="text-mono-400">OSMANI</span>
        </h1>

        {/* Roles */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono tracking-widest text-mono-300 uppercase mb-8">
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
        </div>

        {/* Subtitle Statement */}
        <p className="text-base sm:text-xl text-mono-300 max-w-2xl font-light leading-relaxed mb-10 text-balance">
          I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => scrollToSection("build-lab")}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:bg-mono-200 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 cursor-pointer"
          >
            <Play size={15} className="fill-black" />
            <span>Launch Build Lab</span>
          </button>
          <button
            onClick={() => scrollToSection("projects")}
            className="w-full sm:w-auto px-8 py-3.5 bg-mono-950 text-mono-300 border border-mono-800 font-medium text-sm rounded-full hover:text-white hover:border-mono-600 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Work</span>
          </button>
        </div>
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
