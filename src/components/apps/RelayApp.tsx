"use client";

import { useState } from "react";
import { Radio, Send, RefreshCw, CheckCircle2, ArrowRight, Zap } from "lucide-react";

export default function RelayApp() {
  const [eventsCount, setEventsCount] = useState(14820);
  const [dispatching, setDispatching] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "04:11:02 [EVENT DELIVERED] payload_id #9842 -> 200 OK (18ms)",
    "04:10:45 [QUEUE] Batch 40 items transformed",
    "04:09:30 [RETRY SUCCESS] Webhook attempt 2 succeeded",
  ]);

  const dispatchTestEvent = () => {
    setDispatching(true);
    const eventId = Math.floor(1000 + Math.random() * 9000);
    const time = new Date().toLocaleTimeString();

    setTimeout(() => {
      setEventsCount((c) => c + 1);
      setDispatching(false);
      setLogs((prev) => [
        `[${time}] DISPATCHED evt_${eventId} -> HTTP POST /webhook 200 OK`,
        ...prev.slice(0, 3),
      ]);
    }, 600);
  };

  return (
    <div className="w-full h-full bg-mono-950 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-mono-900 border-b border-mono-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
            <Radio size={15} className="text-white" />
            <span>Relay Event Bridge</span>
          </h2>
          <p className="text-[10px] font-mono text-mono-400">
            {eventsCount.toLocaleString()} events dispatched
          </p>
        </div>

        <button
          onClick={dispatchTestEvent}
          disabled={dispatching}
          className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg hover:bg-mono-200 transition-colors flex items-center gap-1.5 shadow"
        >
          <Zap size={12} className="fill-black" />
          <span>{dispatching ? "Sending..." : "Dispatch"}</span>
        </button>
      </div>

      {/* Main Console View */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-mono-900 border border-mono-800 rounded-xl">
            <span className="text-[10px] font-mono text-mono-400 block">Avg Latency</span>
            <span className="text-base font-bold text-white font-display">14.2 ms</span>
          </div>
          <div className="p-3 bg-mono-900 border border-mono-800 rounded-xl">
            <span className="text-[10px] font-mono text-mono-400 block">Success Rate</span>
            <span className="text-base font-bold text-white font-display">99.98%</span>
          </div>
        </div>

        {/* Live Stream Payload Monitor */}
        <div className="p-3 bg-black border border-mono-850 rounded-xl">
          <h4 className="text-[11px] font-mono uppercase text-mono-400 mb-2 flex items-center justify-between">
            <span>Payload Inspector</span>
            <span className="text-white text-[9px]">LIVE</span>
          </h4>

          <pre className="p-2.5 bg-mono-950 border border-mono-900 rounded-lg text-[10px] font-mono text-mono-300 overflow-x-auto leading-relaxed">
            {`{
  "event": "user.signup",
  "source": "api.relay.internal",
  "timestamp": "${new Date().toISOString().substring(0, 19)}Z",
  "payload": {
    "user_id": "usr_9921",
    "tier": "enterprise"
  }
}`}
          </pre>
        </div>

        {/* Event Logs Stream */}
        <div className="p-3 bg-mono-900 border border-mono-800 rounded-xl font-mono text-[10px]">
          <span className="text-[10px] text-mono-400 block mb-2 font-semibold">
            Dispatch Queue Stream
          </span>
          <div className="flex flex-col gap-1.5">
            {logs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-mono-600 font-bold">&gt;</span>
                <span className={idx === 0 ? "text-white font-medium" : "text-mono-400"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-black border-t border-mono-900 text-center shrink-0">
        <span className="text-[10px] font-mono text-mono-500">
          Asynchronous Message Queue • Retry Backoff Engine
        </span>
      </div>
    </div>
  );
}
