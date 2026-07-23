"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/data/projects";
import DailyTaskApp from "@/components/apps/DailyTaskApp";
import VaultApp from "@/components/apps/VaultApp";
import N8nCompanionApp from "@/components/apps/N8nCompanionApp";
import RelayApp from "@/components/apps/RelayApp";
import { Github, RefreshCw, Smartphone, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface AppLauncherModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function AppLauncherModal({ project, onClose }: AppLauncherModalProps) {
  const [resetKey, setResetKey] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!project) return;
    setIsLoading(true);
    setUseFallback(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [project?.id, resetKey]);

  if (!project) return null;

  const renderFallbackApp = () => {
    switch (project.id) {
      case "dailytask":
        return <DailyTaskApp key={resetKey} />;
      case "vault":
        return <VaultApp key={resetKey} />;
      case "n8n-companion":
        return <N8nCompanionApp key={resetKey} />;
      case "relay":
        return <RelayApp key={resetKey} />;
      default:
        return <DailyTaskApp key={resetKey} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
      >
        {/* Header Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-mono-900 border border-mono-700 flex items-center justify-center text-white">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                {project.title}
              </h3>
              <p className="text-[11px] font-mono text-mono-400">
                Build Lab • Active Session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseFallback(!useFallback)}
              className="px-3 py-1.5 text-mono-300 hover:text-white bg-mono-900 border border-mono-800 rounded-full text-xs font-mono transition-colors"
            >
              {useFallback ? "Switch to Web" : "Switch to Sim"}
            </button>
            <button
              onClick={() => {
                setUseFallback(false);
                setIsLoading(true);
                setResetKey((k) => k + 1);
              }}
              className="p-2.5 text-mono-400 hover:text-white bg-mono-900 border border-mono-800 rounded-full transition-colors cursor-pointer"
              title="Reload App"
            >
              <RefreshCw size={16} />
            </button>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 text-mono-400 hover:text-white bg-mono-900 border border-mono-800 rounded-full transition-colors cursor-pointer"
              title="GitHub Repository"
            >
              <Github size={16} />
            </a>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <X size={14} />
              <span>Close App</span>
            </button>
          </div>
        </div>

        {/* Expanded Phone Hardware Frame */}
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative w-full max-w-[390px] sm:max-w-[430px] h-[82vh] max-h-[820px] bg-mono-950 border-[12px] border-mono-800 rounded-[56px] shadow-2xl shadow-black p-3 flex flex-col items-center justify-between"
        >
          {/* Dynamic Island Notch */}
          <div className="absolute top-5 z-30 w-28 h-6 bg-black rounded-full flex items-center justify-end px-3 gap-2 border border-mono-850">
            <div className="w-3 h-3 rounded-full bg-mono-900 border border-mono-700" />
            <div className="w-2 h-2 rounded-full bg-mono-800" />
          </div>

          {/* Screen Content Viewport */}
          <div className="relative w-full h-full bg-black rounded-[42px] overflow-hidden flex flex-col pt-8 pb-3 border border-mono-900">
            {!useFallback && project.type === "flutter-web" && project.demoUrl ? (
              <div className="relative w-full h-full">
                {isLoading && (
                  <div className="absolute inset-0 bg-mono-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
                    <Loader2 size={28} className="text-white animate-spin mb-3" />
                    <span className="text-xs font-mono text-white">Launching Application...</span>
                  </div>
                )}
                <iframe
                  key={resetKey}
                  src={project.demoUrl}
                  title={`${project.title} Live App`}
                  className="w-full h-full border-0"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setUseFallback(true)}
                />
              </div>
            ) : (
              <div className="w-full h-full">
                {renderFallbackApp()}
              </div>
            )}
          </div>

          {/* Home Bar */}
          <div className="absolute bottom-4 z-30 w-36 h-1 bg-mono-500 rounded-full" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
