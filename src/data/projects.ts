export interface ProjectRoute {
  id: string;
  label: string;
  path: string;
  summary: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  type: "flutter-web" | "video" | "web-app";
  formFactor?: "mobile" | "desktop";
  videoUrl?: string;
  routes?: ProjectRoute[];
  highlights?: { label: string; value: string }[];
  tags: string[];
  features: string[];
  caseStudy: {
    problem: string;
    solution: string;
    architecture: string;
    impact: string;
  };
}

export const ORBIT_PROJECT: Project = {
  id: "orbit",
  title: "Orbit",
  tagline: "Full-Stack AI CRM Workspace",
  description:
    "Zero-signup interactive CRM with drag-and-drop deals, lead scoring, role switching, and tool-calling Orbit AI.",
  githubUrl: "https://github.com/mohd-shariq-osmani/Orbit",
  demoUrl: "https://orbit.shariqosmani.xyz",
  type: "web-app",
  formFactor: "desktop",
  highlights: [
    { label: "Seeded Data", value: "56 Contacts · 36 Deals" },
    { label: "Timeline", value: "165+ Activities" },
    { label: "Access Control", value: "4 Live RBAC Roles" },
    { label: "Orbit AI", value: "Tool Calling + Citations" },
  ],
  routes: [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      summary: "KPI overview, pipeline analytics, and rep leaderboard.",
    },
    {
      id: "deals",
      label: "Deals Kanban",
      path: "/deals",
      summary: "Drag-and-drop pipeline stages with multi-currency totals.",
    },
    {
      id: "assistant",
      label: "Orbit AI",
      path: "/assistant",
      summary: "Streaming CRM assistant with clickable record citations.",
    },
    {
      id: "leads",
      label: "Lead Scoring",
      path: "/leads",
      summary: "0–100 score breakdown and 1-click deal conversion.",
    },
    {
      id: "contacts",
      label: "Contacts 360°",
      path: "/contacts",
      summary: "Filterable contact directory, CSV tools, and AI summaries.",
    },
  ],
  tags: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "TanStack Query",
    "dnd-kit",
    "Recharts",
    "MSW + Dexie",
    "Orbit AI",
  ],
  features: [
    "Live RBAC role switcher (Admin, Manager, Rep, Viewer)",
    "Local IndexedDB + MSW REST persistence with 1-click reset",
    "Streaming /api/ai/* assistant with tool calls & citations",
    "Kanban pipeline, Recharts analytics & ⌘K command palette",
  ],
  caseStudy: {
    problem:
      "Showcasing a real CRM usually hides behind login walls or static screenshots.",
    solution:
      "Paired MSW v3 + IndexedDB local persistence with server-side AI routes.",
    architecture:
      "Next.js 16 + TanStack Query over MSW/Dexie and /api/ai/* handlers.",
    impact:
      "Test full CRM workflows, switch roles, and query Orbit AI with zero signup.",
  },
};

export const PROJECTS: Project[] = [
  {
    id: "vault",
    title: "Vault",
    tagline: "Encrypted Local Document & Identity Vault",
    description:
      "Offline-first Flutter vault securing identity cards and documents on-device with AES-256-GCM encryption, biometrics, and local OCR.",
    githubUrl: "https://github.com/mohd-shariq-osmani/Vault",
    demoUrl: "/apps/vault/index.html",
    type: "flutter-web",
    formFactor: "mobile",
    tags: ["Flutter", "Riverpod", "AES-256-GCM", "Biometrics", "Google ML Kit"],
    features: [
      "AES-256-GCM on-device document encryption",
      "Hardware key storage (Keychain & Keystore)",
      "Fingerprint & Face ID lock gate",
      "On-device OCR autofill via ML Kit",
    ],
    caseStudy: {
      problem:
        "Cloud storage exposes sensitive IDs to breach and network risk.",
      solution:
        "Zero-network local vault encrypting records and scans on-device.",
      architecture:
        "Riverpod + AES-256-GCM encryption, secure key storage, and local ML Kit.",
      impact:
        "Zero cloud transmission with instant biometric access and offline security.",
    },
  },
];

export const BUILD_LAB_PROJECTS: Project[] = [ORBIT_PROJECT, ...PROJECTS];
