import { TECH_STACK } from "@/data/techStack";

export default function TechGrid() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TECH_STACK.map((cat) => (
          <div
            key={cat.category}
            className="p-6 bg-mono-950/80 border border-mono-850 hover:border-mono-700 rounded-2xl transition-all duration-300 backdrop-blur-md group"
          >
            <h4 className="text-xs font-mono uppercase tracking-wider text-mono-400 mb-4 pb-2 border-b border-mono-900 flex items-center justify-between">
              <span>{cat.category}</span>
              <span className="text-[10px] text-mono-500">
                {cat.skills.length} Capabilities
              </span>
            </h4>

            <div className="flex flex-col gap-3.5">
              {cat.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col p-2.5 rounded-xl bg-black/40 border border-mono-900 group-hover:border-mono-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-display">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mono-900 text-mono-400 border border-mono-800">
                      {skill.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-mono-400 font-light mt-1">
                    {skill.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
