"use client";

import { PROJECTS, Project } from "@/data/projects";
import { Play, Smartphone, Terminal, Video } from "lucide-react";

interface BuildLabProps {
  onLaunch: (project: Project) => void;
}

export default function BuildLab({ onLaunch }: BuildLabProps) {
  return (
    <section
      id="build-lab"
      className="relative py-24 px-4 sm:px-8 bg-mono-950 text-white border-t border-mono-900 overflow-hidden"
    >
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-900 border border-mono-800 text-xs font-mono text-mono-300 mb-4">
            <Terminal size={14} />
            <span>Signature Feature</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase font-display mb-4 text-white">
            BUILD LAB
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-lg font-light">
            Don't just read about code. Click below to launch live applications directly inside an expanded mobile environment.
          </p>
        </div>

        {/* Signature Interactive List */}
        <div className="flex flex-col gap-4">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-black border border-mono-850 hover:border-mono-600 rounded-2xl transition-all duration-300 shadow-xl"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-mono-900 border border-mono-800 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  {project.type === "flutter-web" ? (
                    <Smartphone size={20} />
                  ) : (
                    <Video size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                    {project.title}
                    <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-mono-900 border border-mono-800 text-mono-400">
                      {project.type === "flutter-web" ? "Flutter Web" : "Video Demo"}
                    </span>
                  </h3>
                  <p className="text-xs text-mono-400 font-light mt-0.5 line-clamp-1 max-w-md">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onLaunch(project)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105 shrink-0"
              >
                <Play size={13} className="fill-black" />
                <span>
                  {project.type === "flutter-web" ? "[ Launch ]" : "[ Watch Demo ]"}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
