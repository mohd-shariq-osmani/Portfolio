export interface WorkflowNode {
  id: string;
  name: string;
  subtitle?: string;
  type: "trigger" | "action" | "ai" | "database" | "router" | "subnode";
  icon: string;
  x: number; // pixel X coordinate on 1200x500 canvas
  y: number; // pixel Y coordinate on 1200x500 canvas
}

export interface WorkflowConnection {
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export const REAL_N8N_WORKFLOW: Workflow = {
  id: "discord-ai-router",
  name: "Discord AI Content Router & Multi-Platform Dispatcher",
  description:
    "Production n8n pipeline ingesting Discord messages, extracting links, reasoning via LLM Chain, and routing posts across Instagram & Discord channels.",
  nodes: [
    { id: "n1", name: "Every 5 Minutes", subtitle: "Cron Trigger", type: "trigger", icon: "Clock", x: 120, y: 320 },
    { id: "n2", name: "Get Discord Messages", subtitle: "discord message", type: "action", icon: "MessageSquare", x: 300, y: 320 },
    { id: "n3", name: "De-dupe Messages", subtitle: "EVENT/Message", type: "action", icon: "Filter", x: 500, y: 320 },
    { id: "n4", name: "Extract URLs", subtitle: "Regex Match", type: "action", icon: "Link", x: 680, y: 320 },
    { id: "n5", name: "Parse Router", subtitle: "JSON Parser", type: "action", icon: "Code", x: 860, y: 320 },
    
    // Main LLM Reasoning Core
    { id: "n6", name: "Basic LLM Chain", subtitle: "Main Reasoner", type: "ai", icon: "Cpu", x: 1040, y: 320 },
    { id: "n6_sub", name: "OpenRouter Chat Model", subtitle: "Gemini 1.5 Pro", type: "subnode", icon: "Bot", x: 1040, y: 510 },
    
    { id: "n7", name: "Parse Router Output", subtitle: "JSON Struct", type: "action", icon: "Code", x: 1220, y: 320 },
    
    // Router / Switch Node
    { id: "n8", name: "Router / SWITCH", subtitle: "mode: Rules", type: "router", icon: "GitBranch", x: 1400, y: 320 },

    // Branch P1 (Project)
    { id: "p1", name: "P1", subtitle: "Condition", type: "action", icon: "Check", x: 1580, y: 150 },
    { id: "p1_http", name: "HTTP Request", subtitle: "Instagram API 1", type: "action", icon: "Globe", x: 1770, y: 150 },
    { id: "p1_llm", name: "Basic LLM Chain", subtitle: "Project LLM", type: "ai", icon: "Cpu", x: 1960, y: 150 },
    { id: "p1_parse", name: "Parse Project", subtitle: "JSON", type: "action", icon: "Code", x: 2150, y: 150 },
    { id: "p1_limit", name: "Limit Project Length", subtitle: "Truncate", type: "action", icon: "Sliders", x: 2340, y: 150 },
    { id: "p1_out", name: "Create Project Post", subtitle: "Discord Send", type: "action", icon: "Send", x: 2530, y: 150 },

    // Branch P2 (Workout)
    { id: "p2", name: "P2", subtitle: "Condition", type: "action", icon: "Check", x: 1580, y: 320 },
    { id: "p2_http", name: "HTTP Request", subtitle: "Instagram API 2", type: "action", icon: "Globe", x: 1770, y: 320 },
    { id: "p2_llm", name: "Basic LLM Chain", subtitle: "Workout LLM", type: "ai", icon: "Cpu", x: 1960, y: 320 },
    { id: "p2_parse", name: "Parse Workout", subtitle: "JSON", type: "action", icon: "Code", x: 2150, y: 320 },
    { id: "p2_limit", name: "Limit Workout Length", subtitle: "Truncate", type: "action", icon: "Sliders", x: 2340, y: 320 },
    { id: "p2_out", name: "Create Workout Post", subtitle: "Discord Send", type: "action", icon: "Send", x: 2530, y: 320 },

    // Branch P3 (Media)
    { id: "p3", name: "P3", subtitle: "Condition", type: "action", icon: "Check", x: 1580, y: 490 },
    { id: "p3_http", name: "HTTP Request", subtitle: "Instagram API 3", type: "action", icon: "Globe", x: 1770, y: 490 },
    { id: "p3_llm", name: "Basic LLM Chain", subtitle: "Media LLM", type: "ai", icon: "Cpu", x: 1960, y: 490 },
    { id: "p3_parse", name: "Parse Media", subtitle: "JSON", type: "action", icon: "Code", x: 2150, y: 490 },
    { id: "p3_limit", name: "Limit Media Length", subtitle: "Truncate", type: "action", icon: "Sliders", x: 2340, y: 490 },
    { id: "p3_out", name: "Create Media Post", subtitle: "Discord Send", type: "action", icon: "Send", x: 2530, y: 490 },
  ],
  connections: [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
    { from: "n3", to: "n4" },
    { from: "n4", to: "n5" },
    { from: "n5", to: "n6" },
    { from: "n6_sub", to: "n6" },
    { from: "n6", to: "n7" },
    { from: "n7", to: "n8" },

    // Router Outputs
    { from: "n8", to: "p1" },
    { from: "n8", to: "p2" },
    { from: "n8", to: "p3" },

    // Branch 1
    { from: "p1", to: "p1_http" },
    { from: "p1_http", to: "p1_llm" },
    { from: "p1_llm", to: "p1_parse" },
    { from: "p1_parse", to: "p1_limit" },
    { from: "p1_limit", to: "p1_out" },

    // Branch 2
    { from: "p2", to: "p2_http" },
    { from: "p2_http", to: "p2_llm" },
    { from: "p2_llm", to: "p2_parse" },
    { from: "p2_parse", to: "p2_limit" },
    { from: "p2_limit", to: "p2_out" },

    // Branch 3
    { from: "p3", to: "p3_http" },
    { from: "p3_http", to: "p3_llm" },
    { from: "p3_llm", to: "p3_parse" },
    { from: "p3_parse", to: "p3_limit" },
    { from: "p3_limit", to: "p3_out" },
  ],
};
