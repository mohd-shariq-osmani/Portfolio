"use client";

import { PROJECTS, Project } from "@/data/projects";
import IPhoneFrame from "./iPhoneFrame";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowUpRight, CheckCircle2, Github, Play, Smartphone } from "lucide-react";

interface iPhoneShowcaseProps {
  onLaunchBuildLab?: (project: Project) => void;
}

export default function IPhoneShowcase({ onLaunchBuildLab }: iPhoneShowcaseProps) {
  const activeProject = PROJECTS[0];
  if (!activeProject) return null;

  return (
    <div className="relative pt-4 pb-16 sm:pt-8 sm:pb-24 px-4 sm:px-8 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        {/* Sub-section Header */}
        <Reveal className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-3">
            <Smartphone size={14} />
            <span>Mobile Engineering</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase font-display mb-2 text-white">
            Featured Mobile App
          </h3>
          <p className="text-sm text-mono-400 max-w-md font-light">
            Test Vault directly inside an interactive iPhone simulator.
          </p>
        </Reveal>

        {/* Vault Project Showcase Card */}
        <Reveal delay={0.05}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center bg-mono-950 md:bg-mono-950/80 border border-mono-850 rounded-3xl p-5 sm:p-10 shadow-2xl md:backdrop-blur-xl">
            {/* iPhone Simulator first on mobile so users interact right away */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center items-center">
              <IPhoneFrame project={activeProject} onLaunchBuildLab={onLaunchBuildLab} />
            </div>

            {/* Project Details */}
            <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-center gap-5">
              <div>
                <span className="text-[11px] sm:text-xs font-mono tracking-widest text-mono-400 uppercase">
                  {activeProject.tagline}
                </span>
                <h4 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mt-1 mb-2.5 font-display">
                  {activeProject.title}
                </h4>
                <p className="text-sm sm:text-base text-mono-300 font-light leading-relaxed">
                  {activeProject.description}
                </p>
              </div>

              {/* Tech Tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {activeProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[11px] font-mono bg-mono-900 border border-mono-800 text-mono-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Features List */}
              <div className="bg-mono-900/80 border border-mono-850 rounded-2xl p-4 sm:p-5">
                <h5 className="text-xs font-mono uppercase tracking-wider text-mono-400 mb-3">
                  Key Capabilities
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {onLaunchBuildLab && (
                  <button
                    type="button"
                    onClick={() => onLaunchBuildLab(activeProject)}
                    className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                  >
                    <Play size={13} className="fill-black" />
                    <span>Launch in Build Lab</span>
                  </button>
                )}
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-mono-900 border border-mono-800 text-mono-300 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-2"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
