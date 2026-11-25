"use client";

import { useCallback, useState } from "react";
import { ORBIT_PROJECT, Project, ProjectRoute } from "@/data/projects";
import DesktopBrowserViewport from "./DesktopBrowserViewport";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowUpRight, Github, Layers, Monitor, Play } from "lucide-react";

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
    <div className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-8 bg-black text-white border-t border-mono-900">
      <div className="max-w-6xl mx-auto">
        {/* Top Section Header */}
        <Reveal className="flex flex-col items-center text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-3 sm:mb-4">
            <Layers size={14} />
            <span>Interactive Applications</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase font-display mb-2.5 sm:mb-3 text-white">
            Featured Projects
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-xl font-light">
            Interactive AI web workspace and native mobile application.
          </p>
        </Reveal>

        {/* Flagship Web Platform Card (Orbit CRM) */}
        <Reveal
          delay={0.08}
          className="bg-mono-950 md:bg-mono-950/80 border border-mono-850 rounded-3xl p-5 sm:p-9 shadow-2xl md:backdrop-blur-xl flex flex-col gap-6 sm:gap-7"
        >
          {/* Compact Top Header + Metrics + Actions */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl flex flex-col gap-3">
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-black border border-mono-800 text-[11px] font-mono text-mono-300">
                <Monitor size={12} />
                <span>Flagship Web App</span>
              </div>
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display">
                  {project.title}
                </h3>
                <p className="text-sm sm:text-base text-mono-300 font-light mt-1.5">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-[11px] font-mono bg-mono-900 border border-mono-800 text-mono-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:items-end shrink-0">
              {project.highlights && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 w-full lg:w-auto">
                  {project.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="px-3.5 py-2.5 rounded-xl bg-black border border-mono-850"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-wider text-mono-500 block">
                        {item.label}
                      </span>
                      <span className="text-xs font-bold text-white font-display mt-0.5 block">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                {onLaunchBuildLab && (
                  <button
                    type="button"
                    onClick={() => onLaunchBuildLab(project, activeRoute)}
                    className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
                  >
                    <Play size={13} className="fill-black" />
                    <span>Expand View</span>
                  </button>
                )}
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-mono-900 border border-mono-800 text-mono-200 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-1.5"
                >
                  <span>Live Portal</span>
                  <ArrowUpRight size={13} />
                </a>
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-mono-900 border border-mono-800 text-mono-300 hover:text-white hover:border-mono-600 font-medium text-xs rounded-full transition-all flex items-center gap-2"
                >
                  <Github size={14} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Desktop Browser Viewport */}
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
            className="h-[400px] sm:h-[580px] lg:h-[640px]"
          />
        </Reveal>
      </div>
    </div>
  );
}
