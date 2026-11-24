"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WORKFLOWS, WorkflowNode } from "@/data/workflows";
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
  Maximize2,
  MessageSquare,
  RefreshCw,
  Send,
  Sliders,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const NODE_HALF_WIDTH = 88;

function renderNodeIcon(name: string) {
  const iconClass = "text-mono-200";
  switch (name) {
    case "Clock":
      return <Clock size={15} className={iconClass} />;
    case "MessageSquare":
      return <MessageSquare size={15} className={iconClass} />;
    case "Filter":
      return <Filter size={15} className={iconClass} />;
    case "Link":
      return <Link size={15} className={iconClass} />;
    case "Code":
      return <Code size={15} className={iconClass} />;
    case "Cpu":
      return <Cpu size={15} className="text-white" />;
    case "Bot":
      return <Bot size={15} className="text-white" />;
    case "GitBranch":
      return <GitBranch size={15} className="text-white" />;
    case "Check":
      return <Check size={14} className={iconClass} />;
    case "Globe":
      return <Globe size={15} className={iconClass} />;
    case "Sliders":
      return <Sliders size={15} className={iconClass} />;
    case "Send":
      return <Send size={15} className={iconClass} />;
    default:
      return <Zap size={15} className="text-white" />;
  }
}

export default function WorkflowCanvas() {
  const [workflowIndex, setWorkflowIndex] = useState(0);
  const workflow = WORKFLOWS[workflowIndex];

  const [selectedRoute, setSelectedRoute] = useState<string>(
    workflow.routes?.[0]?.id ?? ""
  );
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [passedNodeIds, setPassedNodeIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    workflow.nodes[0]?.id ?? ""
  );
  const [zoom, setZoom] = useState(0.85);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.innerWidth < 640) {
      setZoom(0.55);
    }
  }, []);

  const stopExecution = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsExecuting(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const resetExecution = () => {
    stopExecution();
    setActiveNodeId(null);
    setPassedNodeIds(new Set());
  };

  const handleSelectWorkflow = (idx: number) => {
    const next = WORKFLOWS[idx];
    if (!next) return;
    resetExecution();
    setWorkflowIndex(idx);
    setSelectedRoute(next.routes?.[0]?.id ?? "");
    setSelectedNodeId(next.nodes[0]?.id ?? "");
    if (canvasScrollRef.current) {
      canvasScrollRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  };

  const executionSequence = useMemo(() => {
    return workflow.nodes
      .filter((node) => !node.branch || node.branch === selectedRoute)
      .map((node) => node.id);
  }, [workflow.nodes, selectedRoute]);

  const executeWorkflow = () => {
    if (isExecuting || executionSequence.length === 0) return;

    stopExecution();
    setIsExecuting(true);
    setPassedNodeIds(new Set());
    let step = 0;

    setActiveNodeId(executionSequence[0]);
    setSelectedNodeId(executionSequence[0]);

    intervalRef.current = setInterval(() => {
      const prevId = executionSequence[step];
      step += 1;

      setPassedNodeIds((prev) => {
        const next = new Set(prev);
        if (prevId) next.add(prevId);
        return next;
      });

      if (step >= executionSequence.length) {
        stopExecution();
        setActiveNodeId(executionSequence[executionSequence.length - 1]);
      } else {
        const currentId = executionSequence[step];
        setActiveNodeId(currentId);
        setSelectedNodeId(currentId);
      }
    }, 380);
  };

  const handleFitCanvas = () => {
    if (!canvasScrollRef.current) return;
    const viewportWidth = canvasScrollRef.current.clientWidth;
    if (viewportWidth > 0) {
      const fitScale = Math.max(
        0.45,
        Math.min(1, Number(((viewportWidth - 32) / workflow.canvasWidth).toFixed(2)))
      );
      setZoom(fitScale);
      canvasScrollRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  };

  const selectedNode: WorkflowNode | undefined =
    workflow.nodes.find((n) => n.id === selectedNodeId) ?? workflow.nodes[0];

  const relatedNodes = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const incoming = workflow.connections
      .filter((c) => c.to === selectedNode.id)
      .map((c) => workflow.nodes.find((n) => n.id === c.from))
      .filter((n): n is WorkflowNode => Boolean(n));
    const outgoing = workflow.connections
      .filter((c) => c.from === selectedNode.id)
      .map((c) => workflow.nodes.find((n) => n.id === c.to))
      .filter((n): n is WorkflowNode => Boolean(n));
    return { incoming, outgoing };
  }, [selectedNode, workflow]);

  const executedSet = useMemo(() => {
    const next = new Set(passedNodeIds);
    if (activeNodeId) next.add(activeNodeId);
    return next;
  }, [passedNodeIds, activeNodeId]);

  return (
    <div className="relative w-full bg-mono-950 border border-mono-850 rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="px-5 sm:px-6 py-4 bg-mono-900 border-b border-mono-850 flex flex-col gap-3 z-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <h3 className="text-base font-bold text-white font-display">
                {workflow.name}
              </h3>
            </div>
            <p className="text-xs text-mono-400 font-mono mt-0.5">
              n8n Production Workflow • {workflow.nodes.length} Nodes Configured
            </p>
          </div>

          {/* Workflow Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-black border border-mono-800 rounded-lg">
              {WORKFLOWS.map((wf, idx) => (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => handleSelectWorkflow(idx)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                    idx === workflowIndex
                      ? "bg-white text-black font-semibold"
                      : "text-mono-400 hover:text-white"
                  }`}
                >
                  {wf.shortLabel}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-black border border-mono-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.45, Number((z - 0.1).toFixed(2))))}
                aria-label="Zoom out workflow canvas"
                className="p-1 text-mono-400 hover:text-white rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-mono-300 min-w-[38px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))}
                aria-label="Zoom in workflow canvas"
                className="p-1 text-mono-400 hover:text-white rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={handleFitCanvas}
                aria-label="Fit workflow to viewport"
                className="p-1 text-mono-400 hover:text-white rounded cursor-pointer"
                title="Fit to View"
              >
                <Maximize2 size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={resetExecution}
              className="px-3 py-1.5 bg-black border border-mono-800 hover:border-mono-600 text-mono-300 hover:text-white text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Route Branch Selector when workflow has conditional routes */}
        {workflow.routes && workflow.routes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-mono-850/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-mono-500">
              Execution Route:
            </span>
            {workflow.routes.map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  resetExecution();
                  setSelectedRoute(route.id);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                  selectedRoute === route.id
                    ? "bg-white text-black border-white font-semibold"
                    : "bg-black text-mono-400 border-mono-800 hover:text-white hover:border-mono-600"
                }`}
              >
                {route.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main n8n Visual Node Canvas Viewport */}
      <div className="relative">
        {/* Faint Dot Grid Pattern sized to visible viewport instead of 2740px offscreen texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          ref={canvasScrollRef}
          data-lenis-prevent
          tabIndex={0}
          aria-label="Scrollable n8n workflow canvas"
          className="workflow-scrollbar relative z-10 w-full h-[460px] sm:h-[520px] bg-transparent overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <div
            style={{
              width: `${Math.round(workflow.canvasWidth * zoom)}px`,
              height: `${Math.round(workflow.canvasHeight * zoom)}px`,
            }}
            className="relative shrink-0"
          >
            <div
              style={{
                width: `${workflow.canvasWidth}px`,
                height: `${workflow.canvasHeight}px`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
              className="relative"
            >

              {/* SVG Canvas for Curved Bezier Paths */}
              <svg
                className="absolute top-0 left-0 pointer-events-none z-0"
                style={{
                  width: `${workflow.canvasWidth}px`,
                  height: `${workflow.canvasHeight}px`,
                }}
              >
                {workflow.connections.map((conn, idx) => {
                  const fromNode = workflow.nodes.find((n) => n.id === conn.from);
                  const toNode = workflow.nodes.find((n) => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const x1 = fromNode.x + NODE_HALF_WIDTH;
                  const y1 = fromNode.y;
                  const x2 = toNode.x - NODE_HALF_WIDTH;
                  const y2 = toNode.y;

                  const dx = Math.abs(x2 - x1) * 0.5;
                  const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                  const isActivePath =
                    executedSet.has(fromNode.id) && executedSet.has(toNode.id);

                  return (
                    <g key={`${workflow.id}-${idx}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="3"
                        opacity="0.8"
                      />
                      <path
                        d={pathData}
                        fill="none"
                        stroke={isActivePath ? "#ffffff" : "#52525b"}
                        strokeWidth={isActivePath ? "2.5" : "1.8"}
                        strokeDasharray={isActivePath ? "none" : "5 5"}
                        className="transition-all duration-300"
                      />
                      {isActivePath && isExecuting && (
                        <circle r="4" fill="#ffffff">
                          <animateMotion path={pathData} dur="0.8s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Render Authentic Monochrome Nodes */}
              {workflow.nodes.map((node) => {
                const isActive = activeNodeId === node.id;
                const isPassed = passedNodeIds.has(node.id) && !isActive;
                const isSelected = selectedNodeId === node.id;
                const isDimmedBranch =
                  Boolean(node.branch) && node.branch !== selectedRoute;

                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    aria-pressed={isSelected}
                    aria-label={`${node.name}${node.subtitle ? ` (${node.subtitle})` : ""}`}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute z-10 flex h-[52px] w-[176px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      isActive
                        ? "bg-mono-800 border-white ring-2 ring-white/60 scale-105"
                        : isSelected
                        ? "bg-mono-850 border-white ring-1 ring-white/40"
                        : isPassed
                        ? "bg-mono-900 border-mono-400"
                        : isDimmedBranch
                        ? "bg-mono-950/70 border-mono-850 opacity-50 hover:opacity-90 hover:border-mono-600"
                        : "bg-mono-900 border-mono-700 hover:border-mono-500"
                    }`}
                  >
                    {/* Left Input Port */}
                    <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-mono-700 border border-black" />

                    {/* Node Icon Box */}
                    <div className="w-7 h-7 rounded-lg bg-black border border-mono-800 flex items-center justify-center shrink-0">
                      {renderNodeIcon(node.icon)}
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
                    <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-mono-700 border border-black" />

                    {/* Pulse indicator dot for Trigger node */}
                    {node.type === "trigger" && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Execute Action (pinned cleanly inside canvas container) */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <button
            type="button"
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="pointer-events-auto whitespace-nowrap px-5 py-2.5 bg-white hover:bg-mono-200 disabled:cursor-wait disabled:opacity-80 active:scale-95 text-black font-bold text-xs rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.65)] flex items-center gap-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Zap size={14} className="fill-black" />
            <span>{isExecuting ? "Executing Pipeline..." : "Execute workflow"}</span>
          </button>
        </div>
      </div>

      {/* Node Inspector Footer */}
      {selectedNode && (
        <div className="px-5 sm:px-6 py-4 bg-mono-900/90 border-t border-mono-850 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-mono-800 flex items-center justify-center shrink-0 mt-0.5">
              {renderNodeIcon(selectedNode.icon)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-white font-display">
                  {selectedNode.name}
                </span>
                {selectedNode.subtitle && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black border border-mono-800 text-mono-400">
                    {selectedNode.subtitle}
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-mono-950 border border-mono-800 text-mono-500">
                  {selectedNode.type}
                </span>
              </div>
              {selectedNode.detail && (
                <p className="text-xs text-mono-400 font-light mt-1">
                  {selectedNode.detail}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            {relatedNodes.incoming.map((node) => (
              <button
                key={`in-${node.id}`}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className="px-2 py-1 rounded bg-black border border-mono-800 text-mono-400 hover:text-white hover:border-mono-600 cursor-pointer"
              >
                ← {node.name}
              </button>
            ))}
            {relatedNodes.outgoing.map((node) => (
              <button
                key={`out-${node.id}`}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className="px-2 py-1 rounded bg-black border border-mono-800 text-mono-300 hover:text-white hover:border-mono-600 cursor-pointer"
              >
                {node.name} →
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
