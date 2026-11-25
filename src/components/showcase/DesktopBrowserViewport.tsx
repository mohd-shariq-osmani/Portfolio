"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Loader2,
  Lock,
  Maximize2,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Project, ProjectRoute } from "@/data/projects";

interface DesktopBrowserViewportProps {
  project: Project;
  activeRoute: ProjectRoute;
  onRouteChange: (route: ProjectRoute) => void;
  isBooted: boolean;
  onBoot: (route?: ProjectRoute) => void;
  onExitToPreview?: () => void;
  reloadNonce: number;
  onReload: () => void;
  onExpand?: () => void;
  className?: string;
}

export default function DesktopBrowserViewport({
  project,
  activeRoute,
  onRouteChange,
  isBooted,
  onBoot,
  onExitToPreview,
  reloadNonce,
  onReload,
  onExpand,
  className = "",
}: DesktopBrowserViewportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const baseUrl = (project.demoUrl ?? "https://orbit.shariqosmani.xyz").replace(/\/$/, "");
  const fullUrl = `${baseUrl}${activeRoute.path}`;
  const displayHost = baseUrl.replace(/^https?:\/\//, "");
  const routes = project.routes ?? [];

  useEffect(() => {
    if (!isBooted) {
      setIsLoading(false);
      setIsSlow(false);
      return;
    }

    setIsLoading(true);
    setIsSlow(false);
    const slowTimer = setTimeout(() => {
      setIsSlow(true);
    }, 4500);

    return () => clearTimeout(slowTimer);
  }, [isBooted, activeRoute.path, reloadNonce]);

  return (
    <div
      className={`flex flex-col w-full overflow-hidden rounded-2xl border border-mono-800 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.75)] ${className}`}
    >
      {/* Monochrome Browser Window Chrome */}
      <div className="flex flex-col border-b border-mono-850 bg-mono-950">
        {/* Top bar: Window controls + URL bar + Window actions */}
        <div className="flex items-center justify-between gap-3 px-3.5 sm:px-4 py-2.5">
          {/* Left traffic dots (strictly monochrome) */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-mono-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-mono-800" />
            <span className="h-2.5 w-2.5 rounded-full bg-mono-800" />
          </div>

          {/* URL Pill */}
          <div className="flex min-w-0 flex-1 max-w-xl items-center gap-2 rounded-full border border-mono-800 bg-black px-3 py-1 text-[11px] font-mono text-mono-300">
            <Lock size={11} className="text-mono-500 shrink-0" />
            <span className="truncate">
              <span className="text-mono-500">https://</span>
              <span className="text-white">{displayHost}</span>
              <span className="text-mono-400">{activeRoute.path}</span>
            </span>
            <span
              className={`ml-auto hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                isBooted
                  ? "bg-white text-black font-semibold"
                  : "bg-mono-900 text-mono-400 border border-mono-800"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBooted ? "bg-black animate-pulse" : "bg-mono-500"
                }`}
              />
              {isBooted ? "Live" : "Ready"}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isBooted && onExitToPreview && (
              <button
                type="button"
                onClick={onExitToPreview}
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-mono-800 bg-mono-900 px-2.5 py-1 text-[10px] font-mono text-mono-300 hover:border-mono-600 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={10} />
                <span>Overview</span>
              </button>
            )}
            {isBooted && (
              <button
                type="button"
                onClick={onReload}
                aria-label="Reload Orbit workspace"
                title="Reload workspace"
                className="p-1.5 rounded-full border border-mono-800 bg-mono-900 text-mono-400 hover:text-white hover:border-mono-600 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
              </button>
            )}
            {onExpand && (
              <button
                type="button"
                onClick={onExpand}
                aria-label="Expand Orbit in Build Lab"
                title="Expand in Build Lab"
                className="p-1.5 rounded-full border border-mono-800 bg-mono-900 text-mono-400 hover:text-white hover:border-mono-600 transition-colors cursor-pointer"
              >
                <Maximize2 size={12} />
              </button>
            )}
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Orbit in a new browser tab"
              title="Open in new tab"
              className="inline-flex items-center gap-1 rounded-full border border-mono-800 bg-mono-900 px-2.5 py-1 text-[10px] font-mono text-mono-300 hover:border-mono-600 hover:text-white transition-colors"
            >
              <span className="hidden md:inline">New Tab</span>
              <ArrowUpRight size={11} />
            </a>
          </div>
        </div>

        {/* Route Quick-Jump Strip */}
        {routes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-mono-900 px-3.5 sm:px-4 py-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-mono-500 mr-1 shrink-0">
              Modules:
            </span>
            {routes.map((route) => {
              const isSelected = route.id === activeRoute.id;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => {
                    onRouteChange(route);
                    if (!isBooted) {
                      onBoot(route);
                    }
                  }}
                  className={`relative shrink-0 rounded-full px-3 py-1 text-[11px] font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white text-black font-semibold"
                      : "bg-mono-900/80 text-mono-400 border border-mono-850 hover:text-white hover:border-mono-700"
                  }`}
                >
                  {route.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Viewport Content Area */}
      <div className="relative flex-1 min-h-0 w-full bg-black">
        <AnimatePresence mode="wait">
          {!isBooted ? (
            <motion.div
              key="orbit-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-full flex-col justify-between p-5 sm:p-8 overflow-y-auto"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center gap-6 my-auto max-w-2xl mx-auto w-full">
                {/* Concise Launch Card */}
                <div className="flex flex-col items-center gap-4">
                  <span className="px-3 py-1 rounded-full border border-mono-800 bg-mono-950 text-[11px] font-mono text-mono-400">
                    Zero-Signup Sandbox · {activeRoute.path}
                  </span>
                  <h4 className="text-2xl sm:text-3xl font-bold font-display text-white">
                    {project.title} — {activeRoute.label}
                  </h4>
                  <p className="text-xs sm:text-sm text-mono-400 font-light max-w-md">
                    {activeRoute.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => onBoot(activeRoute)}
                    className="mt-1 px-6 py-3 rounded-full bg-white text-black text-xs font-semibold hover:bg-mono-200 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Play size={13} className="fill-black" />
                    <span>Boot Live Workspace</span>
                  </button>
                </div>

                {/* Compact Route Pills */}
                {routes.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {routes.map((route) => {
                      const active = route.id === activeRoute.id;
                      return (
                        <button
                          key={route.id}
                          type="button"
                          onClick={() => {
                            onRouteChange(route);
                            onBoot(route);
                          }}
                          className={`group flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-mono transition-all cursor-pointer ${
                            active
                              ? "border-mono-500 bg-mono-900 text-white"
                              : "border-mono-850 bg-mono-950/90 text-mono-400 hover:border-mono-700 hover:text-white"
                          }`}
                        >
                          {route.id === "assistant" && (
                            <Sparkles size={12} className="text-mono-300" />
                          )}
                          <span>{route.label}</span>
                          <span className="text-[10px] text-mono-600 group-hover:text-mono-400">
                            {route.path}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="orbit-live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative h-full w-full bg-white"
            >
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-mono-950/95 p-6 text-center">
                  <Loader2 size={26} className="mb-3 animate-spin text-white" />
                  <span className="text-xs sm:text-sm font-mono text-white">
                    Booting Orbit CRM Workspace...
                  </span>
                  <span className="mt-1 text-[11px] font-mono text-mono-400">
                    {fullUrl}
                  </span>
                  {isSlow && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-mono-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>Open in New Tab</span>
                        <ArrowUpRight size={12} />
                      </a>
                      {onExitToPreview && (
                        <button
                          type="button"
                          onClick={onExitToPreview}
                          className="rounded-full border border-mono-700 bg-mono-900 px-4 py-1.5 text-xs font-mono text-mono-200 hover:border-white hover:text-white transition-colors cursor-pointer"
                        >
                          Back to Overview
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
              <iframe
                key={`${activeRoute.path}-${reloadNonce}`}
                src={fullUrl}
                title={`${project.title} — ${activeRoute.label}`}
                loading="lazy"
                allow="clipboard-write"
                className="h-full w-full border-0"
                onLoad={() => setIsLoading(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
