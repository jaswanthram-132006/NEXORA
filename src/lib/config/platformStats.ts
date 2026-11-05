export interface PlatformStat {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

export const platformStats = {
  topicsCount: "18",
  interactiveVisualizers: "18+",
  liveSimulations: "6 Planned (2 Active)",
  challengesCount: "12+",
  tracksCount: "3",

  // StatsBar display metrics
  overviewMetrics: [
    { label: "Curriculum Topics", value: "18 Topics", icon: "📚", description: "Structured DAA, POAI & Advanced modules" },
    { label: "Interactive Visualizers", value: "18 Engines", icon: "🎬", description: "Dynamic state machines with step execution" },
    { label: "Full Simulation Labs", value: "6 Engines", icon: "🧪", description: "Deep-dive algorithm testbeds" },
    { label: "Coding Challenges", value: "12 Problems", icon: "🏆", description: "In-browser executable test-driven practice" },
  ],

  // Hero section trust signals
  heroSignals: [
    { label: "Curated Modules", value: "18" },
    { label: "Algorithm Engines", value: "18+" },
    { label: "Execution Standard", value: "100% Real" },
  ]
};
