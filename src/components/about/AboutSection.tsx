import AboutTimeline from "./AboutTimeline";
import TechGrid from "./TechGrid";
import { Reveal } from "@/components/motion/Reveal";
import { UserCheck } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-16 sm:py-24 px-4 sm:px-8 bg-mono-950 text-white border-t border-mono-900"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <Reveal className="flex flex-col items-center text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-900 border border-mono-800 text-xs font-mono text-mono-400 mb-3 sm:mb-4">
            <UserCheck size={14} />
            <span>Profile &amp; Stack</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase font-display mb-3 text-white">
            About &amp; Stack
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-md font-light">
            Experience, automation systems, and core tools.
          </p>
        </Reveal>

        {/* Two Column Layout: Timeline & Tech Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <AboutTimeline />
          </div>
          <div className="lg:col-span-7">
            <TechGrid />
          </div>
        </div>
      </div>
    </section>
  );
}
