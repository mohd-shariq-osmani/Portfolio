"use client";

import { useState } from "react";
import { Network, Play, RefreshCw, Server, CheckCircle2, AlertTriangle, Activity } from "lucide-react";

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  lastRun: string;
  status: "Success" | "Running" | "Failed";
}

export default function N8nCompanionApp() {
  const [server, setServer] = useState("n8n-prod-01.internal");

  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([
    { id: "1", name: "AI Lead Scoring & Webhook", active: true, lastRun: "2 mins ago", status: "Success" },
    { id: "2", name: "GitHub Error Auto-Triage", active: true, lastRun: "12 mins ago", status: "Success" },
    { id: "3", name: "Daily Vector Embedding Sync", active: false, lastRun: "1 hour ago", status: "Success" },
    { id: "4", name: "Stripe Webhook Event Bridge", active: true, lastRun: "3 hours ago", status: "Success" },
  ]);

  const [logs, setLogs] = useState<string[]>([
    "04:10:22 [SUCCESS] Node 'Gemini AI Agent' finished (240ms)",
    "04:08:15 [SUCCESS] Node 'Postgres Upsert' 1 row affected",
    "04:00:00 [CRON] Triggered 'Daily Vector Sync'",
  ]);

  const toggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const triggerWorkflow = (wf: N8nWorkflow) => {
    const time = new Date().toLocaleTimeString();
    setWorkflows(
      workflows.map((w) => (w.id === wf.id ? { ...w, lastRun: "Just now", status: "Running" } : w))
    );

    setLogs((prev) => [
      `[${time}] Manual trigger dispatched for "${wf.name}"`,
      ...prev.slice(0, 3),
    ]);

    setTimeout(() => {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...w, status: "Success" } : w))
      );
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Execution completed -> 200 OK`,
        ...prev.slice(0, 3),
      ]);
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-mono-950 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-mono-900 border-b border-mono-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
            <Network size={15} className="text-white" />
            <span>n8n Companion</span>
          </h2>
          <p className="text-[10px] font-mono text-mono-400 flex items-center gap-1">
            <Server size={9} />
            {server}
          </p>
        </div>

        <button
          onClick={() => setServer(server.includes("prod") ? "n8n-staging.internal" : "n8n-prod-01.internal")}
          className="px-2 py-1 bg-black border border-mono-800 text-[10px] font-mono rounded text-mono-300 hover:text-white"
        >
          Switch Env
        </button>
      </div>

      {/* Workflow Operations List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="p-3 bg-mono-900 border border-mono-800 rounded-xl flex items-center justify-between gap-2 hover:border-mono-700 transition-colors"
          >
            <div className="flex items-start gap-2.5 overflow-hidden">
              {/* Active Toggle Switch */}
              <button
                onClick={() => toggleWorkflow(wf.id)}
                className={`w-9 h-5 rounded-full p-0.5 border transition-colors shrink-0 mt-0.5 ${
                  wf.active
                    ? "bg-white border-white justify-end"
                    : "bg-mono-950 border-mono-700 justify-start"
                } flex items-center`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    wf.active ? "bg-black" : "bg-mono-600"
                  }`}
                />
              </button>

              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white font-display truncate">
                  {wf.name}
                </h4>
                <div className="flex items-center gap-2 text-[9px] font-mono text-mono-400 mt-0.5">
                  <span>{wf.lastRun}</span>
                  <span>•</span>
                  <span className={wf.status === "Running" ? "text-white font-bold animate-pulse" : "text-mono-300"}>
                    {wf.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => triggerWorkflow(wf)}
              disabled={wf.status === "Running"}
              className="px-2.5 py-1.5 bg-black border border-mono-800 hover:border-mono-600 text-white rounded-lg text-[10px] font-mono flex items-center gap-1 shrink-0"
            >
              <Play size={10} className="fill-white" />
              <span>Run</span>
            </button>
          </div>
        ))}

        {/* Live Logs Sub-section */}
        <div className="mt-2 p-3 bg-black border border-mono-850 rounded-xl font-mono text-[10px]">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-mono-900 text-mono-500">
            <span className="flex items-center gap-1">
              <Activity size={10} />
              Telemetry Console
            </span>
            <span className="text-white">LIVE</span>
          </div>
          <div className="flex flex-col gap-1">
            {logs.map((log, idx) => (
              <p key={idx} className={idx === 0 ? "text-white" : "text-mono-400"}>
                {log}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-black border-t border-mono-900 text-center shrink-0">
        <span className="text-[10px] font-mono text-mono-500">
          n8n REST API • Encrypted Key Connection
        </span>
      </div>
    </div>
  );
}
