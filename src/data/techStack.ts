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
    category: "AI & Intelligent Automation",
    skills: [
      { name: "n8n Workflow Automation", level: "Expert", description: "Custom node creation, complex webhooks, autonomous agent loops." },
      { name: "AI Agents & LLM Integration", level: "Advanced", description: "Function calling, RAG pipelines, Gemini API, structured outputs." },
      { name: "Python & Data Processing", level: "Advanced", description: "Asynchronous backend logic, vector embeddings, scraping." },
      { name: "Vector Databases", level: "Proficient", description: "Qdrant, Pinecone, semantic search indexing." },
    ],
  },
  {
    category: "Cross-Platform & Mobile Engineering",
    skills: [
      { name: "Flutter & Dart", level: "Expert", description: "Clean Architecture, BLoC pattern, custom platform channels, Flutter Web." },
      { name: "Native Enclave & Biometrics", level: "Advanced", description: "Keychain/KeyStore integration, AES-256 local security." },
      { name: "Local-First Storage", level: "Expert", description: "Hive, SQLite, sub-millisecond offline sync architecture." },
    ],
  },
  {
    category: "Full Stack & Web Architecture",
    skills: [
      { name: "Next.js & React", level: "Expert", description: "App Router, SSR, Server Actions, performance optimization." },
      { name: "TypeScript", level: "Expert", description: "Strict typing, generics, complex domain modeling." },
      { name: "Tailwind CSS & Motion", level: "Expert", description: "Framer Motion, GSAP ScrollTrigger, Lenis smooth scroll, custom CSS engines." },
      { name: "Node.js & Express", level: "Advanced", description: "REST APIs, WebSocket streaming, asynchronous queues." },
    ],
  },
  {
    category: "Infrastructure & Systems",
    skills: [
      { name: "Docker & Containerization", level: "Advanced", description: "Multi-stage builds, self-hosted service orchestration." },
      { name: "Git & CI/CD", level: "Expert", description: "GitHub Actions, automated test suites, release pipelines." },
      { name: "Linux Systems & CLI", level: "Advanced", description: "Shell scripting, server management, security hardening." },
    ],
  },
];
