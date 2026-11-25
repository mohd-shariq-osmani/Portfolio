export interface TechCategory {
  category: string;
  summary: string;
  skills: string[];
}

export const TECH_STACK: TechCategory[] = [
  {
    category: "Automation & AI",
    summary: "Multi-agent pipelines, webhooks, and LLM workflows.",
    skills: [
      "n8n Orchestration",
      "Power Automate",
      "Zoho Flows",
      "LLM Function Calling",
    ],
  },
  {
    category: "RPA & QA",
    summary: "Enterprise bot engineering, monitoring, and testing.",
    skills: [
      "UiPath",
      "Blue Prism",
      "Exception Recovery",
      "Test Automation",
    ],
  },
  {
    category: "Full Stack & Web",
    summary: "Type-safe interfaces, REST services, and custom CRMs.",
    skills: [
      "Next.js & React",
      "TypeScript",
      "Node.js",
      "Custom CRMs & APIs",
    ],
  },
  {
    category: "Mobile & Systems",
    summary: "Offline-first Flutter apps with local encryption.",
    skills: [
      "Flutter & Dart",
      "SQLite / Riverpod",
      "AES-256 & Biometrics",
      "GitHub Actions CI",
    ],
  },
];
