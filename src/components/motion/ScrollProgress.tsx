"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

function DesktopScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none bg-transparent"
    >
      <motion.div
        style={{ scaleX }}
        className="h-full w-full origin-left bg-white/80"
      />
    </div>
  );
}

/**
 * Hairline monochrome scroll progress bar rendered on desktop viewports only
 * to avoid continuous scroll-spring work and notch overlap on iOS/mobile.
 */
export default function ScrollProgress() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!isDesktop) return null;
  return <DesktopScrollProgressBar />;
}
