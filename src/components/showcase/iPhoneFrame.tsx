"use client";

import { useCallback, useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { Project } from "@/data/projects";
import ProjectViewport, { PreviewMode } from "./ProjectViewport";

interface IPhoneFrameProps {
  project: Project;
  onLaunchBuildLab?: (project: Project) => void;
}

export default function IPhoneFrame({ project, onLaunchBuildLab }: IPhoneFrameProps) {
  const [reloadNonce, setReloadNonce] = useState(0);
  // Default to fast, lightweight React simulator to avoid heavy WebGL/WASM memory pressure on initial load
  const [mode, setMode] = useState<PreviewMode>("sim");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode("sim");
    setIsLoading(false);
    setReloadNonce(0);
  }, [project.id]);

  const handleModeChange = useCallback((nextMode: PreviewMode) => {
    setMode(nextMode);
    setIsLoading(nextMode === "live");
  }, []);

  const handleReload = useCallback(() => {
    setReloadNonce((prev) => prev + 1);
    if (mode === "live") {
      setIsLoading(true);
    }
  }, [mode]);

  const handleLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLoadError = useCallback(() => {
    setIsLoading(false);
    setMode("sim");
  }, []);

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
          <div className="absolute left-1/2 top-3 z-30 flex h-6 w-[88px] -translate-x-1/2 items-center justify-end gap-2 rounded-full border border-white/10 bg-black px-3 shadow-[0_2px_10px_rgba(0,0,0,0.45)] pointer-events-none">
            <div className="h-3 w-3 rounded-full border border-mono-700 bg-mono-900" />
            <div className="h-2 w-2 rounded-full bg-mono-800" />
          </div>

          <div className="relative flex h-full w-full flex-col bg-black pb-4 pt-10">
            <ProjectViewport
              project={project}
              mode={mode}
              onModeChange={handleModeChange}
              reloadNonce={reloadNonce}
              onReload={handleReload}
              isLoading={isLoading}
              onLoaded={handleLoaded}
              onLoadError={handleLoadError}
              showTopBar
            />
          </div>
        </div>

        {/* Home bar indicator */}
        <div className="absolute bottom-3 left-1/2 z-30 h-1 w-28 -translate-x-1/2 rounded-full bg-white/60 pointer-events-none" />
      </div>

      {/* Quick Launch Control Below Phone */}
      {onLaunchBuildLab && (
        <button
          type="button"
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
