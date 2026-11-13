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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let particles: Particle[] = [];
    const mouse = { x: -2000, y: -2000, targetX: -2000, targetY: -2000 };
    let isVisible = true;

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.floor(rect.width || window.innerWidth);
      height = Math.floor(rect.height || window.innerHeight);
      const isMobile = width < 768;
      // On mobile screens, DPR 1 cuts pixel rendering overhead by 4x on iOS WebKit
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      createParticles();
    };

    const createParticles = () => {
      particles = [];
      const isMobile = width < 768;
      // Streamlined count on mobile for silky smooth 60/120fps
      const count = isMobile
        ? Math.min(26, Math.max(18, Math.floor((width * height) / 22000)))
        : Math.min(Math.max(50, Math.floor((width * height) / 14000)), 90);

      for (let i = 0; i < count; i++) {
        const isWhite = Math.random() > 0.4;
        const baseAlpha = isWhite
          ? Math.random() * 0.4 + 0.35 // 0.35 - 0.75 for crisp visibility
          : Math.random() * 0.25 + 0.2; // 0.20 - 0.45 for greys

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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    const handleResize = () => {
      setupCanvas();
    };

    const drawScene = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const maxConnectDist = isMobile ? 100 : 135;
      const maxConnectDistSq = maxConnectDist * maxConnectDist;
      const mouseRadius = isMobile ? 130 : 180;

      // Smooth cursor lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      const len = particles.length;

      // 1. Update positions & draw particles
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < -15) p.x = width + 15;
        else if (p.x > width + 15) p.x = -15;

        if (p.y < -15) p.y = height + 15;
        else if (p.y > height + 15) p.y = -15;

        // Cursor deflection & illumination
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseRadius && distMouse > 0) {
          const force = (1 - distMouse / mouseRadius) * 0.45;
          p.x -= (dxMouse / distMouse) * force;
          p.y -= (dyMouse / distMouse) * force;
          p.alpha = Math.min(p.baseAlpha + (1 - distMouse / mouseRadius) * 0.5, 0.95);
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isWhite
          ? `rgba(255, 255, 255, ${p.alpha})`
          : `rgba(190, 190, 190, ${p.alpha})`;
        ctx.fill();
      }

      // 2. Draw connecting network lines
      ctx.lineWidth = 0.75;
      for (let i = 0; i < len; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxConnectDistSq) {
            const dist = Math.sqrt(distSq);
            // Clearly visible yet elegant lines
            const lineAlpha = (1 - dist / maxConnectDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }

        // Connecting line to cursor if nearby
        if (mouse.x > 0 && mouse.y > 0) {
          const dxM = p1.x - mouse.x;
          const dyM = p1.y - mouse.y;
          const distMSq = dxM * dxM + dyM * dyM;
          if (distMSq < mouseRadius * mouseRadius) {
            const distM = Math.sqrt(distMSq);
            const mouseLineAlpha = (1 - distM / mouseRadius) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${mouseLineAlpha})`;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      if (isVisible) {
        drawScene();
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    setupCanvas();
    animationFrameId = requestAnimationFrame(loop);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
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
