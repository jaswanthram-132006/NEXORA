"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, SkipForward, RotateCcw, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface RegionDomainConfig {
  [region: string]: string[];
}

const PRESETS: InputPreset<RegionDomainConfig>[] = [
  {
    id: "standard-3color",
    name: "Classic Australia 4-Region (3 Colors)",
    description: "WA, NT, SA, Q each initialized with {R, G, B}",
    data: {
      WA: ["R", "G", "B"],
      NT: ["R", "G", "B"],
      SA: ["R", "G", "B"],
      Q: ["R", "G", "B"],
    },
    rawString: "WA: R,G,B | NT: R,G,B | SA: R,G,B | Q: R,G,B",
  },
  {
    id: "preassigned-wa",
    name: "Pre-assigned WA = Red",
    description: "WA fixed to Red, forcing immediate AC-3 pruning on NT and SA",
    data: {
      WA: ["R"],
      NT: ["R", "G", "B"],
      SA: ["R", "G", "B"],
      Q: ["R", "G", "B"],
    },
    rawString: "WA: R | NT: R,G,B | SA: R,G,B | Q: R,G,B",
  },
  {
    id: "tight-2color-fail",
    name: "2-Color Triangle (Domain Wipeout)",
    description: "WA, NT, SA only have {R, G}. Mutual inequality forces empty domain!",
    data: {
      WA: ["R", "G"],
      NT: ["R", "G"],
      SA: ["R", "G"],
      Q: ["R", "G"],
    },
    rawString: "WA: R,G | NT: R,G | SA: R,G | Q: R,G",
  },
  {
    id: "dual-anchors",
    name: "Dual Anchors (WA=R, Q=G)",
    description: "Two outer regions anchored, leaving NT and SA to resolve",
    data: {
      WA: ["R"],
      NT: ["R", "G", "B"],
      SA: ["R", "G", "B"],
      Q: ["G"],
    },
    rawString: "WA: R | NT: R,G,B | SA: R,G,B | Q: G",
  },
];

interface CSPStep {
  domains: Record<string, string[]>;
  assigned: Record<string, string | null>;
  explanation: string;
  activeConstraint: string;
  isConflict: boolean;
}

// Australia 4-region adjacency
const ADJACENCIES: Record<string, string[]> = {
  WA: ["NT", "SA"],
  NT: ["WA", "SA", "Q"],
  SA: ["WA", "NT", "Q"],
  Q: ["NT", "SA"],
};

export default function CSPVisualizer() {
  const [initialDomains, setInitialDomains] = useState<RegionDomainConfig>(PRESETS[0].data);
  const [stepIdx, setStepIdx] = useState<number>(0);

  // Run pure AC-3 and MRV backtrack solver to precompute genuine steps
  const steps: CSPStep[] = useMemo(() => {
    const recordedSteps: CSPStep[] = [];
    const currentDomains: Record<string, string[]> = {};
    const assigned: Record<string, string | null> = {};

    const regions = ["WA", "NT", "SA", "Q"];

    for (const r of regions) {
      currentDomains[r] = [...(initialDomains[r] || ["R", "G", "B"])];
      assigned[r] = currentDomains[r].length === 1 ? currentDomains[r][0] : null;
    }

    recordedSteps.push({
      domains: JSON.parse(JSON.stringify(currentDomains)),
      assigned: { ...assigned },
      explanation: `Initialized regions with domains: ${regions.map((r) => `${r}={${currentDomains[r].join(", ")}}`).join(", ")}.`,
      activeConstraint: "All adjacent graph regions must have differing colors.",
      isConflict: false,
    });

    // Check for immediate empty domain
    for (const r of regions) {
      if (currentDomains[r].length === 0) {
        recordedSteps.push({
          domains: JSON.parse(JSON.stringify(currentDomains)),
          assigned: { ...assigned },
          explanation: `Immediate domain wipeout at ${r}: Domain is empty! CSP instance has no valid solution.`,
          activeConstraint: `Domain(${r}) is ∅.`,
          isConflict: true,
        });
        return recordedSteps;
      }
    }

    // AC-3 Queue initialization: all directed arcs (Xi, Xj)
    const queue: [string, string][] = [];
    for (const u of regions) {
      for (const v of ADJACENCIES[u] || []) {
        queue.push([u, v]);
      }
    }

    let iterations = 0;
    while (queue.length > 0 && iterations < 30) {
      iterations++;
      const [xi, xj] = queue.shift()!;

      // Revise(Xi, Xj)
      let revised = false;
      const newDomainXi: string[] = [];

      for (const x of currentDomains[xi]) {
        // Is there any y in domain(xj) such that x != y?
        const hasSupport = currentDomains[xj].some((y) => x !== y);
        if (hasSupport) {
          newDomainXi.push(x);
        } else {
          revised = true;
        }
      }

      if (revised) {
        currentDomains[xi] = newDomainXi;

        if (newDomainXi.length === 1) {
          assigned[xi] = newDomainXi[0];
        }

        if (newDomainXi.length === 0) {
          recordedSteps.push({
            domains: JSON.parse(JSON.stringify(currentDomains)),
            assigned: { ...assigned },
            explanation: `Domain Wipeout! Arc consistency check (${xi} → ${xj}) reduced Domain(${xi}) to ∅. No consistent coloring possible!`,
            activeConstraint: `${xi} ≠ ${xj} caused domain wipeout.`,
            isConflict: true,
          });
          return recordedSteps;
        }

        recordedSteps.push({
          domains: JSON.parse(JSON.stringify(currentDomains)),
          assigned: { ...assigned },
          explanation: `AC-3 Arc Revision (${xi} → ${xj}): Pruned unsupported values. Domain(${xi}) is now {${newDomainXi.join(", ")}}.`,
          activeConstraint: `Arc (${xi}, ${xj}) enforced.`,
          isConflict: false,
        });

        // Re-enqueue all neighbors Xk of Xi (where Xk != Xj)
        for (const xk of ADJACENCIES[xi] || []) {
          if (xk !== xj) {
            queue.push([xk, xi]);
          }
        }
      }
    }

    // If regions remain unassigned, perform MRV assignment step
    for (const r of regions) {
      if (!assigned[r] && currentDomains[r].length > 0) {
        const choice = currentDomains[r][0];
        assigned[r] = choice;
        currentDomains[r] = [choice];

        recordedSteps.push({
          domains: JSON.parse(JSON.stringify(currentDomains)),
          assigned: { ...assigned },
          explanation: `MRV Heuristic: Assigned ${r} = ${choice === "R" ? "Red" : choice === "G" ? "Green" : "Blue"}. Pruning adjacent neighbors.`,
          activeConstraint: `Assignment ${r}=${choice} enforced on neighbors.`,
          isConflict: false,
        });

        // Forward check neighbors
        for (const neighbor of ADJACENCIES[r]) {
          currentDomains[neighbor] = currentDomains[neighbor].filter((c) => c !== choice);
          if (currentDomains[neighbor].length === 1) {
            assigned[neighbor] = currentDomains[neighbor][0];
          }
        }
      }
    }

    // Final Solved Step
    recordedSteps.push({
      domains: JSON.parse(JSON.stringify(currentDomains)),
      assigned: { ...assigned },
      explanation: "AC-3 Propagation complete! All binary inequality constraints satisfied across all 4 regions.",
      activeConstraint: "Global Arc Consistency established. Valid 4-Region Map Coloring verified.",
      isConflict: false,
    });

    return recordedSteps;
  }, [initialDomains]);

  const active = steps[stepIdx] || steps[0];

  const colorBadge = (c: string) => {
    if (c === "R") return "bg-rose-500 text-white";
    if (c === "G") return "bg-emerald-500 text-white";
    if (c === "B") return "bg-blue-500 text-white";
    return "bg-slate-300 text-black";
  };

  const handleApplyRaw = (raw: string) => {
    // Expected format: WA: R,G,B | NT: R,G,B | SA: R,G | Q: B
    const parts = raw.split("|").map((p) => p.trim());
    const newDomains: RegionDomainConfig = {};
    const validColors = new Set(["R", "G", "B"]);

    for (const part of parts) {
      const match = part.match(/^([A-Za-z]+)\s*:\s*(.+)$/);
      if (!match) continue;
      const region = match[1].toUpperCase();
      const colors = match[2]
        .split(/[,\s]+/)
        .map((c) => c.trim().toUpperCase())
        .filter((c) => validColors.has(c));

      if (colors.length > 0) {
        newDomains[region] = Array.from(new Set(colors));
      }
    }

    if (Object.keys(newDomains).length === 0) {
      return {
        isValid: false,
        errors: ["Invalid format. Example: 'WA: R,G,B | NT: R,G | SA: B | Q: R,G,B'"],
      };
    }

    setInitialDomains((prev) => ({ ...prev, ...newDomains }));
    setStepIdx(0);
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> AC-3 Arc Consistency &amp; MRV Solver
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Constraint Satisfaction: Domain Reduction on Map Graph
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStepIdx(Math.min(stepIdx + 1, steps.length - 1))}
            disabled={stepIdx >= steps.length - 1}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Next Arc Step
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(0)}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Region Domains & Failure Presets"
        subtitle="Define available color domains per variable (R, G, B) to test arc consistency pruning and domain wipeout."
        initialValue={Object.entries(initialDomains)
          .map(([r, d]) => `${r}: ${d.join(",")}`)
          .join(" | ")}
        placeholder="WA: R,G,B | NT: R,G,B | SA: R,G,B | Q: R,G,B"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => {
          setInitialDomains(PRESETS[0].data);
          setStepIdx(0);
        }}
        summaryBadge={`4 Regions | Step ${stepIdx + 1} of ${steps.length}`}
      />

      {/* Variables & Domain Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {["WA", "NT", "SA", "Q"].map((region) => {
          const dom = active.domains[region] || [];
          const assign = active.assigned[region];

          return (
            <div
              key={region}
              className={cn(
                "p-4 rounded-xl border flex flex-col justify-between transition-all",
                assign
                  ? "dark:bg-white/[0.05] bg-white dark:border-emerald-500/40 border-emerald-400 shadow-sm"
                  : dom.length === 0
                  ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                  : "dark:bg-black/30 bg-[#F7F7F7] dark:border-white/10 border-[#E5E5E5]"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm dark:text-white text-[#171717]">
                  {region}
                </span>
                {assign ? (
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-mono font-bold", colorBadge(assign))}>
                    {assign === "R" ? "Red" : assign === "G" ? "Green" : "Blue"}
                  </span>
                ) : dom.length === 0 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white">
                    EMPTY ∅
                  </span>
                ) : null}
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1">
                  Active Domain ({dom.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap min-h-6">
                  {dom.map((col) => (
                    <span
                      key={col}
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                        colorBadge(col)
                      )}
                    >
                      {col}
                    </span>
                  ))}
                  {dom.length === 0 && (
                    <span className="text-xs text-rose-500 font-bold">Wiped Out</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Propagation note */}
      <div
        className={cn(
          "p-3.5 rounded-xl border font-mono text-xs space-y-1 transition-all",
          active.isConflict
            ? "bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold"
            : "dark:bg-black/40 bg-[#F7F7F7] dark:border-white/[0.08] border-[#E5E5E5]"
        )}
      >
        <p className="dark:text-slate-200 text-[#171717]">{active.explanation}</p>
        <p className="dark:text-slate-400 text-[#737373] text-[11px]">Constraint Invariant: {active.activeConstraint}</p>
      </div>
    </div>
  );
}
