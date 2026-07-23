import { ArrowUpRight, FileText, Github, Linkedin, Mail } from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-28 px-4 sm:px-8 bg-black text-white border-t border-mono-900 overflow-hidden"
    >
      {/* Glow background accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-mono-100/5 blur-[140px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-6">
          <Mail size={14} />
          <span>Initiate Contact</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight uppercase font-display mb-6 text-white">
          Let's Build <br />
          <span className="text-mono-400">Something Exceptional</span>
        </h2>

        <p className="text-base sm:text-lg text-mono-400 font-light max-w-lg mb-12 text-balance">
          Available for AI system design, autonomous workflow automation engineering, and full-stack product development.
        </p>

        {/* Main Email Action */}
        <a
          href="mailto:mohdshariqosmani@gmail.com"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-sm sm:text-base rounded-full hover:bg-mono-200 transition-all duration-300 hover:scale-105 shadow-2xl shadow-white/10 mb-16"
        >
          <Mail size={18} className="fill-black" />
          <span>mohdshariqosmani@gmail.com</span>
          <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>

        {/* Social Links Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <a
            href="https://github.com/mohd-shariq-osmani"
            target="_blank"
            rel="noreferrer"
            className="group p-5 bg-mono-950 border border-mono-850 hover:border-mono-600 rounded-2xl transition-all duration-200 flex flex-col items-center gap-2"
          >
            <Github size={22} className="text-mono-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold text-white font-display">GitHub</span>
            <span className="text-[11px] font-mono text-mono-500">@mohd-shariq-osmani</span>
          </a>

          <a
            href="https://linkedin.com/in/mohd-shariq-osmani"
            target="_blank"
            rel="noreferrer"
            className="group p-5 bg-mono-950 border border-mono-850 hover:border-mono-600 rounded-2xl transition-all duration-200 flex flex-col items-center gap-2"
          >
            <Linkedin size={22} className="text-mono-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold text-white font-display">LinkedIn</span>
            <span className="text-[11px] font-mono text-mono-500">Connect Professionally</span>
          </a>

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="group p-5 bg-mono-950 border border-mono-850 hover:border-mono-600 rounded-2xl transition-all duration-200 flex flex-col items-center gap-2"
          >
            <FileText size={22} className="text-mono-400 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold text-white font-display">Resume</span>
            <span className="text-[11px] font-mono text-mono-500">Download CV PDF</span>
          </a>
        </div>
      </div>
    </section>
  );
}
