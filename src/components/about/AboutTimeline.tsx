const MILESTONES = [
  {
    year: "2024 - Present",
    role: "Senior AI & Automation Engineer",
    company: "Self-Directed / Enterprise Advisory",
    description:
      "Designing end-to-end AI agent frameworks, production n8n workflows, local-first mobile applications, and high-throughput real-time event systems.",
  },
  {
    year: "2023 - 2024",
    role: "Full Stack & Cross-Platform Developer",
    company: "Mobile & Web Products",
    description:
      "Engineered zero-knowledge secure Flutter applications (Vault), task management suites (DailyTask), and Next.js web applications with clean architecture.",
  },
  {
    year: "2022 - 2023",
    role: "Systems & Integration Specialist",
    company: "Automation & Infrastructure",
    description:
      "Built custom webhook dispatchers, REST API integrations, and continuous deployment automation pipelines across cloud and self-hosted environments.",
  },
];

export default function AboutTimeline() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-mono-400">
            Professional Trajectory
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1 font-display">
            Craftsmanship & Philosophy
          </h3>
          <p className="text-sm text-mono-300 font-light leading-relaxed mt-3 max-w-2xl">
            Specializing at the intersection of AI system architecture, autonomous workflow automation, and client-side performance. I believe software should feel instant, secure, and effortless.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 border-l border-mono-800 flex flex-col gap-8 my-4">
          {MILESTONES.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Dot Indicator */}
              <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-mono-600 group-hover:border-white group-hover:scale-125 transition-all" />

              <span className="text-[11px] font-mono text-mono-400 bg-mono-900 border border-mono-800 px-2.5 py-1 rounded-md">
                {item.year}
              </span>
              <h4 className="text-base font-bold text-white font-display mt-2">
                {item.role}
              </h4>
              <span className="text-xs font-mono text-mono-400 block mb-2">
                {item.company}
              </span>
              <p className="text-xs text-mono-300 font-light leading-relaxed max-w-xl">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
