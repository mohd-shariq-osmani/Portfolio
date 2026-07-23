"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";
import { setActiveLenis } from "@/lib/smoothScroll";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      overscroll: true,
    });

    setActiveLenis(lenis);

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    let rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      setActiveLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
