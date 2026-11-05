import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Principles of Artificial Intelligence",
  description:
    "Explore AI fundamentals with interactive simulations, state-space search, knowledge representation, and machine learning.",
};

const topics = [
  {
    slug: "search",
    title: "Search Algorithms & A*",
    description:
      "Uninformed (BFS, DFS, UCS) and informed (Greedy, A*) search, heuristic design, admissibility and consistency.",
    tags: ["A* Search", "Heuristics", "Graph Search"],
    color: "cyan",
  },
  {
    slug: "csp",
    title: "Constraint Satisfaction",
    description:
      "Variables, domains, constraints, backtracking search, forward checking, AC-3 algorithm, MRV heuristic.",
    tags: ["AC-3", "Backtracking", "Heuristics"],
    color: "violet",
  },
  {
    slug: "knowledge",
    title: "Knowledge & Logic",
    description:
      "Propositional logic, inference rules, resolution refutation, first-order logic, unification and forward/backward chaining.",
    tags: ["Logic", "Resolution", "Inference"],
    color: "emerald",
  },
  {
    slug: "ml",
    title: "Machine Learning Math",
    description:
      "Linear regression, logistic regression, gradient descent variants, loss functions, regularization, bias-variance tradeoff.",
    tags: ["Optimization", "Gradient Descent", "Loss"],
    color: "cyan",
  },
  {
    slug: "neural-networks",
    title: "Neural Networks & Backprop",
    description:
      "Perceptrons, multi-layer networks, activation functions, backpropagation calculus, vanishing gradient problem.",
    tags: ["Calculus", "Backprop", "Deep Learning"],
    color: "violet",
  },
  {
    slug: "agents",
    title: "Planning & Intelligent Agents",
    description:
      "Agent architectures, MDPs, Value Iteration, Policy Iteration, Q-Learning, reinforcement learning foundations.",
    tags: ["MDP", "Reinforcement Learning", "Q-Learning"],
    color: "emerald",
  },
];

const colorConfig: Record<string, { badge: string; border: string; glow: string }> = {
  violet: {
    badge: "dark:bg-[#0A84FF]/10 dark:text-blue-300 dark:border-[#0A84FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border-[#FF7A00]/25",
    border: "dark:hover:border-[#0A84FF]/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    glow: "dark:from-[#0A84FF]/10 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  cyan: {
    badge: "dark:bg-[#00D2FF]/10 dark:text-cyan-300 dark:border-[#00D2FF]/25 bg-[rgba(255,122,0,0.08)] text-[#EA580C] border-[#FF7A00]/25",
    border: "dark:hover:border-cyan-400/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    glow: "dark:from-[#00D2FF]/10 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  emerald: {
    badge: "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "dark:hover:border-emerald-400/40 hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]",
    glow: "dark:from-emerald-500/10 from-emerald-500/5 to-transparent",
  },
};

export default function POAIPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-0 right-1/4 w-[800px] h-[550px] bg-[#00D2FF]/[0.08] rounded-full blur-[150px]" />
          <div className="absolute top-1/3 left-10 w-[550px] h-[500px] bg-[#0A84FF]/[0.06] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-0 right-1/4 w-[800px] h-[550px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[150px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          <div className="mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#00D2FF]/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-cyan-300 text-[#FF7A00] uppercase tracking-widest backdrop-blur-md mb-5 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-[#00D2FF] bg-[#FF7A00] animate-pulse" />
              Foundations of Intelligence
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-5">
              Principles of{" "}
              <span className="gradient-text-cyan">Artificial Intelligence</span>
            </h1>
            <p className="dark:text-slate-400 text-[#737373] max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
              Build the theoretical and practical foundations of AI — from
              classical search and logic to modern machine learning, with
              interactive simulations at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => {
              const c = colorConfig[topic.color];
              return (
                <Link
                  key={topic.slug}
                  href={`/poai/${topic.slug}`}
                  className={`group card-base card-hover p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden dark:border-white/10 border-[#E5E5E5] ${c.border}`}
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg leading-snug dark:group-hover:text-cyan-200 group-hover:text-[#FF7A00] transition-colors">
                        {topic.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:group-hover:text-cyan-400 group-hover:text-[#FF7A00] transition-all duration-200 group-hover:translate-x-1 mt-1 shrink-0" />
                    </div>
                    <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-4 font-sans">
                      {topic.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t dark:border-white/[0.08] border-[#E5E5E5]">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-lg text-xs font-mono border backdrop-blur-sm ${c.badge}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
