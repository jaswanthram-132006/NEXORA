"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseNumberArray } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

const COMPACT_SORTING_PRESETS: InputPreset<number[]>[] = [
  {
    id: "default",
    name: "Default (8 elements)",
    description: "Classic test array",
    data: [45, 23, 78, 12, 67, 34, 89, 56],
    rawString: "45, 23, 78, 12, 67, 34, 89, 56",
  },
  {
    id: "reverse",
    name: "Reverse Sorted",
    description: "Worst case decreasing order",
    data: [80, 70, 60, 50, 40, 30, 20, 10],
    rawString: "80, 70, 60, 50, 40, 30, 20, 10",
  },
  {
    id: "nearly-sorted",
    name: "Nearly Sorted",
    description: "Few out-of-order elements",
    data: [10, 20, 40, 30, 50, 70, 60, 80],
    rawString: "10, 20, 40, 30, 50, 70, 60, 80",
  },
  {
    id: "with-duplicates",
    name: "With Duplicates",
    description: "Repeated numbers",
    data: [20, 50, 20, 80, 10, 50, 10, 30],
    rawString: "20, 50, 20, 80, 10, 50, 10, 30",
  },
];

export default function SortingVisualizerCompact() {
  const [arr, setArr] = useState<number[]>([45, 23, 78, 12, 67, 34, 89, 56]);
  const [comparing, setComparing] = useState<[number, number] | null>(null);
  const [swapping, setSwapping] = useState<[number, number] | null>(null);
  const [sorted, setSorted] = useState<number[]>([]);
  const [stepMsg, setStepMsg] = useState<string>("Ready to sort. Click 'Step' to perform adjacent comparison.");

  const stepBubble = () => {
    const working = [...arr];
    const n = working.length;

    // If currently showing a swap, clear swap and continue
    if (swapping) {
      setSwapping(null);
    }

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!sorted.includes(j + 1) && (!comparing || comparing[0] !== j || comparing[1] !== j + 1)) {
          setComparing([j, j + 1]);
          if (working[j] > working[j + 1]) {
            const temp = working[j];
            working[j] = working[j + 1];
            working[j + 1] = temp;
            setArr(working);
            setSwapping([j, j + 1]);
            setStepMsg(`Swapped indices ${j} & ${j + 1} (${working[j + 1]} > ${working[j]})`);
          } else {
            setSwapping(null);
            setStepMsg(`In order: ${working[j]} ≤ ${working[j + 1]} (No swap needed)`);
          }
          return;
        }
      }
    }
    setSorted(Array.from({ length: n }, (_, i) => i));
    setComparing(null);
    setSwapping(null);
    setStepMsg("Array fully sorted!");
  };

  const reset = () => {
    setArr([45, 23, 78, 12, 67, 34, 89, 56]);
    setComparing(null);
    setSwapping(null);
    setSorted([]);
    setStepMsg("Reset to initial unsorted state.");
  };

  const handleApplyCustom = (raw: string) => {
    const res = parseNumberArray(raw, {
      minSize: 4,
      maxSize: 16,
      minVal: -999,
      maxVal: 999,
    });
    if (!res.isValid || !res.data) {
      return { isValid: false, errors: res.errors };
    }
    setArr(res.data);
    setComparing(null);
    setSwapping(null);
    setSorted([]);
    setStepMsg(`Loaded custom array with ${res.data.length} elements. Ready to step.`);
    return { isValid: true };
  };

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const valRange = maxVal - minVal;

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> In-Page Comparison Engine
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Interactive Sorting Bar Visualizer
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stepBubble}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <SkipForward className="w-3.5 h-3.5" /> Step
          </button>
          <button
            type="button"
            onClick={reset}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <Link
            href="/simulations/sorting"
            className="text-xs font-mono font-semibold dark:text-cyan-400 text-[#FF7A00] hover:underline flex items-center gap-1 ml-2"
          >
            Full Lab <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Synchronized Legend */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-mono mb-4 pb-3 border-b dark:border-white/5 border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm dark:bg-slate-700 bg-slate-300 border dark:border-white/10 border-slate-400" />
          <span className="dark:text-slate-400 text-slate-600">Untouched</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.8)]" />
          <span className="dark:text-blue-300 text-blue-700 font-medium">Comparing (Blue)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          <span className="dark:text-amber-300 text-amber-700 font-medium">Swapping (Yellow)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00D2FF] shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
          <span className="dark:text-cyan-300 text-cyan-700 font-medium">Sorted (Cyan)</span>
        </div>
      </div>

      {/* Custom Input Drawer for Compact Visualizer */}
      <CustomInputPanel
        title="Custom Array"
        subtitle="Experiment with 4 to 16 custom numbers"
        initialValue={arr.join(", ")}
        placeholder="e.g. 15, -4, 42, 8, 23, 16"
        presets={COMPACT_SORTING_PRESETS}
        onApply={handleApplyCustom}
        onReset={reset}
        summaryBadge={`${arr.length} items`}
      />

      {/* Bar Chart */}
      <div className="flex items-end justify-center gap-2 h-40 mb-4 px-4 pt-4 border-b dark:border-white/5 border-slate-200">
        {arr.map((val, idx) => {
          const isSwapping = swapping && (swapping[0] === idx || swapping[1] === idx);
          const isComparing = comparing && (comparing[0] === idx || comparing[1] === idx);
          const isDone = sorted.includes(idx);

          let barColor = "dark:bg-slate-700/60 bg-slate-200";
          let borderColor = "dark:border-white/10 border-slate-300";
          let labelColor = "dark:text-slate-400 text-slate-500";

          if (isSwapping) {
            barColor = "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.7)]";
            borderColor = "border-amber-300 dark:border-amber-200";
            labelColor = "text-amber-600 dark:text-amber-400 font-bold";
          } else if (isComparing) {
            barColor = "bg-[#0A84FF] shadow-[0_0_14px_rgba(10,132,255,0.7)]";
            borderColor = "border-blue-400 dark:border-blue-300";
            labelColor = "text-[#0A84FF] font-bold";
          } else if (isDone) {
            barColor = "bg-[#00D2FF] shadow-[0_0_12px_rgba(0,210,255,0.7)]";
            borderColor = "border-cyan-400 dark:border-cyan-200";
            labelColor = "text-cyan-600 dark:text-cyan-300 font-bold";
          }

          const heightPercent = valRange === 0 ? 50 : Math.round(15 + ((val - minVal) / valRange) * 80);

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end">
              <span className={cn("text-[10px] font-mono mb-1 transition-colors", labelColor)}>{val}</span>
              <div
                style={{ height: `${heightPercent}%` }}
                className={cn(
                  "w-full rounded-t-lg transition-all duration-200 border",
                  barColor,
                  borderColor
                )}
              />
              <span className="text-[9px] font-mono dark:text-slate-500 text-slate-400 mt-1">
                {idx}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
        <span className="dark:text-slate-200 text-[#171717]">{stepMsg}</span>
      </div>
    </div>
  );
}
