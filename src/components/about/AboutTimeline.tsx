import { Reveal } from "@/components/motion/Reveal";

const MILESTONES = [
  {
    year: "2025 – Present",
    role: "Automation & Full Stack Engineer",
    summary:
      "Building n8n/LLM pipelines, Power Automate & Zoho flows, and full-stack Next.js/Node.js CRMs.",
  },
  {
    year: "2021 – 2025",
    role: "RPA Developer & QA Engineer",
    summary:
      "Delivered enterprise UiPath and Blue Prism automations with production monitoring and QA.",
  },
];

export default function AboutTimeline() {
  return (
    <Reveal className="w-full flex flex-col gap-6">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-mono-400">
          Trajectory
        </span>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">
          Experience
        </h3>
        <p className="text-sm text-mono-300 font-light leading-relaxed mt-2 max-w-md">
          Designing reliable automation, RPA workflows, and full-stack software.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-5 border-l border-mono-800 flex flex-col gap-6 my-2">
        {MILESTONES.map((item) => (
          <div key={item.year} className="relative group">
            <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-mono-600 group-hover:border-white transition-colors" />

            <span className="text-[11px] font-mono text-mono-400 bg-mono-900 border border-mono-800 px-2.5 py-0.5 rounded-md">
              {item.year}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white font-display mt-2">
              {item.role}
            </h4>
            <p className="text-xs text-mono-400 font-light leading-relaxed mt-1 max-w-md">
              {item.summary}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
