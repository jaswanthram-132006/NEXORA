"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseNumberArray } from "@/lib/customInput/parsers";
import { InputPreset } from "@/lib/customInput/types";

interface CachingConfig {
  requests: number[];
  capacity: number;
}

const PRESETS: InputPreset<CachingConfig>[] = [
  {
    id: "classic-10",
    name: "Classic 10-Request Stream (k=3)",
    description: "Standard memory trace demonstrating LRU temporal locality advantages over FIFO",
    data: { requests: [1, 2, 3, 2, 1, 4, 1, 2, 3, 4], capacity: 3 },
    rawString: "Pages: 1, 2, 3, 2, 1, 4, 1, 2, 3, 4 | Capacity: 3",
  },
  {
    id: "belady-anomaly",
    name: "Bélády's FIFO Anomaly Trace (k=3)",
    description: "Famous counterintuitive sequence where FIFO with k=4 yields 10 faults vs 9 faults with k=3",
    data: { requests: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], capacity: 3 },
    rawString: "Pages: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5 | Capacity: 3",
  },
  {
    id: "cyclic-thrash",
    name: "Cyclic Thrashing Worst-Case (k=3)",
    description: "Continuous cyclic scan over k+1 elements inducing 100% page fault rate on all online policies",
    data: { requests: [1, 2, 3, 4, 1, 2, 3, 4, 1, 2], capacity: 3 },
    rawString: "Pages: 1, 2, 3, 4, 1, 2, 3, 4, 1, 2 | Capacity: 3",
  },
  {
    id: "high-locality",
    name: "High Locality of Reference (k=3)",
    description: "Repeated queries to small working set producing continuous hits",
    data: { requests: [1, 1, 2, 2, 1, 3, 2, 1, 3, 1], capacity: 3 },
    rawString: "Pages: 1, 1, 2, 2, 1, 3, 2, 1, 3, 1 | Capacity: 3",
  },
];

export default function OnlineVisualizer() {
  const [pageRequests, setPageRequests] = useState<number[]>([1, 2, 3, 2, 1, 4, 1, 2, 3, 4]);
  const [cacheCapacity, setCacheCapacity] = useState<number>(3);
  const [step, setStep] = useState<number>(0);

  // Pure online paging simulation for FIFO and LRU
  const simulation = useMemo(() => {
    const runPolicy = (policy: "fifo" | "lru") => {
      let faults = 0;
      const history: { page: number; cache: number[]; isHit: boolean }[] = [];
      let cache: number[] = [];

      for (let i = 0; i < pageRequests.length; i++) {
        const p = pageRequests[i];
        if (cache.includes(p)) {
          if (policy === "lru") {
            cache = [...cache.filter((x) => x !== p), p];
          }
          history.push({ page: p, cache: [...cache], isHit: true });
        } else {
          faults++;
          if (cache.length >= cacheCapacity) {
            cache.shift(); // Evict oldest
          }
          cache.push(p);
          history.push({ page: p, cache: [...cache], isHit: false });
        }
      }
      return { faults, history };
    };

    return {
      fifo: runPolicy("fifo"),
      lru: runPolicy("lru"),
    };
  }, [pageRequests, cacheCapacity]);

  const activeStep = Math.min(step, pageRequests.length - 1);
  const currentReq = pageRequests[activeStep] ?? 1;

  const handleApplyPreset = (p: CachingConfig) => {
    setPageRequests(p.requests);
    setCacheCapacity(p.capacity);
    setStep(0);
  };

  const handleApplyRaw = (raw: string) => {
    const pagesMatch = raw.match(/pages?:\s*([^|]+)/i);
    const capMatch = raw.match(/cap(?:acity)?:\s*(\d+)/i);

    const errors: string[] = [];
    let newPages = pageRequests;
    let newCap = cacheCapacity;

    if (pagesMatch) {
      const res = parseNumberArray(pagesMatch[1], { minSize: 4, maxSize: 20, allowFloat: false });
      if (!res.isValid || !res.data) {
        errors.push(...res.errors);
      } else {
        newPages = res.data;
      }
    }

    if (capMatch) {
      const c = Number(capMatch[1]);
      if (c >= 2 && c <= 6) {
        newCap = c;
      } else {
        errors.push("Cache capacity must be between 2 and 6 slots.");
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setPageRequests(newPages);
    setCacheCapacity(newCap);
    setStep(0);
    return { isValid: true };
  };

  // Cumulative fault counts up to active step
  const lruFaultsSoFar = simulation.lru.history.slice(0, activeStep + 1).filter((h) => !h.isHit).length;
  const fifoFaultsSoFar = simulation.fifo.history.slice(0, activeStep + 1).filter((h) => !h.isHit).length;

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Competitive Ratio Analysis
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Online Caching: LRU vs FIFO Without Future Lookahead (k-Competitive)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(Math.min(step + 1, pageRequests.length - 1))}
            disabled={step >= pageRequests.length - 1}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Next Request
          </button>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Page Request Sequence & Cache Capacity"
        subtitle="Configure the sequence of requested page numbers and cache slots (format: Pages: 1, 2, 3, 2, 1, 4 | Capacity: 3)."
        initialValue={`Pages: ${pageRequests.join(", ")} | Capacity: ${cacheCapacity}`}
        placeholder="Pages: 1, 2, 3, 2, 1, 4 | Capacity: 3"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`${pageRequests.length} Requests | Capacity k = ${cacheCapacity}`}
      />

      {/* Request Stream */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold dark:text-slate-300 text-[#171717]">
            Page Request Stream:
          </span>
          <span className="text-slate-400">
            Evaluating step {activeStep + 1} of {pageRequests.length} (Page {currentReq})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {pageRequests.map((req, i) => (
            <div
              key={i}
              className={cn(
                "w-9 h-9 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all shrink-0",
                i === activeStep
                  ? "bg-[#FF7A00] dark:bg-[#0A84FF] text-white border-white scale-110 shadow-md z-10"
                  : i < activeStep
                  ? "dark:bg-white/[0.04] bg-slate-100 text-slate-400"
                  : "opacity-40 border-dashed"
              )}
            >
              <span>{req}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LRU vs FIFO Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* LRU Cache */}
        <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#0A84FF]">LRU (Least Recently Used) State:</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold",
                simulation.lru.history[activeStep]?.isHit
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-500 border border-rose-500/40"
              )}>
                {simulation.lru.history[activeStep]?.isHit ? "HIT ✓" : "FAULT ✗"}
              </span>
              <span className="text-rose-500 font-bold">Faults: {lruFaultsSoFar}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: cacheCapacity }).map((_, slot) => {
              const currentCache = simulation.lru.history[activeStep]?.cache || [];
              const val = currentCache[slot];
              return (
                <div
                  key={slot}
                  className="flex-1 h-11 rounded-lg border dark:border-white/10 border-slate-300 flex flex-col items-center justify-center font-bold text-sm bg-white dark:bg-black/40"
                >
                  <span>{val !== undefined ? val : "-"}</span>
                  <span className="text-[9px] text-slate-400 font-normal">Slot {slot + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-400">
            Total End Faults: {simulation.lru.faults} / {pageRequests.length}
          </div>
        </div>

        {/* FIFO Cache */}
        <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#FF7A00]">FIFO (First In First Out) State:</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold",
                simulation.fifo.history[activeStep]?.isHit
                  ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-500 border border-rose-500/40"
              )}>
                {simulation.fifo.history[activeStep]?.isHit ? "HIT ✓" : "FAULT ✗"}
              </span>
              <span className="text-rose-500 font-bold">Faults: {fifoFaultsSoFar}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: cacheCapacity }).map((_, slot) => {
              const currentCache = simulation.fifo.history[activeStep]?.cache || [];
              const val = currentCache[slot];
              return (
                <div
                  key={slot}
                  className="flex-1 h-11 rounded-lg border dark:border-white/10 border-slate-300 flex flex-col items-center justify-center font-bold text-sm bg-white dark:bg-black/40"
                >
                  <span>{val !== undefined ? val : "-"}</span>
                  <span className="text-[9px] text-slate-400 font-normal">Slot {slot + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-400">
            Total End Faults: {simulation.fifo.faults} / {pageRequests.length}
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
        <span>Sleator-Tarjan Competitive Ratio Theorem: Deterministic LRU and FIFO are strictly k-competitive against offline optimal B&eacute;l&aacute;dy MIN (Cost_online &le; k &middot; Cost_opt).</span>
      </div>
    </div>
  );
}
