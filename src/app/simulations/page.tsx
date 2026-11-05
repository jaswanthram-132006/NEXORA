import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, FlaskConical, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Algorithm Simulations",
  description:
    "Experience sorting algorithms and graph traversals in real time with step-by-step interactive controls.",
};

const simulations = [
  {
    slug: "sorting",
    title: "Sorting Visualizer",
    description:
      "Bubble, Merge, Quick, and Heap sort with speed control, step-by-step execution, and live comparison counters.",
    tags: ["Sorting", "Interactive", "Step-by-step"],
    status: "ready",
    color: "violet",
  },
  {
    slug: "graph-traversal",
    title: "Graph Traversal Engine",
    description:
      "Breadth-First and Depth-First search with live frontier queue visualization, node state tracking, and traversal trees.",
    tags: ["Graphs", "BFS", "DFS", "Queue"],
    status: "ready",
    color: "cyan",
  },
  {
    slug: "shortest-path",
    title: "Shortest Path (Dijkstra & A*)",
    description:
      "Weighted graph shortest path discovery with priority queue tracking and Manhattan heuristic calculation.",
    tags: ["Dijkstra", "A*", "Priority Queue"],
    status: "ready",
    color: "emerald",
  },
  {
    slug: "dp-matrix",
    title: "DP Matrix Chain & LCS",
    description:
      "Interactive 2D table fill order, back-pointer reconstruction, and subproblem dependency dag visualization.",
    tags: ["DP", "Tableau", "Optimal Substructure"],
    status: "ready",
    color: "violet",
  },
  {
    slug: "neural-network",
    title: "Neural Network Forward/Backward",
    description:
      "Interactive 3-layer neural network with weight sliders, live forward activation values, and backward gradient backpropagation.",
    tags: ["Neural Networks", "Calculus", "Gradients"],
    status: "ready",
    color: "cyan",
  },
  {
    slug: "csp-solver",
    title: "Constraint Satisfaction (AC-3)",
    description:
      "Step through the AC-3 algorithm on map coloring and constraint satisfaction. Watch arc consistency domain reduction in real time.",
    tags: ["CSP", "AC-3", "Backtracking"],
    status: "ready",
    color: "emerald",
  },
  {
    slug: "minimax",
    title: "Minimax & Alpha-Beta Pruning",
    description:
      "Adversarial zero-sum game tree engine with dynamic [α, β] bounds, subtree cutoff scissors, and optimal move decisions.",
    tags: ["Minimax", "Alpha-Beta", "Game Theory", "Adversarial Search"],
    status: "ready",
    color: "violet",
  },
];

const colorConfig: Record<string, { border: string; icon: string; glow: string }> = {
  violet: {
    border: "dark:hover:border-[#0A84FF]/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    icon: "dark:text-[#0A84FF] dark:bg-[#0A84FF]/10 dark:border-[#0A84FF]/25 text-[#FF7A00] bg-[rgba(255,122,0,0.08)] border-[#FF7A00]/30",
    glow: "dark:from-[#0A84FF]/12 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  cyan: {
    border: "dark:hover:border-cyan-400/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    icon: "dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/25 text-[#EA580C] bg-[rgba(255,122,0,0.08)] border-[#FF7A00]/30",
    glow: "dark:from-[#00D2FF]/12 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  emerald: {
    border: "dark:hover:border-emerald-400/40 hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]",
    icon: "dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/25 text-emerald-600 bg-emerald-50 border-emerald-200",
    glow: "dark:from-emerald-500/12 from-emerald-500/5 to-transparent",
  },
};

export default function SimulationsPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[#0A84FF]/[0.08] rounded-full blur-[150px]" />
          <div className="absolute top-1/3 left-10 w-[550px] h-[500px] bg-[#00D2FF]/[0.06] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[150px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          <div className="mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-blue-300 text-[#FF7A00] uppercase tracking-widest backdrop-blur-md mb-5 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-pulse" />
              Interactive Lab
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-5">
              Watch algorithms{" "}
              <span className="gradient-text-electric">run live</span>
            </h1>
            <p className="dark:text-slate-400 text-[#737373] max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
              Every active simulation runs the actual, executable algorithm state machine — no
              fake animations or pre-recorded clips. Control clock speeds, build custom inputs,
              and step through every decision boundary.
            </p>

            {/* Status Info */}
            <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl dark:bg-emerald-500/[0.04] bg-emerald-50/70 border dark:border-emerald-500/20 border-emerald-200 backdrop-blur-md max-w-2xl shadow-sm">
              <FlaskConical className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm dark:text-emerald-200/90 text-emerald-800 leading-relaxed font-sans">
                All <strong className="dark:text-emerald-300 text-emerald-900 font-semibold">6 Laboratory Simulations</strong> are fully operational with step-by-step state machine execution, interactive parameters, and live algorithmic telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {simulations.map((sim) => {
              const c = colorConfig[sim.color];
              const isReady = sim.status === "ready";

              const CardContent = (
                <div
                  className={`group card-base p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden h-full dark:border-white/10 border-[#E5E5E5] ${
                    isReady
                      ? `card-hover cursor-pointer ${c.border}`
                      : "opacity-65 dark:border-white/[0.06] border-[#E5E5E5] dark:bg-white/[0.01] bg-[#F7F7F7]/60"
                  }`}
                >
                  {isReady && (
                    <div
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />
                  )}

                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md shadow-sm border ${c.icon}`}>
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border backdrop-blur-md ${
                          isReady
                            ? "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                            : "dark:bg-white/[0.04] dark:text-slate-400 dark:border-white/10 bg-gray-100 text-[#737373] border-[#E5E5E5]"
                        }`}
                      >
                        {isReady && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {isReady ? "Live Interactive" : "Coming Soon"}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg mb-2 dark:group-hover:text-blue-200 group-hover:text-[#FF7A00] transition-colors">
                      {sim.title}
                    </h3>
                    <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-4 font-sans">
                      {sim.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t dark:border-white/[0.08] border-[#E5E5E5]">
                    <div className="flex flex-wrap gap-1.5">
                      {sim.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-lg text-xs font-mono border dark:bg-white/[0.03] bg-[#F7F7F7] dark:border-white/[0.06] border-[#E5E5E5] dark:text-slate-300 text-[#737373]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-mono">
                      {isReady ? (
                        <span className="flex items-center gap-1.5 dark:text-[#0A84FF] text-[#FF7A00] font-semibold dark:group-hover:text-cyan-300 group-hover:text-[#EA580C] transition-colors">
                          Launch Simulator <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      ) : (
                        <span className="dark:text-slate-500 text-slate-400">In Development</span>
                      )}
                    </div>
                  </div>
                </div>
              );

              return isReady ? (
                <Link key={sim.slug} href={`/simulations/${sim.slug}`} className="block h-full">
                  {CardContent}
                </Link>
              ) : (
                <div key={sim.slug} className="block h-full">
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
