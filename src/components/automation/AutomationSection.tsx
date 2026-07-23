"use client";

import WorkflowCanvas from "./WorkflowCanvas";
import { ArrowUpRight, Github, Network } from "lucide-react";

export default function AutomationSection() {
  return (
    <section
      id="automation"
      className="relative py-24 px-4 sm:px-8 bg-black text-white border-t border-mono-900 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mono-950 border border-mono-800 text-xs font-mono text-mono-400 mb-4">
            <Network size={14} />
            <span>n8n Production Pipelines</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase font-display mb-4 text-white">
            Automation Systems
          </h2>
          <p className="text-sm sm:text-base text-mono-400 max-w-xl font-light">
            Real-time visual node execution canvas modeling intelligent webhooks, AI agent reasoning, and multi-platform content routing.
          </p>
        </div>

        {/* Real n8n Visual Workflow Canvas */}
        <div>
          <WorkflowCanvas />
        </div>

        {/* GitHub Workflows Repo Footer */}
        <div className="flex justify-center mt-10">
          <a
            href="https://github.com/mohd-shariq-osmani/n8n-workflows"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mono-950 border border-mono-800 hover:border-mono-600 rounded-full text-xs font-mono text-mono-300 hover:text-white transition-all cursor-pointer"
          >
            <Github size={15} />
            <span>Explore All n8n Automation Workflows on GitHub</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
