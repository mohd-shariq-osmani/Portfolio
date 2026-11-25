"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Hairline monochrome scroll progress bar pinned to the top edge of the viewport.
 */
export default function ScrollProgress() {
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
