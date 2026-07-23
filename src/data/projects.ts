export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  type: "flutter-web" | "video";
  videoUrl?: string;
  tags: string[];
  features: string[];
  caseStudy: {
    problem: string;
    solution: string;
    architecture: string;
    impact: string;
  };
}

export const PROJECTS: Project[] = [
  {
    id: "dailytask",
    title: "DailyTask",
    tagline: "Intelligent Productivity & Workflow Manager",
    description:
      "Actual compiled Flutter Web application running from the official GitHub repository. Features gesture-driven interaction, intelligent task batching, and local-first persistence.",
    githubUrl: "https://github.com/mohd-shariq-osmani/DailyTask",
    demoUrl: "/apps/dailytask/index.html",
    type: "flutter-web",
    tags: ["Flutter Web", "Dart", "Clean Architecture", "Local-First", "BLoC Pattern"],
    features: [
      "Sub-millisecond local storage synchronization",
      "Gesture-driven task prioritization UI",
      "Dark mode native UI architecture",
      "Cross-platform state persistence",
    ],
    caseStudy: {
      problem: "Traditional task apps suffer from bloated sync latency and complicated interfaces.",
      solution: "Engineered a streamlined, local-first reactive Flutter application with instant feedback loops.",
      architecture: "BLoC pattern layered over Hive key-value persistent storage.",
      impact: "Zero sync delay, sub-60fps rendering across mobile and web targets.",
    },
  },
  {
    id: "vault",
    title: "Vault",
    tagline: "Zero-Knowledge Personal Secrets & Security Manager",
    description:
      "Actual compiled Flutter Web application running from the official GitHub repository. High-security mobile vault engineered with client-side AES-256 encryption.",
    githubUrl: "https://github.com/mohd-shariq-osmani/Vault",
    demoUrl: "/apps/vault/index.html",
    type: "flutter-web",
    tags: ["Flutter Web", "Cryptography", "AES-256", "Biometrics", "Security"],
    features: [
      "Client-side AES-GCM 256-bit encryption",
      "Biometric hardware security module integration",
      "Zero telemetry & zero network transmission",
      "Encrypted backup export & master keys",
    ],
    caseStudy: {
      problem: "Cloud password managers expose sensitive credentials to third-party server risks.",
      solution: "Built a zero-trust local vault where decryption keys never leave hardware enclaves.",
      architecture: "Flutter cryptographic isolates with native Keychain / KeyStore bindings.",
      impact: "Military-grade credential protection with zero cloud exposure.",
    },
  },
  {
    id: "n8n-companion",
    title: "n8n Companion",
    tagline: "Mobile Workflow Monitoring & Operations Dashboard",
    description:
      "Actual compiled Flutter Web application running from the official GitHub repository. Dedicated mobile client for self-hosted n8n instances.",
    githubUrl: "https://github.com/mohd-shariq-osmani/n8n-companion",
    demoUrl: "/apps/n8n-companion/index.html",
    type: "flutter-web",
    tags: ["Flutter Web", "n8n API", "REST / WebSocket", "DevOps", "Automation"],
    features: [
      "Real-time execution status polling & webhooks",
      "One-tap manual workflow triggering",
      "Node execution error log viewer",
      "Multi-instance server management",
    ],
    caseStudy: {
      problem: "n8n automation engineers lack a native, high-speed mobile dashboard for on-the-go workflow ops.",
      solution: "Developed an optimized mobile client tapping into n8n REST API endpoints.",
      architecture: "Reactive Provider pattern with encrypted API key storage.",
      impact: "Instant notification & triage for failed automation workflows.",
    },
  },
  {
    id: "relay",
    title: "Relay",
    tagline: "Real-Time Event Streaming & Webhook Dispatcher",
    description:
      "An automated event bridge and payload processing system connecting distributed microservices, webhooks, and AI pipelines seamlessly.",
    githubUrl: "https://github.com/mohd-shariq-osmani/Relay",
    type: "video",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-code-running-on-a-computer-screen-23580-large.mp4",
    tags: ["Node.js", "Webhooks", "Event-Driven", "AI Pipelines", "System Architecture"],
    features: [
      "High-throughput webhook queueing & retries",
      "Dynamic payload transformation engine",
      "Monochrome live traffic visualizer",
      "Integrated error dead-letter queue",
    ],
    caseStudy: {
      problem: "Unreliable third-party webhooks drop critical events during traffic bursts.",
      solution: "Created an event buffer and queue dispatcher with automatic exponential backoff retries.",
      architecture: "Event-driven asynchronous message router.",
      impact: "99.99% event delivery reliability across microservice integrations.",
    },
  },
];
