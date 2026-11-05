"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, SkipForward, SkipBack, RotateCcw, Play, Pause, Scissors, ShieldAlert, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

// ==========================================
// TREE DATA STRUCTURES & PRESETS
// ==========================================

interface LeafPreset {
  id: string;
  name: string;
  description: string;
  leaves: number[];
  rawString: string;
}

const PRESETS: InputPreset<LeafPreset>[] = [
  {
    id: "r-and-n-classic",
    name: "AIMA Textbook Benchmark (Root = 5)",
    description: "Binary game tree [3, 5, 6, 9, 1, 2, 0, -1] yielding Root = 5 with 3 leaves pruned (L3, L6, L7)",
    data: {
      id: "r-and-n-classic",
      name: "AIMA Textbook Benchmark",
      description: "Binary game tree yielding Root = 5 with 3 leaves pruned",
      leaves: [3, 5, 6, 9, 1, 2, 0, -1],
      rawString: "3, 5, 6, 9, 1, 2, 0, -1",
    },
    rawString: "3, 5, 6, 9, 1, 2, 0, -1",
  },
  {
    id: "heavy-pruning",
    name: "Deep Alpha & Beta Cutoffs (37.5% Pruned)",
    description: "Forces early beta cutoff at N4 and alpha cutoff at N2: [3, 5, 6, 9, 1, 2, 0, -1]",
    data: {
      id: "heavy-pruning",
      name: "Deep Cutoff Benchmark",
      description: "Forces early cutoffs",
      leaves: [3, 5, 6, 9, 1, 2, 0, -1],
      rawString: "3, 5, 6, 9, 1, 2, 0, -1",
    },
    rawString: "3, 5, 6, 9, 1, 2, 0, -1",
  },
  {
    id: "worst-case",
    name: "Zero-Cutoff Worst-Case (0 Pruned)",
    description: "Evaluates all 8 leaves without any alpha or beta cutoff: [8, 10, 2, 4, 5, 6, 1, 3]",
    data: {
      id: "worst-case",
      name: "Zero-Cutoff Worst-Case",
      description: "All 8 leaves evaluated without cutoff",
      leaves: [8, 10, 2, 4, 5, 6, 1, 3],
      rawString: "8, 10, 2, 4, 5, 6, 1, 3",
    },
    rawString: "8, 10, 2, 4, 5, 6, 1, 3",
  },
  {
    id: "zero-sum-combat",
    name: "Right Subtree Cutoff (2 Pruned)",
    description: "Evaluates left subtree completely, prunes right subtree N6: [3, 12, 8, 2, 4, 6, 14, 5]",
    data: {
      id: "zero-sum-combat",
      name: "Right Subtree Cutoff",
      description: "Prunes right subtree N6",
      leaves: [3, 12, 8, 2, 4, 6, 14, 5],
      rawString: "3, 12, 8, 2, 4, 6, 14, 5",
    },
    rawString: "3, 12, 8, 2, 4, 6, 14, 5",
  },
];

interface ExecutionStep {
  nodeId: string;
  activePly: "MAX" | "MIN";
  action: "visit" | "update" | "prune" | "return";
  alpha: number;
  beta: number;
  nodeValues: Record<string, number | null>;
  prunedNodes: string[];
  explanation: string;
}

export default function MinimaxVisualizer() {
  const [leaves, setLeaves] = useState<number[]>([3, 5, 6, 9, 1, 2, 0, -1]);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);

  // ==========================================
  // TREE DEFINITIONS (Binary tree depth 3, 15 nodes total)
  // Node IDs:
  // Root: N0 (MAX)
  // Ply 1: N1 (MIN, left), N2 (MIN, right)
  // Ply 2: N3, N4 (under N1), N5, N6 (under N2) [MAX]
  // Ply 3 (Leaves): L0, L1 (under N3), L2, L3 (under N4), L4, L5 (under N5), L6, L7 (under N6)
  // ==========================================

  const executionSteps = useMemo(() => {
    const steps: ExecutionStep[] = [];
    const values: Record<string, number | null> = {
      N0: null,
      N1: null,
      N2: null,
      N3: null,
      N4: null,
      N5: null,
      N6: null,
      L0: leaves[0] ?? 0,
      L1: leaves[1] ?? 0,
      L2: leaves[2] ?? 0,
      L3: leaves[3] ?? 0,
      L4: leaves[4] ?? 0,
      L5: leaves[5] ?? 0,
      L6: leaves[6] ?? 0,
      L7: leaves[7] ?? 0,
    };
    const pruned = new Set<string>();

    const record = (
      nodeId: string,
      ply: "MAX" | "MIN",
      action: "visit" | "update" | "prune" | "return",
      a: number,
      b: number,
      exp: string
    ) => {
      steps.push({
        nodeId,
        activePly: ply,
        action,
        alpha: a,
        beta: b,
        nodeValues: { ...values },
        prunedNodes: Array.from(pruned),
        explanation: exp,
      });
    };

    const pruneSubtree = (rootId: string) => {
      pruned.add(rootId);
      if (rootId === "N4") {
        pruned.add("L2");
        pruned.add("L3");
      } else if (rootId === "N6") {
        pruned.add("L6");
        pruned.add("L7");
      } else if (rootId === "N2") {
        pruned.add("N5");
        pruned.add("N6");
        pruned.add("L4");
        pruned.add("L5");
        pruned.add("L6");
        pruned.add("L7");
      }
    };

    // Alpha-Beta Search implementation on fixed 3-depth tree
    function runSearch() {
      let alpha = -Infinity;
      let beta = Infinity;

      record("N0", "MAX", "visit", alpha, beta, "Starting Alpha-Beta search at Root N0 (MAX). Initial bounds: α = -∞, β = +∞.");

      // Explore Left Subtree N1 (MIN)
      record("N1", "MIN", "visit", alpha, beta, "Traversing into left child N1 (MIN) with α = -∞, β = +∞.");

      // N3 (MAX)
      record("N3", "MAX", "visit", alpha, beta, "Traversing into N3 (MAX).");
      // L0
      const vL0 = leaves[0] ?? 0;
      record("L0", "MAX", "update", alpha, beta, `Evaluating leaf L0 = ${vL0}.`);
      values.N3 = vL0;
      let alphaN3 = Math.max(alpha, vL0);
      record("N3", "MAX", "update", alphaN3, beta, `N3 updated to max(null, ${vL0}) = ${vL0}. α becomes max(-∞, ${vL0}) = ${alphaN3}.`);

      // L1
      const vL1 = leaves[1] ?? 0;
      record("L1", "MAX", "update", alphaN3, beta, `Evaluating leaf L1 = ${vL1}.`);
      values.N3 = Math.max(values.N3!, vL1);
      alphaN3 = Math.max(alphaN3, values.N3);
      record("N3", "MAX", "return", alphaN3, beta, `N3 finalized = max(${vL0}, ${vL1}) = ${values.N3}. Backtracking to parent N1.`);

      // Return to N1 (MIN)
      values.N1 = values.N3;
      let betaN1 = Math.min(beta, values.N1);
      record("N1", "MIN", "update", alpha, betaN1, `N1 (MIN) updated from child N3: value = ${values.N1}. β updated to min(+∞, ${values.N1}) = ${betaN1}.`);

      // Check prune under N1 before N4
      if (betaN1 <= alpha) {
        pruneSubtree("N4");
        record("N1", "MIN", "prune", alpha, betaN1, `Alpha Cutoff! α (${alpha}) ≥ β (${betaN1}). Pruning entire sibling subtree N4!`);
      } else {
        // Explore N4 (MAX)
        record("N4", "MAX", "visit", alpha, betaN1, `Traversing into child N4 (MAX) with α = ${alpha}, β = ${betaN1}.`);
        // L2
        const vL2 = leaves[2] ?? 0;
        record("L2", "MAX", "update", alpha, betaN1, `Evaluating leaf L2 = ${vL2}.`);
        values.N4 = vL2;
        let alphaN4 = Math.max(alpha, vL2);
        record("N4", "MAX", "update", alphaN4, betaN1, `N4 updated to ${vL2}. α becomes max(${alpha}, ${vL2}) = ${alphaN4}.`);

        if (alphaN4 >= betaN1) {
          pruned.add("L3");
          record("N4", "MAX", "prune", alphaN4, betaN1, `Beta Cutoff at N4! α (${alphaN4}) ≥ β (${betaN1}). Leaf L3 pruned!`);
        } else {
          // L3
          const vL3 = leaves[3] ?? 0;
          record("L3", "MAX", "update", alphaN4, betaN1, `Evaluating leaf L3 = ${vL3}.`);
          values.N4 = Math.max(values.N4!, vL3);
          alphaN4 = Math.max(alphaN4, values.N4);
        }
        record("N4", "MAX", "return", alphaN4, betaN1, `N4 finalized = ${values.N4}. Backtracking to parent N1.`);

        // Finalize N1
        values.N1 = Math.min(values.N1!, values.N4!);
        betaN1 = Math.min(betaN1, values.N1);
        record("N1", "MIN", "return", alpha, betaN1, `N1 (MIN) finalized = min(${values.N3}, ${values.N4}) = ${values.N1}. Backtracking to Root N0.`);
      }

      // Root N0 (MAX) updated from N1
      values.N0 = values.N1;
      alpha = Math.max(alpha, values.N0!);
      record("N0", "MAX", "update", alpha, beta, `Root N0 (MAX) updated from child N1: value = ${values.N0}. α updated to max(-∞, ${values.N0}) = ${alpha}.`);

      // Explore Right Subtree N2 (MIN)
      record("N2", "MIN", "visit", alpha, beta, `Traversing into right child N2 (MIN) with α = ${alpha}, β = ${beta}.`);

      // N5 (MAX)
      record("N5", "MAX", "visit", alpha, beta, `Traversing into N5 (MAX) with α = ${alpha}, β = ${beta}.`);
      // L4
      const vL4 = leaves[4] ?? 0;
      record("L4", "MAX", "update", alpha, beta, `Evaluating leaf L4 = ${vL4}.`);
      values.N5 = vL4;
      let alphaN5 = Math.max(alpha, vL4);
      record("N5", "MAX", "update", alphaN5, beta, `N5 updated to ${vL4}. α becomes max(${alpha}, ${vL4}) = ${alphaN5}.`);

      if (alphaN5 >= beta) {
        pruned.add("L5");
        record("N5", "MAX", "prune", alphaN5, beta, `Beta Cutoff at N5! α (${alphaN5}) ≥ β (${beta}). Leaf L5 pruned!`);
      } else {
        // L5
        const vL5 = leaves[5] ?? 0;
        record("L5", "MAX", "update", alphaN5, beta, `Evaluating leaf L5 = ${vL5}.`);
        values.N5 = Math.max(values.N5!, vL5);
        alphaN5 = Math.max(alphaN5, values.N5);
      }
      record("N5", "MAX", "return", alphaN5, beta, `N5 finalized = ${values.N5}. Backtracking to parent N2.`);

      // Update N2 (MIN)
      values.N2 = values.N5;
      let betaN2 = Math.min(beta, values.N2!);
      record("N2", "MIN", "update", alpha, betaN2, `N2 (MIN) updated from child N5: value = ${values.N2}. β updated to min(${beta}, ${values.N2}) = ${betaN2}.`);

      // Check prune under N2 before N6
      if (betaN2 <= alpha) {
        pruneSubtree("N6");
        record("N2", "MIN", "prune", alpha, betaN2, `Alpha Cutoff at N2! α (${alpha}) ≥ β (${betaN2}). Entire subtree N6 pruned!`);
      } else {
        // Explore N6 (MAX)
        record("N6", "MAX", "visit", alpha, betaN2, `Traversing into child N6 (MAX) with α = ${alpha}, β = ${betaN2}.`);
        // L6
        const vL6 = leaves[6] ?? 0;
        record("L6", "MAX", "update", alpha, betaN2, `Evaluating leaf L6 = ${vL6}.`);
        values.N6 = vL6;
        let alphaN6 = Math.max(alpha, vL6);
        record("N6", "MAX", "update", alphaN6, betaN2, `N6 updated to ${vL6}. α becomes max(${alpha}, ${vL6}) = ${alphaN6}.`);

        if (alphaN6 >= betaN2) {
          pruned.add("L7");
          record("N6", "MAX", "prune", alphaN6, betaN2, `Beta Cutoff at N6! α (${alphaN6}) ≥ β (${betaN2}). Leaf L7 pruned!`);
        } else {
          // L7
          const vL7 = leaves[7] ?? 0;
          record("L7", "MAX", "update", alphaN6, betaN2, `Evaluating leaf L7 = ${vL7}.`);
          values.N6 = Math.max(values.N6!, vL7);
          alphaN6 = Math.max(alphaN6, values.N6);
        }
        record("N6", "MAX", "return", alphaN6, betaN2, `N6 finalized = ${values.N6}. Backtracking to parent N2.`);

        // Finalize N2
        values.N2 = Math.min(values.N2!, values.N6!);
        betaN2 = Math.min(betaN2, values.N2);
      }

      // Finalize Root N0 (MAX)
      values.N0 = Math.max(values.N0!, values.N2!);
      alpha = Math.max(alpha, values.N0);
      record("N0", "MAX", "return", alpha, beta, `Alpha-Beta Search Complete! Optimal Game-Theoretic Minimax Value at Root N0 = ${values.N0}.`);
    }

    runSearch();
    return steps;
  }, [leaves]);

  const activeStep = executionSteps[stepIdx] || executionSteps[0];

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (stepIdx < executionSteps.length - 1) {
          setStepIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, playbackSpeed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIdx, executionSteps.length, playbackSpeed]);

  const handleApplyPreset = (p: LeafPreset) => {
    setLeaves(p.leaves);
    setStepIdx(0);
    setIsPlaying(false);
  };

  const handleApplyRaw = (raw: string) => {
    const nums = raw.split(/[\s,;|]+/).map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    if (nums.length !== 8) {
      return {
        isValid: false,
        errors: [`Please provide exactly 8 terminal leaf utility values (provided ${nums.length}).`],
      };
    }
    setLeaves(nums);
    setStepIdx(0);
    setIsPlaying(false);
    return { isValid: true };
  };

  const totalPrunedLeaves = activeStep.prunedNodes.filter((n) => n.startsWith("L")).length;
  const prunedEfficiency = ((totalPrunedLeaves / 8) * 100).toFixed(0);

  // Helper formatting for alpha/beta
  const formatBound = (val: number) => {
    if (val === -Infinity) return "-∞";
    if (val === Infinity) return "+∞";
    return val.toString();
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Adversarial Zero-Sum Game Tree
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Minimax with Alpha-Beta Pruning
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "Pause" : "Auto Play"}
          </button>
          <button
            type="button"
            onClick={() => { setIsPlaying(false); setStepIdx((prev) => Math.max(0, prev - 1)); }}
            disabled={stepIdx <= 0}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipBack className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={() => { setIsPlaying(false); setStepIdx((prev) => Math.min(prev + 1, executionSteps.length - 1)); }}
            disabled={stepIdx >= executionSteps.length - 1}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Step Next
          </button>
          <button
            type="button"
            onClick={() => { setIsPlaying(false); setStepIdx(0); }}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Terminal Leaf Payoff Matrix"
        subtitle="Enter 8 comma-separated terminal evaluation utilities for the 8 leaves L0 through L7."
        initialValue={leaves.join(", ")}
        placeholder="3, 5, 6, 9, 1, 2, 0, -1"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        helperText="Alpha-Beta pruning yields the exact same minimax decision as standard Minimax while evaluating as few as O(b^(d/2)) leaves in optimal order."
        summaryBadge={`8 Terminal Leaves | ${activeStep.prunedNodes.length} Pruned Branches`}
      />

      {/* Live Telemetry & Alpha-Beta Thresholds */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
        <div>
          <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Current Ply &amp; Node:</span>
          <strong className="text-sm dark:text-white text-[#171717] flex items-center gap-1">
            <span className={cn(
              "px-1.5 py-0.2 rounded text-[10px] font-bold text-white",
              activeStep.activePly === "MAX" ? "bg-[#FF7A00] dark:bg-[#0A84FF]" : "bg-purple-600"
            )}>
              {activeStep.activePly}
            </span>
            {activeStep.nodeId}
          </strong>
        </div>
        <div>
          <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Alpha [α] (MAX best):</span>
          <strong className="text-sm text-emerald-500 font-bold">
            α = {formatBound(activeStep.alpha)}
          </strong>
        </div>
        <div>
          <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Beta [β] (MIN best):</span>
          <strong className="text-sm text-cyan-400 font-bold">
            β = {formatBound(activeStep.beta)}
          </strong>
        </div>
        <div>
          <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Evaluated Leaves:</span>
          <strong className="text-sm text-emerald-400 font-bold">
            {8 - totalPrunedLeaves} / 8 Evaluated
          </strong>
        </div>
        <div>
          <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Pruned Leaves:</span>
          <strong className="text-sm text-amber-500 font-bold flex items-center gap-1">
            <Scissors className="w-3.5 h-3.5" />
            {totalPrunedLeaves} / 8 ({prunedEfficiency}%)
          </strong>
        </div>
      </div>

      {/* 2D GAME TREE VISUALIZATION */}
      <div className="p-6 rounded-xl dark:bg-black/50 bg-slate-50 border dark:border-white/5 border-slate-200 overflow-x-auto">
        <div className="min-w-[620px] flex flex-col items-center gap-6">
          {/* LEVEL 0: ROOT N0 (MAX) */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold dark:text-cyan-400 text-[#FF7A00] mb-1">
              PLY 0: MAX (Root Decision)
            </span>
            <div
              className={cn(
                "w-20 h-12 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-300 shadow-md",
                activeStep.nodeId === "N0"
                  ? "ring-2 dark:ring-[#0A84FF] ring-[#FF7A00] scale-105 bg-[#FF7A00] dark:bg-[#0A84FF] text-white"
                  : "dark:bg-slate-800 bg-white dark:border-white/20 border-slate-300 dark:text-white text-[#171717]"
              )}
            >
              <span>N0: {activeStep.nodeValues.N0 !== null ? activeStep.nodeValues.N0 : "?"}</span>
              <span className="text-[9px] opacity-75">▲ MAX</span>
            </div>
          </div>

          {/* SVG Connectors: Root to Ply 1 */}
          <div className="w-full flex justify-around px-24 -my-4 h-6 text-slate-300 dark:text-slate-700">
            <div className="w-1/2 border-r border-t border-slate-300 dark:border-slate-700 h-6" />
            <div className="w-1/2 border-l border-t border-slate-300 dark:border-slate-700 h-6" />
          </div>

          {/* LEVEL 1: N1, N2 (MIN) */}
          <div className="w-full flex justify-around px-12">
            {[
              { id: "N1", parent: "N0" },
              { id: "N2", parent: "N0" },
            ].map((node) => {
              const isPruned = activeStep.prunedNodes.includes(node.id);
              const isCurrent = activeStep.nodeId === node.id;
              const val = activeStep.nodeValues[node.id];

              return (
                <div key={node.id} className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-20 h-12 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-300",
                      isPruned
                        ? "dark:bg-rose-950/30 bg-rose-100 border-rose-400 text-rose-500 opacity-50 line-through"
                        : isCurrent
                        ? "ring-2 ring-purple-500 scale-105 bg-purple-600 text-white"
                        : "dark:bg-slate-800 bg-white dark:border-white/20 border-slate-300 dark:text-white text-[#171717]"
                    )}
                  >
                    <span>{node.id}: {val !== null ? val : "?"}</span>
                    <span className="text-[9px] opacity-75">▼ MIN</span>
                  </div>
                  {isPruned && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                      <Scissors className="w-2.5 h-2.5" /> CUT
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* LEVEL 2: N3, N4, N5, N6 (MAX) */}
          <div className="w-full flex justify-around px-4">
            {[
              { id: "N3" },
              { id: "N4" },
              { id: "N5" },
              { id: "N6" },
            ].map((node) => {
              const isPruned = activeStep.prunedNodes.includes(node.id);
              const isCurrent = activeStep.nodeId === node.id;
              const val = activeStep.nodeValues[node.id];

              return (
                <div key={node.id} className="flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-16 h-10 rounded-lg border flex flex-col items-center justify-center font-mono text-[11px] font-bold transition-all duration-300",
                      isPruned
                        ? "dark:bg-rose-950/30 bg-rose-100 border-rose-400 text-rose-500 opacity-50 line-through"
                        : isCurrent
                        ? "ring-2 dark:ring-[#0A84FF] ring-[#FF7A00] scale-105 bg-[#FF7A00] dark:bg-[#0A84FF] text-white"
                        : "dark:bg-slate-800 bg-white dark:border-white/10 border-slate-300 dark:text-slate-200 text-slate-800"
                    )}
                  >
                    <span>{node.id}: {val !== null ? val : "?"}</span>
                    <span className="text-[8px] opacity-75">▲ MAX</span>
                  </div>
                  {isPruned && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] px-1 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                      <Scissors className="w-2 h-2" /> PRUNED
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* LEVEL 3: TERMINAL LEAF NODES (L0 through L7) */}
          <div className="w-full flex justify-between px-2 gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => {
              const leafId = `L${i}`;
              const isPruned = activeStep.prunedNodes.includes(leafId);
              const isCurrent = activeStep.nodeId === leafId;
              const val = leaves[i] ?? 0;

              return (
                <div key={leafId} className="flex-1 flex flex-col items-center relative">
                  <div
                    className={cn(
                      "w-full h-11 rounded-lg border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all duration-200",
                      isPruned
                        ? "dark:bg-rose-950/20 bg-rose-50 border-rose-300 text-rose-400 opacity-40 line-through"
                        : isCurrent
                        ? "ring-2 ring-emerald-500 bg-emerald-500 text-white scale-105 shadow-md"
                        : "dark:bg-white/[0.04] bg-white dark:border-white/15 border-slate-200 dark:text-slate-300 text-slate-700"
                    )}
                  >
                    <span className="text-[9px] text-slate-400 font-mono">L{i}</span>
                    <span className="font-extrabold">{val}</span>
                  </div>
                  {isPruned && (
                    <span className="absolute -bottom-2 text-[8px] text-rose-500 font-mono font-bold">
                      ✂ PRUNED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Explanation Bar */}
      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs flex items-center gap-2">
        {activeStep.action === "prune" && (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[11px] shrink-0">
            PRUNING TRIGGERED
          </span>
        )}
        <span className="dark:text-slate-200 text-[#171717]">{activeStep.explanation}</span>
      </div>

      {/* Academic Theory Callout */}
      <div className="p-4 rounded-xl dark:bg-[#0A84FF]/5 bg-[rgba(255,122,0,0.04)] border dark:border-[#0A84FF]/20 border-[#FF7A00]/20 text-xs font-mono space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold dark:text-cyan-300 text-[#FF7A00]">
          <Award className="w-3.5 h-3.5" /> Theoretical Properties: Minimax with Alpha-Beta Pruning
        </div>
        <p className="dark:text-slate-300 text-slate-600 leading-relaxed text-[11px]">
          <strong>Exact Optimality Guarantee:</strong> Alpha-Beta pruning produces the identical root decision as standard Minimax because branches are pruned only when it is mathematically proven that they cannot influence the final decision.
          In the optimal move-ordering case, time complexity drops from O(bᵈ) to O(b^(d/2)), doubling the effective search horizon in identical computational time!
        </p>
      </div>
    </div>
  );
}
