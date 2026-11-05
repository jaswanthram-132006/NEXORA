import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About NEXORA — Architecture & Curriculum",
  description:
    "Learn about NEXORA's design philosophy, pedagogical standards, and technical architecture.",
};

const pillars = [
  {
    icon: Code2,
    title: "100% Deterministic Code",
    description:
      "Every visualization executes actual algorithms in real time. We reject mockups, pre-rendered animations, and non-functional visual placeholders.",
  },
  {
    icon: Layers,
    title: "Tri-Layer Educational Model",
    description:
      "Every concept integrates rigorous mathematical formulation, readable production-grade code, and live interactive visual controls.",
  },
  {
    icon: Cpu,
    title: "Beyond University Syllabus",
    description:
      "From classical sorting to advanced PSPACE complexity, approximation PTAS schemes, and deep learning generalization dynamics.",
  },
  {
    icon: Sparkles,
    title: "High Performance Architecture",
    description:
      "Engineered with Next.js App Router, Tailwind CSS, TypeScript, and hardware-accelerated canvas/SVG visualization pipelines.",
  },
];

const techStack = [
  { name: "Next.js", category: "App Router & SSR Architecture" },
  { name: "TypeScript", category: "Strict Static Type Safety" },
  { name: "Tailwind CSS", category: "Responsive Token-Based Design System" },
  { name: "HTML5 Canvas", category: "60 FPS Deterministic Particle & Simulation Engines" },
  { name: "Lucide React", category: "Consistent Visual Iconography" },
  { name: "SVG & D3 Algorithms", category: "State-Space Frontier & Graph Traversal Pipelines" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[#0A84FF]/[0.08] rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-10 w-[550px] h-[500px] bg-[#00D2FF]/[0.06] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[150px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-blue-300 text-[#FF7A00] uppercase tracking-widest backdrop-blur-md mb-4 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-pulse" />
              Documentation &amp; Vision
            </span>
            <h1 className="text-4xl sm:text-6xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-6">
              About <span className="gradient-text-electric">NEXORA</span>
            </h1>
            <p className="text-lg sm:text-xl dark:text-slate-400 text-[#737373] leading-relaxed font-sans">
              NEXORA is a modern educational platform engineered to bridge the gap
              between abstract mathematical theory and tangible software implementation
              in algorithms and artificial intelligence.
            </p>
          </div>

          {/* Core Pedagogical Pillars */}
          <div className="mb-20">
            <h2 className="text-2xl font-heading font-bold dark:text-white text-[#171717] mb-8 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 dark:text-[#0A84FF] text-[#FF7A00]" />
              Pedagogical Standards
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="card-base card-hover p-7 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b dark:from-[#0A84FF]/10 from-[rgba(255,122,0,0.06)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    />
                    <div className="relative z-10">
                      <div className="w-11 h-11 rounded-xl dark:bg-[#0A84FF]/10 dark:border-[#0A84FF]/25 dark:text-[#0A84FF] bg-[rgba(255,122,0,0.08)] border border-[#FF7A00]/25 text-[#FF7A00] flex items-center justify-center mb-5 backdrop-blur-md shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg mb-2.5 dark:group-hover:text-blue-200 group-hover:text-[#FF7A00] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed font-sans">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curriculum Mapping */}
          <div className="mb-20">
            <h2 className="text-2xl font-heading font-bold dark:text-white text-[#171717] mb-8 flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 dark:text-cyan-400 text-[#FF7A00]" />
              Curriculum Roadmap
            </h2>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card-base card-hover p-7 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b dark:from-[#0A84FF]/10 from-[rgba(255,122,0,0.06)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase dark:text-[#0A84FF] text-[#FF7A00] font-mono block mb-2">
                    Part 1
                  </span>
                  <h3 className="text-xl font-heading font-bold dark:text-white text-[#171717] mb-3 dark:group-hover:text-blue-200 group-hover:text-[#FF7A00] transition-colors">
                    Design &amp; Analysis of Algorithms (DAA)
                  </h3>
                  <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-6 font-sans">
                    Sorting paradigms, graph theory (BFS, DFS, Dijkstra, Bellman-Ford,
                    MST), dynamic programming state transitions, greedy exchange
                    arguments, Master theorem recurrences, and NP-completeness reductions.
                  </p>
                </div>
                <Link
                  href="/daa"
                  className="relative z-10 text-xs font-semibold dark:text-[#0A84FF] text-[#FF7A00] dark:hover:text-cyan-300 hover:text-[#EA580C] flex items-center gap-1.5 pt-4 border-t dark:border-white/[0.08] border-[#E5E5E5] transition-colors"
                >
                  Explore DAA Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="card-base card-hover p-7 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b dark:from-[#00D2FF]/10 from-[rgba(255,122,0,0.06)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase dark:text-cyan-400 text-[#EA580C] font-mono block mb-2">
                    Part 2
                  </span>
                  <h3 className="text-xl font-heading font-bold dark:text-white text-[#171717] mb-3 dark:group-hover:text-cyan-200 group-hover:text-[#EA580C] transition-colors">
                    Principles of Artificial Intelligence (POAI)
                  </h3>
                  <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-6 font-sans">
                    State-space search (A*, heuristics), constraint satisfaction (AC-3,
                    MRV), first-order logic and resolution refutation, machine learning
                    empirical risk minimization, neural network backpropagation, and MDPs.
                  </p>
                </div>
                <Link
                  href="/poai"
                  className="relative z-10 text-xs font-semibold dark:text-cyan-400 text-[#EA580C] dark:hover:text-cyan-300 hover:text-[#FF7A00] flex items-center gap-1.5 pt-4 border-t dark:border-white/[0.08] border-[#E5E5E5] transition-colors"
                >
                  Explore POAI Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="card-base card-hover p-7 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between relative overflow-hidden group shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b dark:from-emerald-500/10 from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                />
                <div className="relative z-10">
                  <span className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 font-mono block mb-2">
                    Part 3
                  </span>
                  <h3 className="text-xl font-heading font-bold dark:text-white text-[#171717] mb-3 dark:group-hover:text-emerald-200 group-hover:text-emerald-600 transition-colors">
                    Advanced Intractable Computing
                  </h3>
                  <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-6 font-sans">
                    Approximation schemes (PTAS, metric TSP, vertex cover bounds),
                    randomized algorithms (Las Vegas vs Monte Carlo, universal hashing),
                    PSPACE complexity, PAC learning theory, and fixed-parameter tractability.
                  </p>
                </div>
                <Link
                  href="/advanced"
                  className="relative z-10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 hover:text-emerald-700 flex items-center gap-1.5 pt-4 border-t dark:border-white/[0.08] border-[#E5E5E5] transition-colors"
                >
                  Explore Advanced Hub <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Technology Stack Grid */}
          <div className="mb-20">
            <h2 className="text-2xl font-heading font-bold dark:text-white text-[#171717] mb-8 flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-[#FF7A00]" />
              Technology Architecture
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="card-base p-5 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between backdrop-blur-md shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <span className="font-mono font-bold dark:text-white text-[#171717] text-sm">
                    {tech.name}
                  </span>
                  <span className="text-xs dark:text-slate-400 text-[#737373] mt-2 font-mono">
                    {tech.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="card-base p-8 sm:p-12 dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-center relative overflow-hidden shadow-sm dark:shadow-[0_20px_60px_rgba(10,132,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r dark:from-[#0A84FF]/[0.1] from-[rgba(255,122,0,0.06)] via-transparent dark:to-[#00D2FF]/[0.08] to-[rgba(255,122,0,0.04)] pointer-events-none"
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717] mb-4 tracking-tight">
                Ready to explore the algorithms?
              </h2>
              <p className="text-sm sm:text-base dark:text-slate-400 text-[#737373] mb-8 leading-relaxed font-sans">
                Jump directly into our interactive simulations or begin reading the
                theoretical foundations from first principles.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/daa" className="btn-primary text-xs px-6 py-3">
                  Start with DAA
                </Link>
                <Link href="/simulations" className="btn-secondary text-xs px-6 py-3">
                  Open Interactive Simulations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
