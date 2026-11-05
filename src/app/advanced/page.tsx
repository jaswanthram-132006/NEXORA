import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Advanced Topics Beyond Syllabus",
  description:
    "Explore cutting-edge computer science topics: approximation algorithms, randomized algorithms, computational complexity, and deep learning theory.",
};

const topics = [
  {
    slug: "approximation",
    title: "Approximation Algorithms",
    description:
      "When optimal is intractable: approximation ratio, Vertex Cover (2-approx), Metric TSP, Set Cover, PTAS and FPTAS schemes.",
    tags: ["PTAS", "NP-Hard", "Approximation Ratio"],
    level: "Advanced",
    color: "emerald",
  },
  {
    slug: "randomized",
    title: "Randomized Algorithms",
    description:
      "Las Vegas vs Monte Carlo, randomized quicksort, Min-Cut (Karger), fingerprinting, universal hashing, Chernoff bounds.",
    tags: ["Probability", "Monte Carlo", "Hashing"],
    level: "Advanced",
    color: "cyan",
  },
  {
    slug: "complexity",
    title: "Computational Complexity",
    description:
      "Beyond NP: co-NP, PSPACE, #P counting problems, polynomial hierarchy, BPP, IP=PSPACE, Baker-Gill-Solovay oracle separation.",
    tags: ["PSPACE", "Oracle Separation", "Hierarchy"],
    level: "Expert",
    color: "violet",
  },
  {
    slug: "deep-learning",
    title: "Deep Learning Theory",
    description:
      "Optimization landscapes, loss surfaces, implicit regularization, overparameterization, neural tangent kernel, double descent.",
    tags: ["NTK", "Double Descent", "Generalization"],
    level: "Expert",
    color: "emerald",
  },
  {
    slug: "online-algorithms",
    title: "Online Algorithms & Streaming",
    description:
      "Competitive ratio, paging algorithms (LRU, FIFO), k-server conjecture, streaming algorithms (Morris counter, Count-Min sketch).",
    tags: ["Competitive Ratio", "Streaming", "Paging"],
    level: "Advanced",
    color: "cyan",
  },
  {
    slug: "parameterized",
    title: "Parameterized Complexity",
    description:
      "Fixed-parameter tractability (FPT), kernelization, bounded search trees, W-hierarchy, color coding, treewidth.",
    tags: ["FPT", "Kernelization", "W-Hierarchy"],
    level: "Expert",
    color: "violet",
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
    glow: "from-[#00D2FF]/10 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  emerald: {
    badge: "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "dark:hover:border-emerald-400/40 hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]",
    glow: "dark:from-emerald-500/10 from-emerald-500/5 to-transparent",
  },
};

const levelColor: Record<string, string> = {
  Advanced: "text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10 border-amber-300 dark:border-amber-400/25",
  Expert: "text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10 border-rose-300 dark:border-rose-400/25",
};

export default function AdvancedPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-10 left-1/3 w-[750px] h-[550px] bg-emerald-600/[0.06] rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-10 w-[550px] h-[500px] bg-[#0A84FF]/[0.06] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-10 left-1/3 w-[750px] h-[550px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[150px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          <div className="mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-emerald-500/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-emerald-300 text-[#FF7A00] uppercase tracking-widest backdrop-blur-md mb-5 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-emerald-400 bg-[#FF7A00] animate-pulse" />
              Advanced Topics
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-5">
              Beyond the{" "}
              <span className="gradient-text-electric">Syllabus</span>
            </h1>
            <p className="dark:text-slate-400 text-[#737373] max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
              Topics that universities rarely cover in depth — the theoretical and
              algorithmic foundations that separate engineers who merely apply code
              from those who truly invent it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => {
              const c = colorConfig[topic.color];
              return (
                <Link
                  key={topic.slug}
                  href={`/advanced/${topic.slug}`}
                  className={`group card-base card-hover p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden dark:border-white/10 border-[#E5E5E5] ${c.border}`}
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg leading-snug dark:group-hover:text-emerald-200 group-hover:text-[#FF7A00] transition-colors">
                        {topic.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${levelColor[topic.level]}`}>
                          {topic.level}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 dark:group-hover:text-emerald-400 group-hover:text-[#FF7A00] transition-all duration-200 group-hover:translate-x-1" />
                      </div>
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
