"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";
import { setActiveLenis } from "@/lib/smoothScroll";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Respect user's motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Mobile / touch devices (especially iPhone Safari & Chrome on iOS) have native,
    // hardware-accelerated 120Hz momentum scrolling.
    // Running Lenis touch interception on iOS hijacks gesture recognition, causes extreme
    // sluggishness, and drops synthesized 'click' events on buttons.
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      // Use native iOS momentum scrolling for instant responsiveness
      return;
    }

    // On desktop / fine pointer devices, initialize Lenis smooth mouse wheel
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      syncTouch: false,
    });

    setActiveLenis(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      setActiveLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
