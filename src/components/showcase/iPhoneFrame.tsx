"use client";

import { Project } from "@/data/projects";
import DailyTaskApp from "@/components/apps/DailyTaskApp";
import VaultApp from "@/components/apps/VaultApp";
import N8nCompanionApp from "@/components/apps/N8nCompanionApp";
import RelayApp from "@/components/apps/RelayApp";
import { Maximize2, RefreshCw, Smartphone, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface IPhoneFrameProps {
  project: Project;
  onLaunchBuildLab?: (project: Project) => void;
}

export default function IPhoneFrame({ project, onLaunchBuildLab }: IPhoneFrameProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Timeout safety guard: if iframe takes > 2s to load, switch to responsive simulator
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [project.id, iframeKey, useFallback]);

  const handleRefresh = () => {
    setUseFallback(false);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const renderFallbackApp = () => {
    switch (project.id) {
      case "dailytask":
        return <DailyTaskApp />;
      case "vault":
        return <VaultApp />;
      case "n8n-companion":
        return <N8nCompanionApp />;
      case "relay":
        return <RelayApp />;
      default:
        return <DailyTaskApp />;
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      {/* iPhone hardware shell: a stable 9:19.5 ratio keeps the frame natural at every breakpoint. */}
      <div className="relative w-[min(78vw,300px)] sm:w-[300px] aspect-[9/19.5] rounded-[46px] bg-gradient-to-br from-[#52525b] via-[#27272a] to-[#09090b] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)] transition-transform duration-500 group-hover:-translate-y-1">
        {/* Side hardware buttons */}
        <div className="absolute -left-[5px] top-[23%] h-12 w-1 rounded-l-full bg-[#52525b] shadow-[0_0_0_1px_rgba(0,0,0,0.6)]" />
        <div className="absolute -left-[5px] top-[33%] h-12 w-1 rounded-l-full bg-[#52525b] shadow-[0_0_0_1px_rgba(0,0,0,0.6)]" />
        <div className="absolute -right-[5px] top-[27%] h-16 w-1 rounded-r-full bg-[#52525b] shadow-[0_0_0_1px_rgba(0,0,0,0.6)]" />

        {/* Screen viewport */}
        <div className="relative h-full w-full overflow-hidden rounded-[39px] border border-white/10 bg-black shadow-[inset_0_0_0_1px_rgba(0,0,0,0.8)]">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-3 z-30 flex h-6 w-[88px] -translate-x-1/2 items-center justify-end gap-2 rounded-full border border-white/10 bg-black px-3 shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            <div className="h-3 w-3 rounded-full border border-mono-700 bg-mono-900" />
            <div className="h-2 w-2 rounded-full bg-mono-800" />
          </div>

          <div className="relative flex h-full w-full flex-col bg-black pb-4 pt-8">
          {!useFallback && project.type === "flutter-web" && project.demoUrl ? (
            <div className="relative h-full w-full">
              {/* Top Controls bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-mono-950/90 border-b border-mono-850 z-20 flex items-center justify-between px-3">
                <span className="text-[9px] font-mono text-mono-400 uppercase">
                  Flutter Web Engine
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseFallback(true)}
                    className="cursor-pointer text-[9px] font-mono text-mono-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
                  >
                    Sim Mode
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="cursor-pointer rounded p-1 text-mono-400 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
                    title="Reload App"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>

              {/* Loading Indicator Spinner */}
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-mono-950/90 p-4 pt-8 text-center backdrop-blur-sm">
                  <Loader2 size={24} className="text-white animate-spin mb-2" />
                  <span className="text-xs font-mono text-white">Loading Engine...</span>
                  <span className="text-[10px] font-mono text-mono-500 mt-1">{project.title}</span>
                </div>
              )}

              {/* Real Compiled Flutter Web Iframe */}
              <iframe
                key={iframeKey}
                src={project.demoUrl}
                title={`${project.title} Flutter Web`}
                loading="lazy"
                className="h-full w-full border-0"
                onLoad={() => setIsLoading(false)}
                onError={() => setUseFallback(true)}
              />
            </div>
          ) : (
            <div className="relative h-full w-full">
              {renderFallbackApp()}
            </div>
          )}
          </div>
        </div>

        {/* Home bar indicator */}
        <div className="absolute bottom-3 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/60" />
      </div>

      {/* Quick Launch Control Below Phone */}
      {onLaunchBuildLab && (
        <button
          onClick={() => onLaunchBuildLab(project)}
          className="mt-5 flex cursor-pointer items-center gap-1.5 rounded-full border border-mono-800 bg-mono-950 px-4 py-2 text-xs font-mono text-mono-300 transition-all hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <Maximize2 size={13} />
          <span>Launch Full Build Lab</span>
        </button>
      )}
    </div>
  );
}
