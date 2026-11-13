const MILESTONES = [
  {
    year: "2025 - Present",
    role: "Automation Engineer & Full Stack Developer",
    company: "Workflow Automation & Web Engineering",
    description:
      "Architecting automated workflow pipelines using n8n, Microsoft Power Automate, and Zoho Flows with webhooks and event-driven triggers. Developing full-stack web applications and custom CRM solutions with Node.js, Next.js, and integrating AI/LLM models for intelligent process automation.",
  },
  {
    year: "2021 - 2025",
    role: "RPA Automation Developer & QA Engineer",
    company: "Robotic Process Automation & Quality Assurance",
    description:
      "Engineered and maintained robotic process automations using UiPath and Blue Prism across enterprise environments. Handled end-to-end process debugging, root-cause failure analysis, production monitoring, and automated test execution to ensure dependable workflow operations.",
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
            Experience & Engineering Focus
          </h3>
          <p className="text-sm text-mono-300 font-light leading-relaxed mt-3 max-w-2xl">
            Specializing in workflow automation, robotic process automation (RPA), and full-stack software development. Dedicated to building reliable, maintainable systems that eliminate manual overhead and improve business operations.
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
