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
    tagline: "Offline-First Daily Routine & Habit Analytics",
    description:
      "A distraction-free habit analytics and routine management application built with Flutter. Designed for daily consistency with automated midnight resets, interactive home screen widgets, and detailed completion analytics.",
    githubUrl: "https://github.com/mohd-shariq-osmani/DailyTask",
    demoUrl: "/apps/dailytask/index.html",
    type: "flutter-web",
    tags: ["Flutter", "Dart", "Provider", "SQLite", "WidgetKit", "AppWidgets"],
    features: [
      "Offline persistence with SQLite (sqflite) and automatic date backfilling",
      "Interactive iOS (WidgetKit) and Android (AppWidgets) home screen widgets",
      "13-week consistency heatmap and progress trend charts via CustomPainter",
      "Daily routine cockpit with auto-reset, task reordering, and streak tracking",
    ],
    caseStudy: {
      problem:
        "Many habit trackers require continuous cloud connectivity, introduce interface bloat, and lack quick home screen interactions for fast logging.",
      solution:
        "Developed a lightweight, offline-first application combining structured SQLite storage with native home screen widget integration.",
      architecture:
        "Provider pattern (ChangeNotifier) with SQLite local storage and native IPC bridges (Darwin Notifications on iOS, Broadcast Receivers on Android).",
      impact:
        "Ensures complete offline availability, eliminates network synchronization delays, and provides instant widget-based interaction.",
    },
  },
  {
    id: "vault",
    title: "Vault",
    tagline: "Encrypted Local Document & Identity Vault",
    description:
      "A local document security application built with Flutter. Protects sensitive documents, identity cards, and credentials on-device using AES-256-GCM encryption, biometric authentication, and on-device OCR.",
    githubUrl: "https://github.com/mohd-shariq-osmani/Vault",
    demoUrl: "/apps/vault/index.html",
    type: "flutter-web",
    tags: ["Flutter", "Riverpod", "AES-256-GCM", "Biometrics", "Google ML Kit", "Offline-First"],
    features: [
      "AES-256-GCM local encryption for document metadata and attachments",
      "Hardware-backed key management via Android Keystore and iOS Keychain",
      "Biometric access control with fingerprint and Face ID authentication",
      "On-device OCR and form autofill using Google ML Kit text recognition",
    ],
    caseStudy: {
      problem:
        "Storing identity cards and sensitive documents in third-party cloud services introduces data breach and privacy risks.",
      solution:
        "Engineered an offline-first mobile vault that encrypts all files and records on-device without external network permissions.",
      architecture:
        "Riverpod state management paired with the encrypt package (AES-256-GCM), flutter_secure_storage, and local ML Kit processing.",
      impact:
        "Provides verifiable data privacy with zero cloud transmission, local biometric gating, and efficient on-device document extraction.",
    },
  },
  {
    id: "n8n-companion",
    title: "n8n Companion",
    tagline: "Mobile Workflow Monitoring & Operations Dashboard",
    description:
      "A dedicated Flutter companion app for monitoring and managing self-hosted n8n automation instances. Provides quick access to workflow statuses, execution history logs, and manual test triggers directly from mobile.",
    githubUrl: "https://github.com/mohd-shariq-osmani/n8n-companion",
    demoUrl: "/apps/n8n-companion/index.html",
    type: "flutter-web",
    tags: ["Flutter", "Dart", "Provider", "n8n REST API", "Workflow Automation"],
    features: [
      "Dashboard overview of active and inactive workflows with execution status metrics",
      "Workflow activation toggles and execution detail inspection",
      "Manual test execution triggering directly from the mobile interface",
      "Session authentication with secure local credential caching",
    ],
    caseStudy: {
      problem:
        "Monitoring and diagnosing self-hosted n8n workflows typically requires access to a desktop browser, slowing down on-call triage.",
      solution:
        "Built a responsive mobile dashboard that communicates directly with n8n REST endpoints to provide real-time status and control.",
      architecture:
        "Provider state management consuming n8n REST APIs via HTTP, with session-based authentication and secure local preferences.",
      impact:
        "Enables automation engineers to quickly verify execution logs and trigger workflow tests without needing a desktop workstation.",
    },
  },
  {
    id: "relay",
    title: "Relay",
    tagline: "Mobile Remote Desktop Input & Peripheral Controller",
    description:
      "A cross-platform input controller system that turns mobile devices into a low-latency virtual trackpad, keyboard, and clipboard synchronization tool for desktop computers (macOS and Windows) over local Wi-Fi.",
    githubUrl: "https://github.com/mohd-shariq-osmani/Relay",
    demoUrl: undefined,
    type: "video",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-code-running-on-a-computer-screen-23580-large.mp4",
    tags: ["Flutter", "Python", "WebSockets", "asyncio", "mDNS / Zeroconf", "Cross-Platform"],
    features: [
      "Virtual trackpad with smooth cursor movement, tap-to-click, and two-finger scroll",
      "Remote keyboard input with real-time text transmission and modifier key support",
      "Automatic local network discovery via mDNS / Zeroconf with secure PIN pairing",
      "Bi-directional clipboard synchronization and desktop power controls (sleep and lock)",
    ],
    caseStudy: {
      problem:
        "Controlling desktop media, presentations, or input devices remotely often requires specialized hardware or cloud-dependent apps that introduce latency and security concerns.",
      solution:
        "Designed a local-first client-server system communicating directly over local Wi-Fi via WebSockets with zero cloud dependencies.",
      architecture:
        "Python 3.11 asyncio desktop server handling OS-level inputs, paired with a Flutter client utilizing mDNS discovery and persistent WebSocket channels.",
      impact:
        "Delivers responsive, low-latency desktop control completely within the local network with automated pairing and zero telemetry.",
    },
  },
];
