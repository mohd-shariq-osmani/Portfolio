"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Play, RefreshCw, Smartphone, Video } from "lucide-react";
import { Project } from "@/data/projects";
import DailyTaskApp from "@/components/apps/DailyTaskApp";
import VaultApp from "@/components/apps/VaultApp";
import N8nCompanionApp from "@/components/apps/N8nCompanionApp";
import RelayApp from "@/components/apps/RelayApp";

export type PreviewMode = "sim" | "live";

export function isTouchViewport(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth < 768 ||
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  );
}

interface ProjectViewportProps {
  project: Project;
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  reloadNonce: number;
  onReload: () => void;
  isLoading: boolean;
  onLoaded: () => void;
  onLoadError: () => void;
  showTopBar?: boolean;
}

export default function ProjectViewport({
  project,
  mode,
  onModeChange,
  reloadNonce,
  onReload,
  isLoading,
  onLoaded,
  onLoadError,
  showTopBar = false,
}: ProjectViewportProps) {
  const [isSlow, setIsSlow] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hasLiveFlutter = project.type === "flutter-web" && Boolean(project.demoUrl);
  const hasLiveVideo = project.type === "video" && Boolean(project.videoUrl);
  const hasLiveMedia = hasLiveFlutter || hasLiveVideo;
  const activeMode: PreviewMode = mode === "live" && hasLiveMedia ? "live" : "sim";

  useEffect(() => {
    if (!isLoading || activeMode !== "live") {
      setIsSlow(false);
      return;
    }

    const slowTimer = setTimeout(() => {
      setIsSlow(true);
    }, 4000);

    return () => clearTimeout(slowTimer);
  }, [isLoading, activeMode, project.id, reloadNonce]);

  useEffect(() => {
    if (activeMode === "live" && hasLiveVideo && videoRef.current?.readyState && videoRef.current.readyState >= 2) {
      onLoaded();
    }
  }, [activeMode, hasLiveVideo, onLoaded, project.id, reloadNonce]);

  const renderFallbackApp = () => {
    switch (project.id) {
      case "dailytask":
        return <DailyTaskApp key={reloadNonce} />;
      case "vault":
        return <VaultApp key={reloadNonce} />;
      case "n8n-companion":
        return <N8nCompanionApp key={reloadNonce} />;
      case "relay":
        return <RelayApp key={reloadNonce} />;
      default:
        return <DailyTaskApp key={reloadNonce} />;
    }
  };

  const liveLabel = project.type === "video" ? "Demo Video" : "Flutter Web";
  const switchToLiveLabel = project.type === "video" ? "Video Demo" : "Live Web";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
      {showTopBar && (
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-mono-850 bg-mono-950/95 px-3">
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-mono-400">
            {activeMode === "live" ? (
              project.type === "video" ? (
                <Video size={10} />
              ) : (
                <Play size={10} />
              )
            ) : (
              <Smartphone size={10} />
            )}
            <span>{activeMode === "live" ? liveLabel : "Sim Mode"}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {hasLiveMedia && (
              <button
                type="button"
                onClick={() => onModeChange(activeMode === "sim" ? "live" : "sim")}
                className="cursor-pointer rounded border border-mono-800 bg-mono-900 px-2 py-0.5 text-[9px] font-mono text-mono-300 transition-colors hover:border-mono-600 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
              >
                {activeMode === "sim" ? switchToLiveLabel : "Sim Mode"}
              </button>
            )}
            <button
              type="button"
              onClick={onReload}
              aria-label={`Reload ${project.title}`}
              title="Reload App"
              className="cursor-pointer rounded p-1 text-mono-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/70"
            >
              <RefreshCw size={11} />
            </button>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 w-full">
        {activeMode === "live" && hasLiveFlutter ? (
          <div className="relative h-full w-full">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-mono-950/95 p-4 text-center">
                <Loader2 size={24} className="mb-2.5 animate-spin text-white" />
                <span className="text-xs font-mono text-white">
                  Loading Flutter Engine...
                </span>
                <span className="mt-1 text-[10px] font-mono text-mono-500">
                  {project.title}
                </span>
                {isSlow && (
                  <button
                    type="button"
                    onClick={() => onModeChange("sim")}
                    className="mt-4 cursor-pointer rounded-full border border-mono-700 bg-mono-900 px-3 py-1 text-[10px] font-mono text-mono-200 transition-colors hover:border-white hover:text-white"
                  >
                    Taking a while? Switch to Sim
                  </button>
                )}
              </div>
            )}
            <iframe
              key={`${project.id}-${reloadNonce}`}
              src={project.demoUrl}
              title={`${project.title} Flutter Web`}
              loading="lazy"
              className="h-full w-full border-0"
              onLoad={onLoaded}
              onError={onLoadError}
            />
          </div>
        ) : activeMode === "live" && hasLiveVideo ? (
          <div className="relative flex h-full w-full items-center justify-center bg-black">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-mono-950/95 p-4 text-center">
                <Loader2 size={24} className="mb-2.5 animate-spin text-white" />
                <span className="text-xs font-mono text-white">
                  Loading Demo Video...
                </span>
                {isSlow && (
                  <button
                    type="button"
                    onClick={() => onModeChange("sim")}
                    className="mt-4 cursor-pointer rounded-full border border-mono-700 bg-mono-900 px-3 py-1 text-[10px] font-mono text-mono-200 transition-colors hover:border-white hover:text-white"
                  >
                    Switch to Interactive Sim
                  </button>
                )}
              </div>
            )}
            <video
              ref={videoRef}
              key={`${project.id}-${reloadNonce}`}
              src={project.videoUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label={`${project.title} demo video`}
              className="h-full w-full object-cover bg-black"
              onLoadedData={onLoaded}
              onCanPlay={onLoaded}
              onError={onLoadError}
            />
          </div>
        ) : (
          <div className="h-full w-full">{renderFallbackApp()}</div>
        )}
      </div>
    </div>
  );
}
