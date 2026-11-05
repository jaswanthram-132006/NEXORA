"use client";

import React, { useState, useMemo } from "react";
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, RotateCcw, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset, ValidationResult } from "@/lib/customInput/types";

interface CityNode {
  id: string;
  name: string;
  x: number;
  y: number;
}

const BASE_CITIES: Record<string, CityNode> = {
  A: { id: "A", name: "Alpha", x: 60, y: 50 },
  B: { id: "B", name: "Beta", x: 190, y: 35 },
  C: { id: "C", name: "Gamma", x: 260, y: 120 },
  D: { id: "D", name: "Delta", x: 140, y: 145 },
  E: { id: "E", name: "Epsilon", x: 50, y: 130 },
};

// Euclidean distance rounded to nearest integer
function getDistance(c1: CityNode, c2: CityNode): number {
  return Math.round(Math.hypot(c1.x - c2.x, c1.y - c2.y));
}

interface TSPInstance {
  tour: string[];
  threshold: number;
}

const PRESETS: InputPreset<TSPInstance>[] = [
  {
    id: "optimal",
    name: "Valid Tour (Under Threshold K=520)",
    description: "Hamiltonian cycle A-B-C-D-E-A with cost 468 <= 520",
    data: { tour: ["A", "B", "C", "D", "E", "A"], threshold: 520 },
    rawString: "A-B-C-D-E-A",
  },
  {
    id: "tight",
    name: "Tight Feasibility (K=470)",
    description: "Same valid tour tested against strict bound K=470",
    data: { tour: ["A", "B", "C", "D", "E", "A"], threshold: 470 },
    rawString: "A-B-C-D-E-A",
  },
  {
    id: "suboptimal-fail",
    name: "Valid Tour (Exceeds Threshold K=450)",
    description: "Valid cycle A-C-B-E-D-A, but total distance 680 > 450",
    data: { tour: ["A", "C", "B", "E", "D", "A"], threshold: 450 },
    rawString: "A-C-B-E-D-A",
  },
  {
    id: "invalid-duplicate",
    name: "Invalid Tour: Duplicate Vertex",
    description: "A-B-C-B-E-A repeats Beta, violating simple cycle definition",
    data: { tour: ["A", "B", "C", "B", "E", "A"], threshold: 550 },
    rawString: "A-B-C-B-E-A",
  },
  {
    id: "invalid-missing",
    name: "Invalid Tour: Missing Vertex",
    description: "A-B-C-E-A completely omits Delta",
    data: { tour: ["A", "B", "C", "E", "A"], threshold: 600 },
    rawString: "A-B-C-E-A",
  },
];

export default function NPCompletenessVisualizer() {
  const [numCities, setNumCities] = useState<number>(5);
  const [currentTour, setCurrentTour] = useState<string[]>(["A", "B", "C", "D", "E", "A"]);
  const [threshold, setThreshold] = useState<number>(520);
  const [customThresholdInput, setCustomThresholdInput] = useState<string>("520");
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasVerified, setHasVerified] = useState<boolean>(false);

  // Factorial calculations for theoretical search space
  const factorial = (n: number): number => {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const toursCount = factorial(numCities - 1) / 2;

  // Active cities subset
  const activeCityKeys = Object.keys(BASE_CITIES).slice(0, numCities);

  // Validate and step-by-step verify the tour
  const verification = useMemo(() => {
    const steps: {
      leg: string;
      u: string;
      v: string;
      dist: number;
      cumulative: number;
      explanation: string;
    }[] = [];

    let isValidHamiltonian = true;
    let failureReason = "";

    // 1. Check start and end match
    if (currentTour.length < 2 || currentTour[0] !== currentTour[currentTour.length - 1]) {
      isValidHamiltonian = false;
      failureReason = `Tour must start and return to the same vertex (starts at ${currentTour[0]}, ends at ${currentTour[currentTour.length - 1]}).`;
    }

    // 2. Check inner vertices form a permutation of active cities
    const visitedInner = currentTour.slice(0, currentTour.length - 1);
    const uniqueVisited = new Set(visitedInner);

    if (uniqueVisited.size !== activeCityKeys.length || visitedInner.length !== activeCityKeys.length) {
      isValidHamiltonian = false;
      failureReason = `Tour does not visit each of the ${activeCityKeys.length} cities exactly once. Visited: [${visitedInner.join(", ")}].`;
    }

    for (const key of activeCityKeys) {
      if (!uniqueVisited.has(key)) {
        isValidHamiltonian = false;
        failureReason = `City ${key} was never visited in the certificate.`;
      }
    }

    // 3. Compute costs leg by leg (O(n) additions)
    let cumulative = 0;
    for (let i = 0; i < currentTour.length - 1; i++) {
      const u = currentTour[i];
      const v = currentTour[i + 1];
      const cityU = BASE_CITIES[u];
      const cityV = BASE_CITIES[v];

      let d = 0;
      if (cityU && cityV) {
        d = getDistance(cityU, cityV);
      } else {
        d = 999;
      }
      cumulative += d;
      steps.push({
        leg: `${u} → ${v}`,
        u,
        v,
        dist: d,
        cumulative,
        explanation: `Edge (${u}, ${v}) cost = ${d} km | Cumulative: ${cumulative} km`,
      });
    }

    const satisfiesThreshold = isValidHamiltonian && cumulative <= threshold;

    return {
      steps,
      totalCost: cumulative,
      isValidHamiltonian,
      failureReason,
      satisfiesThreshold,
    };
  }, [currentTour, threshold, activeCityKeys]);

  const handleApplyPresetOrInput = (instance: TSPInstance) => {
    setCurrentTour(instance.tour);
    setThreshold(instance.threshold);
    setCustomThresholdInput(String(instance.threshold));
    setActiveStep(0);
    setHasVerified(true);
  };

  const handleApplyTourString = (raw: string) => {
    // Expected format: A-B-C-D-E-A or A,B,C,D,E,A
    const parts = raw
      .replace(/[,\s->]+/g, " ")
      .trim()
      .toUpperCase()
      .split(" ")
      .filter(Boolean);

    if (parts.length < 3) {
      return {
        isValid: false,
        errors: ["Tour certificate must specify at least 3 nodes (e.g. A-B-C-A)."],
      };
    }

    const unknown = parts.filter((p) => !BASE_CITIES[p]);
    if (unknown.length > 0) {
      return {
        isValid: false,
        errors: [`Unknown city identifiers: [${unknown.join(", ")}]. Valid cities: A, B, C, D, E.`],
      };
    }

    handleApplyPresetOrInput({ tour: parts, threshold });
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-rose-500/10 bg-rose-50 text-rose-500 border border-rose-500/30 font-semibold mb-1">
            <AlertTriangle className="w-3 h-3" /> Combinatorial Explosion &amp; P vs NP Verification
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Travelling Salesperson (TSP): O(n!) Search Space vs O(n) Certificate Verification
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setHasVerified(true);
              setActiveStep(verification.steps.length);
            }}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-lg"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verify Certificate in O(n)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveStep(0);
              setHasVerified(false);
            }}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-xl dark:bg-amber-500/[0.05] bg-amber-50/70 border dark:border-amber-500/25 border-amber-200 text-xs font-mono dark:text-amber-200 text-amber-900 leading-relaxed">
        <strong>P vs NP Dichotomy Principle:</strong> Solving TSP requires evaluating (n-1)! / 2 tours in the worst case (exponentially intractable). However, verifying if a proposed tour certificate has total cost &le; K takes only <strong>O(n) additions</strong> — mathematically proving the TSP decision problem is in <strong>NP</strong>.
      </div>

      {/* Custom Input Panel for Tour Certificate */}
      <CustomInputPanel
        title="Custom Tour Certificate & Feasibility Presets"
        subtitle="Enter a proposed tour sequence using node letters separated by dashes or spaces (e.g. A-B-C-D-E-A)."
        initialValue={currentTour.join("-")}
        placeholder="e.g. A-B-C-D-E-A"
        presets={PRESETS}
        onApply={handleApplyTourString}
        onReset={() => handleApplyPresetOrInput(PRESETS[0].data)}
        summaryBadge={`Tour: ${currentTour.join(" → ")} | K = ${threshold}`}
      />

      {/* City Slider & Cost Threshold Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5]">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="dark:text-slate-300 text-[#171717] font-semibold">
              Problem Size (n): {numCities} Cities
            </span>
            <span className="text-rose-500 font-bold">
              Unique Tours: {toursCount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={5}
            value={numCities}
            onChange={(e) => {
              const n = Number(e.target.value);
              setNumCities(n);
              const keys = Object.keys(BASE_CITIES).slice(0, n);
              setCurrentTour([...keys, keys[0]]);
              setActiveStep(0);
              setHasVerified(false);
            }}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#FF7A00] dark:accent-[#0A84FF] bg-slate-300 dark:bg-slate-700"
          />
          <div className="text-[11px] font-mono text-slate-500">
            Search space scales as (n-1)!/2. At n=20: &gt; 6 &times; 10¹⁷ tours!
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="dark:text-slate-300 text-[#171717] font-semibold">
              Cost Threshold Budget (K):
            </span>
            <span className="dark:text-cyan-400 text-[#FF7A00] font-bold">
              {threshold} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customThresholdInput}
              onChange={(e) => {
                setCustomThresholdInput(e.target.value);
                const val = Number(e.target.value);
                if (!isNaN(val) && val > 0) setThreshold(val);
              }}
              className="w-28 px-2 py-1 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-300 dark:bg-black/30 bg-white dark:text-white text-[#171717]"
            />
            <span className="text-xs font-mono text-slate-400">km maximum allowable</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="h-48 w-full dark:bg-black/40 bg-[#F7F7F7] rounded-xl flex items-center justify-center p-2 border dark:border-white/5 border-[#E5E5E5] relative">
        <svg viewBox="0 0 320 180" className="w-full h-full max-w-md">
          {/* Render all potential inter-city edges faint */}
          {activeCityKeys.map((u, i) =>
            activeCityKeys.slice(i + 1).map((v) => {
              const c1 = BASE_CITIES[u];
              const c2 = BASE_CITIES[v];
              return (
                <line
                  key={`${u}-${v}`}
                  x1={c1.x}
                  y1={c1.y}
                  x2={c2.x}
                  y2={c2.y}
                  className="stroke-slate-300 dark:stroke-slate-800 stroke-[1] stroke-dasharray-[2,2]"
                />
              );
            })
          )}

          {/* Render proposed tour path */}
          {currentTour.map((node, i) => {
            if (i === currentTour.length - 1) return null;
            const nextNode = currentTour[i + 1];
            const c1 = BASE_CITIES[node];
            const c2 = BASE_CITIES[nextNode];
            if (!c1 || !c2) return null;

            return (
              <line
                key={`tour-${i}`}
                x1={c1.x}
                y1={c1.y}
                x2={c2.x}
                y2={c2.y}
                className={cn(
                  "transition-all duration-300 stroke-2",
                  hasVerified
                    ? verification.satisfiesThreshold
                      ? "stroke-emerald-400"
                      : "stroke-rose-400"
                    : "stroke-[#FF7A00] dark:stroke-[#0A84FF]"
                )}
              />
            );
          })}

          {/* Render city nodes */}
          {activeCityKeys.map((key) => {
            const city = BASE_CITIES[key];
            const inTour = currentTour.includes(key);

            return (
              <g key={key}>
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={14}
                  className={cn(
                    "transition-all duration-200 stroke-2",
                    inTour
                      ? "fill-white dark:fill-[#080B12] stroke-[#FF7A00] dark:stroke-[#0A84FF]"
                      : "fill-slate-200 dark:fill-slate-800 stroke-slate-400"
                  )}
                />
                <text
                  x={city.x}
                  y={city.y + 4}
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-[#171717] dark:fill-white select-none"
                >
                  {key}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Verification Result Breakdown */}
      {hasVerified && (
        <div
          className={cn(
            "p-4 rounded-xl border text-xs font-mono space-y-2 transition-all",
            verification.satisfiesThreshold
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          )}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {verification.satisfiesThreshold ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>CERTIFICATE ACCEPTED: Valid Tour with Cost {verification.totalCost} km &le; {threshold} km</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 shrink-0" />
                <span>
                  CERTIFICATE REJECTED:{" "}
                  {!verification.isValidHamiltonian
                    ? verification.failureReason
                    : `Tour cost (${verification.totalCost} km) exceeds bound (${threshold} km).`}
                </span>
              </>
            )}
          </div>

          <div className="text-[11px] pt-1 border-t dark:border-white/10 border-black/10 flex flex-wrap items-center justify-between gap-2">
            <span>
              Verification Complexity: {verification.steps.length} additions = O(n) deterministic work.
            </span>
            <span className="font-semibold">
              Legs: {verification.steps.map((s) => `${s.leg} (${s.dist})`).join(" + ")} = {verification.totalCost} km
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
