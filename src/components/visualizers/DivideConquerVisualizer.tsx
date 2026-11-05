"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Sparkles, SkipForward, SkipBack, RotateCcw, Search, Play, Pause, Disc, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseNumberArray } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

type DCMode = "binarySearch" | "hanoi" | "minMax" | "quickselect";

// --- Binary Search Types ---
interface StepRecord {
  low: number;
  mid: number;
  high: number;
  found: boolean;
  explanation: string;
}

const BINARY_PRESETS: InputPreset<number[]>[] = [
  {
    id: "default",
    name: "Classic Sorted (12 items)",
    description: "Standard ascending range for binary halving",
    data: [3, 9, 14, 19, 25, 33, 42, 51, 64, 77, 88, 95],
    rawString: "3, 9, 14, 19, 25, 33, 42, 51, 64, 77, 88, 95",
  },
  {
    id: "powers-of-two",
    name: "Geometric / Powers of 2",
    description: "Binary search on powers: 1 to 512",
    data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
    rawString: "1, 2, 4, 8, 16, 32, 64, 128, 256, 512",
  },
  {
    id: "negatives",
    name: "Mixed Positive & Negative",
    description: "Contains negative and zero coordinates",
    data: [-45, -28, -15, -4, 0, 7, 18, 33, 49, 72, 88],
    rawString: "-45, -28, -15, -4, 0, 7, 18, 33, 49, 72, 88",
  },
];

// --- Towers of Hanoi Types ---
interface HanoiMove {
  disk: number;
  from: "A" | "B" | "C";
  to: "A" | "B" | "C";
  stepNumber: number;
  pegsState: { A: number[]; B: number[]; C: number[] };
  explanation: string;
}

// --- Min-Max D&C Types ---
interface MinMaxStep {
  l: number;
  r: number;
  min: number;
  max: number;
  comparisons: number;
  type: "base1" | "base2" | "combine";
  explanation: string;
}

// --- Quickselect Types ---
interface QuickselectStep {
  low: number;
  high: number;
  pivotIdx: number;
  pivotVal: number;
  arrSnapshot: number[];
  k: number;
  found: boolean;
  explanation: string;
}

const DISK_COLORS = [
  "from-rose-500 to-red-600",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-600",
  "from-cyan-400 to-blue-600",
  "from-indigo-400 to-purple-600",
  "from-fuchsia-400 to-pink-600",
];

export default function DivideConquerVisualizer() {
  const [activeMode, setActiveMode] = useState<DCMode>("binarySearch");

  // === 1. Binary Search State ===
  const [elements, setElements] = useState<number[]>([3, 9, 14, 19, 25, 33, 42, 51, 64, 77, 88, 95]);
  const [target, setTarget] = useState<number>(42);
  const [customTargetInput, setCustomTargetInput] = useState<string>("42");
  const [bsStepIndex, setBsStepIndex] = useState<number>(0);

  // === 2. Towers of Hanoi State ===
  const [hanoiDisks, setHanoiDisks] = useState<number>(3);
  const [hanoiStepIndex, setHanoiStepIndex] = useState<number>(0);
  const [isHanoiPlaying, setIsHanoiPlaying] = useState<boolean>(false);
  const [hanoiSpeed, setHanoiSpeed] = useState<number>(600);
  const hanoiTimerRef = useRef<NodeJS.Timeout | null>(null);

  // === 3. Min-Max State ===
  const [minMaxArray, setMinMaxArray] = useState<number[]>([22, 13, -5, 88, 45, 9, 102, 34]);
  const [minMaxStepIndex, setMinMaxStepIndex] = useState<number>(0);

  // === 4. Quickselect State ===
  const [qsArray, setQsArray] = useState<number[]>([65, 28, 14, 82, 45, 93, 7, 33, 56]);
  const [qsK, setQsK] = useState<number>(4); // 4th smallest
  const [qsStepIndex, setQsStepIndex] = useState<number>(0);

  // --- Compute Binary Search Steps ---
  const bsSteps: StepRecord[] = useMemo(() => {
    let low = 0;
    let high = elements.length - 1;
    const records: StepRecord[] = [];

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const val = elements[mid];

      if (val === target) {
        records.push({
          low,
          mid,
          high,
          found: true,
          explanation: `Pivot matched! elements[mid=${mid}] === ${val}. Target ${target} located in O(1) comparison at step ${records.length + 1}.`,
        });
        break;
      } else if (val < target) {
        records.push({
          low,
          mid,
          high,
          found: false,
          explanation: `elements[mid=${mid}] (${val}) < target (${target}). Discard left half [${low}..${mid}]. Recurse into right window [${mid + 1}..${high}].`,
        });
        low = mid + 1;
      } else {
        records.push({
          low,
          mid,
          high,
          found: false,
          explanation: `elements[mid=${mid}] (${val}) > target (${target}). Discard right half [${mid}..${high}]. Recurse into left window [${low}..${mid - 1}].`,
        });
        high = mid - 1;
      }
    }

    if (records.length === 0 || !records[records.length - 1].found) {
      records.push({
        low,
        mid: -1,
        high,
        found: false,
        explanation: `Search space exhausted (low=${low} > high=${high}). Target ${target} does not exist in array.`,
      });
    }

    return records;
  }, [elements, target]);

  // --- Compute Towers of Hanoi Steps ---
  const hanoiSteps: HanoiMove[] = useMemo(() => {
    const moves: { disk: number; from: "A" | "B" | "C"; to: "A" | "B" | "C" }[] = [];

    function solve(n: number, from: "A" | "B" | "C", to: "A" | "B" | "C", aux: "A" | "B" | "C") {
      if (n === 1) {
        moves.push({ disk: 1, from, to });
        return;
      }
      solve(n - 1, from, aux, to);
      moves.push({ disk: n, from, to });
      solve(n - 1, aux, to, from);
    }

    solve(hanoiDisks, "A", "C", "B");

    // Track peg snapshots step by step
    const currentPegs: { A: number[]; B: number[]; C: number[] } = {
      A: Array.from({ length: hanoiDisks }, (_, i) => hanoiDisks - i), // e.g. [3, 2, 1]
      B: [],
      C: [],
    };

    const recorded: HanoiMove[] = [
      {
        disk: 0,
        from: "A",
        to: "A",
        stepNumber: 0,
        pegsState: { A: [...currentPegs.A], B: [...currentPegs.B], C: [...currentPegs.C] },
        explanation: `Initial state: All ${hanoiDisks} disks arranged monotonically on Source Peg A. Target: Move all disks to Peg C using Auxiliary Peg B.`,
      },
    ];

    moves.forEach((m, idx) => {
      const movedDisk = currentPegs[m.from].pop()!;
      // Strict Invariant Check: Disk legality verification
      const targetTop = currentPegs[m.to][currentPegs[m.to].length - 1];
      const isLegal = targetTop === undefined || targetTop > movedDisk;
      currentPegs[m.to].push(movedDisk);
      recorded.push({
        disk: m.disk,
        from: m.from,
        to: m.to,
        stepNumber: idx + 1,
        pegsState: { A: [...currentPegs.A], B: [...currentPegs.B], C: [...currentPegs.C] },
        explanation: `Step ${idx + 1}/${moves.length}: Move disk ${m.disk} from Peg ${m.from} to Peg ${m.to}. Legal move verified (${isLegal ? "Valid" : "Illegal"}): ${targetTop !== undefined ? `disk ${movedDisk} placed on larger disk ${targetTop}` : `disk ${movedDisk} placed on empty peg`}.`,
      });
    });

    return recorded;
  }, [hanoiDisks]);

  // Towers of Hanoi auto-play ticker
  useEffect(() => {
    if (isHanoiPlaying) {
      hanoiTimerRef.current = setInterval(() => {
        setHanoiStepIndex((prev) => {
          if (prev >= hanoiSteps.length - 1) {
            setIsHanoiPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, hanoiSpeed);
    } else {
      if (hanoiTimerRef.current) clearInterval(hanoiTimerRef.current);
    }
    return () => {
      if (hanoiTimerRef.current) clearInterval(hanoiTimerRef.current);
    };
  }, [isHanoiPlaying, hanoiSteps.length, hanoiSpeed]);

  // --- Compute Min-Max Tournament Steps ---
  const minMaxSteps: MinMaxStep[] = useMemo(() => {
    const stepsList: MinMaxStep[] = [];
    let compCount = 0;

    function solveMinMax(arr: number[], l: number, r: number): { min: number; max: number } {
      if (l === r) {
        const res = { min: arr[l], max: arr[l] };
        stepsList.push({
          l,
          r,
          min: res.min,
          max: res.max,
          comparisons: compCount,
          type: "base1",
          explanation: `Base Case (1 element at index ${l}): min = max = ${arr[l]}. Requires 0 comparisons.`,
        });
        return res;
      }

      if (r === l + 1) {
        compCount += 1;
        const isLess = arr[l] < arr[r];
        const res = {
          min: isLess ? arr[l] : arr[r],
          max: isLess ? arr[r] : arr[l],
        };
        stepsList.push({
          l,
          r,
          min: res.min,
          max: res.max,
          comparisons: compCount,
          type: "base2",
          explanation: `Base Case (2 elements [${arr[l]}, ${arr[r]}]): 1 comparison yields min=${res.min}, max=${res.max}.`,
        });
        return res;
      }

      const mid = Math.floor((l + r) / 2);
      const left = solveMinMax(arr, l, mid);
      const right = solveMinMax(arr, mid + 1, r);

      compCount += 2; // 1 comparison for min, 1 for max
      const combined = {
        min: Math.min(left.min, right.min),
        max: Math.max(left.max, right.max),
      };

      stepsList.push({
        l,
        r,
        min: combined.min,
        max: combined.max,
        comparisons: compCount,
        type: "combine",
        explanation: `Combine partitions [${l}..${mid}] and [${mid + 1}..${r}]: min(${left.min}, ${right.min})=${combined.min}, max(${left.max}, ${right.max})=${combined.max}. (2 comparisons).`,
      });

      return combined;
    }

    solveMinMax(minMaxArray, 0, minMaxArray.length - 1);
    return stepsList;
  }, [minMaxArray]);

  // --- Compute Quickselect Steps ---
  const qsSteps: QuickselectStep[] = useMemo(() => {
    const list: QuickselectStep[] = [];
    const arr = [...qsArray];

    function partition(low: number, high: number): number {
      const pivot = arr[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
          i++;
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;
        }
      }
      const tmp = arr[i + 1];
      arr[i + 1] = arr[high];
      arr[high] = tmp;
      return i + 1;
    }

    function select(low: number, high: number, kRank: number) {
      if (low <= high) {
        const pivotIndex = partition(low, high);
        const pivotVal = arr[pivotIndex];

        if (pivotIndex === kRank - 1) {
          list.push({
            low,
            high,
            pivotIdx: pivotIndex,
            pivotVal,
            arrSnapshot: [...arr],
            k: kRank,
            found: true,
            explanation: `Found! Pivot index ${pivotIndex} matches rank ${kRank}-1. The ${kRank}th smallest element is ${pivotVal}.`,
          });
          return;
        } else if (pivotIndex > kRank - 1) {
          list.push({
            low,
            high,
            pivotIdx: pivotIndex,
            pivotVal,
            arrSnapshot: [...arr],
            k: kRank,
            found: false,
            explanation: `Pivot index ${pivotIndex} > target rank ${kRank}-1. Discard right sub-array. Recurse only on left partition [${low}..${pivotIndex - 1}].`,
          });
          select(low, pivotIndex - 1, kRank);
        } else {
          list.push({
            low,
            high,
            pivotIdx: pivotIndex,
            pivotVal,
            arrSnapshot: [...arr],
            k: kRank,
            found: false,
            explanation: `Pivot index ${pivotIndex} < target rank ${kRank}-1. Discard left sub-array. Recurse only on right partition [${pivotIndex + 1}..${high}].`,
          });
          select(pivotIndex + 1, high, kRank);
        }
      }
    }

    select(0, arr.length - 1, Math.min(qsK, arr.length));
    return list;
  }, [qsArray, qsK]);

  const activeBsStep = bsSteps[bsStepIndex] || bsSteps[0];
  const activeHanoiStep = hanoiSteps[hanoiStepIndex] || hanoiSteps[0];
  const activeMinMaxStep = minMaxSteps[minMaxStepIndex] || minMaxSteps[0];
  const activeQsStep = qsSteps[qsStepIndex] || qsSteps[0];

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-6">
      {/* Top Header & Paradigm Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Divide &amp; Conquer Problem Suite
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            {activeMode === "binarySearch" && "Binary Search: Logarithmic Interval Halving"}
            {activeMode === "hanoi" && "Towers of Hanoi: Multi-Phase State Recursion"}
            {activeMode === "minMax" && "Finding Min-Max: Tournament Tree Decomposition"}
            {activeMode === "quickselect" && "Quickselect: Expected O(N) Order Statistics"}
          </h3>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-white/[0.04] bg-slate-100 border dark:border-white/10 border-[#E5E5E5] text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveMode("binarySearch")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
              activeMode === "binarySearch"
                ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Search className="w-3.5 h-3.5" /> Binary Search
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("hanoi");
              setIsHanoiPlaying(false);
              setHanoiStepIndex(0);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
              activeMode === "hanoi"
                ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Disc className="w-3.5 h-3.5" /> Towers of Hanoi
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("minMax");
              setMinMaxStepIndex(0);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
              activeMode === "minMax"
                ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Trophy className="w-3.5 h-3.5" /> Min-Max Tournament
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode("quickselect");
              setQsStepIndex(0);
            }}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5",
              activeMode === "quickselect"
                ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Target className="w-3.5 h-3.5" /> Quickselect
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: BINARY SEARCH */}
      {/* ========================================================================= */}
      {activeMode === "binarySearch" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Step {bsStepIndex + 1} of {bsSteps.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBsStepIndex(Math.max(0, bsStepIndex - 1))}
                disabled={bsStepIndex === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setBsStepIndex(Math.min(bsStepIndex + 1, bsSteps.length - 1))}
                disabled={bsStepIndex >= bsSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next
              </button>
              <button
                type="button"
                onClick={() => setBsStepIndex(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Array & Presets"
            subtitle="Enter 4 to 24 numbers (comma or space separated). Input is auto-sorted to maintain the Binary Search invariant."
            initialValue={elements.join(", ")}
            placeholder="e.g. 2, 8, 14, 25, 33, 47, 56, 72"
            presets={BINARY_PRESETS}
            onApply={(raw) => {
              const res = parseNumberArray(raw, { minSize: 4, maxSize: 24, allowFloat: false });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              const sorted = [...res.data].sort((a, b) => a - b);
              setElements(sorted);
              const midVal = sorted[Math.floor(sorted.length / 2)];
              setTarget(midVal);
              setCustomTargetInput(String(midVal));
              setBsStepIndex(0);
              return { isValid: true };
            }}
            onReset={() => {
              setElements(BINARY_PRESETS[0].data);
              setTarget(42);
              setBsStepIndex(0);
            }}
            summaryBadge={`N = ${elements.length} items | Target = ${target}`}
          />

          {/* Target Query Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5]">
            <div className="flex flex-wrap items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">Query Target:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {elements.slice(0, 6).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setTarget(val);
                      setCustomTargetInput(String(val));
                      setBsStepIndex(0);
                    }}
                    className={cn(
                      "px-2 py-0.5 text-xs font-mono rounded-lg border transition-all",
                      target === val
                        ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] font-bold dark:text-cyan-300 text-[#FF7A00]"
                        : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-400 text-[#737373]"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const p = Number(customTargetInput.trim());
                  if (!isNaN(p)) {
                    setTarget(p);
                    setBsStepIndex(0);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="number"
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(e.target.value)}
                  className="w-16 px-2 py-0.5 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-300 dark:bg-black/30 bg-white"
                />
                <button type="submit" className="px-2 py-0.5 text-xs font-mono rounded-lg border dark:border-white/10 bg-slate-100 dark:bg-white/5 font-semibold">
                  Set
                </button>
              </form>
            </div>
            <span className="text-xs font-mono text-slate-400">Recurrence: T(n) = T(n/2) + O(1) → Θ(log n)</span>
          </div>

          {/* Array visualization */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-1.5">
            {elements.map((num, idx) => {
              const inRange = idx >= activeBsStep.low && idx <= activeBsStep.high;
              const isMid = idx === activeBsStep.mid;
              const isFound = isMid && activeBsStep.found;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-300 relative",
                    isFound
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30 scale-105"
                      : isMid
                      ? "dark:bg-[#0A84FF]/25 bg-[rgba(255,122,0,0.18)] dark:border-[#0A84FF] border-[#FF7A00] font-bold text-[#FF7A00] dark:text-cyan-300 scale-105"
                      : inRange
                      ? "dark:bg-white/[0.05] bg-white dark:border-white/20 border-slate-300 text-slate-700 dark:text-slate-200"
                      : "dark:bg-black/20 bg-slate-100/50 dark:border-white/5 border-slate-200 opacity-30"
                  )}
                >
                  <span className="text-[10px] font-mono text-slate-400">[{idx}]</span>
                  <span className="text-sm font-mono font-bold mt-0.5">{num}</span>
                  {idx === activeBsStep.low && (
                    <span className="absolute -bottom-4 text-[9px] font-mono font-bold text-amber-500">L</span>
                  )}
                  {idx === activeBsStep.mid && (
                    <span className="absolute -top-4 text-[9px] font-mono font-bold text-[#FF7A00] dark:text-cyan-400">MID</span>
                  )}
                  {idx === activeBsStep.high && (
                    <span className="absolute -bottom-4 text-[9px] font-mono font-bold text-indigo-400">R</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box */}
          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs flex items-center justify-between">
            <span className="dark:text-slate-200 text-[#171717]">{activeBsStep.explanation}</span>
            <span className="text-xs text-slate-400 shrink-0 ml-3">
              Low: {activeBsStep.low} | Mid: {activeBsStep.mid >= 0 ? activeBsStep.mid : "None"} | High: {activeBsStep.high}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TOWERS OF HANOI (PHASE 1, ITEM 1) */}
      {/* ========================================================================= */}
      {activeMode === "hanoi" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-1">
                Move {hanoiStepIndex} of {hanoiSteps.length - 1} | Optimal bound: 2^{hanoiDisks} - 1 = {Math.pow(2, hanoiDisks) - 1} moves
              </span>
              <span className="text-xs font-mono dark:text-cyan-300 text-[#FF7A00] font-semibold">
                Recurrence: T(n) = 2T(n-1) + 1 → Θ(2ⁿ) time, Θ(n) call stack space
              </span>
            </div>

            {/* Hanoi Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsHanoiPlaying(!isHanoiPlaying)}
                className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 rounded-lg"
              >
                {isHanoiPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isHanoiPlaying ? "Pause" : "Auto Solve"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHanoiPlaying(false);
                  setHanoiStepIndex(Math.max(0, hanoiStepIndex - 1));
                }}
                disabled={hanoiStepIndex === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHanoiPlaying(false);
                  setHanoiStepIndex(Math.min(hanoiStepIndex + 1, hanoiSteps.length - 1));
                }}
                disabled={hanoiStepIndex >= hanoiSteps.length - 1}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHanoiPlaying(false);
                  setHanoiStepIndex(0);
                }}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Config Bar: Disk count & speed */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Disks (N):</span>
              {[3, 4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setIsHanoiPlaying(false);
                    setHanoiDisks(count);
                    setHanoiStepIndex(0);
                  }}
                  className={cn(
                    "w-7 h-7 text-xs font-mono rounded-lg border font-bold transition-all",
                    hanoiDisks === count
                      ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] border-transparent"
                      : "dark:border-white/10 border-slate-300 text-slate-500 hover:border-slate-400"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Speed:</span>
              {[
                { label: "Slow", ms: 900 },
                { label: "Normal", ms: 500 },
                { label: "Fast", ms: 250 },
              ].map((s) => (
                <button
                  key={s.ms}
                  type="button"
                  onClick={() => setHanoiSpeed(s.ms)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
                    hanoiSpeed === s.ms
                      ? "dark:border-cyan-400 border-[#FF7A00] font-bold dark:text-cyan-300 text-[#FF7A00]"
                      : "dark:border-white/10 border-slate-300 text-slate-500"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Towers Graphic Canvas */}
          <div className="relative h-64 dark:bg-black/30 bg-[#F7F7F7] rounded-2xl border dark:border-white/10 border-slate-200 p-4 flex items-end justify-around">
            {(["A", "B", "C"] as const).map((pegId) => {
              const diskStack = activeHanoiStep.pegsState[pegId];
              const isSourcePeg = activeHanoiStep.from === pegId && hanoiStepIndex > 0;
              const isTargetPeg = activeHanoiStep.to === pegId && hanoiStepIndex > 0;

              return (
                <div key={pegId} className="flex flex-col items-center flex-1 h-full justify-end relative">
                  {/* Vertical Peg Rod */}
                  <div className="w-3.5 h-44 rounded-t-lg dark:bg-slate-700 bg-slate-300 absolute bottom-4 z-0 shadow-inner" />

                  {/* Stack of Disks on this peg */}
                  <div className="flex flex-col-reverse items-center gap-1.5 z-10 mb-4 w-full px-2">
                    {diskStack.map((diskSize) => {
                      const widthPercent = Math.max(25, (diskSize / hanoiDisks) * 85);
                      const colorGradient = DISK_COLORS[(diskSize - 1) % DISK_COLORS.length];

                      return (
                        <div
                          key={diskSize}
                          style={{ width: `${widthPercent}%` }}
                          className={cn(
                            "h-6 rounded-lg bg-gradient-to-r shadow-md flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-200 border border-white/20",
                            colorGradient
                          )}
                        >
                          {diskSize}
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal Base Platform */}
                  <div
                    className={cn(
                      "w-4/5 h-4 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all z-20",
                      isTargetPeg
                        ? "dark:bg-emerald-500/20 bg-emerald-100 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : isSourcePeg
                        ? "dark:bg-amber-500/20 bg-amber-100 border-amber-500 text-amber-600 dark:text-amber-400"
                        : "dark:bg-slate-800 bg-slate-200 dark:border-slate-700 border-slate-300 text-slate-500"
                    )}
                  >
                    Peg {pegId} {pegId === "A" ? "(Source)" : pegId === "B" ? "(Aux)" : "(Target)"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hanoi Step Explanation Banner */}
          <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs flex items-center justify-between">
            <span className="dark:text-slate-200 text-[#171717]">{activeHanoiStep.explanation}</span>
            {hanoiStepIndex === hanoiSteps.length - 1 && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-bold border border-emerald-500/30">
                Solved in {hanoiSteps.length - 1} Moves
              </span>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: FINDING MIN-MAX (PHASE 2, ITEM 11) */}
      {/* ========================================================================= */}
      {activeMode === "minMax" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Tournament Step {minMaxStepIndex + 1} of {minMaxSteps.length}
              </span>
              <span className="text-xs font-mono dark:text-cyan-300 text-[#FF7A00] font-semibold">
                D&amp;C Comparisons: ⌈3n/2⌡ - 2 = {Math.ceil((3 * minMaxArray.length) / 2) - 2} ops (vs Naive 2n - 2 = {2 * minMaxArray.length - 2} ops)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMinMaxStepIndex(Math.max(0, minMaxStepIndex - 1))}
                disabled={minMaxStepIndex === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setMinMaxStepIndex(Math.min(minMaxStepIndex + 1, minMaxSteps.length - 1))}
                disabled={minMaxStepIndex >= minMaxSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next
              </button>
              <button
                type="button"
                onClick={() => setMinMaxStepIndex(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Array for Min-Max Tournament"
            subtitle="Enter 4 to 16 integers to watch the tournament pair comparison tree."
            initialValue={minMaxArray.join(", ")}
            placeholder="e.g. 22, 13, -5, 88, 45, 9, 102, 34"
            presets={[
              {
                id: "default-8",
                name: "Classic 8 Elements",
                description: "Standard power-of-two tournament tree",
                data: [22, 13, -5, 88, 45, 9, 102, 34],
                rawString: "22, 13, -5, 88, 45, 9, 102, 34",
              },
              {
                id: "odd-7",
                name: "Odd 7 Elements",
                description: "Demonstrates unbalanced leaf handling",
                data: [19, 44, 2, 76, 5, 83, 12],
                rawString: "19, 44, 2, 76, 5, 83, 12",
              },
            ]}
            onApply={(raw) => {
              const res = parseNumberArray(raw, { minSize: 4, maxSize: 16, allowFloat: false });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setMinMaxArray(res.data);
              setMinMaxStepIndex(0);
              return { isValid: true };
            }}
            onReset={() => {
              setMinMaxArray([22, 13, -5, 88, 45, 9, 102, 34]);
              setMinMaxStepIndex(0);
            }}
            summaryBadge={`N = ${minMaxArray.length} items`}
          />

          {/* Array Tiles with Active Tournament Range */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {minMaxArray.map((val, idx) => {
              const isInActiveRange = idx >= activeMinMaxStep.l && idx <= activeMinMaxStep.r;
              const isCurrentMin = isInActiveRange && val === activeMinMaxStep.min;
              const isCurrentMax = isInActiveRange && val === activeMinMaxStep.max;

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    isCurrentMin && isCurrentMax
                      ? "bg-purple-500/20 border-purple-500 font-bold"
                      : isCurrentMin
                      ? "bg-cyan-500/20 border-cyan-500 font-bold text-cyan-600 dark:text-cyan-400"
                      : isCurrentMax
                      ? "bg-rose-500/20 border-rose-500 font-bold text-rose-600 dark:text-rose-400"
                      : isInActiveRange
                      ? "dark:bg-white/[0.08] bg-white border-amber-400/50"
                      : "dark:bg-black/20 bg-slate-100 opacity-40"
                  )}
                >
                  <span className="text-[10px] font-mono text-slate-400 block">[{idx}]</span>
                  <span className="text-base font-mono font-bold">{val}</span>
                  {isCurrentMin && <span className="text-[9px] font-mono font-bold text-cyan-500 block">MIN</span>}
                  {isCurrentMax && <span className="text-[9px] font-mono font-bold text-rose-500 block">MAX</span>}
                </div>
              );
            })}
          </div>

          {/* Tournament Telemetry */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card-base p-3 rounded-xl border dark:border-white/10 text-center font-mono">
              <span className="text-slate-400 text-xs block">Current Partition Min</span>
              <span className="text-lg font-bold text-cyan-400">{activeMinMaxStep.min}</span>
            </div>
            <div className="card-base p-3 rounded-xl border dark:border-white/10 text-center font-mono">
              <span className="text-slate-400 text-xs block">Current Partition Max</span>
              <span className="text-lg font-bold text-rose-400">{activeMinMaxStep.max}</span>
            </div>
            <div className="card-base p-3 rounded-xl border dark:border-white/10 text-center font-mono">
              <span className="text-slate-400 text-xs block">Comparisons Executed</span>
              <span className="text-lg font-bold text-amber-400">{activeMinMaxStep.comparisons}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {activeMinMaxStep.explanation}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: QUICKSELECT (PHASE 2, ITEM 12) */}
      {/* ========================================================================= */}
      {activeMode === "quickselect" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400 block">
                Quickselect Step {qsStepIndex + 1} of {qsSteps.length} | Target: Rank {qsK} (kth smallest)
              </span>
              <span className="text-xs font-mono dark:text-cyan-300 text-[#FF7A00] font-semibold">
                Expected Time: T(n) = T(n/2) + O(n) → O(n) Average (vs Sorting O(n log n))
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQsStepIndex(Math.max(0, qsStepIndex - 1))}
                disabled={qsStepIndex === 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setQsStepIndex(Math.min(qsStepIndex + 1, qsSteps.length - 1))}
                disabled={qsStepIndex >= qsSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next
              </button>
              <button
                type="button"
                onClick={() => setQsStepIndex(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          <CustomInputPanel
            title="Custom Array & Target Rank k"
            subtitle="Enter 4 to 16 numbers to find the kth smallest element."
            initialValue={qsArray.join(", ")}
            placeholder="e.g. 65, 28, 14, 82, 45, 93, 7, 33, 56"
            presets={[
              {
                id: "default-qs",
                name: "Unsorted 9 Elements",
                description: "Mixed unsorted elements",
                data: [65, 28, 14, 82, 45, 93, 7, 33, 56],
                rawString: "65, 28, 14, 82, 45, 93, 7, 33, 56",
              },
              {
                id: "duplicates-qs",
                name: "Duplicates & Ties Benchmark",
                description: "Contains recurring values (15, 8, 2)",
                data: [15, 3, 15, 8, 2, 8, 15, 1],
                rawString: "15, 3, 15, 8, 2, 8, 15, 1",
              },
              {
                id: "boundary-extremes",
                name: "Extremes Range Benchmark",
                description: "Negative, zero, and high integers",
                data: [-12, 0, 45, 100, -3, 88, 2],
                rawString: "-12, 0, 45, 100, -3, 88, 2",
              },
            ]}
            onApply={(raw) => {
              const res = parseNumberArray(raw, { minSize: 4, maxSize: 16, allowFloat: false });
              if (!res.isValid || !res.data) return { isValid: false, errors: res.errors };
              setQsArray(res.data);
              setQsStepIndex(0);
              return { isValid: true };
            }}
            onReset={() => {
              setQsArray([65, 28, 14, 82, 45, 93, 7, 33, 56]);
              setQsK(4);
              setQsStepIndex(0);
            }}
            summaryBadge={`N = ${qsArray.length} items | Rank k = ${qsK}`}
          />

          {/* Rank k Selector */}
          <div className="flex items-center gap-2 p-3 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] font-mono text-xs">
            <span className="text-slate-400">Select Target Rank k:</span>
            {Array.from({ length: qsArray.length }).map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => {
                  setQsK(i + 1);
                  setQsStepIndex(0);
                }}
                className={cn(
                  "w-7 h-7 rounded-lg border font-bold transition-all",
                  qsK === i + 1
                    ? "bg-[#FF7A00] text-white dark:bg-[#0A84FF] border-transparent"
                    : "dark:border-white/10 border-slate-300 text-slate-500"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Quickselect Array Snapshot */}
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
            {activeQsStep.arrSnapshot.map((val, idx) => {
              const isPivot = idx === activeQsStep.pivotIdx;
              const inActiveSubarray = idx >= activeQsStep.low && idx <= activeQsStep.high;

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all",
                    isPivot && activeQsStep.found
                      ? "bg-emerald-500/25 border-emerald-500 text-emerald-500 font-bold scale-105"
                      : isPivot
                      ? "bg-amber-500/20 border-amber-500 text-amber-500 font-bold scale-105"
                      : inActiveSubarray
                      ? "dark:bg-white/[0.05] bg-white border-slate-300 dark:border-white/20"
                      : "dark:bg-black/20 bg-slate-100 opacity-25"
                  )}
                >
                  <span className="text-[10px] font-mono text-slate-400 block">[{idx}]</span>
                  <span className="text-base font-mono font-bold">{val}</span>
                  {isPivot && (
                    <span className="text-[9px] font-mono font-bold block">
                      {activeQsStep.found ? "Kth MATCH" : "PIVOT"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
            {activeQsStep.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
