"use client";

import React, { useState } from "react";
import { Sparkles, GitBranch, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface FPTConfig {
  n: number;
  k: number;
}

const PRESETS: InputPreset<FPTConfig>[] = [
  {
    id: "moderate-instance",
    name: "Moderate Scale Instance (N=1,000, k=3)",
    description: "Standard benchmark showing multi-million fold speedup of FPT over classical O(n^k)",
    data: { n: 1000, k: 3 },
    rawString: "N: 1000 | k: 3",
  },
  {
    id: "big-data-small-k",
    name: "Web-Scale Big Data (N=50,000, k=4)",
    description: "Massive graph where n^k is physically impossible (6.25 × 10¹⁸ ops), but FPT runs in 800,000 ops (< 1 ms)",
    data: { n: 50000, k: 4 },
    rawString: "N: 50000 | k: 4",
  },
  {
    id: "intractable-barrier",
    name: "Exponential Classical Barrier (N=500, k=8)",
    description: "Demonstrates how classical XP algorithms collapse while FPT remains bounded to 2⁸ · 500 = 128,000 ops",
    data: { n: 500, k: 8 },
    rawString: "N: 500 | k: 8",
  },
  {
    id: "minimal-base",
    name: "Base Boundary (N=40, k=2)",
    description: "Small instance illustrating search tree depth k=2 with 4 terminal leaves",
    data: { n: 40, k: 2 },
    rawString: "N: 40 | k: 2",
  },
];

export default function ParameterizedVisualizer() {
  const [n, setN] = useState<number>(1000);
  const [k, setK] = useState<number>(3);

  // Standard exponential vs FPT:
  // Classical Brute Force: n^k operations
  // FPT Search Tree: 2^k * n operations
  const classicalOps = Math.pow(n, k);
  const fptOps = Math.pow(2, k) * n;
  const speedupRatio = classicalOps / fptOps;

  const handleApplyPreset = (p: FPTConfig) => {
    setN(p.n);
    setK(p.k);
  };

  const handleApplyRaw = (raw: string) => {
    const nMatch = raw.match(/n:\s*(\d+)/i);
    const kMatch = raw.match(/k:\s*(\d+)/i);

    const errors: string[] = [];
    let newN = n;
    let newK = k;

    if (nMatch) {
      const valN = Number(nMatch[1]);
      if (valN >= 10 && valN <= 1000000) {
        newN = valN;
      } else {
        errors.push("Graph size N must be between 10 and 1,000,000 vertices.");
      }
    }

    if (kMatch) {
      const valK = Number(kMatch[1]);
      if (valK >= 1 && valK <= 10) {
        newK = valK;
      } else {
        errors.push("Parameter budget k must be between 1 and 10.");
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setN(newN);
    setK(newK);
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> FPT Bounded Search Tree (f(k) · n^O(1))
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Parameterized Complexity: Vertex Cover Search Tree of Depth k
          </h3>
        </div>

        {/* Parameter K selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">Parameter k:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setK(val)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
                  k === val
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] font-bold dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-400 text-[#737373]"
                )}
              >
                k={val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Graph Size N & Parameter Budget k"
        subtitle="Configure graph order N and vertex cover budget k to evaluate XP vs FPT runtime divergence (format: N: 1000 | k: 3)."
        initialValue={`N: ${n} | k: ${k}`}
        placeholder="N: 1000 | k: 3"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`N = ${n.toLocaleString()} Vertices | k = ${k} | Speedup: ${speedupRatio >= 1e6 ? `${(speedupRatio / 1e6).toFixed(1)}M ×` : `${Math.round(speedupRatio)} ×`}`}
      />

      {/* Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl dark:bg-rose-500/10 bg-rose-50/50 border dark:border-rose-500/20 border-rose-200 font-mono text-xs space-y-2">
          <span className="font-bold text-rose-500 block text-sm">
            Classical Brute-Force O(n^k) [XP Class]:
          </span>
          <p className="text-slate-500 text-[11px]">
            Input size n = {n.toLocaleString()} vertices with budget k = {k}:
          </p>
          <div className="text-base font-bold dark:text-rose-300 text-rose-600">
            {classicalOps >= 1e12 ? `${classicalOps.toExponential(2)} operations` : `${Math.round(classicalOps).toLocaleString()} operations`}
          </div>
          <p className="text-[10px] text-slate-400">
            Exponent grows with k &rarr; Intractable as k scales.
          </p>
        </div>

        <div className="p-4 rounded-xl dark:bg-emerald-500/10 bg-emerald-50/50 border dark:border-emerald-500/20 border-emerald-200 font-mono text-xs space-y-2">
          <span className="font-bold text-emerald-500 block text-sm">
            FPT Algorithm O(2^k &middot; n) [FPT Class]:
          </span>
          <p className="text-slate-500 text-[11px]">
            Bounded depth-k search tree with 2^{k} leaves:
          </p>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-300">
            {Math.round(fptOps).toLocaleString()} operations
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Efficiency multiplier: {speedupRatio >= 1e6 ? `${(speedupRatio / 1e6).toFixed(1)} Million &times; faster` : `${Math.round(speedupRatio)} &times; faster`}!
          </p>
        </div>
      </div>

      {/* Binary Search Tree Visualizer */}
      <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold dark:text-slate-200 text-[#171717]">
            Bounded Search Tree Structure (Depth = {k}):
          </span>
          <span className="text-xs text-slate-400">
            Max leaves: 2^{k} = {Math.pow(2, k)} leaves
          </span>
        </div>

        <div className="flex justify-center py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="px-3 py-1 rounded bg-[#FF7A00] dark:bg-[#0A84FF] text-white font-bold text-xs shadow-sm">
              Root: Pick Edge (u, v)
            </div>
            <div className="flex gap-8 sm:gap-16">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">Branch 1: Include u</span>
                <div className="px-2.5 py-1 rounded dark:bg-slate-800 bg-white border dark:border-white/10 text-xs font-semibold">
                  Budget k&apos; = {k - 1}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">Branch 2: Include v</span>
                <div className="px-2.5 py-1 rounded dark:bg-slate-800 bg-white border dark:border-white/10 text-xs font-semibold">
                  Budget k&apos; = {k - 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
