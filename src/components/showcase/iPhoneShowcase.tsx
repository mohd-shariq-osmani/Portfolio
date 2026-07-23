"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROJECTS, Project } from "@/data/projects";
import IPhoneFrame from "./iPhoneFrame";
import { ArrowUpRight, CheckCircle2, Github, Layers, Play } from "lucide-react";

interface iPhoneShowcaseProps {
  onLaunchBuildLab?: (project: Project) => void;
}

export default function IPhoneShowcase({ onLaunchBuildLab }: iPhoneShowcaseProps) {
  const [activeTab, setActiveTab] = useState<string>(PROJECTS[0].id);

  return (
    <section id="projects" className="relative py-24 px-4 sm:px-8 bg-black text-white border-t border-mono-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-4">
            <Layers size={14} />
            <span>Interactive Applications</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase font-display mb-4 text-white">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-xl font-light">
            Native mobile and web applications running directly inside responsive iPhone simulators.
          </p>

          {/* Project Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-mono-950 border border-mono-850 rounded-full shadow-lg">
            {PROJECTS.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setActiveTab(proj.id)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeTab === proj.id
                    ? "bg-white text-black font-semibold shadow-md"
                    : "text-mono-400 hover:text-white"
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Project Display Grid */}
        {PROJECTS.map((project) => {
          if (project.id !== activeTab) return null;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-mono-950/80 border border-mono-850 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
            >
              {/* Left Column: Project Details & Case Study */}
              <div className="lg:col-span-7 flex flex-col justify-center gap-6">
                <div>
                  <span className="text-xs font-mono tracking-widest text-mono-400 uppercase">
                    {project.tagline}
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1 mb-4 font-display">
                    {project.title}
                  </h3>
                  <p className="text-sm sm:text-base text-mono-300 font-light leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
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
                  <h4 className="text-xs font-mono uppercase tracking-wider text-mono-400 mb-3">
                    Engineered Features
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {project.features.map((feat, idx) => (
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
                    <span className="text-mono-200">{project.caseStudy.architecture}</span>
                  </div>
                  <div className="p-4 bg-black border border-mono-850 rounded-xl">
                    <span className="text-mono-500 uppercase block mb-1">System Impact</span>
                    <span className="text-mono-200">{project.caseStudy.impact}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {onLaunchBuildLab && project.type === "flutter-web" && (
                    <button
                      onClick={() => onLaunchBuildLab(project)}
                      className="px-6 py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5"
                    >
                      <Play size={13} className="fill-black" />
                      <span>Launch App in Lab</span>
                    </button>
                  )}
                  <a
                    href={project.githubUrl}
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
                <IPhoneFrame project={project} onLaunchBuildLab={onLaunchBuildLab} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
