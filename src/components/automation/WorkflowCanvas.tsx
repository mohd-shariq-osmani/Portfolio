"use client";

import { useState, useEffect, useRef } from "react";
import { REAL_N8N_WORKFLOW, WorkflowNode } from "@/data/workflows";
import {
  Bot,
  Check,
  Clock,
  Code,
  Cpu,
  Filter,
  GitBranch,
  Globe,
  Link,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Sliders,
  Zap,
} from "lucide-react";

const CANVAS_WIDTH = 2740;
const CANVAS_HEIGHT = 640;

export default function WorkflowCanvas() {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("n1");
  const canvasScrollRef = useRef<HTMLDivElement | null>(null);

  const workflow = REAL_N8N_WORKFLOW;

  const renderIcon = (name: string) => {
    switch (name) {
      case "Clock":
        return <Clock size={15} className="text-orange-400" />;
      case "MessageSquare":
        return <MessageSquare size={15} className="text-indigo-400" />;
      case "Filter":
        return <Filter size={15} className="text-mono-300" />;
      case "Link":
        return <Link size={15} className="text-mono-300" />;
      case "Code":
        return <Code size={15} className="text-mono-300" />;
      case "Cpu":
        return <Cpu size={15} className="text-emerald-400" />;
      case "Bot":
        return <Bot size={15} className="text-white" />;
      case "GitBranch":
        return <GitBranch size={15} className="text-cyan-400" />;
      case "Check":
        return <Check size={14} className="text-emerald-400" />;
      case "Globe":
        return <Globe size={15} className="text-blue-400" />;
      case "Sliders":
        return <Sliders size={15} className="text-mono-300" />;
      case "Send":
        return <Send size={15} className="text-indigo-400" />;
      default:
        return <Zap size={15} className="text-mono-300" />;
    }
  };

  const executeWorkflow = () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setActiveStepIndex(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= workflow.nodes.length) {
        clearInterval(interval);
        setIsExecuting(false);
        setActiveStepIndex(workflow.nodes.length - 1);
      } else {
        setActiveStepIndex(step);
      }
    }, 400);
  };

  return (
    <div className="relative w-full bg-[#121214] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-[#18181b] border-b border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-bold text-white font-display">
              {workflow.name}
            </h3>
          </div>
          <p className="text-xs text-mono-400 font-mono mt-0.5">
            n8n Production Workflow • {workflow.nodes.length} Nodes Configured
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveStepIndex(-1)}
            className="px-3.5 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-mono-300 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Reset Nodes</span>
          </button>
        </div>
      </div>

      {/* Main n8n Visual Node Canvas Viewport */}
      <div
        ref={canvasScrollRef}
        data-lenis-prevent
        tabIndex={0}
        aria-label="Scrollable n8n workflow canvas"
        className="workflow-scrollbar relative w-full h-[560px] sm:h-[620px] bg-[#161618] overflow-auto overscroll-contain cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        {/* Faint Dot Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
          }}
        />

        {/* SVG Canvas for Curved Bezier Paths */}
        <svg
          className="absolute top-0 left-0 pointer-events-none z-0"
          style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
        >
          {workflow.connections.map((conn, idx) => {
            const fromNode = workflow.nodes.find((n) => n.id === conn.from);
            const toNode = workflow.nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            // Nodes use a fixed width, so connections stay aligned as labels change.
            const x1 = fromNode.x + 88;
            const y1 = fromNode.y;
            const x2 = toNode.x - 88;
            const y2 = toNode.y;

            const dx = Math.abs(x2 - x1) * 0.5;
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const fromIdx = workflow.nodes.findIndex((n) => n.id === fromNode.id);
            const toIdx = workflow.nodes.findIndex((n) => n.id === toNode.id);
            const isActivePath = activeStepIndex >= toIdx;

            return (
              <g key={idx}>
                {/* Background Shadow Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#000000"
                  strokeWidth="3"
                  opacity="0.8"
                />
                {/* Main Connection Curve */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isActivePath ? "#10b981" : "#52525b"}
                  strokeWidth={isActivePath ? "2.5" : "1.8"}
                  strokeDasharray={isActivePath ? "none" : "5 5"}
                  className="transition-all duration-300"
                />
                {/* Pulse dot along active path */}
                {isActivePath && isExecuting && (
                  <circle r="4" fill="#ffffff">
                    <animateMotion path={pathData} dur="0.8s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Authentic n8n Nodes */}
        <div className="relative" style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}>
          {workflow.nodes.map((node, index) => {
            const isActive = index === activeStepIndex;
            const isPassed = index < activeStepIndex;
            const isSelected = selectedNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute z-10 flex h-[52px] w-[176px] items-center gap-2.5 rounded-xl border px-3 py-2 shadow-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#27272a] border-emerald-400 ring-2 ring-emerald-400/50 scale-105"
                    : isSelected
                    ? "bg-[#27272a] border-white ring-1 ring-white/40"
                    : isPassed
                    ? "bg-[#1f1f23] border-emerald-600/70"
                    : "bg-[#1c1c20] border-[#3f3f46] hover:border-[#71717a]"
                }`}
              >
                {/* Left Input Port */}
                <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3f3f46] border border-[#18181b]" />

                {/* Node Icon Box */}
                <div className="w-7 h-7 rounded-lg bg-[#141416] border border-[#27272a] flex items-center justify-center shrink-0">
                  {renderIcon(node.icon)}
                </div>

                {/* Node Labels */}
                <div className="min-w-0 flex-1 pr-1">
                  <span className="block truncate text-[11px] font-bold leading-tight text-white font-sans">
                    {node.name}
                  </span>
                  {node.subtitle && (
                    <span className="mt-0.5 block truncate text-[9px] font-mono leading-none text-mono-400">
                      {node.subtitle}
                    </span>
                  )}
                </div>

                {/* Right Output Port */}
                <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3f3f46] border border-[#18181b]" />

                {/* Orange Indicator dot for Trigger node */}
                {node.type === "trigger" && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Floating canvas action stays visible while the workflow is inspected. */}
        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 pointer-events-none">
          <button
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="pointer-events-auto whitespace-nowrap px-5 py-3 bg-[#ff5200] hover:bg-[#ff6d00] disabled:cursor-wait disabled:opacity-80 active:scale-95 text-white font-bold text-xs rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center gap-2 transition-all duration-200 border border-orange-400/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161618]"
          >
            <Zap size={15} className="fill-white" />
            <span>{isExecuting ? "Executing Pipeline..." : "Execute workflow"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
