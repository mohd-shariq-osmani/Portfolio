"use client";

import { useState } from "react";
import { ShieldCheck, Lock, Eye, EyeOff, Copy, Key, Plus, Check, Fingerprint } from "lucide-react";

interface VaultItem {
  id: string;
  service: string;
  username: string;
  secret: string;
  category: "Password" | "API Key" | "SSH Key" | "Crypto";
}

export default function VaultApp() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [items, setItems] = useState<VaultItem[]>([
    {
      id: "1",
      service: "GitHub Enterprise API Token",
      username: "mohd-shariq-osmani",
      secret: "ghp_92n8N38X9aA10zL29m8Xk19P029sZ",
      category: "API Key",
    },
    {
      id: "2",
      service: "AWS Production Infrastructure",
      username: "admin@osmani.io",
      secret: "AKIAIOSFODNN7EXAMPLE_SECRET",
      category: "SSH Key",
    },
    {
      id: "3",
      service: "Solana Cold Storage Wallet",
      username: "Primary Vault",
      secret: "abandon amount barrel canal base zebra wolf ocean",
      category: "Crypto",
    },
    {
      id: "4",
      service: "Self-Hosted n8n Instance DB",
      username: "postgres_n8n",
      secret: "super_secret_db_pass_2026_mso",
      category: "Password",
    },
  ]);

  const [newService, setNewService] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim() || !newSecret.trim()) return;
    const newItem: VaultItem = {
      id: Date.now().toString(),
      service: newService.trim(),
      username: newUsername.trim() || "user",
      secret: newSecret.trim(),
      category: "Password",
    };
    setItems([newItem, ...items]);
    setNewService("");
    setNewUsername("");
    setNewSecret("");
    setShowAddForm(false);
  };

  if (!unlocked) {
    return (
      <div className="w-full h-full bg-mono-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-mono-900 border border-mono-700 flex items-center justify-center mb-4 text-white shadow-xl">
          <ShieldCheck size={28} />
        </div>
        <h2 className="text-base font-bold font-display text-white mb-1">
          Vault AES-256
        </h2>
        <p className="text-xs text-mono-400 mb-6 max-w-[200px]">
          Zero-Knowledge Encrypted Enclave
        </p>

        <button
          onClick={() => setUnlocked(true)}
          className="w-full max-w-[200px] py-3 bg-white text-black font-semibold text-xs rounded-full hover:bg-mono-200 transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Fingerprint size={16} />
          <span>Biometric Unlock</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-mono-950 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-mono-900 border-b border-mono-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
            <Lock size={14} className="text-white" />
            <span>Encrypted Vault</span>
          </h2>
          <p className="text-[10px] font-mono text-mono-400">
            {items.length} items • AES-256-GCM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1 bg-white text-black text-xs font-bold rounded-lg hover:bg-mono-200 transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            <span>Add</span>
          </button>
          <button
            onClick={() => setUnlocked(false)}
            className="p-1.5 text-mono-400 hover:text-white bg-black border border-mono-800 rounded-lg"
            title="Lock Vault"
          >
            <Lock size={12} />
          </button>
        </div>
      </div>

      {/* Add Form Drawer */}
      {showAddForm && (
        <form onSubmit={addItem} className="p-3 bg-black border-b border-mono-850 flex flex-col gap-2 shrink-0">
          <input
            type="text"
            placeholder="Service name (e.g. Stripe API)"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            className="px-3 py-1.5 bg-mono-900 border border-mono-800 rounded-lg text-xs text-white placeholder-mono-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Username / Identifier"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="px-3 py-1.5 bg-mono-900 border border-mono-800 rounded-lg text-xs text-white placeholder-mono-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Secret Payload"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            className="px-3 py-1.5 bg-mono-900 border border-mono-800 rounded-lg text-xs text-white placeholder-mono-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs text-mono-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-white text-black font-bold text-xs rounded-md"
            >
              Save Encrypted
            </button>
          </div>
        </form>
      )}

      {/* Secrets List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
        {items.map((item) => {
          const isRevealed = !!revealedIds[item.id];
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="p-3 bg-mono-900 border border-mono-800 rounded-xl flex flex-col gap-2 hover:border-mono-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-display">
                    {item.service}
                  </h4>
                  <span className="text-[10px] font-mono text-mono-400">
                    {item.username}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black border border-mono-800 text-mono-400">
                  {item.category}
                </span>
              </div>

              {/* Secret Bar */}
              <div className="p-2 bg-black border border-mono-850 rounded-lg flex items-center justify-between gap-2 font-mono text-xs">
                <span className="truncate text-mono-300">
                  {isRevealed ? item.secret : "••••••••••••••••••••"}
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="p-1 text-mono-400 hover:text-white transition-colors"
                  >
                    {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => handleCopy(item.id, item.secret)}
                    className="p-1 text-mono-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check size={12} className="text-white" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-black border-t border-mono-900 text-center shrink-0">
        <span className="text-[10px] font-mono text-mono-500">
          Hardware Key Enclave • Zero Cloud Logs
        </span>
      </div>
    </div>
  );
}
