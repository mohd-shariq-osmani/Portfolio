"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Monitor, RefreshCw, Smartphone, X } from "lucide-react";
import { Project, ProjectRoute } from "@/data/projects";
import ProjectViewport, {
  PreviewMode,
  isTouchViewport,
} from "@/components/showcase/ProjectViewport";
import DesktopBrowserViewport from "@/components/showcase/DesktopBrowserViewport";
import { pauseLenis, resumeLenis } from "@/lib/smoothScroll";

interface AppLauncherModalProps {
  project: Project | null;
  initialRoute?: ProjectRoute;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DEFAULT_ROUTE: ProjectRoute = {
  id: "dashboard",
  label: "Dashboard",
  path: "/dashboard",
  summary: "Live workspace overview.",
};

export default function AppLauncherModal({
  project,
  initialRoute,
  onClose,
}: AppLauncherModalProps) {
  const [reloadNonce, setReloadNonce] = useState(0);
  const [mode, setMode] = useState<PreviewMode>("sim");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoute, setActiveRoute] = useState<ProjectRoute>(DEFAULT_ROUTE);
  const [isDesktopBooted, setIsDesktopBooted] = useState(true);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isOpen = Boolean(project);
  const isDesktopProject =
    project?.formFactor === "desktop" || project?.type === "web-app";

  useEffect(() => {
    if (!project) return;

    if (project.formFactor === "desktop" || project.type === "web-app") {
      const nextRoute = initialRoute ?? project.routes?.[0] ?? DEFAULT_ROUTE;
      setActiveRoute(nextRoute);
      setIsDesktopBooted(true);
      setReloadNonce(0);
      return;
    }

    const hasLiveMedia =
      (project.type === "flutter-web" && Boolean(project.demoUrl)) ||
      (project.type === "video" && Boolean(project.videoUrl));

    // On mobile touch devices or for Vault (which showcases pre-seeded dummy IDs in Sim Mode), default to simulator
    const initialMode: PreviewMode =
      project.id !== "vault" && !isTouchViewport() && hasLiveMedia
        ? "live"
        : "sim";

    setMode(initialMode);
    setIsLoading(initialMode === "live");
    setReloadNonce(0);
  }, [project, initialRoute]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    pauseLenis();

    const focusTimer = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      resumeLenis();
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

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

  const hasLiveMedia =
    Boolean(project) &&
    ((project?.type === "flutter-web" && Boolean(project.demoUrl)) ||
      (project?.type === "video" && Boolean(project.videoUrl)));

  const switchButtonLabel =
    mode === "sim"
      ? project?.type === "video"
        ? "Switch to Video"
        : "Switch to Web"
      : "Switch to Sim";

  const externalWebUrl = project?.demoUrl
    ? `${project.demoUrl.replace(/\/$/, "")}${activeRoute.path}`
    : undefined;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="app-launcher-modal"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-launcher-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between gap-3 p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/95"
        >
          {/* Header Bar (in-flow so it never collides with hardware frame on short phones) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[1280px] flex items-center justify-between gap-2 z-30 shrink-0"
          >
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-mono-900 border border-mono-700 flex items-center justify-center text-white shrink-0">
                {isDesktopProject ? <Monitor size={18} /> : <Smartphone size={18} />}
              </div>
              <div>
                <h3
                  id="app-launcher-title"
                  className="text-xs sm:text-sm font-bold text-white font-display"
                >
                  {project.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-mono text-mono-400">
                  Build Lab •{" "}
                  {isDesktopProject
                    ? `Live Web Workspace (${activeRoute.label})`
                    : mode === "live"
                      ? project.type === "video"
                        ? "Demo Video"
                        : "Flutter Web"
                      : "Interactive Sim"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {!isDesktopProject && hasLiveMedia && (
                <button
                  type="button"
                  onClick={() =>
                    handleModeChange(mode === "sim" ? "live" : "sim")
                  }
                  className="inline-flex cursor-pointer px-3 py-1.5 text-mono-300 hover:text-white bg-mono-900 border border-mono-800 rounded-full text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {switchButtonLabel}
                </button>
              )}
              {isDesktopProject && externalWebUrl && (
                <a
                  href={externalWebUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-mono-300 hover:text-white bg-mono-900 border border-mono-800 rounded-full text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <span>Open Fullscreen</span>
                  <ArrowUpRight size={13} />
                </a>
              )}
              <button
                type="button"
                onClick={handleReload}
                aria-label={`Reload ${project.title}`}
                className="p-2 sm:p-2.5 text-mono-400 hover:text-white bg-mono-900 border border-mono-800 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                title="Reload App"
              >
                <RefreshCw size={15} />
              </button>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} GitHub Repository`}
                className="p-2 sm:p-2.5 text-mono-400 hover:text-white bg-mono-900 border border-mono-800 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                title="GitHub Repository"
              >
                <Github size={15} />
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close Build Lab modal"
                className="px-3.5 sm:px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all flex items-center gap-1.5 shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X size={14} />
                <span className="hidden sm:inline">Close App</span>
              </button>
            </div>
          </div>

          {isDesktopProject ? (
            /* Expanded Desktop Browser Window */
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="min-h-0 flex-1 w-full max-w-[1280px] flex items-center justify-center"
            >
              <DesktopBrowserViewport
                project={project}
                activeRoute={activeRoute}
                onRouteChange={setActiveRoute}
                isBooted={isDesktopBooted}
                onBoot={(route) => {
                  if (route) setActiveRoute(route);
                  setIsDesktopBooted(true);
                }}
                onExitToPreview={() => setIsDesktopBooted(false)}
                reloadNonce={reloadNonce}
                onReload={handleReload}
                className="h-full max-h-[820px]"
              />
            </motion.div>
          ) : (
            /* Expanded Phone Hardware Frame */
            <div className="min-h-0 flex-1 w-full flex items-center justify-center">
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 24, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative w-full max-w-[380px] sm:max-w-[420px] h-full max-h-[780px] bg-mono-950 border-[10px] sm:border-[12px] border-mono-800 rounded-[48px] sm:rounded-[56px] shadow-2xl shadow-black p-2.5 sm:p-3 flex flex-col items-center justify-between"
              >
                {/* Dynamic Island Notch */}
                <div className="pointer-events-none absolute top-4 sm:top-5 z-30 w-24 sm:w-28 h-5 sm:h-6 bg-black rounded-full flex items-center justify-end px-3 gap-2 border border-mono-850">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-mono-900 border border-mono-700" />
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-mono-800" />
                </div>

                {/* Screen Content Viewport */}
                <div className="relative w-full h-full bg-black rounded-[38px] sm:rounded-[42px] overflow-hidden flex flex-col pt-8 sm:pt-9 pb-3 border border-mono-900">
                  <ProjectViewport
                    project={project}
                    mode={mode}
                    onModeChange={handleModeChange}
                    reloadNonce={reloadNonce}
                    onReload={handleReload}
                    isLoading={isLoading}
                    onLoaded={handleLoaded}
                    onLoadError={handleLoadError}
                  />
                </div>

                {/* Home Bar */}
                <div className="pointer-events-none absolute bottom-3.5 sm:bottom-4 z-30 w-32 sm:w-36 h-1 bg-mono-500 rounded-full" />
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
