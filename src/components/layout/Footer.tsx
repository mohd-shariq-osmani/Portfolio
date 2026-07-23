"use client";

import { ArrowUp, Terminal } from "lucide-react";
import { scrollToTop as scrollToTopPage } from "@/lib/smoothScroll";

export default function Footer() {
  const handleScrollToTop = () => {
    scrollToTopPage();
  };

  return (
    <footer className="w-full py-8 px-4 sm:px-8 bg-black text-mono-400 border-t border-mono-900 text-xs font-mono">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-white" />
          <span className="text-white font-semibold font-display">
            MOHD SHARIQ OSMANI
          </span>
          <span className="text-mono-600">•</span>
          <span>© {new Date().getFullYear()} All Rights Reserved.</span>
        </div>

        {/* Right - Back to Top */}
        <button
          onClick={handleScrollToTop}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-mono-400 hover:text-white hover:border-mono-600 transition-colors"
        >
          <span>Back to top</span>
          <ArrowUp size={13} />
        </button>
      </div>
    </footer>
  );
}
