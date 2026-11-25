"use client";

import { useCallback, useState } from "react";
import { ORBIT_PROJECT, Project, ProjectRoute } from "@/data/projects";
import DesktopBrowserViewport from "./DesktopBrowserViewport";
import { Reveal } from "@/components/motion/Reveal";
import {
  ArrowUpRight,
  CheckCircle2,
  Github,
  Layers,
  Monitor,
  Play,
} from "lucide-react";

interface WebShowcaseProps {
  onLaunchBuildLab?: (project: Project, initialRoute?: ProjectRoute) => void;
}

export default function WebShowcase({ onLaunchBuildLab }: WebShowcaseProps) {
  const project = ORBIT_PROJECT;
  const routes = project.routes ?? [];
  const [activeRoute, setActiveRoute] = useState<ProjectRoute>(
    routes[0] ?? {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      summary: "Live revenue dashboard.",
    }
  );
  const [isBooted, setIsBooted] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const handleBoot = useCallback((route?: ProjectRoute) => {
    if (route) {
      setActiveRoute(route);
    }
    setIsBooted(true);
  }, []);

  const handleReload = useCallback(() => {
    setReloadNonce((prev) => prev + 1);
  }, []);

  const liveHref = `${(project.demoUrl ?? "https://orbit.shariqosmani.xyz").replace(
    /\/$/,
    ""
  )}${activeRoute.path}`;

  return (
    <div className="relative pt-24 pb-16 px-4 sm:px-8 bg-black text-white border-t border-mono-900">
      <div className="max-w-6xl mx-auto">
        {/* Top Section Header */}
        <Reveal className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-4">
            <Layers size={14} />
            <span>Interactive Applications</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase font-display mb-4 text-white">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-2xl font-light">
            Full-stack AI web platforms and cross-platform mobile applications—explore and test them live right here.
          </p>
        </Reveal>

        {/* Flagship Web Platform Card (Orbit CRM) */}
        <Reveal
          delay={0.08}
          className="bg-mono-950 md:bg-mono-950/80 border border-mono-850 rounded-3xl p-6 sm:p-10 shadow-2xl md:backdrop-blur-xl flex flex-col gap-8"
        >
          {/* Project Details & KPIs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Narrative + Features */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black border border-mono-800 text-[11px] font-mono text-mono-300 mb-3">
                  <Monitor size={12} />
                  <span>Flagship Web Platform · Self-Hosted</span>
                </div>
                <span className="block text-xs font-mono tracking-widest text-mono-400 uppercase">
                  {project.tagline}
                </span>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-1 mb-3 font-display">
                  {project.title}
                </h3>
                <p className="text-sm sm:text-base text-mono-300 font-light leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack Tags */}
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

              {/* Key Features */}
              <div className="bg-mono-900/80 border border-mono-850 rounded-2xl p-5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-mono-400 mb-3">
                  Engineered Features
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {project.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-mono-300"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-mono-400 shrink-0 mt-0.5"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Metrics, Case Study & Actions */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {project.highlights && (
                <div className="grid grid-cols-2 gap-3">
                  {project.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="p-3.5 rounded-xl bg-black border border-mono-850"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-mono-500 block">
                        {item.label}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white font-display mt-1 block">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-black border border-mono-850 rounded-xl text-xs font-mono">
                <span className="text-mono-500 uppercase block mb-1">
                  Architecture
                </span>
                <span className="text-mono-200 leading-relaxed">
                  {project.caseStudy.architecture}
                </span>
              </div>

              <div className="p-4 bg-black border border-mono-850 rounded-xl text-xs font-mono">
                <span className="text-mono-500 uppercase block mb-1">
                  System Impact
                </span>
                <span className="text-mono-200 leading-relaxed">
                  {project.caseStudy.impact}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {onLaunchBuildLab && (
                  <button
                    type="button"
                    onClick={() => onLaunchBuildLab(project, activeRoute)}
                    className="px-5 py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                  >
                    <Play size={13} className="fill-black" />
                    <span>Launch in Build Lab</span>
                  </button>
                )}
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-mono-900 border border-mono-800 text-mono-200 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-1.5"
                >
                  <span>Live Portal</span>
                  <ArrowUpRight size={13} />
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 bg-mono-900 border border-mono-800 text-mono-300 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-2"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Full-Width Interactive Desktop Browser Viewport */}
          <DesktopBrowserViewport
            project={project}
            activeRoute={activeRoute}
            onRouteChange={setActiveRoute}
            isBooted={isBooted}
            onBoot={handleBoot}
            onExitToPreview={() => setIsBooted(false)}
            reloadNonce={reloadNonce}
            onReload={handleReload}
            onExpand={
              onLaunchBuildLab
                ? () => onLaunchBuildLab(project, activeRoute)
                : undefined
            }
            className="h-[540px] sm:h-[600px] lg:h-[660px]"
          />
        </Reveal>
      </div>
    </div>
  );
}
