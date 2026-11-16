"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

export type CatPose = "idle" | "blink";

const CAT_ASSETS: Record<CatPose, string> = {
  idle: "/images/cat/cat-idle.png",
  blink: "/images/cat/cat-blink.png",
};

const BUBBLE_MESSAGES = [
  "Meow! 🐾",
  "Let's build! 🚀",
  "Purr... ✨",
  "^•ﻌ•^",
  "Code & Coffee! ☕",
  "Always shipping! ⚡",
];

interface CatMascotProps {
  /**
   * "floating": Desktop bottom-right floating companion (hidden on mobile).
   * "hero": Mobile in-flow companion placed directly below hero introduction (hidden on desktop).
   */
  variant?: "floating" | "hero";
  className?: string;
}

export default function CatMascot({
  variant = "floating",
  className = "",
}: CatMascotProps) {
  const [pose, setPose] = useState<CatPose>("idle");
  const [isJumping, setIsJumping] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const messageIndexRef = useRef(0);
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const jumpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Periodic natural eye blinking (every 3.5 - 5.5s for ~180ms)
  useEffect(() => {
    let active = true;

    const scheduleNextBlink = () => {
      const delay = Math.floor(Math.random() * 2000) + 3500;
      blinkTimeoutRef.current = setTimeout(() => {
        if (!active) return;
        setPose((prev) => (prev === "idle" ? "blink" : prev));

        setTimeout(() => {
          if (!active) return;
          setPose("idle");
          scheduleNextBlink();
        }, 180);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      active = false;
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
  }, []);

  const handleInteraction = useCallback(() => {
    setPose("blink");
    setIsJumping(true);

    const nextMsg = BUBBLE_MESSAGES[messageIndexRef.current % BUBBLE_MESSAGES.length];
    messageIndexRef.current += 1;
    setBubbleText(nextMsg);

    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);

    jumpTimeoutRef.current = setTimeout(() => {
      setIsJumping(false);
      setPose("idle");
    }, 650);

    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 2000);
  }, []);

  const currentSrc = CAT_ASSETS[pose] || CAT_ASSETS.idle;

  if (variant === "floating") {
    return (
      <aside
        aria-label="Interactive Cat Mascot Companion"
        className={`hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end select-none pointer-events-none ${className}`}
      >
        {/* Playful Pixel Speech Bubble */}
        <div
          aria-live="polite"
          className={`pointer-events-none mb-1.5 transition-opacity duration-200 ${
            bubbleText ? "opacity-100 animate-cat-bubble" : "opacity-0 pointer-events-none"
          }`}
        >
          {bubbleText && (
            <div className="relative px-3 py-1.5 bg-black/95 text-white font-mono text-[11px] rounded-lg border border-mono-750 shadow-[0_8px_24px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-1.5">
              <span>{bubbleText}</span>
              <div className="absolute -bottom-1.5 right-6 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-mono-750" />
            </div>
          )}
        </div>

        {/* Hover Hint Tooltip (only when not showing speech bubble) */}
        {!bubbleText && showTooltip && (
          <div className="pointer-events-none mb-1 px-2.5 py-1 bg-mono-950/90 text-mono-300 font-mono text-[10px] rounded-md border border-mono-800 shadow-lg backdrop-blur-sm animate-cat-bubble">
            Click me! 🐾
          </div>
        )}

        {/* Mascot Clickable Button - Pure Transparent Background */}
        <button
          type="button"
          onClick={handleInteraction}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleInteraction();
            }
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          tabIndex={0}
          aria-label="MSO's Pixel Cat Mascot - Click to make cat jump"
          className="pointer-events-auto relative p-0 bg-transparent border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg active:scale-95 transition-transform"
        >
          {/* Crisp Pixel-Art Cat (clean standalone without card/box background) */}
          <div
            className={`relative w-[108px] sm:w-[120px] aspect-[521/527] ${
              isJumping ? "animate-cat-jump" : "animate-cat-idle"
            }`}
          >
            <Image
              src={currentSrc}
              alt="White pixel-art cat mascot"
              width={521}
              height={527}
              priority
              unoptimized
              className="pixel-art w-full h-full object-contain"
            />
          </div>
        </button>
      </aside>
    );
  }

  // Hero Mobile Variant: placed directly below hero introduction in page flow
  return (
    <div
      aria-label="Interactive Cat Mascot"
      className={`flex md:hidden flex-col items-center justify-center select-none ${className}`}
    >
      {/* Speech Bubble on Mobile Tap */}
      <div
        aria-live="polite"
        className={`h-8 mb-2 flex items-center justify-center transition-all duration-200 ${
          bubbleText ? "opacity-100 animate-cat-bubble scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {bubbleText && (
          <div className="relative px-3.5 py-1.5 bg-black/95 text-white font-mono text-xs rounded-lg border border-mono-700 shadow-xl backdrop-blur-md">
            <span>{bubbleText}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-mono-700" />
          </div>
        )}
      </div>

      {/* Mascot Mobile Tap Target - Pure Transparent Background */}
      <button
        type="button"
        onClick={handleInteraction}
        tabIndex={0}
        aria-label="Tap to interact with pixel cat mascot"
        className="relative p-0 bg-transparent border-0 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg transition-transform"
      >
        {/* Crisp Pixel-Art Cat (larger on mobile, clean standalone without background box) */}
        <div
          className={`relative w-[145px] sm:w-[160px] aspect-[521/527] ${
            isJumping ? "animate-cat-jump" : "animate-cat-idle"
          }`}
        >
          <Image
            src={currentSrc}
            alt="White pixel-art cat mascot companion"
            width={521}
            height={527}
            priority
            unoptimized
            className="pixel-art w-full h-full object-contain"
          />
        </div>
      </button>
    </div>
  );
}
