"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DISCORD_MULTI_AGENT_WORKFLOW,
  N8nNodeBrand,
  WorkflowConnection,
  WorkflowNode,
} from "@/data/workflows";
import {
  AlertTriangle,
  Bot,
  Check,
  Clock,
  Code2,
  Cpu,
  GitBranch,
  Maximize2,
  MessageSquare,
  Play,
  RefreshCw,
  Terminal,
  Webhook,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

const BRAND_COLORS: Record<
  N8nNodeBrand,
  { accent: string; bg: string; border: string }
> = {
  "n8n-trigger": {
    accent: "#FF6D5A",
    bg: "rgba(255, 109, 90, 0.14)",
    border: "rgba(255, 109, 90, 0.35)",
  },
  discord: {
    accent: "#7289DA",
    bg: "rgba(88, 101, 242, 0.16)",
    border: "rgba(114, 137, 218, 0.35)",
  },
  webhook: {
    accent: "#FF6D5A",
    bg: "rgba(255, 109, 90, 0.14)",
    border: "rgba(255, 109, 90, 0.35)",
  },
  code: {
    accent: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.35)",
  },
  if: {
    accent: "#10B981",
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.35)",
  },
  terminal: {
    accent: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.14)",
    border: "rgba(56, 189, 248, 0.35)",
  },
  ai: {
    accent: "#C084FC",
    bg: "rgba(168, 85, 247, 0.16)",
    border: "rgba(192, 132, 252, 0.35)",
  },
  schedule: {
    accent: "#FB923C",
    bg: "rgba(251, 146, 60, 0.14)",
    border: "rgba(251, 146, 60, 0.35)",
  },
  error: {
    accent: "#EF4444",
    bg: "rgba(239, 68, 68, 0.16)",
    border: "rgba(239, 68, 68, 0.38)",
  },
};

function renderBrandIcon(brand: N8nNodeBrand, size = 22) {
  const color = BRAND_COLORS[brand].accent;
  switch (brand) {
    case "n8n-trigger":
      return <Play size={size} style={{ color }} />;
    case "discord":
      return <MessageSquare size={size} style={{ color }} />;
    case "webhook":
      return <Webhook size={size} style={{ color }} />;
    case "code":
      return <Code2 size={size} style={{ color }} />;
    case "if":
      return <GitBranch size={size} style={{ color }} />;
    case "terminal":
      return <Terminal size={size} style={{ color }} />;
    case "ai":
      return <Bot size={size} style={{ color }} />;
    case "schedule":
      return <Clock size={size} style={{ color }} />;
    case "error":
      return <AlertTriangle size={size} style={{ color }} />;
    default:
      return <Cpu size={size} style={{ color }} />;
  }
}

function getPortCoordinates(node: WorkflowNode, conn: WorkflowConnection) {
  if (conn.targetHandle === "ai_languageModel") {
    return {
      x1: node.x,
      y1: node.y - 34,
    };
  }

  let halfW = 46;
  let yOffset = 0;

  if (node.kind === "aiChain") {
    halfW = 92;
  } else if (node.kind === "if") {
    halfW = 46;
    if (conn.sourceHandle === "true") yOffset = -15;
    if (conn.sourceHandle === "false") yOffset = 15;
  }

  return {
    x1: node.x + halfW,
    y1: node.y + yOffset,
  };
}

function getTargetPortCoordinates(node: WorkflowNode, conn: WorkflowConnection) {
  if (conn.targetHandle === "ai_languageModel") {
    return {
      x2: node.x,
      y2: node.y + 42,
    };
  }

  const halfW = node.kind === "aiChain" ? 92 : 46;
  return {
    x2: node.x - halfW,
    y2: node.y,
  };
}

function buildConnectionPath(
  fromNode: WorkflowNode,
  toNode: WorkflowNode,
  conn: WorkflowConnection
): string {
  const { x1, y1 } = getPortCoordinates(fromNode, conn);
  const { x2, y2 } = getTargetPortCoordinates(toNode, conn);

  if (conn.targetHandle === "ai_languageModel") {
    const dy = Math.abs(y1 - y2) * 0.5;
    return `M ${x1} ${y1} C ${x1} ${y1 - dy}, ${x2} ${y2 + dy}, ${x2} ${y2}`;
  }

  const dx = Math.max(48, Math.abs(x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export default function WorkflowCanvas() {
  const workflow = DISCORD_MULTI_AGENT_WORKFLOW;

  const [scenarioId, setScenarioId] = useState<string>(workflow.scenarios[0].id);
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set());
  const [passedNodeIds, setPassedNodeIds] = useState<Set<string>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    "gemini-stage1-chain-node"
  );
  const [zoom, setZoom] = useState(0.68);
  const [isDragging, setIsDragging] = useState(false);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const scenario =
    workflow.scenarios.find((s) => s.id === scenarioId) ?? workflow.scenarios[0];

  useEffect(() => {
    if (canvasScrollRef.current) {
      const vw = canvasScrollRef.current.clientWidth;
      if (vw > 0 && vw < 640) {
        setZoom(0.45);
      } else if (vw >= 640 && vw < 1024) {
        setZoom(0.58);
      } else {
        setZoom(0.72);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopExecution = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsExecuting(false);
  };

  const resetExecution = () => {
    stopExecution();
    setActiveNodeIds(new Set());
    setPassedNodeIds(new Set());
  };

  const executeWorkflow = () => {
    if (isExecuting || scenario.steps.length === 0) return;
    stopExecution();
    setIsExecuting(true);
    setPassedNodeIds(new Set());

    let stepIdx = 0;
    const firstBatch = scenario.steps[0];
    setActiveNodeIds(new Set(firstBatch));
    setSelectedNodeId(firstBatch[firstBatch.length - 1]);

    intervalRef.current = setInterval(() => {
      const prevBatch = scenario.steps[stepIdx] ?? [];
      stepIdx += 1;

      setPassedNodeIds((prev) => {
        const next = new Set(prev);
        prevBatch.forEach((id) => next.add(id));
        return next;
      });

      if (stepIdx >= scenario.steps.length) {
        stopExecution();
        setActiveNodeIds(new Set());
      } else {
        const currentBatch = scenario.steps[stepIdx];
        setActiveNodeIds(new Set(currentBatch));
        setSelectedNodeId(currentBatch[currentBatch.length - 1]);
      }
    }, 420);
  };

  const handleFitCanvas = () => {
    if (!canvasScrollRef.current) return;
    const vw = canvasScrollRef.current.clientWidth;
    if (vw > 0) {
      const fitScale = Math.max(
        0.35,
        Math.min(1, Number(((vw - 24) / workflow.canvasWidth).toFixed(2)))
      );
      setZoom(fitScale);
      canvasScrollRef.current.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    if ((e.target as HTMLElement).closest("button")) return;
    if (!canvasScrollRef.current) return;

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: canvasScrollRef.current.scrollLeft,
      scrollTop: canvasScrollRef.current.scrollTop,
    };
    setIsDragging(true);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active || !canvasScrollRef.current) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    canvasScrollRef.current.scrollLeft = dragStateRef.current.scrollLeft - dx;
    canvasScrollRef.current.scrollTop = dragStateRef.current.scrollTop - dy;
  };

  const stopDragging = () => {
    dragStateRef.current.active = false;
    setIsDragging(false);
  };

  const selectedNode =
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

  const scenarioNodeSet = useMemo(() => {
    const set = new Set<string>();
    scenario.steps.forEach((batch) => batch.forEach((id) => set.add(id)));
    return set;
  }, [scenario]);

  const executedSet = useMemo(() => {
    const next = new Set(passedNodeIds);
    activeNodeIds.forEach((id) => next.add(id));
    return next;
  }, [passedNodeIds, activeNodeIds]);

  return (
    <div className="relative w-full bg-[#18181c] border border-[#2d2d35] rounded-3xl overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Authentic n8n Top Editor Bar */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#1e1e24] border-b border-[#2d2d35] flex flex-col gap-3 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* n8n coral node mark */}
            <div className="w-8 h-8 rounded-lg bg-[#ff6d5a]/15 border border-[#ff6d5a]/40 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-[#ff6d5a]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  {workflow.name}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-[11px] font-mono text-mono-400 mt-0.5">
                {workflow.nodes.length} Nodes · 2-Stage Multi-Agent (Gemini 3.6 + Claude Sonnet 5)
              </p>
            </div>
          </div>

          {/* Scenario Path Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 sm:flex-wrap">
            {workflow.scenarios.map((sc) => {
              const active = sc.id === scenario.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    resetExecution();
                    setScenarioId(sc.id);
                    const first = sc.steps[0]?.[0];
                    if (first) setSelectedNodeId(first);
                  }}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-colors cursor-pointer ${
                    active
                      ? "bg-[#ff6d5a] border-[#ff6d5a] text-white font-semibold"
                      : "bg-[#141418] border-[#2d2d35] text-mono-400 hover:text-white hover:border-[#4b4b57]"
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main n8n Canvas Viewport */}
      <div className="relative bg-[#141418]">
        {/* n8n Fine Dotted Grid sized to visible viewport */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-25 z-0"
          style={{
            backgroundImage: "radial-gradient(#9ca3af 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div
          ref={canvasScrollRef}
          data-lenis-prevent
          tabIndex={0}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={stopDragging}
          onPointerLeave={stopDragging}
          aria-label="Interactive n8n workflow canvas"
          className={`workflow-scrollbar relative z-10 w-full h-[380px] sm:h-[520px] overflow-auto overscroll-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
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
              {/* n8n Sticky Notes */}
              {workflow.stickyNotes.map((note) => {
                const toneStyles =
                  note.tone === "rose"
                    ? "bg-red-950/15 border-red-500/20 text-red-200/80"
                    : note.tone === "amber"
                      ? "bg-amber-950/15 border-amber-500/20 text-amber-200/80"
                      : "bg-[#1f1f27]/45 border-[#32323d] text-mono-300";

                return (
                  <div
                    key={note.id}
                    style={{
                      left: `${note.x}px`,
                      top: `${note.y}px`,
                      width: `${note.width}px`,
                      height: `${note.height}px`,
                    }}
                    className={`pointer-events-none absolute rounded-2xl border border-dashed p-4 ${toneStyles}`}
                  >
                    <div className="text-xs font-bold font-display tracking-wide">
                      {note.title}
                    </div>
                    <div className="text-[11px] font-mono opacity-65 mt-0.5">
                      {note.subtitle}
                    </div>
                  </div>
                );
              })}

              {/* SVG Bezier Wires */}
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

                  const pathData = buildConnectionPath(fromNode, toNode, conn);
                  const isSubnodeWire = conn.targetHandle === "ai_languageModel";
                  const isActiveWire =
                    executedSet.has(fromNode.id) && executedSet.has(toNode.id);
                  const inScenario =
                    scenarioNodeSet.has(fromNode.id) &&
                    scenarioNodeSet.has(toNode.id);

                  const wireColor = isActiveWire
                    ? "#10b981"
                    : isSubnodeWire
                      ? "#a855f7"
                      : inScenario
                        ? "#7b7b8b"
                        : "#454552";

                  return (
                    <g key={`wire-${idx}`}>
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#09090b"
                        strokeWidth="4"
                        opacity="0.7"
                      />
                      <path
                        d={pathData}
                        fill="none"
                        stroke={wireColor}
                        strokeWidth={isActiveWire ? "2.6" : "2"}
                        strokeDasharray={isSubnodeWire && !isActiveWire ? "6 5" : "none"}
                        className="transition-colors duration-200"
                      />
                      {isActiveWire && isExecuting && (
                        <circle r="4.5" fill="#34d399">
                          <animateMotion path={pathData} dur="0.7s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Authentic n8n Node Shapes */}
              {workflow.nodes.map((node) => {
                const isActive = activeNodeIds.has(node.id);
                const isPassed = passedNodeIds.has(node.id) && !isActive;
                const isSelected = selectedNodeId === node.id;
                const inScenario = scenarioNodeSet.has(node.id);
                const palette = BRAND_COLORS[node.brand];

                // 1. Circular AI Sub-Node
                if (node.kind === "aiSubnode") {
                  return (
                    <div
                      key={node.id}
                      style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute z-10 flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        aria-pressed={isSelected}
                        aria-label={`${node.name} (${node.subtitle})`}
                        className={`relative w-[68px] h-[68px] rounded-full border-2 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          isActive
                            ? "bg-[#2a2438] border-[#c084fc] ring-2 ring-[#c084fc]/50 scale-105"
                            : isPassed
                              ? "bg-[#24242d] border-emerald-400"
                              : isSelected
                                ? "bg-[#282834] border-white"
                                : "bg-[#22222a] border-[#4b4b59] hover:border-[#858599]"
                        }`}
                      >
                        {/* Top diamond port connecting to AI Chain */}
                        <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-[#a855f7] border border-[#141418]" />
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: palette.bg }}
                        >
                          {renderBrandIcon(node.brand, 20)}
                        </div>
                        {isPassed && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-[#141418]">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                      <div className="mt-2 w-[150px] text-center pointer-events-none">
                        <div className="text-[11px] font-semibold text-white leading-tight truncate">
                          {node.name}
                        </div>
                        <div className="text-[10px] font-mono text-mono-400 truncate">
                          {node.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                }

                // 2. Wide LangChain AI Chain Node
                if (node.kind === "aiChain") {
                  return (
                    <div
                      key={node.id}
                      style={{
                        left: `${node.x}px`,
                        top: `${node.y}px`,
                        transform: "translate(-50%, -50%)",
                      }}
                      className="absolute z-10 flex flex-col items-center"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedNodeId(node.id)}
                        aria-pressed={isSelected}
                        aria-label={`${node.name} (${node.subtitle})`}
                        className={`relative w-[184px] h-[84px] rounded-2xl border-2 px-3.5 flex items-center gap-3 text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          isActive
                            ? "bg-[#292735] border-[#ff6d5a] ring-2 ring-[#ff6d5a]/45 scale-[1.03]"
                            : isPassed
                              ? "bg-[#22262b] border-emerald-500"
                              : isSelected
                                ? "bg-[#292933] border-white"
                                : "bg-[#23232c] border-[#454554] hover:border-[#78788c]"
                        }`}
                      >
                        {/* Input Port */}
                        <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#6e6e80] border-2 border-[#141418]" />

                        <div
                          className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: palette.bg,
                            borderColor: palette.border,
                          }}
                        >
                          {renderBrandIcon(node.brand, 21)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold text-white leading-snug line-clamp-2">
                            {node.name}
                          </div>
                          <div className="text-[9px] font-mono text-mono-400 mt-0.5 truncate">
                            {node.subtitle}
                          </div>
                        </div>

                        {/* Output Port */}
                        <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#6e6e80] border-2 border-[#141418]" />

                        {/* Bottom Model Diamond Port */}
                        <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                          <div className="w-3 h-3 rotate-45 bg-[#a855f7] border-2 border-[#141418]" />
                        </div>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-purple-300/80 whitespace-nowrap pointer-events-none">
                          Model
                        </span>

                        {isPassed && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-[#141418]">
                            <Check size={11} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                }

                // 3. Standard Square n8n Node / Trigger / If Node (Label below tile)
                const isTrigger = node.kind === "trigger";
                const isIf = node.kind === "if";

                return (
                  <div
                    key={node.id}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute z-10 flex flex-col items-center ${
                      !inScenario && !isActive && !isPassed ? "opacity-55 hover:opacity-100" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      aria-pressed={isSelected}
                      aria-label={`${node.name} (${node.subtitle})`}
                      className={`relative w-[92px] h-[92px] border-2 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        isTrigger
                          ? "rounded-l-[38px] rounded-r-2xl"
                          : "rounded-2xl"
                      } ${
                        isActive
                          ? "bg-[#2c2b34] border-[#ff6d5a] ring-2 ring-[#ff6d5a]/45 scale-105"
                          : isPassed
                            ? "bg-[#22282a] border-emerald-500"
                            : isSelected
                              ? "bg-[#2a2a34] border-white"
                              : "bg-[#23232c] border-[#454554] hover:border-[#78788c]"
                      }`}
                    >
                      {/* Left Trigger Bolt OR Input Port */}
                      {isTrigger ? (
                        <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#ff6d5a] text-white flex items-center justify-center border-2 border-[#141418]">
                          <Zap size={8} className="fill-white" />
                        </div>
                      ) : (
                        <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#6e6e80] border-2 border-[#141418]" />
                      )}

                      {/* Centered n8n Icon Tile */}
                      <div
                        className="w-12 h-12 rounded-xl border flex items-center justify-center"
                        style={{
                          backgroundColor: palette.bg,
                          borderColor: palette.border,
                        }}
                      >
                        {renderBrandIcon(node.brand, 24)}
                      </div>

                      {/* Right Output Port(s) */}
                      {isIf ? (
                        <>
                          <div className="absolute -right-[6px] top-[31px] w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#141418]" />
                          <span className="absolute -right-8 top-[24px] text-[9px] font-mono text-emerald-400 pointer-events-none">
                            true
                          </span>
                          <div className="absolute -right-[6px] top-[61px] w-3 h-3 rounded-full bg-[#7c7c8f] border-2 border-[#141418]" />
                          <span className="absolute -right-9 top-[54px] text-[9px] font-mono text-mono-400 pointer-events-none">
                            false
                          </span>
                        </>
                      ) : (
                        <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#6e6e80] border-2 border-[#141418]" />
                      )}

                      {isPassed && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center border-2 border-[#141418]">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </button>

                    {/* Label Below Tile (Classic n8n Canvas Layout) */}
                    <div className="mt-2 w-[155px] text-center pointer-events-none">
                      <div className="text-[11px] font-semibold text-white leading-tight line-clamp-2">
                        {node.name}
                      </div>
                      <div className="text-[10px] font-mono text-mono-500 mt-0.5 truncate">
                        {node.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Non-overlapping Canvas Action Toolbar (Zoom/Fit left, Execute right/center) */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-2.5 px-3.5 sm:px-5 py-2.5 bg-[#1b1b21] border-t border-[#2d2d35]">
          <div className="flex items-center gap-1 bg-[#141418] border border-[#32323c] rounded-xl p-1">
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))
              }
              aria-label="Zoom out workflow canvas"
              title="Zoom Out"
              className="p-1.5 text-mono-300 hover:text-white hover:bg-[#2a2a32] rounded-lg cursor-pointer"
            >
              <ZoomOut size={14} />
            </button>
            <span className="px-1.5 text-[10px] font-mono text-mono-400 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))
              }
              aria-label="Zoom in workflow canvas"
              title="Zoom In"
              className="p-1.5 text-mono-300 hover:text-white hover:bg-[#2a2a32] rounded-lg cursor-pointer"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={handleFitCanvas}
              aria-label="Fit workflow to view"
              title="Fit View"
              className="p-1.5 text-mono-300 hover:text-white hover:bg-[#2a2a32] rounded-lg cursor-pointer"
            >
              <Maximize2 size={13} />
            </button>
            <button
              type="button"
              onClick={resetExecution}
              aria-label="Reset execution"
              title="Reset Execution"
              className="p-1.5 text-mono-300 hover:text-white hover:bg-[#2a2a32] rounded-lg cursor-pointer"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 bg-[#ff6d5a] hover:bg-[#ff5640] disabled:cursor-wait disabled:opacity-80 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Zap size={14} className="fill-white" />
            <span>
              {isExecuting ? "Executing..." : "Execute workflow"}
            </span>
          </button>
        </div>
      </div>

      {/* Real Parameter Inspector Panel */}
      {selectedNode && (
        <div className="px-5 sm:px-6 py-4 bg-[#1e1e24] border-t border-[#2d2d35] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5"
              style={{
                backgroundColor: BRAND_COLORS[selectedNode.brand].bg,
                borderColor: BRAND_COLORS[selectedNode.brand].border,
              }}
            >
              {renderBrandIcon(selectedNode.brand, 18)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white font-display">
                  {selectedNode.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141418] border border-[#2d2d35] text-mono-300">
                  {selectedNode.n8nType}
                </span>
              </div>
              <p className="text-xs text-mono-400 font-light mt-1">
                {selectedNode.detail}
              </p>
              {selectedNode.configPreview && (
                <code className="mt-2 inline-block max-w-full truncate rounded-md bg-[#141418] border border-[#2a2a33] px-2.5 py-1 text-[10px] font-mono text-mono-300">
                  {selectedNode.configPreview}
                </code>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono shrink-0">
            {relatedNodes.incoming.map((node) => (
              <button
                key={`in-${node.id}`}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#2d2d35] text-mono-400 hover:text-white hover:border-[#4b4b57] cursor-pointer"
              >
                ← {node.name}
              </button>
            ))}
            {relatedNodes.outgoing.map((node) => (
              <button
                key={`out-${node.id}`}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className="px-2.5 py-1 rounded-lg bg-[#141418] border border-[#2d2d35] text-mono-300 hover:text-white hover:border-[#4b4b57] cursor-pointer"
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
