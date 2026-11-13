"use client";

import { useState } from "react";
import { MousePointer2, Keyboard, Clipboard, Power, Laptop, CheckCircle2, Wifi } from "lucide-react";

export default function RelayApp() {
  const [activeMode, setActiveMode] = useState<"trackpad" | "keyboard" | "clipboard" | "power">("trackpad");
  const [clickFeedback, setClickFeedback] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [clipboardContent, setClipboardContent] = useState("https://github.com/mohd-shariq-osmani/Relay");
  const [copiedStatus, setCopiedStatus] = useState(false);

  const triggerClick = (label: string) => {
    setClickFeedback(label);
    setTimeout(() => setClickFeedback(null), 300);
  };

  const handleCopyClipboard = () => {
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 1500);
  };

  return (
    <div className="w-full h-full bg-mono-950 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="p-3.5 bg-mono-900 border-b border-mono-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-black border border-mono-800 flex items-center justify-center text-white">
            <Laptop size={14} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white font-display flex items-center gap-1.5">
              <span>Workstation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </h2>
            <p className="text-[10px] font-mono text-mono-400">
              LAN • WebSocket Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-mono text-mono-400 bg-mono-950 px-2 py-1 rounded-md border border-mono-800">
          <Wifi size={11} className="text-emerald-400" />
          <span>mDNS</span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-4 p-2 gap-1 bg-black/60 border-b border-mono-900 shrink-0">
        <button
          onClick={() => setActiveMode("trackpad")}
          className={`py-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeMode === "trackpad" ? "bg-white text-black font-semibold shadow" : "text-mono-400 hover:text-white"
          }`}
        >
          <MousePointer2 size={13} />
          <span className="text-[9px] font-mono">Trackpad</span>
        </button>

        <button
          onClick={() => setActiveMode("keyboard")}
          className={`py-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeMode === "keyboard" ? "bg-white text-black font-semibold shadow" : "text-mono-400 hover:text-white"
          }`}
        >
          <Keyboard size={13} />
          <span className="text-[9px] font-mono">Keyboard</span>
        </button>

        <button
          onClick={() => setActiveMode("clipboard")}
          className={`py-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeMode === "clipboard" ? "bg-white text-black font-semibold shadow" : "text-mono-400 hover:text-white"
          }`}
        >
          <Clipboard size={13} />
          <span className="text-[9px] font-mono">Clipboard</span>
        </button>

        <button
          onClick={() => setActiveMode("power")}
          className={`py-1.5 rounded-lg flex flex-col items-center gap-1 transition-all ${
            activeMode === "power" ? "bg-white text-black font-semibold shadow" : "text-mono-400 hover:text-white"
          }`}
        >
          <Power size={13} />
          <span className="text-[9px] font-mono">Power</span>
        </button>
      </div>

      {/* Main Interactive View Area */}
      <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
        {activeMode === "trackpad" && (
          <div className="h-full flex flex-col justify-between gap-2.5">
            {/* Virtual Touch Surface */}
            <div
              onClick={() => triggerClick("Left Click")}
              className="flex-1 bg-mono-900/60 border border-dashed border-mono-800 hover:border-mono-600 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all active:bg-mono-800/80"
            >
              <MousePointer2 size={24} className="text-mono-500 mb-2" />
              <span className="text-xs font-mono text-mono-300">Virtual Touchpad Surface</span>
              <span className="text-[10px] text-mono-500 mt-1 font-mono">
                {clickFeedback ? `Dispatched: ${clickFeedback}` : "Tap for Left Click • 2-Finger Scroll"}
              </span>
            </div>

            {/* Click Hardware Buttons */}
            <div className="grid grid-cols-2 gap-2 h-14">
              <button
                onClick={() => triggerClick("Left Click")}
                className="rounded-xl bg-mono-900 border border-mono-800 hover:border-mono-600 text-xs font-mono font-medium text-mono-200 active:bg-white active:text-black transition-all"
              >
                Left Click
              </button>
              <button
                onClick={() => triggerClick("Right Click")}
                className="rounded-xl bg-mono-900 border border-mono-800 hover:border-mono-600 text-xs font-mono font-medium text-mono-200 active:bg-white active:text-black transition-all"
              >
                Right Click
              </button>
            </div>
          </div>
        )}

        {activeMode === "keyboard" && (
          <div className="h-full flex flex-col justify-between gap-3">
            <div className="p-3 bg-mono-900 border border-mono-800 rounded-xl">
              <span className="text-[10px] font-mono text-mono-400 block mb-2">Remote Input Stream</span>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type here to send keystrokes..."
                className="w-full bg-black border border-mono-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-mono-600 focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["Escape", "Enter", "Backspace", "Tab", "Space", "Cmd / Win"].map((key) => (
                <button
                  key={key}
                  onClick={() => triggerClick(`Key: ${key}`)}
                  className="py-2.5 rounded-lg bg-mono-900 border border-mono-800 text-[11px] font-mono text-mono-300 hover:text-white hover:border-mono-600 active:bg-white active:text-black transition-all"
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="p-2.5 bg-black border border-mono-900 rounded-xl text-center">
              <span className="text-[10px] font-mono text-mono-500">
                {clickFeedback || "Live keystrokes transmitted over WebSocket"}
              </span>
            </div>
          </div>
        )}

        {activeMode === "clipboard" && (
          <div className="h-full flex flex-col justify-between gap-3">
            <div className="p-3 bg-mono-900 border border-mono-800 rounded-xl">
              <span className="text-[10px] font-mono text-mono-400 block mb-2">Synchronized Host Clipboard</span>
              <textarea
                value={clipboardContent}
                onChange={(e) => setClipboardContent(e.target.value)}
                rows={4}
                className="w-full bg-black border border-mono-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-white resize-none"
              />
            </div>

            <button
              onClick={handleCopyClipboard}
              className="w-full py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-mono-200 transition-all flex items-center justify-center gap-1.5"
            >
              {copiedStatus ? <CheckCircle2 size={13} /> : <Clipboard size={13} />}
              <span>{copiedStatus ? "Pushed to Desktop Clipboard" : "Send to Desktop"}</span>
            </button>
          </div>
        )}

        {activeMode === "power" && (
          <div className="h-full flex flex-col justify-center gap-3">
            <div className="p-3 bg-mono-900/60 border border-mono-850 rounded-xl text-center mb-2">
              <Power size={20} className="text-mono-400 mx-auto mb-1.5" />
              <span className="text-xs font-bold text-white font-display block">System Power Commands</span>
              <span className="text-[10px] font-mono text-mono-400">Authenticated PIN Session</span>
            </div>

            <button
              onClick={() => triggerClick("Lock Workstation")}
              className="py-3 rounded-xl bg-mono-900 border border-mono-800 hover:border-mono-600 text-xs font-mono text-mono-200 active:bg-white active:text-black transition-all"
            >
              Lock Desktop
            </button>
            <button
              onClick={() => triggerClick("Sleep Mode")}
              className="py-3 rounded-xl bg-mono-900 border border-mono-800 hover:border-mono-600 text-xs font-mono text-mono-200 active:bg-white active:text-black transition-all"
            >
              Sleep Workstation
            </button>

            {clickFeedback && (
              <span className="text-[10px] font-mono text-emerald-400 text-center mt-1">
                Dispatched: {clickFeedback}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-black border-t border-mono-900 text-center shrink-0">
        <span className="text-[10px] font-mono text-mono-500">
          Local-First • Python Asyncio Server • Flutter Client
        </span>
      </div>
    </div>
  );
}
