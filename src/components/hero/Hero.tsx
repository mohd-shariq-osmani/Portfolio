"use client";

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
      className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-between items-center px-4 sm:px-8 pt-24 sm:pt-28 pb-8 sm:pb-12 bg-black text-white overflow-x-hidden"
    >
      {/* Background Floating Monochrome Particle Network */}
      <ParticleGrid />

      {/* Subtle Monochrome Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/[0.04] blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center justify-center my-auto py-6 sm:py-12">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-300 mb-6 sm:mb-8 shadow-lg animate-hero-badge">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Crafting High-Performance Systems</span>
        </div>

        {/* Name Typography with Horizontal Scanning Reveal */}
        <div className="relative mb-5 sm:mb-6 select-none inline-block max-w-full px-4 sm:px-8 py-2 overflow-hidden">
          {/* Laser Scan Line - GPU Accelerated CSS */}
          <div className="absolute top-0 bottom-0 w-[3px] z-20 pointer-events-none bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff,0_0_40px_#ffffff] animate-laser-line" />

          {/* Laser Trailing Wash - GPU Accelerated CSS */}
          <div className="absolute top-0 bottom-0 w-36 z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md animate-laser-wash" />

          {/* Hero Name Typography - With Laser Wipe Reveal */}
          <h1 className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase leading-[0.95] text-balance font-display text-white pr-4 sm:pr-8 pb-2 animate-title-reveal">
            MOHD SHARIQ <br />
            <span className="text-mono-400">OSMANI</span>
          </h1>
        </div>

        {/* Roles */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-mono tracking-widest text-mono-300 uppercase mb-6 sm:mb-8 animate-hero-roles">
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
        <p className="text-sm sm:text-lg md:text-xl text-mono-300 max-w-2xl font-light leading-relaxed mb-8 sm:mb-10 text-balance px-2 animate-hero-subtitle">
          I build AI-powered software, intelligent automation systems, and cross-platform mobile applications.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto animate-hero-cta">
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
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        type="button"
        aria-label="Scroll to projects"
        className="relative z-10 flex flex-col items-center gap-2 cursor-pointer pt-4 sm:pt-6 focus-visible:outline-none animate-hero-scroll"
        onClick={() => scrollToSection("projects")}
      >
        <span className="text-[10px] font-mono tracking-widest text-mono-400 uppercase">
          Scroll to explore
        </span>
        <div className="p-2 rounded-full border border-mono-800 bg-mono-950 text-mono-300 animate-subtle-bounce">
          <ArrowDown size={14} />
        </div>
      </button>
    </section>
  );
}
