"use client";

import { ReactNode, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

export default function MotionProvider({ children }: { children: ReactNode }) {
  const [reducedMode, setReducedMode] = useState<"user" | "always">("user");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const update = () => setReducedMode(media.matches ? "always" : "user");
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return <MotionConfig reducedMotion={reducedMode}>{children}</MotionConfig>;
}
