export interface TechCategory {
  category: string;
  skills: {
    name: string;
    level: string;
    description: string;
  }[];
}

export const TECH_STACK: TechCategory[] = [
  {
    category: "Workflow Automation & AI Systems",
    skills: [
      {
        name: "n8n Workflow Orchestration",
        level: "Advanced",
        description: "Designing multi-node automation pipelines, webhook handlers, and AI agent chains.",
      },
      {
        name: "Power Automate & Zoho Flows",
        level: "Advanced",
        description: "Connecting business applications through cloud flows, scheduled triggers, and automated event actions.",
      },
      {
        name: "Webhooks & Event Triggers",
        level: "Advanced",
        description: "Configuring asynchronous HTTP webhook endpoints, payload parsers, and event dispatchers.",
      },
      {
        name: "AI & LLM Integration",
        level: "Advanced",
        description: "Integrating language models via structured outputs, function calling, and contextual prompt design.",
      },
    ],
  },
  {
    category: "Robotic Process Automation (RPA)",
    skills: [
      {
        name: "UiPath & Blue Prism",
        level: "Advanced",
        description: "Developing automated desktop and web processes, selectors, and background queue workers.",
      },
      {
        name: "Process Debugging & Analysis",
        level: "Advanced",
        description: "Root-cause fault isolation, runtime variable inspection, and exception recovery logic.",
      },
      {
        name: "Production Monitoring",
        level: "Advanced",
        description: "Active process surveillance, automated error logging, and execution audit reporting.",
      },
      {
        name: "Test Automation & QA",
        level: "Advanced",
        description: "Automated regression testing, edge case scenario validation, and quality verification.",
      },
    ],
  },
  {
    category: "Full Stack & Web Architecture",
    skills: [
      {
        name: "Node.js & Backend Services",
        level: "Advanced",
        description: "Developing RESTful APIs, asynchronous services, and modular server-side logic.",
      },
      {
        name: "Custom CRM & Systems Integration",
        level: "Advanced",
        description: "Building tailored CRM platforms, third-party API bridges, and customer data pipelines.",
      },
      {
        name: "Next.js & React",
        level: "Advanced",
        description: "Building responsive, component-driven user interfaces with App Router and server-rendered pages.",
      },
      {
        name: "TypeScript",
        level: "Advanced",
        description: "Enforcing type safety, structured domain models, and maintainable application codebases.",
      },
    ],
  },
  {
    category: "Mobile & Systems Engineering",
    skills: [
      {
        name: "Flutter & Dart",
        level: "Advanced",
        description: "Cross-platform mobile development using Provider and Riverpod state management patterns.",
      },
      {
        name: "Offline Storage & Persistence",
        level: "Advanced",
        description: "Local data modeling using SQLite (sqflite) and platform-level preference stores.",
      },
      {
        name: "Local Security & Biometrics",
        level: "Advanced",
        description: "Client-side AES-256-GCM encryption, biometric authentication, and Keychain/Keystore integration.",
      },
      {
        name: "Git & CI/CD Automation",
        level: "Advanced",
        description: "Automated GitHub Actions build checks, branch lifecycle management, and release staging.",
      },
    ],
  },
];
