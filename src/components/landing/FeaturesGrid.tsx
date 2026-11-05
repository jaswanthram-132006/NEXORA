import React from "react";
import {
  BarChart3,
  Network,
  Brain,
  Code2,
  Layers,
  Zap,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: BarChart3,
    title: "Deterministic Visualizers",
    description:
      "Step through sorting, searching, and tree traversals with real-time comparison counters, index swaps, and complexity tracking.",
    color: "electric",
    size: "large",
  },
  {
    icon: Brain,
    title: "Neural Network Calculus",
    description:
      "Deconstruct feedforward layers, backpropagation gradient calculations, and non-linear activation surface transformations.",
    color: "cyan",
    size: "normal",
  },
  {
    icon: Network,
    title: "State-Space Graph Traversal",
    description:
      "Live FIFO Queue for BFS and LIFO Call Stack for DFS, shortest-path discovery, and edge relaxation.",
    color: "emerald",
    size: "normal",
  },
  {
    icon: Code2,
    title: "Asymptotic Complexity",
    description:
      "Master Theorem recurrences, loop invariants, decision-tree information-theoretic lower bounds, and Omega/Theta notations.",
    color: "electric",
    size: "normal",
  },
  {
    icon: Layers,
    title: "Dynamic Programming",
    description:
      "Memoization, tabulation, optimal substructure, and overlapping subproblem state-space compression.",
    color: "cyan",
    size: "normal",
  },
  {
    icon: FlaskConical,
    title: "Sequential Decision Agents",
    description:
      "Markov Decision Processes, Value Iteration, Bellman Optimality, and constraint satisfaction arc consistency (AC-3).",
    color: "emerald",
    size: "large",
  },
  {
    icon: BookOpen,
    title: "Formal Proof Walkthroughs",
    description:
      "Exchange argument proofs for Greedy, inductive correctness bounds, and polynomial-time reduction gadgets.",
    color: "electric",
    size: "normal",
  },
  {
    icon: Zap,
    title: "Intractable Complexity",
    description:
      "NP-Completeness, PSPACE alternating games, PTAS approximation schemes, and FPT parameterized algorithms.",
    color: "cyan",
    size: "normal",
  },
];

type ColorKey = "electric" | "violet" | "cyan" | "emerald";

const colorConfig: Record<
  ColorKey,
  { iconWrapper: string; iconColor: string; hoverBorder: string; glow: string }
> = {
  electric: {
    iconWrapper:
      "dark:bg-[#0A84FF]/10 dark:border-[#0A84FF]/25 dark:text-blue-300 dark:shadow-[0_0_12px_rgba(10,132,255,0.2)] bg-[rgba(255,122,0,0.08)] border-[#FF7A00]/30 text-[#FF7A00]",
    iconColor: "dark:text-[#0A84FF] text-[#FF7A00]",
    hoverBorder:
      "dark:hover:border-[#0A84FF]/40 hover:border-[#FF7A00]/40 hover:shadow-[0_8px_30px_rgba(255,122,0,0.12)]",
    glow: "dark:from-[#0A84FF]/10 from-[rgba(255,122,0,0.08)] to-transparent",
  },
  violet: {
    iconWrapper:
      "dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300 dark:shadow-[0_0_12px_rgba(139,92,246,0.2)] bg-[rgba(255,122,0,0.08)] border-[#FF7A00]/30 text-[#FF7A00]",
    iconColor: "dark:text-violet-400 text-[#FF7A00]",
    hoverBorder:
      "dark:hover:border-violet-500/40 hover:border-[#FF7A00]/40 hover:shadow-[0_8px_30px_rgba(255,122,0,0.12)]",
    glow: "dark:from-violet-500/10 from-[rgba(255,122,0,0.08)] to-transparent",
  },
  cyan: {
    iconWrapper:
      "dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-300 dark:shadow-[0_0_12px_rgba(6,182,212,0.2)] bg-[rgba(255,122,0,0.08)] border-[#FF7A00]/30 text-[#EA580C]",
    iconColor: "dark:text-cyan-400 text-[#EA580C]",
    hoverBorder:
      "dark:hover:border-cyan-500/40 hover:border-[#FF7A00]/40 hover:shadow-[0_8px_30px_rgba(255,122,0,0.12)]",
    glow: "dark:from-cyan-500/10 from-[rgba(255,122,0,0.08)] to-transparent",
  },
  emerald: {
    iconWrapper:
      "dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)] bg-emerald-50 border-emerald-200 text-emerald-600",
    iconColor: "dark:text-emerald-400 text-emerald-600",
    hoverBorder:
      "dark:hover:border-emerald-500/40 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)]",
    glow: "dark:from-emerald-500/10 from-emerald-500/5 to-transparent",
  },
};

export default function FeaturesGrid() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="section-padding">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#0A84FF]/25 border-[#FF7A00]/25 text-xs font-mono font-medium dark:text-blue-300 text-[#FF7A00] uppercase tracking-widest mb-4 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-pulse" />
            Curriculum Architecture
          </span>
          <h2 className="section-title text-balance dark:text-white text-[#171717]">
            <span>Built for true</span>{" "}
            <span className="gradient-text-electric">conceptual depth</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base dark:text-slate-400 text-[#737373] max-w-2xl mx-auto leading-relaxed font-sans">
            Eliminating black-box hand-waving. Every concept combines formal
            mathematical definitions, executable code, and verifiable simulations.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-fr">
          {features.map((feature) => {
            const c = colorConfig[feature.color as ColorKey];
            const Icon = feature.icon;
            const isLarge = feature.size === "large";

            return (
              <div
                key={feature.title}
                className={cn(
                  "card-base card-hover p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden",
                  c.hoverBorder,
                  isLarge && "lg:col-span-2"
                )}
              >
                {/* Ambient Card Underlay Sheen */}
                <div
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                    c.glow
                  )}
                />

                <div className="relative z-10">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center border mb-5 transition-transform duration-200 group-hover:scale-105 backdrop-blur-md",
                      c.iconWrapper
                    )}
                  >
                    <Icon className={cn("w-5 h-5", c.iconColor)} />
                  </div>
                  <h3 className="font-heading font-bold dark:text-white text-[#171717] text-base sm:text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-4 border-t dark:border-white/[0.06] border-[#E5E5E5] flex items-center justify-between text-xs font-mono dark:text-slate-500 text-[#737373]">
                  <span>Theoretical Module</span>
                  <span className="dark:group-hover:text-cyan-300 group-hover:text-[#FF7A00] transition-colors flex items-center gap-1">
                    Verified <span className="text-emerald-500">✓</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
