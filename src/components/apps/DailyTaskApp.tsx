"use client";

import { useState } from "react";
import { Check, Plus, Trash2, Calendar, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  time: string;
}

export default function DailyTaskApp() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review n8n AI Lead Pipeline logs",
      priority: "High",
      completed: true,
      time: "09:30 AM",
    },
    {
      id: "2",
      title: "Deploy Vault AES-256 patch to store",
      priority: "High",
      completed: false,
      time: "11:15 AM",
    },
    {
      id: "3",
      title: "Optimize Flutter Web compile bundle",
      priority: "Medium",
      completed: false,
      time: "02:00 PM",
    },
    {
      id: "4",
      title: "Refactor Relay event queue retries",
      priority: "Low",
      completed: false,
      time: "04:45 PM",
    },
  ]);

  const [filter, setFilter] = useState<"All" | "Active" | "Completed">("All");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "Active") return !t.completed;
    if (filter === "Completed") return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-full h-full bg-mono-950 text-white flex flex-col justify-between select-none font-sans overflow-hidden">
      {/* App Header Bar */}
      <div className="p-4 bg-mono-900 border-b border-mono-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
            <CheckCircle2 size={15} className="text-white" />
            <span>DailyTask Pro</span>
          </h2>
          <p className="text-[10px] font-mono text-mono-400">
            {completedCount}/{tasks.length} completed
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 bg-black rounded-lg border border-mono-800 text-[10px]">
          {(["All", "Active", "Completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === f ? "bg-white text-black font-semibold" : "text-mono-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task Creation Form */}
      <form onSubmit={addTask} className="p-3 bg-black border-b border-mono-850 flex gap-2 shrink-0">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-3 py-1.5 bg-mono-900 border border-mono-800 rounded-lg text-xs text-white placeholder-mono-500 focus:outline-none focus:border-mono-500"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          className="px-2 py-1.5 bg-mono-900 border border-mono-800 rounded-lg text-xs text-mono-300 focus:outline-none"
        >
          <option value="High">High</option>
          <option value="Medium">Med</option>
          <option value="Low">Low</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-mono-200 transition-colors flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
      </form>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-mono-500">
            <CheckCircle2 size={24} className="mb-2 opacity-50" />
            <p className="text-xs font-mono">No tasks in list</p>
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                t.completed
                  ? "bg-mono-950 border-mono-900 opacity-60"
                  : "bg-mono-900 border-mono-800 hover:border-mono-700"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <button
                  onClick={() => toggleTask(t.id)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    t.completed
                      ? "bg-white border-white text-black"
                      : "border-mono-600 hover:border-white"
                  }`}
                >
                  {t.completed && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="overflow-hidden">
                  <p
                    className={`text-xs font-medium truncate ${
                      t.completed ? "line-through text-mono-500" : "text-white"
                    }`}
                  >
                    {t.title}
                  </p>
                  <span className="text-[9px] font-mono text-mono-500 flex items-center gap-1 mt-0.5">
                    <Clock size={9} />
                    {t.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    t.priority === "High"
                      ? "bg-mono-800 border-mono-600 text-white font-bold"
                      : t.priority === "Medium"
                      ? "bg-mono-900 border-mono-800 text-mono-300"
                      : "bg-black border-mono-850 text-mono-500"
                  }`}
                >
                  {t.priority}
                </span>
                <button
                  onClick={() => deleteTask(t.id)}
                  className="p-1 text-mono-500 hover:text-white transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* App Footer */}
      <div className="p-2.5 bg-black border-t border-mono-900 text-center shrink-0">
        <span className="text-[10px] font-mono text-mono-500">
          Flutter Reactive Engine • Instant Local Sync
        </span>
      </div>
    </div>
  );
}
