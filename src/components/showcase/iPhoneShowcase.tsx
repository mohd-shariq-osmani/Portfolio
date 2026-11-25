"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, Project } from "@/data/projects";
import IPhoneFrame from "./iPhoneFrame";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowUpRight, CheckCircle2, Github, Play, Smartphone } from "lucide-react";

interface iPhoneShowcaseProps {
  onLaunchBuildLab?: (project: Project) => void;
}

export default function IPhoneShowcase({ onLaunchBuildLab }: iPhoneShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>(PROJECTS[0].id);
  const activeProject = PROJECTS.find((p) => p.id === activeTab) ?? PROJECTS[0];

  return (
    <div className="relative pt-8 pb-24 px-4 sm:px-8 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Sub-section Header */}
        <Reveal className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-3">
            <Smartphone size={14} />
            <span>Mobile &amp; Systems Engineering</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase font-display mb-3 text-white">
            Interactive Mobile Applications
          </h3>
          <p className="text-sm text-mono-400 max-w-xl font-light">
            Native Flutter and systems applications running inside responsive iPhone simulators.
          </p>

          {/* Animated Project Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-7 p-1.5 bg-mono-950 border border-mono-850 rounded-full shadow-lg">
            {PROJECTS.map((proj) => {
              const isActive = activeTab === proj.id;
              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setActiveTab(proj.id)}
                  className={`relative px-4 py-2 text-xs font-medium rounded-full transition-colors duration-200 cursor-pointer select-none ${
                    isActive ? "text-black font-semibold" : "text-mono-400 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="mobile-project-tab-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-white shadow-md"
                    />
                  )}
                  <span className="relative z-10">{proj.title}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Selected Project Display Grid with Smooth Crossfade */}
        <Reveal delay={0.05}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-mono-950 md:bg-mono-950/80 border border-mono-850 rounded-3xl p-6 sm:p-10 shadow-2xl md:backdrop-blur-xl"
            >
              {/* Left Column: Project Details & Case Study */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-6">
                <div>
                  <span className="text-xs font-mono tracking-widest text-mono-400 uppercase">
                    {activeProject.tagline}
                  </span>
                  <h4 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1 mb-4 font-display">
                    {activeProject.title}
                  </h4>
                  <p className="text-sm sm:text-base text-mono-300 font-light leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2">
                  {activeProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-[11px] font-mono bg-mono-900 border border-mono-800 text-mono-300 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Key Features List */}
                <div className="bg-mono-900/80 border border-mono-850 rounded-2xl p-5">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-mono-400 mb-3">
                    Engineered Features
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeProject.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-mono-300">
                        <CheckCircle2 size={14} className="text-mono-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Architecture & Impact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 bg-black border border-mono-850 rounded-xl">
                    <span className="text-mono-500 uppercase block mb-1">Architecture</span>
                    <span className="text-mono-200">{activeProject.caseStudy.architecture}</span>
                  </div>
                  <div className="p-4 bg-black border border-mono-850 rounded-xl">
                    <span className="text-mono-500 uppercase block mb-1">System Impact</span>
                    <span className="text-mono-200">{activeProject.caseStudy.impact}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {onLaunchBuildLab && (
                    <button
                      type="button"
                      onClick={() => onLaunchBuildLab(activeProject)}
                      className="px-6 py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                    >
                      <Play size={13} className="fill-black" />
                      <span>
                        {activeProject.type === "flutter-web"
                          ? "Launch App in Lab"
                          : "Watch Demo in Lab"}
                      </span>
                    </button>
                  )}
                  <a
                    href={activeProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-mono-900 border border-mono-800 text-mono-300 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-2"
                  >
                    <Github size={14} />
                    <span>View GitHub Repo</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              {/* Right Column: iPhone Simulator Hardware */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <IPhoneFrame project={activeProject} onLaunchBuildLab={onLaunchBuildLab} />
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}
