"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface ComplexityConfig {
  n: number;
}

const PRESETS: InputPreset<ComplexityConfig>[] = [
  {
    id: "micro-workload",
    name: "Micro Workload (N = 8)",
    description: "Low-n regime where constant factors often outweigh asymptotic scaling",
    data: { n: 8 },
    rawString: "N: 8",
  },
  {
    id: "cache-line",
    name: "Standard Array Segment (N = 16)",
    description: "Typical baseline demonstrating divergence of O(n²) and O(2ⁿ)",
    data: { n: 16 },
    rawString: "N: 16",
  },
  {
    id: "exponential-barrier",
    name: "Exponential Intractability Barrier (N = 32)",
    description: "At N=32, 2³² = 4.29 Billion ops (exceeding single-threaded second budgets)",
    data: { n: 32 },
    rawString: "N: 32",
  },
  {
    id: "astronomical-gap",
    name: "Polynomial vs Exponential Gulf (N = 64)",
    description: "O(n²) = 4,096 ops vs O(2ⁿ) > 1.84 × 10¹⁹ ops (physical limit)",
    data: { n: 64 },
    rawString: "N: 64",
  },
];

export default function ComplexityVisualizer() {
  const [n, setN] = useState<number>(16);

  // Computations for asymptotic growth
  const o1 = 1;
  const oLogN = Math.log2(n);
  const oN = n;
  const oNLogN = n * Math.log2(n);
  const oN2 = n * n;
  const o2N = n <= 30 ? Math.pow(2, n) : Infinity;

  const curves = [
    { label: "O(1) Constant", val: o1, color: "bg-emerald-500", text: "text-emerald-500", desc: "Hash table lookups, array indexing" },
    { label: "O(log n) Logarithmic", val: oLogN, color: "bg-cyan-500", text: "text-cyan-500", desc: "Binary search, balanced BST operations" },
    { label: "O(n) Linear", val: oN, color: "bg-blue-500", text: "text-blue-500", desc: "Single pass array traversal, counting" },
    { label: "O(n log n) Linearithmic", val: oNLogN, color: "bg-amber-500", text: "text-amber-500", desc: "Merge sort, Quick sort average, FFT" },
    { label: "O(n²) Quadratic", val: oN2, color: "bg-orange-500", text: "text-orange-500", desc: "Bubble sort, nested loops, all-pairs comparison" },
    { label: "O(2ⁿ) Exponential", val: o2N, color: "bg-rose-500", text: "text-rose-500", desc: "Subset enumeration, brute-force SAT / TSP" },
  ];

  const handleApplyPreset = (p: ComplexityConfig) => {
    setN(p.n);
  };

  const handleApplyRaw = (raw: string) => {
    const match = raw.match(/n:\s*(\d+)/i) || raw.match(/(\d+)/);
    if (!match) {
      return { isValid: false, errors: ["Please enter an integer (e.g. 'N: 32' or '32')."] };
    }

    const val = Number(match[1]);
    if (val < 1 || val > 128) {
      return { isValid: false, errors: ["Input size N must be between 1 and 128."] };
    }

    setN(val);
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Asymptotic Growth Hierarchy
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Computational Complexity: Asymptotic Scaling Comparison
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">Quick N:</span>
          <div className="flex items-center gap-1">
            {[8, 16, 32, 64].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setN(v)}
                className={cn(
                  "px-2 py-0.5 text-xs font-mono rounded-lg border transition-all",
                  n === v
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] font-bold dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-400 text-[#737373]"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Problem Scale N & Complexity Presets"
        subtitle="Set input scale N (1 to 128) to observe real-time mathematical explosion across Big-O asymptotic classes."
        initialValue={`N: ${n}`}
        placeholder="N: 32"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[1].data)}
        summaryBadge={`N = ${n} | O(n²) = ${(n * n).toLocaleString()} ops | O(2ⁿ) = ${n <= 25 ? Math.pow(2, n).toLocaleString() : "> 10⁸ ops"}`}
      />

      {/* Sliders and bar comparisons */}
      <div className="space-y-4">
        {curves.map((c) => {
          // Normalize for bar display using log10 scale against 2^25
          const maxScale = Math.log10(Math.pow(2, 25));
          const currentLog = Math.log10(Math.min(c.val, Math.pow(2, 25)) + 1);
          const displayWidth = Math.min(100, Math.max(2, (currentLog / maxScale) * 100));

          return (
            <div key={c.label} className="space-y-1 font-mono text-xs">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={cn("font-bold", c.text)}>{c.label}</span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">({c.desc})</span>
                </div>
                <span className="dark:text-slate-200 text-[#171717] font-semibold">
                  {c.val === Infinity || c.val > 1e12
                    ? `> 10¹² ops (Intractable at N=${n})`
                    : `${Math.round(c.val).toLocaleString()} ops`}
                </span>
              </div>
              <div className="h-3 w-full dark:bg-white/[0.04] bg-slate-100 rounded-full overflow-hidden border dark:border-white/5 border-slate-200">
                <div
                  style={{ width: `${displayWidth}%` }}
                  className={cn("h-full rounded-full transition-all duration-300", c.color)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Log-Scale Asymptotic Comparison at N = {n}</span>
        <span className="text-[#FF7A00] dark:text-cyan-300 font-bold">
          {n >= 30 ? "Exponential O(2ⁿ) crosses intractable boundary" : "Polynomial classes scale comfortably"}
        </span>
      </div>
    </div>
  );
}
