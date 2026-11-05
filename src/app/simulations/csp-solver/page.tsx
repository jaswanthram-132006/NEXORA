"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Settings2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

// Problem definitions
type ProblemType = "map" | "queens";

interface CSPVariable {
  id: string;
  name: string;
  domain: string[];
  assignedValue: string | null;
  neighbors: string[];
}

const AUSTRALIA_MAP_TEMPLATE: CSPVariable[] = [
  { id: "WA", name: "Western Australia", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["NT", "SA"] },
  { id: "NT", name: "Northern Territory", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["WA", "SA", "Q"] },
  { id: "SA", name: "South Australia", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["WA", "NT", "Q", "NSW", "V"] },
  { id: "Q", name: "Queensland", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["NT", "SA", "NSW"] },
  { id: "NSW", name: "New South Wales", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["SA", "Q", "V"] },
  { id: "V", name: "Victoria", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: ["SA", "NSW"] },
  { id: "T", name: "Tasmania", domain: ["Red", "Green", "Blue"], assignedValue: null, neighbors: [] },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Red: { bg: "bg-rose-500/20", text: "text-rose-500", border: "border-rose-500/40" },
  Green: { bg: "bg-emerald-500/20", text: "text-emerald-500", border: "border-emerald-500/40" },
  Blue: { bg: "bg-blue-500/20", text: "text-blue-500", border: "border-blue-500/40" },
};

interface CSPConfig {
  problemType: ProblemType;
  customDomains: Record<string, string[]>;
}

const PRESETS: InputPreset<CSPConfig>[] = [
  {
    id: "australia-3color",
    name: "Classic Australia 3-Coloring",
    description: "All 7 states initialized with unconstrained {Red, Green, Blue} domains",
    data: {
      problemType: "map",
      customDomains: {
        WA: ["Red", "Green", "Blue"],
        NT: ["Red", "Green", "Blue"],
        SA: ["Red", "Green", "Blue"],
        Q: ["Red", "Green", "Blue"],
        NSW: ["Red", "Green", "Blue"],
        V: ["Red", "Green", "Blue"],
        T: ["Red", "Green", "Blue"],
      },
    },
    rawString: "WA: Red, Green, Blue | NT: Red, Green, Blue | SA: Red, Green, Blue | Q: Red, Green, Blue | NSW: Red, Green, Blue | V: Red, Green, Blue | T: Red, Green, Blue",
  },
  {
    id: "preassigned-anchors",
    name: "Anchored Map (WA=Red, NSW=Green)",
    description: "Two outer regions anchored, forcing immediate AC-3 arc pruning through SA and NT",
    data: {
      problemType: "map",
      customDomains: {
        WA: ["Red"],
        NT: ["Red", "Green", "Blue"],
        SA: ["Red", "Green", "Blue"],
        Q: ["Red", "Green", "Blue"],
        NSW: ["Green"],
        V: ["Red", "Green", "Blue"],
        T: ["Red", "Green", "Blue"],
      },
    },
    rawString: "WA: Red | NT: Red, Green, Blue | SA: Red, Green, Blue | Q: Red, Green, Blue | NSW: Green | V: Red, Green, Blue | T: Red, Green, Blue",
  },
  {
    id: "impossible-triangle",
    name: "Impossible 2-Color Triangle (Wipeout)",
    description: "WA, NT, and SA mutually adjacent on 3-cycle restricted to {Red, Green} → guaranteed AC-3 wipeout",
    data: {
      problemType: "map",
      customDomains: {
        WA: ["Red", "Green"],
        NT: ["Red", "Green"],
        SA: ["Red", "Green"],
        Q: ["Red", "Green", "Blue"],
        NSW: ["Red", "Green", "Blue"],
        V: ["Red", "Green", "Blue"],
        T: ["Red", "Green", "Blue"],
      },
    },
    rawString: "WA: Red, Green | NT: Red, Green | SA: Red, Green | Q: Red, Green, Blue | NSW: Red, Green, Blue | V: Red, Green, Blue | T: Red, Green, Blue",
  },
  {
    id: "queens-4",
    name: "4-Queens CSP Benchmark",
    description: "4 Queens on a 4x4 chessboard with non-attacking row/col/diagonal constraints",
    data: {
      problemType: "queens",
      customDomains: {
        Q0: ["Col 0", "Col 1", "Col 2", "Col 3"],
        Q1: ["Col 0", "Col 1", "Col 2", "Col 3"],
        Q2: ["Col 0", "Col 1", "Col 2", "Col 3"],
        Q3: ["Col 0", "Col 1", "Col 2", "Col 3"],
      },
    },
    rawString: "Q0: Col 0, Col 1, Col 2, Col 3 | Q1: Col 0, Col 1, Col 2, Col 3 | Q2: Col 0, Col 1, Col 2, Col 3 | Q3: Col 0, Col 1, Col 2, Col 3",
  },
];

export default function CSPSolverPage() {
  const [problem, setProblem] = useState<ProblemType>("map");
  const [algorithm, setAlgorithm] = useState<"ac3" | "backtrack">("ac3");
  const [variables, setVariables] = useState<CSPVariable[]>(() => JSON.parse(JSON.stringify(AUSTRALIA_MAP_TEMPLATE)));
  const [arcQueue, setArcQueue] = useState<[string, string][]>([]);
  const [activeArc, setActiveArc] = useState<[string, string] | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [revisionsCount, setRevisionsCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "paused" | "solved" | "failure">("idle");
  const [speed, setSpeed] = useState(700);
  const [historyLog, setHistoryLog] = useState<string[]>([
    "CSP engine initialized. Variables loaded with initial domains {Red, Green, Blue}.",
  ]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset CSP state with optional custom domains
  const resetCSP = useCallback((overrideProblem?: ProblemType, customDomains?: Record<string, string[]>) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("idle");
    setStepCount(0);
    setRevisionsCount(0);
    setActiveArc(null);

    const activeProb = overrideProblem ?? problem;

    if (activeProb === "map") {
      const vars: CSPVariable[] = JSON.parse(JSON.stringify(AUSTRALIA_MAP_TEMPLATE));
      if (customDomains) {
        vars.forEach((v) => {
          if (customDomains[v.id] && customDomains[v.id].length > 0) {
            v.domain = [...customDomains[v.id]];
          }
        });
      }
      setVariables(vars);

      // Build initial AC-3 arc queue: for each connected edge (u, v), add (u, v) and (v, u)
      const arcs: [string, string][] = [];
      vars.forEach((v: CSPVariable) => {
        v.neighbors.forEach((nbr: string) => {
          arcs.push([v.id, nbr]);
        });
      });
      setArcQueue(arcs);
      setHistoryLog([
        `Initialized Australia Map Coloring (${vars.length} variables). AC-3 Queue initialized with ${arcs.length} directional arcs.`,
      ]);
    } else {
      // 4-Queens Problem
      const qVars: CSPVariable[] = [0, 1, 2, 3].map((row) => ({
        id: `Q${row}`,
        name: `Row ${row}`,
        domain: (customDomains && customDomains[`Q${row}`]) ? [...customDomains[`Q${row}`]] : ["Col 0", "Col 1", "Col 2", "Col 3"],
        assignedValue: null,
        neighbors: [0, 1, 2, 3].filter((r) => r !== row).map((r) => `Q${r}`),
      }));
      setVariables(qVars);
      const arcs: [string, string][] = [];
      qVars.forEach((v) => {
        v.neighbors.forEach((nbr) => arcs.push([v.id, nbr]));
      });
      setArcQueue(arcs);
      setHistoryLog([
        `Initialized 4-Queens CSP (4 variables, 4 column positions per row). ${arcs.length} binary constraints loaded.`,
      ]);
    }
  }, [problem]);

  useEffect(() => {
    resetCSP();
  }, [resetCSP]);

  // Execute one step of AC-3
  const stepAC3 = useCallback(() => {
    if (arcQueue.length === 0) {
      const hasEmptyDomain = variables.some((v) => v.domain.length === 0);
      if (hasEmptyDomain) {
        setStatus("failure");
        setHistoryLog((prev) => ["Failure: Domain wipeout detected! A variable has 0 valid values.", ...prev.slice(0, 40)]);
      } else {
        setStatus("solved");
        setHistoryLog((prev) => [
          "Arc Consistency AC-3 Complete! All binary constraints satisfied across all remaining variable domains.",
          ...prev.slice(0, 40),
        ]);
      }
      setActiveArc(null);
      return false;
    }

    const nextQueue = [...arcQueue];
    const [xiId, xjId] = nextQueue.shift()!;
    setActiveArc([xiId, xjId]);

    const varsCopy: CSPVariable[] = JSON.parse(JSON.stringify(variables));
    const xi = varsCopy.find((v) => v.id === xiId)!;
    const xj = varsCopy.find((v) => v.id === xjId)!;

    let revised = false;
    const newXiDomain: string[] = [];

    // Test constraint satisfaction: for each val x in Xi, is there some val y in Xj that satisfies the constraint?
    for (const xVal of xi.domain) {
      let hasSupport = false;
      for (const yVal of xj.domain) {
        if (problem === "map") {
          // Map coloring constraint: xi != xj
          if (xVal !== yVal) {
            hasSupport = true;
            break;
          }
        } else {
          // N-Queens constraint: not same column and not diagonal
          const r1 = parseInt(xi.id.replace("Q", ""), 10);
          const c1 = parseInt(xVal.replace("Col ", ""), 10);
          const r2 = parseInt(xj.id.replace("Q", ""), 10);
          const c2 = parseInt(yVal.replace("Col ", ""), 10);

          const sameCol = c1 === c2;
          const sameDiag = Math.abs(r1 - r2) === Math.abs(c1 - c2);

          if (!sameCol && !sameDiag) {
            hasSupport = true;
            break;
          }
        }
      }

      if (hasSupport) {
        newXiDomain.push(xVal);
      } else {
        revised = true;
      }
    }

    if (revised) {
      xi.domain = newXiDomain;
      setRevisionsCount((r) => r + 1);
      setHistoryLog((prev) => [
        `REVISED arc (${xiId} -> ${xjId}): Domain of ${xiId} pruned to {${newXiDomain.join(", ")}}. Re-queuing neighbors.`,
        ...prev.slice(0, 40),
      ]);

      // Add (xk, xi) for all neighbors xk of xi except xj
      xi.neighbors.forEach((xkId) => {
        if (xkId !== xjId && !nextQueue.some(([a, b]) => a === xkId && b === xiId)) {
          nextQueue.push([xkId, xiId]);
        }
      });
    } else {
      setHistoryLog((prev) => [
        `Checked arc (${xiId} -> ${xjId}): Consistent. No values pruned from domain of ${xiId}.`,
        ...prev.slice(0, 40),
      ]);
    }

    setVariables(varsCopy);
    setArcQueue(nextQueue);
    setStepCount((s) => s + 1);

    if (newXiDomain.length === 0) {
      setStatus("failure");
      return false;
    }

    return true;
  }, [arcQueue, variables, problem]);

  // Backtracking with Forward Checking step
  const stepBacktrack = useCallback(() => {
    const varsCopy: CSPVariable[] = JSON.parse(JSON.stringify(variables));

    // Find unassigned variable with Minimum Remaining Values (MRV)
    const unassigned = varsCopy.filter((v) => v.assignedValue === null);
    if (unassigned.length === 0) {
      setStatus("solved");
      setHistoryLog((prev) => ["Backtracking Complete: All variables successfully assigned without conflict!", ...prev.slice(0, 40)]);
      return false;
    }

    unassigned.sort((a, b) => a.domain.length - b.domain.length);
    const currentVar = unassigned[0];

    // Pick first available value from its domain
    if (currentVar.domain.length === 0) {
      setStatus("failure");
      setHistoryLog((prev) => [`Backtracking dead end at ${currentVar.id}: No consistent values in domain.`, ...prev.slice(0, 40)]);
      return false;
    }

    const assignedVal = currentVar.domain[0];
    currentVar.assignedValue = assignedVal;

    // Forward check: prune this value from unassigned neighbors
    let prunedAny = false;
    currentVar.neighbors.forEach((nbrId) => {
      const nbr = varsCopy.find((v) => v.id === nbrId);
      if (nbr && nbr.assignedValue === null) {
        if (problem === "map") {
          const prevLen = nbr.domain.length;
          nbr.domain = nbr.domain.filter((d) => d !== assignedVal);
          if (nbr.domain.length < prevLen) prunedAny = true;
        } else {
          // Queens conflict check
          const r1 = parseInt(currentVar.id.replace("Q", ""), 10);
          const c1 = parseInt(assignedVal.replace("Col ", ""), 10);
          const r2 = parseInt(nbr.id.replace("Q", ""), 10);

          nbr.domain = nbr.domain.filter((d) => {
            const c2 = parseInt(d.replace("Col ", ""), 10);
            return c1 !== c2 && Math.abs(r1 - r2) !== Math.abs(c1 - c2);
          });
          prunedAny = true;
        }
      }
    });

    setVariables(varsCopy);
    setStepCount((s) => s + 1);
    setHistoryLog((prev) => [
      `MRV Assignment: ${currentVar.id} := ${assignedVal}. Forward checked neighbors${prunedAny ? " (domains pruned)" : ""}.`,
      ...prev.slice(0, 40),
    ]);

    return true;
  }, [variables, problem]);

  // Main step router
  const performStep = useCallback(() => {
    if (algorithm === "ac3") {
      return stepAC3();
    } else {
      return stepBacktrack();
    }
  }, [algorithm, stepAC3, stepBacktrack]);

  // Play / Pause auto ticker
  useEffect(() => {
    if (status === "running") {
      timerRef.current = setInterval(() => {
        const canContinue = performStep();
        if (!canContinue) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, speed, performStep]);

  const toggleRun = () => {
    if (status === "running") {
      setStatus("paused");
    } else {
      setStatus("running");
    }
  };

  const handleApplyRaw = (raw: string) => {
    // Check if input targets queens (Q0, Q1, ...) or map regions (WA, NT, ...)
    const isQueens = /Q[0-3]:/i.test(raw);
    const targetProblem: ProblemType = isQueens ? "queens" : "map";

    const customDomains: Record<string, string[]> = {};
    const parts = raw.split("|").map((p) => p.trim());
    const errors: string[] = [];

    parts.forEach((part) => {
      if (!part) return;
      const colonIdx = part.indexOf(":");
      if (colonIdx === -1) return;
      const varId = part.substring(0, colonIdx).trim().toUpperCase();
      const domainStr = part.substring(colonIdx + 1).trim();

      const validValues = domainStr
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      if (validValues.length === 0) {
        errors.push(`Variable ${varId} has an empty domain specification.`);
      } else {
        // Normalize color capitalization
        const normalizedValues = validValues.map((val) => {
          if (val.toLowerCase() === "red" || val.toLowerCase() === "r") return "Red";
          if (val.toLowerCase() === "green" || val.toLowerCase() === "g") return "Green";
          if (val.toLowerCase() === "blue" || val.toLowerCase() === "b") return "Blue";
          return val;
        });
        customDomains[varId] = normalizedValues;
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    if (Object.keys(customDomains).length === 0) {
      return { isValid: false, errors: ["No valid variable domain specifications found. Use format 'WA: Red, Blue | NT: Green'."] };
    }

    setProblem(targetProblem);
    resetCSP(targetProblem, customDomains);
    return { isValid: true };
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/simulations"
                className="text-xs font-mono dark:text-[#0A84FF] text-[#FF7A00] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Simulations
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-xs font-mono text-slate-400">CSP & AC-3 Solver</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-emerald-500/30 border-emerald-500/40 text-xs font-semibold dark:text-emerald-300 text-emerald-700 uppercase tracking-widest backdrop-blur-md mb-3 dark:bg-emerald-500/10 bg-emerald-50 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Constraint Satisfaction Engine
                </span>
                <h1 className="text-3xl sm:text-5xl font-heading font-extrabold dark:text-white text-[#171717] tracking-tight mb-3">
                  AC-3 & Backtracking <span className="gradient-text-electric">Solver</span>
                </h1>
                <p className="dark:text-slate-400 text-[#737373] max-w-2xl text-sm sm:text-base leading-relaxed">
                  Inspect arc consistency propagation, domain reduction queues, and MRV forward checking on classic constraint satisfaction benchmarks.
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border dark:border-white/10 border-[#E5E5E5]">
                  <div>
                    <div className="text-xs font-mono dark:text-slate-400 text-[#737373] uppercase tracking-wider">
                      Engine Status
                    </div>
                    <div className="text-sm font-bold font-mono mt-0.5 flex items-center gap-1.5">
                      {status === "solved" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {status === "failure" && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      {status === "running" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      <span
                        className={
                          status === "solved"
                            ? "text-emerald-500"
                            : status === "failure"
                            ? "text-rose-500"
                            : "dark:text-white text-[#171717] uppercase"
                        }
                      >
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="h-8 w-px dark:bg-white/10 bg-[#E5E5E5]" />

                  <div>
                    <div className="text-xs font-mono dark:text-slate-400 text-[#737373] uppercase tracking-wider">
                      Revisions
                    </div>
                    <div className="text-sm font-bold font-mono dark:text-white text-[#171717] mt-0.5">
                      {revisionsCount}
                    </div>
                  </div>

                  <div className="h-8 w-px dark:bg-white/10 bg-[#E5E5E5]" />

                  <div>
                    <div className="text-xs font-mono dark:text-slate-400 text-[#737373] uppercase tracking-wider">
                      Queue
                    </div>
                    <div className="text-sm font-bold font-mono dark:text-white text-[#171717] mt-0.5">
                      {arcQueue.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Input Engine Panel */}
          <div className="mb-6">
            <CustomInputPanel
              title="Custom Variable Domains & Problem Presets"
              subtitle="Specify customized domains per variable (e.g. 'WA: Red, Blue | NT: Green') or test domain wipeout"
              initialValue="WA: Red, Green, Blue | NT: Red, Green, Blue | SA: Red, Green, Blue | Q: Red, Green, Blue | NSW: Red, Green, Blue | V: Red, Green, Blue | T: Red, Green, Blue"
              placeholder="e.g. WA: Red | NT: Red, Green, Blue | SA: Blue | Q: Red, Green, Blue"
              presets={PRESETS}
              onApply={handleApplyRaw}
              onReset={() => resetCSP()}
              summaryBadge={`Model: ${problem === "map" ? "Australia Map (7 Vars)" : "4-Queens CSP"} | Algs: ${algorithm.toUpperCase()}`}
            />
          </div>

          {/* Interactive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & Parameters */}
            <div className="lg:col-span-4 space-y-6">
              {/* Problem & Algorithm Selector */}
              <div className="glass-panel p-6 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold font-heading dark:text-white text-[#171717]">
                  <Settings2 className="w-4 h-4 dark:text-[#0A84FF] text-[#FF7A00]" />
                  Simulation Setup
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono dark:text-slate-400 text-[#737373] uppercase">
                    Problem Model
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProblem("map");
                      }}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                        problem === "map"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-[#0A84FF] text-[#FF7A00] font-bold"
                          : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-300 text-[#737373]"
                      }`}
                    >
                      Map 3-Coloring
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProblem("queens");
                      }}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                        problem === "queens"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-[#0A84FF] text-[#FF7A00] font-bold"
                          : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-300 text-[#737373]"
                      }`}
                    >
                      4-Queens CSP
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono dark:text-slate-400 text-[#737373] uppercase">
                    Algorithm Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAlgorithm("ac3");
                        resetCSP();
                      }}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                        algorithm === "ac3"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-[#0A84FF] text-[#FF7A00] font-bold"
                          : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-300 text-[#737373]"
                      }`}
                    >
                      AC-3 Propagation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAlgorithm("backtrack");
                        resetCSP();
                      }}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border transition-all ${
                        algorithm === "backtrack"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-[#0A84FF] text-[#FF7A00] font-bold"
                          : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-300 text-[#737373]"
                      }`}
                    >
                      MRV Backtracking
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t dark:border-white/10 border-[#E5E5E5]">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="dark:text-slate-400 text-[#737373]">Engine Step Speed:</span>
                    <span className="font-bold dark:text-white text-[#171717]">{speed}ms</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1500"
                    step="50"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 dark:bg-white/10 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF7A00] dark:accent-[#0A84FF]"
                  />
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={toggleRun}
                    disabled={status === "solved" || status === "failure"}
                    className="flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-semibold flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#EA580C] dark:bg-[#0A84FF] dark:hover:bg-blue-600 text-white transition-all shadow-md disabled:opacity-50"
                  >
                    {status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {status === "running" ? "Pause" : "Auto Solve"}
                  </button>

                  <button
                    type="button"
                    onClick={() => performStep()}
                    disabled={status === "running" || status === "solved" || status === "failure"}
                    className="py-2.5 px-3 rounded-xl border dark:border-white/10 border-[#E5E5E5] hover:dark:bg-white/[0.05] hover:bg-slate-100 font-mono text-xs flex items-center justify-center disabled:opacity-50"
                    title="Single Step Forward"
                  >
                    <StepForward className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => resetCSP()}
                    className="py-2.5 px-3 rounded-xl border dark:border-white/10 border-[#E5E5E5] hover:dark:bg-white/[0.05] hover:bg-slate-100 font-mono text-xs flex items-center justify-center"
                    title="Reset Problem State"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arc Queue Inspection */}
              <div className="glass-panel p-6 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold font-heading dark:text-white text-[#171717]">
                    Worklist Queue (Arcs)
                  </div>
                  <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">
                    {arcQueue.length} remaining
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl dark:bg-black/30 bg-slate-100/70 border dark:border-white/5 border-slate-200">
                  {arcQueue.length === 0 ? (
                    <span className="text-xs font-mono text-slate-400 italic">Queue is empty</span>
                  ) : (
                    arcQueue.map(([u, v], idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 text-xs font-mono rounded border ${
                          idx === 0
                            ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] font-bold text-[#FF7A00] dark:text-[#0A84FF]"
                            : "dark:border-white/10 border-slate-200 dark:bg-white/[0.03] bg-white text-slate-500"
                        }`}
                      >
                        ({u}&rarr;{v})
                      </span>
                    ))
                  )}
                </div>

                {activeArc && (
                  <div className="p-3 rounded-xl dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-mono flex items-center justify-between">
                    <span className="dark:text-blue-300 text-[#EA580C]">Active Evaluation Arc:</span>
                    <span className="font-bold">
                      ({activeArc[0]} &rarr; {activeArc[1]})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right CSP Visualization Canvas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Main Visualizer Board */}
              <div className="glass-panel p-6 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <h2 className="font-heading font-bold text-base dark:text-white text-[#171717]">
                      {problem === "map" ? "Australia Map Variables & Domains" : "N-Queens CSP Matrix"}
                    </h2>
                  </div>
                  <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">
                    Step #{stepCount}
                  </span>
                </div>

                {/* Variable Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {variables.map((v) => {
                    const isEvaluating = activeArc && (activeArc[0] === v.id || activeArc[1] === v.id);
                    const isHead = activeArc && activeArc[0] === v.id;

                    return (
                      <div
                        key={v.id}
                        className={`p-4 rounded-xl border transition-all duration-300 relative ${
                          isHead
                            ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.06)] ring-2 dark:ring-[#0A84FF]/40 ring-[#FF7A00]/40"
                            : isEvaluating
                            ? "dark:border-cyan-400/50 border-[#FF7A00]/50 dark:bg-white/[0.04] bg-white"
                            : "dark:border-white/10 border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-sm dark:text-white text-[#171717]">
                            {v.id}
                          </span>
                          <span className="text-xs font-sans text-slate-400 truncate max-w-[110px]">
                            {v.name}
                          </span>
                        </div>

                        {/* Assignment or Domain */}
                        <div className="mt-3 space-y-2">
                          <div className="text-[10px] font-mono dark:text-slate-400 text-[#737373] uppercase tracking-wider">
                            {v.assignedValue ? "Assigned Value" : `Domain (${v.domain.length})`}
                          </div>

                          {v.assignedValue ? (
                            <div
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                                COLOR_MAP[v.assignedValue]
                                  ? `${COLOR_MAP[v.assignedValue].bg} ${COLOR_MAP[v.assignedValue].text} ${COLOR_MAP[v.assignedValue].border}`
                                  : "dark:bg-emerald-500/20 bg-emerald-50 text-emerald-600 border-emerald-300"
                              }`}
                            >
                              {v.assignedValue}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {v.domain.length === 0 ? (
                                <span className="text-xs font-mono text-rose-500 font-bold">
                                  &empty; Empty (Wipeout)
                                </span>
                              ) : (
                                v.domain.map((dom) => (
                                  <span
                                    key={dom}
                                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                                      COLOR_MAP[dom]
                                        ? `${COLOR_MAP[dom].bg} ${COLOR_MAP[dom].text} ${COLOR_MAP[dom].border}`
                                        : "dark:bg-white/[0.05] bg-white text-slate-600 border-slate-300"
                                    }`}
                                  >
                                    {dom}
                                  </span>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Neighbors list */}
                        <div className="mt-3 pt-2.5 border-t dark:border-white/10 border-slate-200 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                          <span>Neighbors:</span>
                          <span className="font-semibold text-slate-300 truncate max-w-[120px]">
                            {v.neighbors.length > 0 ? v.neighbors.join(", ") : "None"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Constraint Graph Representation Info */}
                <div className="p-4 rounded-xl dark:bg-black/20 bg-slate-50 border dark:border-white/5 border-slate-200 flex items-start gap-3 text-xs leading-relaxed font-sans dark:text-slate-300 text-slate-600">
                  <Info className="w-4 h-4 text-[#FF7A00] dark:text-[#0A84FF] shrink-0 mt-0.5" />
                  <div>
                    <strong className="dark:text-white text-[#171717] font-semibold">Constraint Propagation Logic:</strong> AC-3 evaluates directed arc <span className="font-mono font-bold">(Xi &rarr; Xj)</span>. If for any color <span className="font-mono">c &isin; Domain(Xi)</span> there exists no compatible color in <span className="font-mono">Domain(Xj)</span>, <span className="font-mono">c</span> is permanently pruned from <span className="font-mono">Xi</span>. Whenever a domain is pruned, all incoming edges <span className="font-mono">(Xk &rarr; Xi)</span> are re-inserted into the queue.
                  </div>
                </div>
              </div>

              {/* Execution Audit Log */}
              <div className="glass-panel p-6 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm dark:text-white text-[#171717]">
                    Execution Event Audit Log
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Latest {historyLog.length} events
                  </span>
                </div>

                <div className="h-44 overflow-y-auto space-y-1.5 p-3 rounded-xl dark:bg-black/30 bg-slate-100/70 border dark:border-white/5 border-slate-200 font-mono text-xs">
                  {historyLog.map((log, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed ${
                        index === 0
                          ? "dark:text-[#00D2FF] text-[#EA580C] font-semibold"
                          : "dark:text-slate-400 text-slate-600"
                      }`}
                    >
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theory Link */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200">
            <Link
              href="/poai/csp"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Constraint Satisfaction &amp; AC-3 Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
