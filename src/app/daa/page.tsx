import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Design & Analysis of Algorithms",
  description:
    "Master algorithm design paradigms with interactive visualizations and complexity analysis.",
};

const topics = [
  {
    slug: "sorting",
    title: "Sorting Algorithms",
    description:
      "Bubble, Merge, Quick, Heap sort — analyze their time/space complexity and watch them run step by step.",
    complexity: "O(n log n)",
    lessons: 8,
    tags: ["Comparison", "Divide & Conquer", "In-place"],
    color: "violet",
  },
  {
    slug: "graphs",
    title: "Graph Algorithms",
    description:
      "BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Prim's and Kruskal's — with interactive graph traversals.",
    complexity: "O(V + E)",
    lessons: 10,
    tags: ["BFS", "DFS", "Shortest Path", "MST"],
    color: "cyan",
  },
  {
    slug: "dp",
    title: "Dynamic Programming",
    description:
      "Memoization vs tabulation, optimal substructure, overlapping subproblems — LCS, Knapsack, Matrix Chain.",
    complexity: "Problem-dependent",
    lessons: 9,
    tags: ["Memoization", "Tabulation", "Optimization"],
    color: "emerald",
  },
  {
    slug: "greedy",
    title: "Greedy Algorithms",
    description:
      "Activity selection, Huffman coding, fractional knapsack — when greedy works and why it fails.",
    complexity: "O(n log n)",
    lessons: 6,
    tags: ["Optimal Substructure", "Greedy Choice"],
    color: "violet",
  },
  {
    slug: "divide-conquer",
    title: "Divide & Conquer",
    description:
      "Master theorem, recurrence relations, Strassen matrix multiplication, closest pair of points.",
    complexity: "Master Theorem",
    lessons: 7,
    tags: ["Recurrences", "Recursion Tree"],
    color: "cyan",
  },
  {
    slug: "np-completeness",
    title: "NP-Completeness",
    description:
      "P vs NP, polynomial reductions, SAT, 3-SAT, Clique, Vertex Cover — the theory of hard problems.",
    complexity: "NP-Hard",
    lessons: 5,
    tags: ["Reductions", "Decision Problems"],
    color: "emerald",
  },
];

const colorConfig: Record<string, { badge: string; border: string; complexity: string; glow: string }> = {
  violet: {
    badge: "dark:bg-[#0A84FF]/10 dark:text-blue-300 dark:border-[#0A84FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border-[#FF7A00]/25",
    border: "dark:hover:border-[#0A84FF]/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    complexity: "dark:text-[#0A84FF] text-[#FF7A00]",
    glow: "dark:from-[#0A84FF]/10 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  cyan: {
    badge: "dark:bg-[#00D2FF]/10 dark:text-cyan-300 dark:border-[#00D2FF]/25 bg-[rgba(255,122,0,0.08)] text-[#EA580C] border-[#FF7A00]/25",
    border: "dark:hover:border-cyan-400/40 hover:border-[#FF7A00]/40 hover:shadow-[0_12px_36px_rgba(255,122,0,0.12)]",
    complexity: "dark:text-cyan-400 text-[#EA580C]",
    glow: "dark:from-[#00D2FF]/10 from-[rgba(255,122,0,0.06)] to-transparent",
  },
  emerald: {
    badge: "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "dark:hover:border-emerald-400/40 hover:border-emerald-500/40 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]",
    complexity: "text-emerald-600 dark:text-emerald-400",
    glow: "dark:from-emerald-500/10 from-emerald-500/5 to-transparent",
  },
};

export default function DAAPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-gray-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[#0A84FF]/[0.08] rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-[#00D2FF]/[0.06] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[150px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          {/* Page header */}
          <div className="mb-14">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-blue-300 text-[#FF7A00] uppercase tracking-widest backdrop-blur-md mb-5 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-pulse" />
              Core Curriculum
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-5">
              Design &amp; Analysis of{" "}
              <span className="gradient-text-electric">Algorithms</span>
            </h1>
            <p className="dark:text-slate-400 text-[#737373] max-w-2xl text-base sm:text-lg leading-relaxed font-sans">
              A rigorous, interactive course covering algorithm design paradigms,
              complexity analysis, and correctness proofs — with step-by-step
              interactive visualizations for every major algorithm.
            </p>
          </div>

          {/* Topic grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topics.map((topic) => {
              const c = colorConfig[topic.color];
              return (
                <Link
                  key={topic.slug}
                  href={`/daa/${topic.slug}`}
                  className={`group card-base card-hover p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden dark:border-white/10 border-[#E5E5E5] ${c.border}`}
                >
                  {/* Subtle top specular sheen */}
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${c.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg leading-snug dark:group-hover:text-blue-200 group-hover:text-[#FF7A00] transition-colors">
                        {topic.title}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-slate-400 dark:group-hover:text-[#0A84FF] group-hover:text-[#FF7A00] transition-all duration-200 group-hover:translate-x-1 mt-1 shrink-0" />
                    </div>
                    <p className="text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-4 font-sans">
                      {topic.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono border backdrop-blur-sm ${c.badge}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t dark:border-white/[0.08] border-[#E5E5E5] text-xs dark:text-slate-400 text-[#737373] font-mono">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {topic.lessons} modules
                      </span>
                      <span className={`font-semibold ${c.complexity}`}>
                        {topic.complexity}
                      </span>
                    </div>
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
