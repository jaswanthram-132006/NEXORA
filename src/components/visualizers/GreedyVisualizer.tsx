"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, SkipForward, SkipBack, RotateCcw, Package, Clock, GitFork, Scissors, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseIntervals } from "@/lib/customInput/parsers";
import { InputPreset, IntervalInput } from "@/lib/customInput/types";

// ==========================================
// 1. ACTIVITY SELECTION TYPES & DATA
// ==========================================
interface Activity {
  id: string;
  start: number;
  finish: number;
  color: string;
}

const PALETTE = [
  "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-emerald-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-lime-500", "bg-sky-500"
];

const defaultActivities: Activity[] = [
  { id: "A1", start: 1, finish: 4, color: "bg-blue-500" },
  { id: "A2", start: 3, finish: 5, color: "bg-amber-500" },
  { id: "A3", start: 0, finish: 6, color: "bg-purple-500" },
  { id: "A4", start: 5, finish: 7, color: "bg-emerald-500" },
  { id: "A5", start: 3, finish: 9, color: "bg-rose-500" },
  { id: "A6", start: 5, finish: 9, color: "bg-cyan-500" },
  { id: "A7", start: 6, finish: 10, color: "bg-indigo-500" },
  { id: "A8", start: 8, finish: 11, color: "bg-orange-500" },
  { id: "A9", start: 8, finish: 12, color: "bg-pink-500" },
  { id: "A10", start: 2, finish: 14, color: "bg-teal-500" },
  { id: "A11", start: 12, finish: 16, color: "bg-sky-500" },
];

const ACTIVITY_PRESETS: InputPreset<IntervalInput[]>[] = [
  {
    id: "default",
    name: "CLRS Benchmark (11 intervals)",
    description: "Classic textbook set testing earliest finish selection (OPT = 4 compatible activities)",
    data: defaultActivities,
    rawString: "1-4, 3-5, 0-6, 5-7, 3-9, 5-9, 6-10, 8-11, 8-12, 2-14, 12-16",
  },
  {
    id: "disjoint",
    name: "Mutually Disjoint",
    description: "Every interval is compatible (100% acceptance)",
    data: [
      { start: 1, finish: 3 }, { start: 4, finish: 6 },
      { start: 7, finish: 9 }, { start: 10, finish: 12 },
    ],
    rawString: "1-3, 4-6, 7-9, 10-12",
  },
  {
    id: "high-conflict",
    name: "Span Trap & Short Tasks",
    description: "Long spanning task (0-15) competing with multiple rapid tasks",
    data: [
      { start: 0, finish: 15 }, { start: 1, finish: 3 },
      { start: 4, finish: 7 }, { start: 8, finish: 11 }, { start: 12, finish: 14 }
    ],
    rawString: "0-15, 1-3, 4-7, 8-11, 12-14",
  },
];

// ==========================================
// 2. KNAPSACK TYPES & DATA
// ==========================================
interface KnapsackItem {
  id: string;
  name: string;
  value: number;
  weight: number;
  density: number; // value / weight
  color: string;
}

interface KnapsackPreset {
  id: string;
  name: string;
  description: string;
  capacity: number;
  items: { name: string; value: number; weight: number }[];
  rawString: string;
}

const KNAPSACK_PRESETS: InputPreset<KnapsackPreset>[] = [
  {
    id: "clrs-classic",
    name: "CLRS Textbook Benchmark (W = 50)",
    description: "Item 1 (10kg, $60), Item 2 (20kg, $100), Item 3 (30kg, $120) → Optimal Fractional: $240.00 (vs 0/1 Discrete: $220.00)",
    data: {
      id: "clrs-classic",
      name: "CLRS Textbook Benchmark",
      description: "Item 1 (10kg, $60), Item 2 (20kg, $100), Item 3 (30kg, $120) → Optimal Fractional: $240.00 (vs 0/1 Discrete: $220.00)",
      capacity: 50,
      items: [
        { name: "Item 1", value: 60, weight: 10 },
        { name: "Item 2", value: 100, weight: 20 },
        { name: "Item 3", value: 120, weight: 30 },
      ],
      rawString: "Capacity: 50 | Items: 60:10, 100:20, 120:30",
    },
    rawString: "Capacity: 50 | Items: 60:10, 100:20, 120:30",
  },
  {
    id: "multi-tier",
    name: "Precious Metals & Minerals (W = 60)",
    description: "5 diverse items with tight density gradations",
    data: {
      id: "multi-tier",
      name: "Precious Metals",
      description: "5 diverse items with tight density gradations",
      capacity: 60,
      items: [
        { name: "Gold Dust", value: 280, weight: 20 },
        { name: "Silver Ingots", value: 150, weight: 15 },
        { name: "Platinum Wire", value: 200, weight: 25 },
        { name: "Copper Coils", value: 80, weight: 20 },
        { name: "Rare Earths", value: 120, weight: 10 },
      ],
      rawString: "Capacity: 60 | Items: 280:20, 150:15, 200:25, 80:20, 120:10",
    },
    rawString: "Capacity: 60 | Items: 280:20, 150:15, 200:25, 80:20, 120:10",
  },
  {
    id: "all-fit",
    name: "Unconstrained Fill (W = 100)",
    description: "Knapsack holds all items with surplus capacity",
    data: {
      id: "all-fit",
      name: "Unconstrained Fill",
      description: "Knapsack holds all items with surplus capacity",
      capacity: 100,
      items: [
        { name: "Medicines", value: 180, weight: 15 },
        { name: "Rations", value: 120, weight: 20 },
        { name: "Electronics", value: 160, weight: 25 },
      ],
      rawString: "Capacity: 100 | Items: 180:15, 120:20, 160:25",
    },
    rawString: "Capacity: 100 | Items: 180:15, 120:20, 160:25",
  },
];

interface KnapsackExecutionStep {
  item: KnapsackItem;
  fractionTaken: number; // 0 to 1
  weightTaken: number;
  valueGained: number;
  totalWeight: number;
  totalValue: number;
  remainingCapacity: number;
  explanation: string;
}

// Branch and Bound State Types
interface BBNode {
  id: string;
  level: number; // item index in sorted order (-1 for root)
  profit: number;
  weight: number;
  bound: number; // Upper bound using fractional knapsack
  taken: boolean[];
  status: "active" | "pruned-capacity" | "pruned-bound" | "optimal" | "explored";
  decisionLabel: string;
}

interface BBStep {
  activeNode: BBNode;
  allNodes: BBNode[];
  bestProfit: number;
  bestTaken: boolean[];
  explanation: string;
  prunedCount: number;
}

type GreedyMode = "activity" | "knapsack" | "branchAndBound";

export default function GreedyVisualizer() {
  const [mode, setMode] = useState<GreedyMode>("activity");

  // Activity Selection State
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [actStep, setActStep] = useState<number>(0);

  // Knapsack State
  const [knapsackCapacity, setKnapsackCapacity] = useState<number>(50);
  const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>([
    { id: "K1", name: "Item 1", value: 60, weight: 10, density: 6.0, color: "bg-blue-500" },
    { id: "K2", name: "Item 2", value: 100, weight: 20, density: 5.0, color: "bg-amber-500" },
    { id: "K3", name: "Item 3", value: 120, weight: 30, density: 4.0, color: "bg-emerald-500" },
  ]);
  const [ksStep, setKsStep] = useState<number>(0);
  const [bbStep, setBbStep] = useState<number>(0);

  // ==========================================
  // COMPUTED: ACTIVITY SELECTION
  // ==========================================
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => a.finish - b.finish);
  }, [activities]);

  const actExecutionSteps = useMemo(() => {
    const steps: {
      activity: Activity;
      status: "selected" | "rejected";
      reason: string;
      selectedIds: string[];
    }[] = [];

    let lastFinish = -1;
    const currentSelected: string[] = [];

    for (const act of sortedActivities) {
      if (act.start >= lastFinish) {
        currentSelected.push(act.id);
        lastFinish = act.finish;
        steps.push({
          activity: act,
          status: "selected",
          reason: `Selected ${act.id} [${act.start} → ${act.finish}]: start time (${act.start}) ≥ previous finish (${lastFinish}). Optimal compatible choice!`,
          selectedIds: [...currentSelected],
        });
      } else {
        steps.push({
          activity: act,
          status: "rejected",
          reason: `Rejected ${act.id} [${act.start} → ${act.finish}]: overlaps with previous finish (${act.start} < ${lastFinish}).`,
          selectedIds: [...currentSelected],
        });
      }
    }
    return steps;
  }, [sortedActivities]);

  const activeActStep = actExecutionSteps[actStep] || actExecutionSteps[actExecutionSteps.length - 1];

  // ==========================================
  // COMPUTED: FRACTIONAL KNAPSACK
  // ==========================================
  const sortedKnapsackItems = useMemo(() => {
    return [...knapsackItems].sort((a, b) => b.density - a.density);
  }, [knapsackItems]);

  const knapsackExecutionSteps = useMemo(() => {
    const steps: KnapsackExecutionStep[] = [];
    let currentWeight = 0;
    let currentValue = 0;

    for (const item of sortedKnapsackItems) {
      const remaining = knapsackCapacity - currentWeight;
      if (remaining <= 0) {
        steps.push({
          item,
          fractionTaken: 0,
          weightTaken: 0,
          valueGained: 0,
          totalWeight: currentWeight,
          totalValue: currentValue,
          remainingCapacity: 0,
          explanation: `Skipped ${item.name} (${item.weight}kg, $${item.value}): knapsack capacity reached (0kg remaining).`,
        });
        continue;
      }

      if (item.weight <= remaining) {
        currentWeight += item.weight;
        currentValue += item.value;
        steps.push({
          item,
          fractionTaken: 1.0,
          weightTaken: item.weight,
          valueGained: item.value,
          totalWeight: currentWeight,
          totalValue: currentValue,
          remainingCapacity: knapsackCapacity - currentWeight,
          explanation: `Took 100% of ${item.name} (ρ = ${item.density.toFixed(2)}): item weight ${item.weight}kg fits completely into remaining ${remaining}kg. Added $${item.value}.`,
        });
      } else {
        const fraction = remaining / item.weight;
        const gainedVal = fraction * item.value;
        currentWeight += remaining;
        currentValue += gainedVal;
        steps.push({
          item,
          fractionTaken: fraction,
          weightTaken: remaining,
          valueGained: gainedVal,
          totalWeight: currentWeight,
          totalValue: currentValue,
          remainingCapacity: 0,
          explanation: `Fractional Slice: Took ${(fraction * 100).toFixed(1)}% (${remaining}/${item.weight}kg) of ${item.name} (ρ = ${item.density.toFixed(2)}). Filled remaining capacity. Added $${gainedVal.toFixed(1)}. Knapsack full!`,
        });
      }
    }

    return steps;
  }, [sortedKnapsackItems, knapsackCapacity]);

  const activeKsStep = knapsackExecutionSteps[ksStep] || knapsackExecutionSteps[0];

  // ==========================================
  // COMPUTED: BRANCH AND BOUND 0/1 KNAPSACK
  // ==========================================
  const bbExecutionSteps = useMemo(() => {
    const n = sortedKnapsackItems.length;
    const steps: BBStep[] = [];
    const allNodes: BBNode[] = [];

    // Calculate upper bound using fractional knapsack relaxation
    function getBound(u: { level: number; profit: number; weight: number }): number {
      if (u.weight >= knapsackCapacity) return 0;
      let profitBound = u.profit;
      let j = u.level + 1;
      let totweight = u.weight;

      while (j < n && totweight + sortedKnapsackItems[j].weight <= knapsackCapacity) {
        totweight += sortedKnapsackItems[j].weight;
        profitBound += sortedKnapsackItems[j].value;
        j++;
      }

      if (j < n) {
        profitBound += (knapsackCapacity - totweight) * sortedKnapsackItems[j].density;
      }
      return profitBound;
    }

    let maxProfit = 0;
    let bestTaken = new Array(n).fill(false);
    let prunedCount = 0;

    // Root node
    const rootBound = getBound({ level: -1, profit: 0, weight: 0 });
    const rootNode: BBNode = {
      id: "Node-Root",
      level: -1,
      profit: 0,
      weight: 0,
      bound: rootBound,
      taken: [],
      status: "active",
      decisionLabel: "Root (Unchosen)",
    };

    allNodes.push(rootNode);

    steps.push({
      activeNode: rootNode,
      allNodes: [...allNodes],
      bestProfit: 0,
      bestTaken: [...bestTaken],
      explanation: `Initialized Branch & Bound root. Fractional Knapsack relaxation yields initial Upper Bound U = $${rootBound.toFixed(1)}.`,
      prunedCount: 0,
    });

    // Best-First Priority Queue (by highest upper bound)
    const queue: BBNode[] = [rootNode];

    while (queue.length > 0 && steps.length < 30) {
      queue.sort((a, b) => b.bound - a.bound);
      const u = queue.shift()!;

      if (u.bound <= maxProfit) {
        u.status = "pruned-bound";
        prunedCount++;
        steps.push({
          activeNode: u,
          allNodes: [...allNodes],
          bestProfit: maxProfit,
          bestTaken: [...bestTaken],
          explanation: `Pruned by Bound: Node ${u.id} has Upper Bound U = $${u.bound.toFixed(1)} ≤ Best Feasible Profit $${maxProfit}. Subtree pruned!`,
          prunedCount,
        });
        continue;
      }

      if (u.level >= n - 1) continue;

      const nextLevel = u.level + 1;
      const nextItem = sortedKnapsackItems[nextLevel];

      // Branch 1: INCLUDE nextItem (Left child)
      const leftWeight = u.weight + nextItem.weight;
      const leftProfit = u.profit + nextItem.value;
      const leftTaken = [...u.taken, true];

      const leftNode: BBNode = {
        id: `N${allNodes.length + 1}-Take-${nextItem.name}`,
        level: nextLevel,
        profit: leftProfit,
        weight: leftWeight,
        bound: getBound({ level: nextLevel, profit: leftProfit, weight: leftWeight }),
        taken: leftTaken,
        status: "active",
        decisionLabel: `+ ${nextItem.name}`,
      };

      allNodes.push(leftNode);

      if (leftWeight <= knapsackCapacity) {
        if (leftProfit > maxProfit) {
          maxProfit = leftProfit;
          bestTaken = [...leftTaken];
          leftNode.status = "optimal";
          steps.push({
            activeNode: leftNode,
            allNodes: [...allNodes],
            bestProfit: maxProfit,
            bestTaken: [...bestTaken],
            explanation: `New Best Solution! Included ${nextItem.name}: Weight = ${leftWeight}kg ≤ ${knapsackCapacity}kg. New Best Profit = $${maxProfit}.`,
            prunedCount,
          });
        } else {
          steps.push({
            activeNode: leftNode,
            allNodes: [...allNodes],
            bestProfit: maxProfit,
            bestTaken: [...bestTaken],
            explanation: `Branched Left (Include ${nextItem.name}): Weight = ${leftWeight}kg, Profit = $${leftProfit}, Upper Bound U = $${leftNode.bound.toFixed(1)}.`,
            prunedCount,
          });
        }

        if (leftNode.bound > maxProfit) {
          queue.push(leftNode);
        } else {
          leftNode.status = "pruned-bound";
          prunedCount++;
        }
      } else {
        leftNode.status = "pruned-capacity";
        prunedCount++;
        steps.push({
          activeNode: leftNode,
          allNodes: [...allNodes],
          bestProfit: maxProfit,
          bestTaken: [...bestTaken],
          explanation: `Infeasible Weight Prune: Including ${nextItem.name} pushes weight to ${leftWeight}kg > Capacity ${knapsackCapacity}kg! Pruned.`,
          prunedCount,
        });
      }

      // Branch 2: EXCLUDE nextItem (Right child)
      const rightTaken = [...u.taken, false];
      const rightBound = getBound({ level: nextLevel, profit: u.profit, weight: u.weight });
      const rightNode: BBNode = {
        id: `N${allNodes.length + 1}-Skip-${nextItem.name}`,
        level: nextLevel,
        profit: u.profit,
        weight: u.weight,
        bound: rightBound,
        taken: rightTaken,
        status: "active",
        decisionLabel: `Skip ${nextItem.name}`,
      };

      allNodes.push(rightNode);

      if (rightBound > maxProfit) {
        queue.push(rightNode);
        steps.push({
          activeNode: rightNode,
          allNodes: [...allNodes],
          bestProfit: maxProfit,
          bestTaken: [...bestTaken],
          explanation: `Branched Right (Skip ${nextItem.name}): Weight = ${u.weight}kg, Profit = $${u.profit}, Upper Bound U = $${rightBound.toFixed(1)} > Best $${maxProfit}. Enqueued.`,
          prunedCount,
        });
      } else {
        rightNode.status = "pruned-bound";
        prunedCount++;
        steps.push({
          activeNode: rightNode,
          allNodes: [...allNodes],
          bestProfit: maxProfit,
          bestTaken: [...bestTaken],
          explanation: `Pruned Right Branch: Skipping ${nextItem.name} yields bound U = $${rightBound.toFixed(1)} ≤ Best $${maxProfit}. Subtree pruned!`,
          prunedCount,
        });
      }
    }

    steps.push({
      activeNode: allNodes[0],
      allNodes: [...allNodes],
      bestProfit: maxProfit,
      bestTaken: [...bestTaken],
      explanation: `Branch & Bound Complete! Global 0/1 Optimal Solution = $${maxProfit}. Items taken: ${sortedKnapsackItems.filter((_, idx) => bestTaken[idx]).map((it) => it.name).join(", ") || "None"}.`,
      prunedCount,
    });

    return steps;
  }, [sortedKnapsackItems, knapsackCapacity]);

  const activeBbStep = bbExecutionSteps[bbStep] || bbExecutionSteps[0];

  // ==========================================
  // HANDLERS: INPUT
  // ==========================================
  const handleApplyIntervals = (raw: string) => {
    const res = parseIntervals(raw);
    if (!res.isValid || !res.data) {
      return { isValid: false, errors: res.errors };
    }
    const newActs: Activity[] = res.data.map((item, idx) => ({
      id: item.name || `A${idx + 1}`,
      start: item.start,
      finish: item.finish,
      color: PALETTE[idx % PALETTE.length],
    }));

    setActivities(newActs);
    setActStep(0);
    return { isValid: true };
  };

  const handleApplyKnapsackRaw = (raw: string) => {
    const capMatch = raw.match(/capacity:\s*(\d+(\.\d+)?)/i);
    const itemsMatch = raw.match(/items?:\s*([^\n|]+)/i);

    const errors: string[] = [];
    let newCap = knapsackCapacity;
    let newItems: KnapsackItem[] = [];

    if (capMatch) {
      const parsedCap = parseFloat(capMatch[1]);
      if (parsedCap > 0 && parsedCap <= 500) {
        newCap = parsedCap;
      } else {
        errors.push("Capacity must be between 1 and 500.");
      }
    }

    if (itemsMatch) {
      const tokens = itemsMatch[1].trim().split(/[\s,;]+/);
      let idx = 1;
      for (const tok of tokens) {
        if (!tok) continue;
        const parts = tok.split(/[:\-]/);
        if (parts.length === 2) {
          const v = parseFloat(parts[0]);
          const w = parseFloat(parts[1]);
          if (!isNaN(v) && !isNaN(w) && v > 0 && w > 0) {
            newItems.push({
              id: `K${idx}`,
              name: `Item ${idx}`,
              value: v,
              weight: w,
              density: parseFloat((v / w).toFixed(3)),
              color: PALETTE[(idx - 1) % PALETTE.length],
            });
            idx++;
          }
        }
      }
      if (newItems.length < 2) {
        errors.push("Please provide at least 2 valid items in 'value:weight' format (e.g. 60:10, 100:20).");
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setKnapsackCapacity(newCap);
    if (newItems.length > 0) {
      setKnapsackItems(newItems);
    }
    setKsStep(0);
    setBbStep(0);
    return { isValid: true };
  };

  const handleApplyKnapsackPreset = (p: KnapsackPreset) => {
    setKnapsackCapacity(p.capacity);
    const items: KnapsackItem[] = p.items.map((it, idx) => ({
      id: `K${idx + 1}`,
      name: it.name,
      value: it.value,
      weight: it.weight,
      density: parseFloat((it.value / it.weight).toFixed(3)),
      color: PALETTE[idx % PALETTE.length],
    }));
    setKnapsackItems(items);
    setKsStep(0);
    setBbStep(0);
  };

  const maxTimeline = Math.max(...activities.map((a) => a.finish), 16);

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Algorithm Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold">
              <Sparkles className="w-3 h-3" /> Greedy &amp; Optimization Studio
            </span>
            <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500">
              Heuristic Greedy vs Exact Branch &amp; Bound
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { setMode("activity"); setActStep(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
                mode === "activity"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
                  : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
              )}
            >
              <Clock className="w-3.5 h-3.5" /> 1. Activity Selection
            </button>
            <button
              type="button"
              onClick={() => { setMode("knapsack"); setKsStep(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
                mode === "knapsack"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
                  : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
              )}
            >
              <Package className="w-3.5 h-3.5" /> 2. Fractional Knapsack
            </button>
            <button
              type="button"
              onClick={() => { setMode("branchAndBound"); setBbStep(0); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
                mode === "branchAndBound"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
                  : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
              )}
            >
              <GitFork className="w-3.5 h-3.5" /> 3. 0/1 Knapsack Branch &amp; Bound
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {mode === "activity" && (
            <>
              <button
                type="button"
                onClick={() => setActStep((prev) => Math.max(0, prev - 1))}
                disabled={actStep <= 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setActStep((prev) => Math.min(prev + 1, actExecutionSteps.length - 1))}
                disabled={actStep >= actExecutionSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Step Next
              </button>
              <button
                type="button"
                onClick={() => setActStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </>
          )}

          {mode === "knapsack" && (
            <>
              <button
                type="button"
                onClick={() => setKsStep((prev) => Math.max(0, prev - 1))}
                disabled={ksStep <= 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setKsStep((prev) => Math.min(prev + 1, knapsackExecutionSteps.length - 1))}
                disabled={ksStep >= knapsackExecutionSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next Item
              </button>
              <button
                type="button"
                onClick={() => setKsStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </>
          )}

          {mode === "branchAndBound" && (
            <>
              <button
                type="button"
                onClick={() => setBbStep((prev) => Math.max(0, prev - 1))}
                disabled={bbStep <= 0}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipBack className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setBbStep((prev) => Math.min(prev + 1, bbExecutionSteps.length - 1))}
                disabled={bbStep >= bbExecutionSteps.length - 1}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
              >
                <SkipForward className="w-3.5 h-3.5" /> Next Branch
              </button>
              <button
                type="button"
                onClick={() => setBbStep(0)}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: ACTIVITY SELECTION */}
      {/* ========================================================= */}
      {mode === "activity" && (
        <div className="space-y-4">
          <CustomInputPanel
            title="Custom Interval Scheduling Input"
            subtitle="Specify intervals in 'start-finish' format (e.g. 1-4, 3-5, 0-6)."
            initialValue={activities.map((a) => `${a.start}-${a.finish}`).join(", ")}
            placeholder="e.g. 1-4, 3-5, 0-6, 5-7, 8-11"
            presets={ACTIVITY_PRESETS}
            onApply={handleApplyIntervals}
            onReset={() => { setActivities(defaultActivities); setActStep(0); }}
            helperText="Enter 2 to 20 intervals separated by commas. Each must have finish > start ≥ 0."
            summaryBadge={`${activities.length} intervals`}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
            <div>
              <span className="dark:text-slate-400 text-slate-600">Evaluating Interval: </span>
              <strong className="dark:text-white text-[#171717]">
                {activeActStep?.activity.id} ({actStep + 1} of {actExecutionSteps.length})
              </strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600">Optimal Compatible Set: </span>
              <strong className="text-emerald-500">
                {activeActStep ? activeActStep.selectedIds.join(", ") : "None"} ({activeActStep?.selectedIds.length || 0} tasks)
              </strong>
            </div>
            <div className="text-[11px] dark:text-cyan-400 text-[#FF7A00]">
              Sorting Key: min(f_i) → Greedy Choice
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl dark:bg-black/40 bg-slate-50 border dark:border-white/5 border-slate-200">
            <div className="flex justify-between text-[10px] font-mono dark:text-slate-500 text-slate-400 pb-2 border-b dark:border-white/10 border-slate-200">
              {Array.from({ length: maxTimeline + 1 }, (_, i) => (
                <span key={i} className="w-4 text-center">
                  {i}
                </span>
              ))}
            </div>

            {sortedActivities.map((act) => {
              const stepInfo = actExecutionSteps.find((s) => s.activity.id === act.id);
              const isEvaluated = actExecutionSteps.indexOf(stepInfo!) <= actStep;
              const isAccepted = activeActStep?.selectedIds.includes(act.id);
              const isCurrent = activeActStep?.activity.id === act.id;

              const leftPercent = (act.start / maxTimeline) * 100;
              const widthPercent = ((act.finish - act.start) / maxTimeline) * 100;

              return (
                <div key={act.id} className="relative h-6 flex items-center">
                  <div
                    style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                    className={cn(
                      "absolute h-5 rounded-md px-2 flex items-center justify-between text-[10px] font-mono transition-all duration-200 border",
                      isCurrent
                        ? "ring-2 dark:ring-[#0A84FF] ring-[#FF7A00] font-bold z-10"
                        : "",
                      isAccepted
                        ? "bg-emerald-500/80 text-white border-emerald-400 shadow-sm"
                        : isEvaluated
                        ? "dark:bg-rose-950/40 bg-rose-100 text-rose-500 border-rose-300 opacity-60 line-through"
                        : "dark:bg-slate-700/60 bg-slate-200 dark:text-slate-300 text-slate-700 border-slate-300"
                    )}
                  >
                    <span>{act.id}</span>
                    <span>{act.start}-{act.finish}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
            <span className="dark:text-slate-200 text-[#171717]">{activeActStep?.reason}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: FRACTIONAL KNAPSACK */}
      {/* ========================================================= */}
      {mode === "knapsack" && (
        <div className="space-y-5">
          <CustomInputPanel
            title="Knapsack Capacity & Items Configuration"
            subtitle="Specify Knapsack capacity and items in 'value:weight' format (e.g. Capacity: 50 | Items: 60:10, 100:20, 120:30)."
            initialValue={`Capacity: ${knapsackCapacity} | Items: ${knapsackItems.map((k) => `${k.value}:${k.weight}`).join(", ")}`}
            placeholder="Capacity: 50 | Items: 60:10, 100:20, 120:30"
            presets={KNAPSACK_PRESETS}
            onApply={handleApplyKnapsackRaw}
            onReset={() => handleApplyKnapsackPreset(KNAPSACK_PRESETS[0].data)}
            helperText="Greedy heuristic sorts items strictly by density ρ = value / weight in descending order."
            summaryBadge={`W = ${knapsackCapacity} kg | ${knapsackItems.length} Candidate Items`}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Knapsack Capacity (W):</span>
              <strong className="text-sm dark:text-white text-[#171717]">{knapsackCapacity} kg</strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Current Weight Filled:</span>
              <strong className="text-sm text-cyan-500 dark:text-cyan-400">
                {activeKsStep ? activeKsStep.totalWeight.toFixed(1) : 0} / {knapsackCapacity} kg
              </strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Accumulated Value:</span>
              <strong className="text-sm text-emerald-500">
                ${activeKsStep ? activeKsStep.totalValue.toFixed(2) : "0.00"}
              </strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Greedy Step:</span>
              <strong className="text-sm dark:text-white text-[#171717]">
                {ksStep + 1} of {knapsackExecutionSteps.length}
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-xl dark:bg-black/40 bg-slate-50 border dark:border-white/5 border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="dark:text-slate-300 text-slate-700 font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#FF7A00] dark:text-[#0A84FF]" />
                Knapsack Load Level: {((activeKsStep?.totalWeight / knapsackCapacity) * 100 || 0).toFixed(1)}%
              </span>
              <span className="dark:text-slate-400 text-slate-500 text-[11px]">
                Remaining: {activeKsStep?.remainingCapacity.toFixed(1)} kg
              </span>
            </div>

            <div className="relative h-9 w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-white/10 p-1 flex gap-0.5 border dark:border-white/10 border-slate-300">
              {knapsackExecutionSteps.slice(0, ksStep + 1).map((step, idx) => {
                if (step.weightTaken <= 0) return null;
                const widthPercent = (step.weightTaken / knapsackCapacity) * 100;
                return (
                  <div
                    key={idx}
                    style={{ width: `${widthPercent}%` }}
                    className={cn(
                      "h-full rounded-lg flex items-center justify-center text-[10px] font-mono text-white font-bold transition-all duration-300 relative group overflow-hidden px-1",
                      step.item.color
                    )}
                  >
                    <span className="truncate">
                      {step.item.name} ({step.weightTaken.toFixed(1)}kg)
                    </span>
                    {step.fractionTaken < 1.0 && (
                      <span className="absolute bottom-0 right-1 text-[8px] opacity-90 font-mono">
                        {(step.fractionTaken * 100).toFixed(0)}% slice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold dark:text-slate-300 text-slate-700 flex justify-between items-center">
              <span>Items Ranked by Value/Weight Density (ρ = v/w):</span>
              <span className="text-[11px] dark:text-cyan-400 text-[#FF7A00]">
                Algorithm Choice Rule: max(v_i / w_i)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sortedKnapsackItems.map((item, idx) => {
                const step = knapsackExecutionSteps.find((s) => s.item.id === item.id);
                const stepIndex = knapsackExecutionSteps.indexOf(step!);
                const isProcessed = stepIndex <= ksStep;
                const isCurrent = stepIndex === ksStep;
                const fraction = isProcessed ? step?.fractionTaken || 0 : 0;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all duration-200 font-mono text-xs flex flex-col justify-between",
                      isCurrent
                        ? "ring-2 dark:ring-[#0A84FF] ring-[#FF7A00] dark:bg-white/[0.04] bg-white border-transparent shadow-md"
                        : isProcessed
                        ? fraction > 0
                          ? "dark:bg-emerald-950/20 bg-emerald-50 dark:border-emerald-500/40 border-emerald-300"
                          : "dark:bg-rose-950/20 bg-rose-50 dark:border-rose-500/30 border-rose-200 opacity-60"
                        : "dark:bg-white/[0.02] bg-white dark:border-white/10 border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold dark:text-white text-[#171717]">
                          <span className={cn("w-2 h-2 rounded-full", item.color)} />
                          {item.name}
                        </div>
                        <span className="text-[10px] dark:text-slate-400 text-slate-500">
                          Rank #{idx + 1}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold dark:bg-white/10 bg-slate-100 dark:text-cyan-300 text-[#FF7A00]">
                          ρ = {item.density.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400">$/kg</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] py-1 border-t dark:border-white/5 border-slate-100">
                      <div>
                        <span className="text-slate-400">Value: </span>
                        <strong className="text-emerald-500">${item.value}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Weight: </span>
                        <strong className="dark:text-slate-200 text-slate-800">{item.weight} kg</strong>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t dark:border-white/5 border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      {isProcessed ? (
                        fraction === 1.0 ? (
                          <span className="text-emerald-500 font-bold">100% Taken</span>
                        ) : fraction > 0 ? (
                          <span className="text-amber-500 font-bold">{(fraction * 100).toFixed(1)}% Slice</span>
                        ) : (
                          <span className="text-rose-400 line-through">0% (Skipped)</span>
                        )
                      ) : (
                        <span className="text-slate-500">Pending Evaluation</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
            <span className="dark:text-slate-200 text-[#171717]">{activeKsStep?.explanation}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: BRANCH AND BOUND 0/1 KNAPSACK */}
      {/* ========================================================= */}
      {mode === "branchAndBound" && (
        <div className="space-y-5">
          <CustomInputPanel
            title="Knapsack Capacity & Items Configuration"
            subtitle="Configure Knapsack capacity and items for exact 0/1 Branch & Bound exploration."
            initialValue={`Capacity: ${knapsackCapacity} | Items: ${knapsackItems.map((k) => `${k.value}:${k.weight}`).join(", ")}`}
            placeholder="Capacity: 50 | Items: 60:10, 100:20, 120:30"
            presets={KNAPSACK_PRESETS}
            onApply={handleApplyKnapsackRaw}
            onReset={() => handleApplyKnapsackPreset(KNAPSACK_PRESETS[0].data)}
            helperText="Uses LC-Search (Least Cost / Best-First) with the Fractional Knapsack relaxation as the bounding function U."
            summaryBadge={`W = ${knapsackCapacity} kg | ${bbExecutionSteps.length} Search Tree Steps`}
          />

          {/* Telemetry Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Best Feasible Profit (LB):</span>
              <strong className="text-sm text-emerald-500 font-bold">${activeBbStep.bestProfit}</strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Current Node Upper Bound (U):</span>
              <strong className="text-sm text-cyan-400 font-bold">${activeBbStep.activeNode.bound.toFixed(1)}</strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Pruned Branches:</span>
              <strong className="text-sm text-amber-500 font-bold flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5" /> {activeBbStep.prunedCount} Subtrees
              </strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Tree Search Step:</span>
              <strong className="text-sm dark:text-white text-[#171717]">
                {bbStep + 1} of {bbExecutionSteps.length}
              </strong>
            </div>
          </div>

          {/* Optimal 0/1 Selection Vector Display */}
          <div className="p-4 rounded-xl dark:bg-black/40 bg-slate-50 border dark:border-white/5 border-slate-200">
            <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 block mb-2">
              0/1 Discrete Inclusion Decisions x ∈ &#123;0, 1&#125;ⁿ:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sortedKnapsackItems.map((it, idx) => {
                const isTaken = activeBbStep.bestTaken[idx];
                return (
                  <div
                    key={it.id}
                    className={cn(
                      "p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between transition-all",
                      isTaken
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 font-bold"
                        : "dark:bg-white/[0.02] bg-white dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-500"
                    )}
                  >
                    <span>{it.name} ({it.weight}kg, ${it.value})</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", isTaken ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700")}>
                      x = {isTaken ? "1" : "0"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Decision Node Tree Cards */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold dark:text-slate-300 text-slate-700 block">
              Explored State-Space Tree Nodes:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
              {activeBbStep.allNodes.map((node) => {
                const isCurrent = node.id === activeBbStep.activeNode.id;
                const isPruned = node.status.startsWith("pruned");

                return (
                  <div
                    key={node.id}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-mono transition-all",
                      isCurrent
                        ? "ring-2 dark:ring-[#0A84FF] ring-[#FF7A00] dark:bg-white/[0.05] bg-white border-transparent"
                        : isPruned
                        ? "dark:bg-rose-950/20 bg-rose-50 border-rose-300 text-rose-500 opacity-60 line-through"
                        : "dark:bg-white/[0.02] bg-white dark:border-white/10 border-slate-200"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{node.decisionLabel}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                        U = ${node.bound.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>w = {node.weight}kg</span>
                      <span>v = ${node.profit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Explanation Bar */}
          <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
            <span className="dark:text-slate-200 text-[#171717]">{activeBbStep.explanation}</span>
          </div>

          {/* Academic Theory Callout */}
          <div className="p-4 rounded-xl dark:bg-[#0A84FF]/5 bg-[rgba(255,122,0,0.04)] border dark:border-[#0A84FF]/20 border-[#FF7A00]/20 text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold dark:text-cyan-300 text-[#FF7A00]">
              <Award className="w-3.5 h-3.5" /> Branch & Bound Duality: Fractional Relaxation as Bound
            </div>
            <p className="dark:text-slate-300 text-slate-600 leading-relaxed text-[11px]">
              Branch & Bound solves the NP-hard 0/1 Knapsack problem by expanding a state-space tree while computing an <strong>admissible Upper Bound U</strong> at each node via the Fractional Knapsack relaxation.
              Whenever a branch has U ≤ maxProfit or exceeds capacity, it is safely pruned, cutting off exponential search without sacrificing the global optimal discrete solution!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
