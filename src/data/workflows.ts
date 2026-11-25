export type N8nNodeKind = "trigger" | "action" | "if" | "aiChain" | "aiSubnode";

export type N8nNodeBrand =
  | "n8n-trigger"
  | "discord"
  | "webhook"
  | "code"
  | "if"
  | "terminal"
  | "ai"
  | "schedule"
  | "error";

export interface WorkflowNode {
  id: string;
  name: string;
  subtitle: string;
  n8nType: string;
  kind: N8nNodeKind;
  brand: N8nNodeBrand;
  x: number;
  y: number;
  detail: string;
  configPreview?: string;
}

export interface WorkflowConnection {
  from: string;
  to: string;
  sourceHandle?: "main" | "true" | "false";
  targetHandle?: "main" | "ai_languageModel";
}

export interface WorkflowStickyNote {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: "neutral" | "amber" | "rose";
}

export interface ExecutionScenario {
  id: string;
  label: string;
  steps: string[][];
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  canvasWidth: number;
  canvasHeight: number;
  stickyNotes: WorkflowStickyNote[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  scenarios: ExecutionScenario[];
}

export const DISCORD_MULTI_AGENT_WORKFLOW: N8nWorkflow = {
  id: "discord-ai-multi-agent-router",
  name: "Discord AI Multi-Agent Router",
  active: true,
  canvasWidth: 3280,
  canvasHeight: 900,
  stickyNotes: [
    {
      id: "note-main",
      title: "Main Intake & 2-Stage AI Multi-Agent Router",
      subtitle: "Discord Polling / Webhook → Universal Scraper → Gemini 3.6 Perception → Claude Sonnet 5 Chief Editor → Dynamic Discord Embed",
      x: 55,
      y: 70,
      width: 3185,
      height: 555,
      tone: "neutral",
    },
    {
      id: "note-error",
      title: "Error Alerting",
      subtitle: "Catches node failures & posts stack trace to #error-log",
      x: 55,
      y: 650,
      width: 810,
      height: 215,
      tone: "rose",
    },
    {
      id: "note-digest",
      title: "Scheduled Daily Digest",
      subtitle: "Cron 30 17 * * * (11 PM IST) → #general summary",
      x: 910,
      y: 650,
      width: 1090,
      height: 215,
      tone: "amber",
    },
  ],
  nodes: [
    // Main Flow
    {
      id: "manual-trigger-node-001",
      name: "When clicking ‘Execute workflow’",
      subtitle: "Manual Trigger",
      n8nType: "n8n-nodes-base.manualTrigger",
      kind: "trigger",
      brand: "n8n-trigger",
      x: 150,
      y: 205,
      detail: "On-demand manual trigger for testing intake polling directly from the n8n canvas.",
      configPreview: "Trigger mode: Manual execution",
    },
    {
      id: "get-discord-messages-node-001",
      name: "Get Discord Messages",
      subtitle: "discord: getAll",
      n8nType: "n8n-nodes-base.discord",
      kind: "action",
      brand: "discord",
      x: 375,
      y: 205,
      detail: "Fetches the latest 10 messages from AutoBot #intake channel via Discord Bot API.",
      configPreview: "Guild: AutoBot · Channel: #intake · Limit: 10",
    },
    {
      id: "dedupe-messages-node-001",
      name: "Dedupe Messages",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 600,
      y: 205,
      detail: "Tracks staticData.lastMessageId with BigInt comparison and filters out bot messages.",
      configPreview: "const lastId = $getWorkflowStaticData('global').lastMessageId;",
    },
    {
      id: "discord-webhook-trigger-001",
      name: "Discord Webhook Intake",
      subtitle: "POST /discord-intake",
      n8nType: "n8n-nodes-base.webhook",
      kind: "trigger",
      brand: "webhook",
      x: 375,
      y: 410,
      detail: "Real-time HTTP POST webhook receiving Discord intake events from the companion bot.",
      configPreview: "HTTP Method: POST · Path: /discord-intake",
    },
    {
      id: "intake-classifier-node",
      name: "Intake & Type Classifier",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 825,
      y: 305,
      detail: "Extracts URLs and image attachments, then classifies incoming content as url, image, or text.",
      configPreview: "inputType = targetUrl ? 'url' : (directImageUrl ? 'image' : 'text');",
    },
    {
      id: "if-has-url-node",
      name: "If Has URL?",
      subtitle: "boolean equals true",
      n8nType: "n8n-nodes-base.if",
      kind: "if",
      brand: "if",
      x: 1055,
      y: 305,
      detail: "Branches to the Python universal scraper when hasUrl is true, or skips straight to data guard.",
      configPreview: "{{ $json.hasUrl }} === true",
    },
    {
      id: "execute-universal-scraper-node",
      name: "Execute Universal Scraper",
      subtitle: "executeCommand",
      n8nType: "n8n-nodes-base.executeCommand",
      kind: "action",
      brand: "terminal",
      x: 1295,
      y: 195,
      detail: "Runs universal_scraper.py to extract page titles, captions, transcripts, comments, and images.",
      configPreview: "python3 /usr/local/bin/universal_scraper.py '{{ $json.targetUrl }}'",
    },
    {
      id: "parse-data-guard-node",
      name: "Parse & Data Guard",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 1530,
      y: 305,
      detail: "Parses scraper JSON stdout, merges intake metadata, and evaluates content entropy (<25 chars check).",
      configPreview: "isInsufficientData = inputType === 'url' && !scraped.hasContent && totalLength < 25",
    },
    {
      id: "if-insufficient-data-node",
      name: "If Insufficient Data?",
      subtitle: "boolean equals true",
      n8nType: "n8n-nodes-base.if",
      kind: "if",
      brand: "if",
      x: 1765,
      y: 305,
      detail: "Routes blocked/login-walled links to a safe fallback notice; sends valid payloads to Stage 1 AI.",
      configPreview: "{{ $json.isInsufficientData }} === true",
    },
    {
      id: "format-fallback-card-node",
      name: "Format Fallback Card",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 2025,
      y: 170,
      detail: "Builds a gray #others fallback embed and updates the intake reaction via discord-bot:3000.",
      configPreview: "targetChannelId: '1538704806900797450' (#others)",
    },
    {
      id: "gemini-stage1-chain-node",
      name: "Stage 1: Gemini 3.6 Flash (Perception)",
      subtitle: "Basic LLM Chain",
      n8nType: "@n8n/n8n-nodes-langchain.chainLlm",
      kind: "aiChain",
      brand: "ai",
      x: 2025,
      y: 365,
      detail: "Multimodal perception agent extracting structured facts, recipes, workouts, repos, and taxonomy.",
      configPreview: "Taxonomy: project | recipe | workout | anime | media | others",
    },
    {
      id: "gemini-36-flash-model-node",
      name: "Gemini 3.6 Flash",
      subtitle: "Chat Model",
      n8nType: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      kind: "aiSubnode",
      brand: "ai",
      x: 2025,
      y: 525,
      detail: "Sub-node supplying low-temperature (0.1) Gemini 3.6 Flash completions to Stage 1 Chain.",
      configPreview: "model: gemini-3.6-flash · temperature: 0.1",
    },
    {
      id: "parse-stage1-dossier-node",
      name: "Parse Stage 1 Dossier",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 2295,
      y: 365,
      detail: "Strips reasoning tags/fences, parses Stage 1 JSON, and extracts verified GitHub URLs.",
      configPreview: "stage1Dossier = JSON.parse(cleanOutput(rawText));",
    },
    {
      id: "claude-stage2-chain-node",
      name: "Stage 2: Claude Sonnet 5 (Chief Editor)",
      subtitle: "Basic LLM Chain",
      n8nType: "@n8n/n8n-nodes-langchain.chainLlm",
      kind: "aiChain",
      brand: "ai",
      x: 2565,
      y: 365,
      detail: "Chief editor agent curating persona-tailored, <150-word high-signal Discord embed JSON.",
      configPreview: "Personas: Chef, Staff Engineer, Coach, Cinephile, Otaku, Analyst",
    },
    {
      id: "claude-sonnet-5-model-node",
      name: "Claude Sonnet 5",
      subtitle: "Chat Model",
      n8nType: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      kind: "aiSubnode",
      brand: "ai",
      x: 2565,
      y: 525,
      detail: "Sub-node supplying Claude Sonnet 5 (temperature 0.2) editorial completions to Stage 2 Chain.",
      configPreview: "model: claude-sonnet-5 · temperature: 0.2",
    },
    {
      id: "sanitizer-validator-node",
      name: "Sanitizer & Schema Validator",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 2810,
      y: 365,
      detail: "Enforces confidence >= 0.70, normalizes GitHub links, verifies IMDb URLs, and maps channel IDs.",
      configPreview: "CATEGORY_MAP[category].channelId + IMDb API lookup",
    },
    {
      id: "unified-card-formatter",
      name: "Unified Card Formatter & Dispatcher",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 2985,
      y: 365,
      detail: "Renders dedicated recipe or standard embed layouts and flips the Discord reaction from ⏳ to ✅.",
      configPreview: "Formats Markdown embed + http://discord-bot:3000/update-reaction",
    },
    {
      id: "unified-discord-post",
      name: "Create Dynamic Discord Post",
      subtitle: "discord: send",
      n8nType: "n8n-nodes-base.discord",
      kind: "action",
      brand: "discord",
      x: 3115,
      y: 255,
      detail: "Dispatches the color-coded embed card dynamically into the routed Discord channel.",
      configPreview: "channelId: {{ $json.targetChannelId }}",
    },

    // Error Flow
    {
      id: "error-trigger-node-001",
      name: "Error Trigger",
      subtitle: "On Workflow Error",
      n8nType: "n8n-nodes-base.errorTrigger",
      kind: "trigger",
      brand: "error",
      x: 165,
      y: 765,
      detail: "Captures uncaught runtime failures across any node in the router pipeline.",
      configPreview: "Executes on error with failed node & stack trace",
    },
    {
      id: "format-error-node-001",
      name: "Format Error Alert",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 455,
      y: 765,
      detail: "Formats execution ID, failing node name, error message, and trimmed stack trace.",
      configPreview: "Failed Node + Execution ID + 500-char stack snippet",
    },
    {
      id: "create-error-post-node-001",
      name: "Send Error to Discord",
      subtitle: "discord: #error-log",
      n8nType: "n8n-nodes-base.discord",
      kind: "action",
      brand: "discord",
      x: 745,
      y: 765,
      detail: "Posts formatted failure alerts directly to AutoBot #error-log for triage.",
      configPreview: "Guild: AutoBot · Channel: #error-log",
    },

    // Daily Digest Flow
    {
      id: "daily-digest-schedule-trigger",
      name: "Daily 11 PM IST Trigger",
      subtitle: "Cron 30 17 * * *",
      n8nType: "n8n-nodes-base.scheduleTrigger",
      kind: "trigger",
      brand: "schedule",
      x: 1025,
      y: 765,
      detail: "Scheduled trigger running daily at 17:30 UTC (11:00 PM IST).",
      configPreview: "Cron Expression: 30 17 * * *",
    },
    {
      id: "generate-daily-digest-cmd",
      name: "Generate Daily Digest",
      subtitle: "executeCommand",
      n8nType: "n8n-nodes-base.executeCommand",
      kind: "action",
      brand: "terminal",
      x: 1315,
      y: 765,
      detail: "Executes generate_daily_digest.py to aggregate the day's curated items.",
      configPreview: "python3 /usr/local/bin/generate_daily_digest.py",
    },
    {
      id: "parse-daily-digest-code",
      name: "Parse Daily Digest",
      subtitle: "Code (JS)",
      n8nType: "n8n-nodes-base.code",
      kind: "action",
      brand: "code",
      x: 1605,
      y: 765,
      detail: "Parses digest markdown, total item count, and report date with stdout fallback.",
      configPreview: "JSON.parse(stdout) -> digestMarkdown, totalCount, date",
    },
    {
      id: "post-daily-digest-general-node",
      name: "Post Digest to #general",
      subtitle: "discord: #general",
      n8nType: "n8n-nodes-base.discord",
      kind: "action",
      brand: "discord",
      x: 1895,
      y: 765,
      detail: "Publishes the daily summary digest markdown into #general.",
      configPreview: "Guild: AutoBot · Channel: #general",
    },
  ],
  connections: [
    { from: "manual-trigger-node-001", to: "get-discord-messages-node-001" },
    { from: "get-discord-messages-node-001", to: "dedupe-messages-node-001" },
    { from: "dedupe-messages-node-001", to: "intake-classifier-node" },
    { from: "discord-webhook-trigger-001", to: "intake-classifier-node" },
    { from: "intake-classifier-node", to: "if-has-url-node" },
    {
      from: "if-has-url-node",
      to: "execute-universal-scraper-node",
      sourceHandle: "true",
    },
    {
      from: "if-has-url-node",
      to: "parse-data-guard-node",
      sourceHandle: "false",
    },
    { from: "execute-universal-scraper-node", to: "parse-data-guard-node" },
    { from: "parse-data-guard-node", to: "if-insufficient-data-node" },
    {
      from: "if-insufficient-data-node",
      to: "format-fallback-card-node",
      sourceHandle: "true",
    },
    {
      from: "if-insufficient-data-node",
      to: "gemini-stage1-chain-node",
      sourceHandle: "false",
    },
    { from: "format-fallback-card-node", to: "unified-discord-post" },
    {
      from: "gemini-36-flash-model-node",
      to: "gemini-stage1-chain-node",
      targetHandle: "ai_languageModel",
    },
    { from: "gemini-stage1-chain-node", to: "parse-stage1-dossier-node" },
    { from: "parse-stage1-dossier-node", to: "claude-stage2-chain-node" },
    {
      from: "claude-sonnet-5-model-node",
      to: "claude-stage2-chain-node",
      targetHandle: "ai_languageModel",
    },
    { from: "claude-stage2-chain-node", to: "sanitizer-validator-node" },
    { from: "sanitizer-validator-node", to: "unified-card-formatter" },
    { from: "unified-card-formatter", to: "unified-discord-post" },
    // Error flow
    { from: "error-trigger-node-001", to: "format-error-node-001" },
    { from: "format-error-node-001", to: "create-error-post-node-001" },
    // Daily Digest flow
    { from: "daily-digest-schedule-trigger", to: "generate-daily-digest-cmd" },
    { from: "generate-daily-digest-cmd", to: "parse-daily-digest-code" },
    { from: "parse-daily-digest-code", to: "post-daily-digest-general-node" },
  ],
  scenarios: [
    {
      id: "url-ai-full",
      label: "Webhook + AI",
      steps: [
        ["discord-webhook-trigger-001"],
        ["intake-classifier-node"],
        ["if-has-url-node"],
        ["execute-universal-scraper-node"],
        ["parse-data-guard-node"],
        ["if-insufficient-data-node"],
        ["gemini-36-flash-model-node", "gemini-stage1-chain-node"],
        ["parse-stage1-dossier-node"],
        ["claude-sonnet-5-model-node", "claude-stage2-chain-node"],
        ["sanitizer-validator-node"],
        ["unified-card-formatter"],
        ["unified-discord-post"],
      ],
    },
    {
      id: "manual-text",
      label: "Manual Poll",
      steps: [
        ["manual-trigger-node-001"],
        ["get-discord-messages-node-001"],
        ["dedupe-messages-node-001"],
        ["intake-classifier-node"],
        ["if-has-url-node"],
        ["parse-data-guard-node"],
        ["if-insufficient-data-node"],
        ["gemini-36-flash-model-node", "gemini-stage1-chain-node"],
        ["parse-stage1-dossier-node"],
        ["claude-sonnet-5-model-node", "claude-stage2-chain-node"],
        ["sanitizer-validator-node"],
        ["unified-card-formatter"],
        ["unified-discord-post"],
      ],
    },
    {
      id: "fallback",
      label: "Fallback",
      steps: [
        ["discord-webhook-trigger-001"],
        ["intake-classifier-node"],
        ["if-has-url-node"],
        ["execute-universal-scraper-node"],
        ["parse-data-guard-node"],
        ["if-insufficient-data-node"],
        ["format-fallback-card-node"],
        ["unified-discord-post"],
      ],
    },
    {
      id: "daily-digest",
      label: "Daily Digest",
      steps: [
        ["daily-digest-schedule-trigger"],
        ["generate-daily-digest-cmd"],
        ["parse-daily-digest-code"],
        ["post-daily-digest-general-node"],
      ],
    },
    {
      id: "error-alert",
      label: "Error Alert",
      steps: [
        ["error-trigger-node-001"],
        ["format-error-node-001"],
        ["create-error-post-node-001"],
      ],
    },
  ],
};
