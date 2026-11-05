import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ArrowLeft, Sparkles, Trophy } from "lucide-react";
import MinimaxVisualizer from "@/components/visualizers/MinimaxVisualizer";

export const metadata: Metadata = {
  title: "Minimax with Alpha-Beta Pruning Simulation | NEXORA",
  description:
    "Interactive 2-player zero-sum adversarial game tree visualizer with dynamic [α, β] intervals and subtree branch pruning.",
};

export default function MinimaxSimulationPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Background illumination */}
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
        <div className="section-padding max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono dark:text-slate-400 text-slate-500">
            <Link
              href="/simulations"
              className="hover:underline flex items-center gap-1 dark:text-cyan-400 text-[#FF7A00]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Simulations
            </Link>
            <span>/</span>
            <span>Minimax & Alpha-Beta Pruning</span>
          </div>

          {/* Heading */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold">
                <Trophy className="w-3 h-3" /> Game Theory &amp; Adversarial Search
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717]">
              Adversarial Minimax with Alpha-Beta Pruning
            </h1>
            <p className="dark:text-slate-400 text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Step through a zero-sum game tree between MAX and MIN. Watch how maintaining $[\alpha, \beta]$ cutoff intervals allows the algorithm to prune provably irrelevant subtrees without altering the optimal minimax decision.
            </p>
          </div>

          {/* Interactive Visualizer */}
          <MinimaxVisualizer />

          {/* Theory Link */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200">
            <Link
              href="/poai/search"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Game Theory, Minimax &amp; Adversarial Search Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
