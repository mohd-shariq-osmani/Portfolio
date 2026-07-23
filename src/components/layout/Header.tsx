"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { scrollToTarget } from "@/lib/smoothScroll";

const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "Projects", href: "#projects" },
  { label: "Build Lab", href: "#build-lab" },
  { label: "Automation", href: "#automation" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      const sections = NAV_ITEMS.map((item) => item.href.substring(1));
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 250) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setMobileMenuOpen(false);
    const targetId = href.substring(1);
    scrollToTarget(targetId);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full border transition-all duration-300 backdrop-blur-md ${
          scrolled
            ? "bg-mono-950/90 border-mono-800 shadow-2xl shadow-black w-full max-w-4xl"
            : "bg-mono-900/60 border-mono-800/70 w-full max-w-5xl"
        }`}
      >
        {/* Brand / Logo */}
        <button
          onClick={() => scrollToSection("#hero")}
          className="flex items-center gap-2 text-xs font-mono tracking-widest text-mono-300 hover:text-white transition-colors group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full bg-mono-900 border border-mono-700 flex items-center justify-center text-white group-hover:border-mono-400 transition-colors">
            <Terminal size={13} />
          </div>
          <span className="font-semibold tracking-wider text-white">MSO</span>
          <span className="hidden sm:inline-block text-mono-500">// DEV</span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.href.substring(1);
            return (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className={`relative px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase transition-colors rounded-full cursor-pointer ${
                  isActive ? "text-white bg-mono-800" : "text-mono-400 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => scrollToSection("#contact")}
            className="px-4 py-1.5 text-xs font-semibold tracking-wide text-black bg-white rounded-full hover:bg-mono-200 transition-all duration-200 hover:scale-105 active:scale-95 shadow cursor-pointer"
          >
            Get in Touch
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-mono-300 hover:text-white rounded-full bg-mono-900 border border-mono-800 cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 bg-mono-950/95 border border-mono-800 rounded-2xl p-6 backdrop-blur-xl md:hidden shadow-2xl flex flex-col gap-4 z-50"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="text-left text-sm font-medium tracking-wider uppercase py-2 text-mono-300 hover:text-white border-b border-mono-900 last:border-0 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("#contact")}
              className="w-full mt-2 py-3 text-xs font-semibold tracking-wider text-black bg-white rounded-xl text-center uppercase cursor-pointer"
            >
              Get in Touch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
