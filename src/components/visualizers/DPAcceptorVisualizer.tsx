"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, SkipForward, SkipBack, RotateCcw, Scissors, AlignLeft, Layers, Split } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseStringPair, parseNumberArray } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

type DPMode = "lcs" | "editDistance" | "rodCutting" | "substring" | "fib";

const LCS_PRESETS: InputPreset<{ s1: string; s2: string }>[] = [
  {
    id: "algo",
    name: "ALGO & LOG",
    description: "Classic short benchmark (LCS: 'LGO')",
    data: { s1: "ALGO", s2: "LOG" },
    rawString: "ALGO, LOG",
  },
  {
    id: "classic-clrs",
    name: "DNA Sequences (CLRS)",
    description: "Classic textbook test strings",
    data: { s1: "AGGTAB", s2: "GXTXAYB" },
    rawString: "AGGTAB, GXTXAYB",
  },
  {
    id: "nexora",
    name: "NEXORA & EXPLORE",
    description: "Common subsequence match ('EXOR')",
    data: { s1: "NEXORA", s2: "EXPLORE" },
    rawString: "NEXORA, EXPLORE",
  },
];

const EDIT_PRESETS: InputPreset<{ s1: string; s2: string }>[] = [
  {
    id: "horse-ros",
    name: "HORSE → ROS",
    description: "Classic Levenshtein benchmark (3 edits)",
    data: { s1: "HORSE", s2: "ROS" },
    rawString: "HORSE, ROS",
  },
  {
    id: "intention-execution",
    name: "INTENTION → EXECUTION",
    description: "Multi-character substitution & insertion (5 edits)",
    data: { s1: "INTENTION", s2: "EXECUTION" },
    rawString: "INTENTION, EXECUTION",
  },
  {
    id: "kitten-sitting",
    name: "KITTEN → SITTING",
    description: "Common NLP test pair (3 edits)",
    data: { s1: "KITTEN", s2: "SITTING" },
    rawString: "KITTEN, SITTING",
  },
];

const ROD_PRESETS: InputPreset<number[]>[] = [
  {
    id: "clrs-rod",
    name: "CLRS Textbook Prices (Length 1..8)",
    description: "Prices: [1, 5, 8, 9, 10, 17, 17, 20]",
    data: [1, 5, 8, 9, 10, 17, 17, 20],
    rawString: "1, 5, 8, 9, 10, 17, 17, 20",
  },
  {
    id: "linear-rod",
    name: "Even Uniform Prices",
    description: "Prices: [2, 5, 7, 11, 14, 18]",
    data: [2, 5, 7, 11, 14, 18],
    rawString: "2, 5, 7, 11, 14, 18",
  },
];

export default function DPAcceptorVisualizer() {
  const [mode, setMode] = useState<DPMode>("lcs");

  // === 1. LCS State ===
  const [lcsS1, setLcsS1] = useState<string>("ALGO");
  const [lcsS2, setLcsS2] = useState<string>("LOG");
  const [lcsStep, setLcsStep] = useState<number>(0);

  // === 2. Edit Distance State ===
  const [editS1, setEditS1] = useState<string>("HORSE");
  const [editS2, setEditS2] = useState<string>("ROS");
  const [editStep, setEditStep] = useState<number>(0);

  // === 3. Rod Cutting State ===
  const [rodPrices, setRodPrices] = useState<number[]>([1, 5, 8, 9, 10, 17, 17, 20]);
  const [rodLength, setRodLength] = useState<number>(4);
  const [rodStep, setRodStep] = useState<number>(0);

  // === 4. Substring State ===
  const [subS1, setSubS1] = useState<string>("ABABC");
  const [subS2, setSubS2] = useState<string>("BABCA");
  const [subStep, setSubStep] = useState<number>(0);

  // === 5. Fibonacci / Staircase State ===
  const [fibN, setFibN] = useState<number>(6);
  const [fibStep, setFibStep] = useState<number>(0);

  // --- Compute LCS Table & Steps ---
  const { lcsDp, lcsStepsList, lcsReconstruction } = useMemo(() => {
    const m = lcsS1.length;
    const n = lcsS2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const steps: { i: number; j: number; match: boolean; val: number; explanation: string }[] = [];

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c1 = lcsS1[i - 1];
        const c2 = lcsS2[j - 1];
        if (c1 === c2) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            i,
            j,
            match: true,
            val: dp[i][j],
            explanation: `Match '${c1}' === '${c2}'! dp[${i}][${j}] = 1 + dp[${i - 1}][${j - 1}] = ${dp[i][j]}`,
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            i,
            j,
            match: false,
            val: dp[i][j],
            explanation: `Mismatch '${c1}' ≠ '${c2}'. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
          });
        }
      }
    }

    // Reconstruct LCS string
    let i = m, j = n;
    const recon: string[] = [];
    while (i > 0 && j > 0) {
      if (lcsS1[i - 1] === lcsS2[j - 1]) {
        recon.unshift(lcsS1[i - 1]);
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }

    return { lcsDp: dp, lcsStepsList: steps, lcsReconstruction: recon.join("") };
  }, [lcsS1, lcsS2]);

  // --- Compute Edit Distance Table & Steps ---
  const { editDp, editStepsList, editTotalOps } = useMemo(() => {
    const m = editS1.length;
    const n = editS2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const steps: { i: number; j: number; op: string; val: number; explanation: string }[] = [];

    // Base cases
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const c1 = editS1[i - 1];
        const c2 = editS2[j - 1];
        if (c1 === c2) {
          dp[i][j] = dp[i - 1][j - 1];
          steps.push({
            i,
            j,
            op: "Match",
            val: dp[i][j],
            explanation: `'${c1}' === '${c2}': No edit needed. Inherit diagonal dp[${i - 1}][${j - 1}] = ${dp[i][j]}.`,
          });
        } else {
          const insertCost = dp[i][j - 1] + 1;
          const deleteCost = dp[i - 1][j] + 1;
          const replaceCost = dp[i - 1][j - 1] + 1;
          const minCost = Math.min(insertCost, deleteCost, replaceCost);
          dp[i][j] = minCost;

          const chosenOp = minCost === replaceCost ? "Substitute" : minCost === deleteCost ? "Delete" : "Insert";
          steps.push({
            i,
            j,
            op: chosenOp,
            val: dp[i][j],
            explanation: `Mismatch '${c1}' ≠ '${c2}'. min(Ins:${insertCost}, Del:${deleteCost}, Sub:${replaceCost}) = ${minCost} (${chosenOp}).`,
          });
        }
      }
    }

    return { editDp: dp, editStepsList: steps, editTotalOps: dp[m][n] };
  }, [editS1, editS2]);

  // --- Compute Rod Cutting Table & Steps ---
  const { rodRevenue, rodCuts, rodStepsList } = useMemo(() => {
    const r: number[] = new Array(rodLength + 1).fill(0);
    const s: number[] = new Array(rodLength + 1).fill(0);
    const steps: { j: number; bestRev: number; firstCut: number; explanation: string }[] = [];

    for (let j = 1; j <= rodLength; j++) {
      let maxVal = -Infinity;
      let bestFirstCut = 1;

      for (let i = 1; i <= j; i++) {
        const p = i <= rodPrices.length ? rodPrices[i - 1] : 0;
        const candidate = p + r[j - i];
        if (candidate > maxVal) {
          maxVal = candidate;
          bestFirstCut = i;
        }
      }

      r[j] = maxVal;
      s[j] = bestFirstCut;
      steps.push({
        j,
        bestRev: maxVal,
        firstCut: bestFirstCut,
        explanation: `Rod of length ${j}m: Cut ${bestFirstCut}m (price $${rodPrices[bestFirstCut - 1] || 0}) + optimal remaining ${j - bestFirstCut}m (rev $${r[j - bestFirstCut]}) = max revenue $${maxVal}.`,
      });
    }

    // Trace cut decomposition
    const cuts: number[] = [];
    let rem = rodLength;
    while (rem > 0) {
      cuts.push(s[rem]);
      rem = rem - s[rem];
    }

    return { rodRevenue: r, rodCuts: cuts, rodStepsList: steps };
  }, [rodLength, rodPrices]);

  // --- Compute Substring Table ---
  const { subDp, subStepsList, maxSubLen, maxSubStr } = useMemo(() => {
    const m = subS1.length;
    const n = subS2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    const steps: { i: number; j: number; val: number; explanation: string }[] = [];
    let maxLen = 0;
    let endIdx = 0;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (subS1[i - 1] === subS2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          if (dp[i][j] > maxLen) {
            maxLen = dp[i][j];
            endIdx = i;
          }
          steps.push({
            i,
            j,
            val: dp[i][j],
            explanation: `Contiguous match '${subS1[i - 1]}' === '${subS2[j - 1]}'! Substring length = ${dp[i][j]}.`,
          });
        } else {
          dp[i][j] = 0;
          steps.push({
            i,
            j,
            val: 0,
            explanation: `Mismatch. Contiguous streak breaks → dp[${i}][${j}] = 0.`,
          });
        }
      }
    }

    return {
      subDp: dp,
      subStepsList: steps,
      maxSubLen: maxLen,
      maxSubStr: subS1.slice(endIdx - maxLen, endIdx),
    };
  }, [subS1, subS2]);

  // --- Compute Fibonacci / Staircase Steps ---
  const fibTable = useMemo(() => {
    const table: { n: number; val: number; explanation: string }[] = [];
    table.push({ n: 0, val: 1, explanation: "Base case: Ways(0) = 1 (ground state / 0 steps)" });
    if (fibN >= 1) table.push({ n: 1, val: 1, explanation: "Base case: Ways(1) = 1 (single 1-step leap)" });
    for (let i = 2; i <= fibN; i++) {
      const v = table[i - 1].val + table[i - 2].val;
      table.push({
        n: i,
        val: v,
        explanation: `Staircase step ${i}: Ways(${i}) = Ways(${i - 1}) + Ways(${i - 2}) = ${table[i - 1].val} + ${table[i - 2].val} = ${v} ways.`,
      });
    }
    return table;
  }, [fibN]);

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-6">
      {/* Top Header & Mode Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Dynamic Programming Tableau Engine
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            {mode === "lcs" && "Longest Common Subsequence (LCS): 2D Matrix"}
            {mode === "editDistance" && "Edit Distance (Levenshtein): Alignment Matrix"}
            {mode === "rodCutting" && "Rod Cutting: Revenue Maximization & Cuts"}
            {mode === "substring" && "Longest Common Substring: Contiguous DP"}
            {mode === "fib" && "Staircase & Fibonacci: 1D Tabulation"}
          </h3>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-white/[0.04] bg-slate-100 border dark:border-white/10 border-[#E5E5E5] text-xs font-mono flex-wrap">
          <button
            type="button"
            onClick={() => { setMode("lcs"); setLcsStep(0); }}
            className={cn("px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1", mode === "lcs" ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm" : "text-slate-500 hover:text-white")}
          >
            <Layers className="w-3.5 h-3.5" /> LCS
          </button>
          <button
            type="button"
            onClick={() => { setMode("editDistance"); setEditStep(0); }}
            className={cn("px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1", mode === "editDistance" ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm" : "text-slate-500 hover:text-white")}
          >
            <AlignLeft className="w-3.5 h-3.5" /> Edit Distance
          </button>
          <button
            type="button"
            onClick={() => { setMode("rodCutting"); setRodStep(0); }}
            className={cn("px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1", mode === "rodCutting" ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm" : "text-slate-500 hover:text-white")}
          >
            <Scissors className="w-3.5 h-3.5" /> Rod Cutting
          </button>
          <button
            type="button"
            onClick={() => { setMode("substring"); setSubStep(0); }}
            className={cn("px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1", mode === "substring" ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm" : "text-slate-500 hover:text-white")}
          >
            <Split className="w-3.5 h-3.5" /> Substring
          </button>
          <button
            type="button"
            onClick={() => { setMode("fib"); setFibStep(0); }}
            className={cn("px-2.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1", mode === "fib" ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm" : "text-slate-500 hover:text-white")}
          >
            Staircase (Fib)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: LCS */}
      {/* ========================================================================= */}
      {mode === "lcs" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Cell {lcsStep + 1} of {lcsStepsList.length} | LCS: &quot;<strong className="text-emerald-500">{lcsReconstruction}</strong>&quot; (Length: {lcsDp[lcsS1.length][lcsS2.length]})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLcsStep(Math.max(0, lcsStep - 1))}
                disabled={lcsStep === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setLcsStep(Math.min(lcsStep + 1, lcsStepsList.length - 1))}
                disabled={lcsStep >= lcsStepsList.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => setLcsStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom LCS Strings"
            subtitle="Provide two strings to compute their optimal common subsequence table."
            initialValue={`${lcsS1}, ${lcsS2}`}
            placeholder="e.g. ALGORITHM, LOGARITHM"
            presets={LCS_PRESETS}
            onApply={(raw) => {
              const res = parseStringPair(raw, { maxLen: 12 });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setLcsS1(res.data.s1.toUpperCase());
              setLcsS2(res.data.s2.toUpperCase());
              setLcsStep(0);
              return { isValid: true };
            }}
            onReset={() => {
              setLcsS1("ALGO");
              setLcsS2("LOG");
              setLcsStep(0);
            }}
            summaryBadge={`"${lcsS1}" vs "${lcsS2}" → Length ${lcsDp[lcsS1.length][lcsS2.length]}`}
          />

          {/* LCS 2D Matrix Table */}
          <div className="overflow-x-auto p-2 rounded-xl dark:bg-black/30 bg-slate-50 border dark:border-white/10 border-slate-200">
            <table className="w-full border-collapse font-mono text-xs text-center">
              <thead>
                <tr>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">i \ j</th>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">Ø</th>
                  {lcsS2.split("").map((ch, idx) => (
                    <th key={idx} className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {ch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: lcsS1.length + 1 }).map((_, r) => (
                  <tr key={r}>
                    <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {r === 0 ? "Ø" : lcsS1[r - 1]}
                    </th>
                    {Array.from({ length: lcsS2.length + 1 }).map((_, c) => {
                      const cur = lcsStepsList[lcsStep];
                      const isCurrent = cur && cur.i === r && cur.j === c;

                      return (
                        <td
                          key={c}
                          className={cn(
                            "p-2.5 border dark:border-white/10 border-slate-200 transition-all font-bold",
                            isCurrent
                              ? "bg-amber-400/30 text-amber-500 scale-105 ring-2 ring-amber-400"
                              : r === 0 || c === 0
                              ? "opacity-50 text-slate-400"
                              : "dark:text-slate-200 text-slate-700"
                          )}
                        >
                          {lcsDp[r][c]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {lcsStepsList[lcsStep]?.explanation || "Recurrence: dp[i][j] = (s1[i]==s2[j]) ? 1 + dp[i-1][j-1] : max(dp[i-1][j], dp[i][j-1])"}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: EDIT DISTANCE (LEVENSHTEIN) (PHASE 1, ITEM 2) */}
      {/* ========================================================================= */}
      {mode === "editDistance" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Cell {editStep + 1} of {editStepsList.length} | Minimum Edits: <strong className="text-amber-500 text-sm">{editTotalOps}</strong> operations
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditStep(Math.max(0, editStep - 1))}
                disabled={editStep === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setEditStep(Math.min(editStep + 1, editStepsList.length - 1))}
                disabled={editStep >= editStepsList.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => setEditStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Edit Distance Strings"
            subtitle="Provide Source and Target strings to calculate minimum Insert, Delete, and Substitute operations."
            initialValue={`${editS1}, ${editS2}`}
            placeholder="e.g. HORSE, ROS"
            presets={EDIT_PRESETS}
            onApply={(raw) => {
              const res = parseStringPair(raw, { maxLen: 12 });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setEditS1(res.data.s1.toUpperCase());
              setEditS2(res.data.s2.toUpperCase());
              setEditStep(0);
              return { isValid: true };
            }}
            onReset={() => {
              setEditS1("HORSE");
              setEditS2("ROS");
              setEditStep(0);
            }}
            summaryBadge={`"${editS1}" → "${editS2}" (Min Edits: ${editTotalOps})`}
          />

          {/* Edit Distance 2D Matrix */}
          <div className="overflow-x-auto p-2 rounded-xl dark:bg-black/30 bg-slate-50 border dark:border-white/10 border-slate-200">
            <table className="w-full border-collapse font-mono text-xs text-center">
              <thead>
                <tr>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">i \ j</th>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">ε</th>
                  {editS2.split("").map((ch, idx) => (
                    <th key={idx} className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {ch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: editS1.length + 1 }).map((_, r) => (
                  <tr key={r}>
                    <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {r === 0 ? "ε" : editS1[r - 1]}
                    </th>
                    {Array.from({ length: editS2.length + 1 }).map((_, c) => {
                      const cur = editStepsList[editStep];
                      const isCurrent = cur && cur.i === r && cur.j === c;

                      return (
                        <td
                          key={c}
                          className={cn(
                            "p-2.5 border dark:border-white/10 border-slate-200 transition-all font-bold",
                            isCurrent
                              ? "bg-amber-400/30 text-amber-500 scale-105 ring-2 ring-amber-400"
                              : r === 0 || c === 0
                              ? "text-slate-400"
                              : "dark:text-slate-200 text-slate-700"
                          )}
                        >
                          {editDp[r][c]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {editStepsList[editStep]?.explanation || "Recurrence: dp[i][j] = (s1[i]==s2[j]) ? dp[i-1][j-1] : 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])"}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ROD CUTTING (PHASE 1, ITEM 4) */}
      {/* ========================================================================= */}
      {mode === "rodCutting" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Length: {rodLength}m | Max Revenue: <strong className="text-emerald-500 text-sm">${rodRevenue[rodLength]}</strong>
              </span>
              <span className="text-xs font-mono dark:text-cyan-300 text-[#FF7A00] font-semibold">
                Optimal Decomposition: {rodCuts.map((c) => `${c}m`).join(" + ")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRodStep(Math.max(0, rodStep - 1))}
                disabled={rodStep === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setRodStep(Math.min(rodStep + 1, rodStepsList.length - 1))}
                disabled={rodStep >= rodStepsList.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => setRodStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Price Array"
            subtitle="Prices for cut lengths 1m, 2m, 3m... up to 8m."
            initialValue={rodPrices.join(", ")}
            placeholder="e.g. 1, 5, 8, 9, 10, 17, 17, 20"
            presets={ROD_PRESETS}
            onApply={(raw) => {
              const res = parseNumberArray(raw, { minSize: 4, maxSize: 10, minVal: 1, allowFloat: false });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setRodPrices(res.data);
              setRodStep(0);
              return { isValid: true };
            }}
            onReset={() => {
              setRodPrices([1, 5, 8, 9, 10, 17, 17, 20]);
              setRodLength(4);
              setRodStep(0);
            }}
            summaryBadge={`Prices: [${rodPrices.slice(0, 4).join(", ")}...]`}
          />

          {/* Rod Length Selector */}
          <div className="flex items-center gap-2 p-3 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] font-mono text-xs">
            <span className="text-slate-400">Target Rod Length (n):</span>
            {[2, 3, 4, 5, 6, 7, 8].map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => {
                  setRodLength(len);
                  setRodStep(0);
                }}
                className={cn(
                  "w-8 h-8 rounded-lg border font-bold transition-all",
                  rodLength === len
                    ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] border-transparent"
                    : "dark:border-white/10 border-slate-300 text-slate-500"
                )}
              >
                {len}m
              </button>
            ))}
          </div>

          {/* Visual Cut Rod Segments */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 block">Optimal Cut Segments:</span>
            <div className="flex h-12 w-full rounded-xl overflow-hidden border dark:border-white/20 border-slate-300 bg-slate-100 dark:bg-black/40">
              {rodCuts.map((cutLen, idx) => {
                const widthPercent = (cutLen / rodLength) * 100;
                const price = cutLen <= rodPrices.length ? rodPrices[cutLen - 1] : 0;
                return (
                  <div
                    key={idx}
                    style={{ width: `${widthPercent}%` }}
                    className="h-full border-r last:border-r-0 border-white/20 bg-gradient-to-r from-emerald-500 to-teal-600 flex flex-col items-center justify-center text-white font-mono text-xs font-bold"
                  >
                    <span>{cutLen}m</span>
                    <span className="text-[10px] opacity-80">${price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1D Revenue DP Table */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {Array.from({ length: rodLength + 1 }).map((_, j) => (
              <div
                key={j}
                className={cn(
                  "p-3 rounded-xl border text-center font-mono transition-all",
                  j === rodStep + 1
                    ? "bg-amber-400/20 border-amber-400 text-amber-500 font-bold"
                    : "dark:bg-white/[0.04] bg-white border-slate-200 dark:border-white/10"
                )}
              >
                <span className="text-[10px] text-slate-400 block">r[{j}]</span>
                <span className="text-sm font-bold">${rodRevenue[j]}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {rodStepsList[rodStep]?.explanation || "Recurrence: r[j] = max_{1 <= i <= j} (p[i] + r[j-i])"}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: LONGEST COMMON SUBSTRING (PHASE 2, ITEM 14) */}
      {/* ========================================================================= */}
      {mode === "substring" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Cell {subStep + 1} of {subStepsList.length} | Longest Contiguous Substring: &quot;<strong className="text-cyan-400">{maxSubStr}</strong>&quot; (Length: {maxSubLen})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubStep(Math.max(0, subStep - 1))}
                disabled={subStep === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setSubStep(Math.min(subStep + 1, subStepsList.length - 1))}
                disabled={subStep >= subStepsList.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => setSubStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Substring Strings"
            subtitle="Provide two strings to compute their contiguous common substring."
            initialValue={`${subS1}, ${subS2}`}
            placeholder="e.g. ABABC, BABCA"
            presets={[
              { id: "default-sub", name: "ABABC vs BABCA", description: "Matches 'BABC' (length 4)", data: { s1: "ABABC", s2: "BABCA" }, rawString: "ABABC, BABCA" },
            ]}
            onApply={(raw) => {
              const res = parseStringPair(raw, { maxLen: 12 });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setSubS1(res.data.s1.toUpperCase());
              setSubS2(res.data.s2.toUpperCase());
              setSubStep(0);
              return { isValid: true };
            }}
            onReset={() => {
              setSubS1("ABABC");
              setSubS2("BABCA");
              setSubStep(0);
            }}
            summaryBadge={`"${subS1}" vs "${subS2}" → "${maxSubStr}"`}
          />

          <div className="overflow-x-auto p-2 rounded-xl dark:bg-black/30 bg-slate-50 border dark:border-white/10 border-slate-200">
            <table className="w-full border-collapse font-mono text-xs text-center">
              <thead>
                <tr>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">i \ j</th>
                  <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5">Ø</th>
                  {subS2.split("").map((ch, idx) => (
                    <th key={idx} className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {ch}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: subS1.length + 1 }).map((_, r) => (
                  <tr key={r}>
                    <th className="p-2 border dark:border-white/10 border-slate-200 bg-black/5 dark:bg-white/5 font-bold text-[#FF7A00] dark:text-cyan-300">
                      {r === 0 ? "Ø" : subS1[r - 1]}
                    </th>
                    {Array.from({ length: subS2.length + 1 }).map((_, c) => {
                      const cur = subStepsList[subStep];
                      const isCurrent = cur && cur.i === r && cur.j === c;

                      return (
                        <td
                          key={c}
                          className={cn(
                            "p-2.5 border dark:border-white/10 border-slate-200 transition-all font-bold",
                            isCurrent
                              ? "bg-cyan-500/30 text-cyan-400 ring-2 ring-cyan-400 scale-105"
                              : subDp[r][c] > 0
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "opacity-40 text-slate-400"
                          )}
                        >
                          {subDp[r][c]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {subStepsList[subStep]?.explanation || "Recurrence: dp[i][j] = (s1[i]==s2[j]) ? 1 + dp[i-1][j-1] : 0"}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 5: FIBONACCI & STAIRCASE (PHASE 2, ITEM 13) */}
      {/* ========================================================================= */}
      {mode === "fib" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Staircase N = {fibN} | Total Distinct Paths: <strong className="text-emerald-500 text-sm">{fibTable[fibN].val}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFibStep(Math.max(0, fibStep - 1))}
                disabled={fibStep === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setFibStep(Math.min(fibStep + 1, fibTable.length - 1))}
                disabled={fibStep >= fibTable.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => setFibStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* 1D Cell Row */}
          <div className="flex flex-wrap gap-2 p-2">
            {fibTable.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-xl border text-center font-mono min-w-[70px] transition-all",
                  idx === fibStep
                    ? "bg-amber-400/25 border-amber-400 text-amber-500 font-bold scale-105"
                    : idx < fibStep
                    ? "dark:bg-white/[0.06] bg-white border-emerald-500/30 text-emerald-500"
                    : "dark:bg-black/20 bg-slate-100 opacity-40"
                )}
              >
                <span className="text-[10px] text-slate-400 block">Step {item.n}</span>
                <span className="text-base font-bold">{item.val}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {fibTable[fibStep]?.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
