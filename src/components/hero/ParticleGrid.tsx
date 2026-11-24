"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  isWhite: boolean;
}

export default function ParticleGrid() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    let animationFrameId: number | null = null;
    let isInView = true;
    let isPageVisible = !document.hidden;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let lastFrameTime = 0;

    let particles: Particle[] = [];
    const mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000 };

    let lastWidth = window.innerWidth;
    let cachedRect: DOMRect | null = null;

    const createParticles = () => {
      particles = [];
      const isMobile = width < 768;
      const count = isMobile
        ? Math.min(20, Math.max(14, Math.floor((width * height) / 28000)))
        : Math.min(Math.max(48, Math.floor((width * height) / 15000)), 85);

      for (let i = 0; i < count; i++) {
        const isWhite = Math.random() > 0.4;
        const baseAlpha = isWhite
          ? Math.random() * 0.4 + 0.35
          : Math.random() * 0.25 + 0.2;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.4 + 1.0,
          baseAlpha,
          alpha: baseAlpha,
          isWhite,
        });
      }
    };

    const drawScene = () => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const maxConnectDist = isMobile ? 90 : 135;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;
      const mouseRadius = 180;

      if (!isCoarsePointer) {
        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;
      }

      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -15) p.x = width + 15;
          else if (p.x > width + 15) p.x = -15;

          if (p.y < -15) p.y = height + 15;
          else if (p.y > height + 15) p.y = -15;

          if (!isCoarsePointer && mouse.x > 0 && mouse.y > 0) {
            const dxMouse = mouse.x - p.x;
            const dyMouse = mouse.y - p.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < mouseRadius && distMouse > 0) {
              const force = (1 - distMouse / mouseRadius) * 0.45;
              p.x -= (dxMouse / distMouse) * force;
              p.y -= (dyMouse / distMouse) * force;
              p.alpha = Math.min(
                p.baseAlpha + (1 - distMouse / mouseRadius) * 0.5,
                0.95
              );
            } else {
              p.alpha += (p.baseAlpha - p.alpha) * 0.05;
            }
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isWhite
          ? `rgba(255, 255, 255, ${p.alpha})`
          : `rgba(190, 190, 190, ${p.alpha})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
      for (let i = 0; i < len; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      if (!isCoarsePointer && mouse.x > 0 && mouse.y > 0) {
        ctx.beginPath();
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        for (let i = 0; i < len; i++) {
          const p1 = particles[i];
          const dxM = p1.x - mouse.x;
          const dyM = p1.y - mouse.y;
          if (dxM * dxM + dyM * dyM < mouseRadius * mouseRadius) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
          }
        }
        ctx.stroke();
      }
    };

    const setupCanvas = () => {
      cachedRect = canvas.getBoundingClientRect();
      width = Math.floor(
        canvas.clientWidth || cachedRect.width || window.innerWidth
      );
      height = Math.floor(
        canvas.clientHeight || cachedRect.height || window.innerHeight
      );
      const isMobile = width < 768 || isCoarsePointer;
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      createParticles();
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const loop = (now: number) => {
      if (!isInView || !isPageVisible || prefersReducedMotion) {
        animationFrameId = null;
        return;
      }

      // Cap mobile/touch frame rate at ~30fps so scroll & CoreAnimation remain completely smooth on iOS
      const minInterval = isCoarsePointer || width < 768 ? 33 : 0;
      if (minInterval === 0 || now - lastFrameTime >= minInterval) {
        lastFrameTime = now;
        drawScene();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (prefersReducedMotion) {
        drawScene();
        return;
      }
      if (animationFrameId === null && isInView && isPageVisible) {
        lastFrameTime = 0;
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!cachedRect) cachedRect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - cachedRect.left;
      mouse.targetY = e.clientY - cachedRect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (Math.abs(currentWidth - lastWidth) > 15) {
        lastWidth = currentWidth;
        setupCanvas();
        if (prefersReducedMotion) {
          drawScene();
        }
      }
    };

    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        isInView = entries.some((entry) => entry.isIntersecting);
        if (isInView) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    );

    setupCanvas();
    observer.observe(container);
    startLoop();

    window.addEventListener("resize", handleResize);
    if (!isCoarsePointer) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopLoop();
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (!isCoarsePointer) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-hidden="true"
      />
      {/* Seamless fade into black at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
    </div>
  );
}
