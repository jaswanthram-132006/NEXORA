"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, SkipForward, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseMatrixDims } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

const PRESETS: InputPreset<number[]>[] = [
  {
    id: "classic-3",
    name: "Classic 3-Matrix Chain",
    description: "Dimensions [10, 30, 5, 60] -> A1(10x30), A2(30x5), A3(5x60)",
    data: [10, 30, 5, 60],
    rawString: "10, 30, 5, 60",
  },
  {
    id: "clrs-6",
    name: "CLRS Textbook 6-Matrix Problem",
    description: "Classic textbook benchmark [30, 35, 15, 5, 10, 20, 25]",
    data: [30, 35, 15, 5, 10, 20, 25],
    rawString: "30, 35, 15, 5, 10, 20, 25",
  },
  {
    id: "asymmetric-skew",
    name: "Highly Asymmetric Bottleneck",
    description: "Demonstrates how parenthesization order prevents astronomical intermediate products",
    data: [5, 100, 5, 50, 6],
    rawString: "5, 100, 5, 50, 6",
  },
  {
    id: "uniform-4",
    name: "Uniform Scaling 4-Chain",
    description: "Monotonically increasing matrices [10, 20, 30, 40, 50]",
    data: [10, 20, 30, 40, 50],
    rawString: "10, 20, 30, 40, 50",
  },
];

export default function DPMatrixSimulationPage() {
  const [dims, setDims] = useState<number[]>([10, 30, 5, 60]);
  const [stepIdx, setStepIdx] = useState<number>(0);

  // Compute MCM DP table
  const mcmResult = useMemo(() => {
    const p = dims;
    const n = p.length - 1;
    const m: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const s: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    const steps: { l: number; i: number; j: number; kOpt: number; cost: number; explanation: string }[] = [];

    // l is chain length
    for (let l = 2; l <= n; l++) {
      for (let i = 1; i <= n - l + 1; i++) {
        const j = i + l - 1;
        m[i][j] = Infinity;
        let bestK = i;
        for (let k = i; k <= j - 1; k++) {
          const q = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
          if (q < m[i][j]) {
            m[i][j] = q;
            bestK = k;
          }
        }
        s[i][j] = bestK;
        steps.push({
          l,
          i,
          j,
          kOpt: bestK,
          cost: m[i][j],
          explanation: `Chain length ${l}: m[${i},${j}] = min split at k=${bestK} (${m[i][bestK]} + ${m[bestK + 1][j]} + ${p[i - 1]}×${p[bestK]}×${p[j]}). Optimal sub-cost = ${m[i][j].toLocaleString()} scalar multiplications.`,
        });
      }
    }
    return { m, s, steps, n };
  }, [dims]);

  const { m, s, steps, n } = mcmResult;
  const currentStep = steps[stepIdx] || steps[0] || {
    l: 0,
    i: 1,
    j: 1,
    kOpt: 1,
    cost: 0,
    explanation: "Base case: single matrices require 0 scalar multiplications.",
  };

  const handleApplyDims = (newDims: number[]) => {
    setDims(newDims);
    setStepIdx(0);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono dark:text-slate-500 text-[#737373]">
            <Link href="/simulations" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Simulations
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-purple-500/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-purple-300 text-[#FF7A00] font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Matrix Chain Multiplication (MCM)
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717]">
                Dynamic Programming Matrix Engine
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIdx(Math.min(stepIdx + 1, steps.length - 1))}
                disabled={stepIdx >= steps.length - 1}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 rounded-xl disabled:opacity-40"
              >
                <SkipForward className="w-4 h-4" /> Next Sub-Chain
              </button>
              <button
                type="button"
                onClick={() => setStepIdx(0)}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Custom Input Panel */}
          <CustomInputPanel
            title="Custom Matrix Dimensions Sequence & Presets"
            subtitle="Enter dimension array p0, p1, ..., pn (e.g. 10, 30, 5, 60 defines matrices A1: 10×30, A2: 30×5, A3: 5×60)."
            initialValue={dims.join(", ")}
            placeholder="e.g. 10, 30, 5, 60"
            presets={PRESETS}
            onApply={(raw) => {
              const res = parseMatrixDims(raw);
              if (!res.isValid || !res.data) {
                return { isValid: false, errors: res.errors };
              }
              handleApplyDims(res.data);
              return { isValid: true };
            }}
            onReset={() => handleApplyDims(PRESETS[0].data)}
            summaryBadge={`${n} Matrices | Minimum Total Cost: ${m[1] && m[1][n] !== undefined ? m[1][n].toLocaleString() : 0} ops`}
          />

          {/* Recurrence Explanation Card */}
          <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs space-y-1">
            <div className="font-bold text-[#FF7A00] dark:text-cyan-300">
              Bellman Optimal Substructure Recurrence:
            </div>
            <p className="dark:text-slate-300 text-[#171717]">
              m[i, j] = 0 (if i = j), else min_{"{i ≤ k < j}"} {"{"} m[i, k] + m[k+1, j] + p_{"{i-1}"} · p_k · p_j {"}"}
            </p>
          </div>

          {/* 2D Table Display */}
          <div className="card-base rounded-2xl p-6 border dark:border-white/10 border-[#E5E5E5] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base dark:text-white text-[#171717]">
                DP Cost Matrix m[1..{n}, 1..{n}]
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Active Step {stepIdx + 1} of {steps.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-mono text-xs text-center">
                <thead>
                  <tr>
                    <th className="p-3 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">i \ j</th>
                    {Array.from({ length: n }).map((_, j) => (
                      <th key={j} className="p-3 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold dark:text-cyan-300 text-[#FF7A00]">
                        A{j + 1} ({dims[j]}×{dims[j + 1]})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: n }).map((_, r) => (
                    <tr key={r}>
                      <th className="p-3 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold dark:text-cyan-300 text-[#FF7A00]">
                        A{r + 1}
                      </th>
                      {Array.from({ length: n }).map((_, c) => {
                        const i = r + 1;
                        const j = c + 1;
                        const isMainDiagonal = i === j;
                        const isUpperTriangle = i < j;
                        const isCurrent = currentStep && currentStep.i === i && currentStep.j === j;

                        return (
                          <td
                            key={c}
                            className={cn(
                              "p-3 border dark:border-white/10 border-slate-200 transition-all font-bold",
                              isCurrent
                                ? "bg-[#FF7A00]/25 dark:bg-[#0A84FF]/30 dark:text-cyan-300 text-[#FF7A00] scale-105"
                                : isMainDiagonal
                                ? "bg-slate-100 dark:bg-white/[0.03] text-slate-400"
                                : isUpperTriangle
                                ? "dark:bg-emerald-500/10 bg-emerald-50 text-emerald-600 dark:text-emerald-400"
                                : "dark:bg-black/40 bg-slate-100 opacity-20"
                            )}
                          >
                            {isUpperTriangle ? m[i][j].toLocaleString() : isMainDiagonal ? "0" : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
              <span className="dark:text-slate-200 text-[#171717]">
                Step {stepIdx + 1}/{steps.length}: {currentStep.explanation}
              </span>
            </div>
          </div>

          {/* Theory Link */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200">
            <Link
              href="/daa/dp"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Dynamic Programming &amp; Optimal Substructure Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
