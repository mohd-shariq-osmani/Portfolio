import { TECH_STACK } from "@/data/techStack";
import { Reveal } from "@/components/motion/Reveal";

export default function TechGrid() {
  return (
    <Reveal delay={0.05} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {TECH_STACK.map((cat) => (
          <div
            key={cat.category}
            className="p-5 bg-mono-950 md:bg-mono-950/80 border border-mono-850 hover:border-mono-700 rounded-2xl transition-colors duration-300 md:backdrop-blur-md"
          >
            <h4 className="text-xs font-mono uppercase tracking-wider text-white mb-1">
              {cat.category}
            </h4>
            <p className="text-xs text-mono-400 font-light mb-3.5">
              {cat.summary}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-black/70 border border-mono-850 text-[11px] font-mono text-mono-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
