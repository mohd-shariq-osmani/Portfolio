"use client";

import { BUILD_LAB_PROJECTS, Project } from "@/data/projects";
import { Reveal, StaggerItem, StaggerList } from "@/components/motion/Reveal";
import { Monitor, Play, Smartphone, Terminal, Video } from "lucide-react";

interface BuildLabProps {
  onLaunch: (project: Project) => void;
}

function getProjectBadge(type: Project["type"]) {
  switch (type) {
    case "web-app":
      return "Full-Stack Web";
    case "flutter-web":
      return "Flutter Web";
    default:
      return "Video Demo";
  }
}

function getActionLabel(type: Project["type"]) {
  switch (type) {
    case "web-app":
      return "[ Launch Workspace ]";
    case "flutter-web":
      return "[ Launch ]";
    default:
      return "[ Watch Demo ]";
  }
}

export default function BuildLab({ onLaunch }: BuildLabProps) {
  return (
    <section
      id="build-lab"
      className="relative py-24 px-4 sm:px-8 bg-mono-950 text-white border-t border-mono-900 overflow-x-clip"
    >
      {/* Background Accent Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <Reveal className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-900 border border-mono-800 text-xs font-mono text-mono-300 mb-4">
            <Terminal size={14} />
            <span>Signature Feature</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase font-display mb-4 text-white">
            BUILD LAB
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-lg font-light">
            Don&apos;t just read about code. Click below to launch live web platforms and mobile applications inside an expanded interactive environment.
          </p>
        </Reveal>

        {/* Signature Interactive List */}
        <StaggerList className="flex flex-col gap-4" stagger={0.07}>
          {BUILD_LAB_PROJECTS.map((project) => (
            <StaggerItem key={project.id}>
              <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-black border border-mono-850 hover:border-mono-600 rounded-2xl transition-all duration-300 shadow-xl hover:-translate-y-0.5">
                {/* Left Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mono-900 border border-mono-800 group-hover:border-mono-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-all">
                    {project.type === "web-app" ? (
                      <Monitor size={20} />
                    ) : project.type === "flutter-web" ? (
                      <Smartphone size={20} />
                    ) : (
                      <Video size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display flex flex-wrap items-center gap-2">
                      {project.title}
                      <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-mono-900 border border-mono-800 text-mono-400">
                        {getProjectBadge(project.type)}
                      </span>
                    </h3>
                    <p className="text-xs text-mono-400 font-light mt-0.5 line-clamp-1 max-w-md">
                      {project.tagline}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => onLaunch(project)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105 active:scale-95 shrink-0 cursor-pointer select-none"
                >
                  <Play size={13} className="fill-black" />
                  <span>{getActionLabel(project.type)}</span>
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
