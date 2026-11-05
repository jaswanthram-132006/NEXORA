"use client";

import React, { useState } from "react";
import { Sparkles, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface MonteCarloConfig {
  sampleCount: number;
  seed: number;
}

const PRESETS: InputPreset<MonteCarloConfig>[] = [
  {
    id: "quick-sample",
    name: "Quick Exploration (N = 500)",
    description: "Rapid sampling illustrating initial variance and settling",
    data: { sampleCount: 500, seed: 42 },
    rawString: "Samples: 500 | Seed: 42",
  },
  {
    id: "deep-benchmark",
    name: "Deep Precision Benchmark (N = 2,500)",
    description: "High sample count showing Law of Large Numbers convergence toward π ≈ 3.14159",
    data: { sampleCount: 2500, seed: 1337 },
    rawString: "Samples: 2500 | Seed: 1337",
  },
  {
    id: "small-variance",
    name: "Small Sample Variance (N = 80)",
    description: "Low count demonstrates statistical variance and error bounds (O(1/√N))",
    data: { sampleCount: 80, seed: 7 },
    rawString: "Samples: 80 | Seed: 7",
  },
  {
    id: "seed-comparison",
    name: "Golden Ratio Seed (N = 1,200)",
    description: "Reproducible Monte Carlo run using seed 1618",
    data: { sampleCount: 1200, seed: 1618 },
    rawString: "Samples: 1200 | Seed: 1618",
  },
];

// Linear Congruential Generator (LCG) for deterministic, reproducible pseudorandom points
function createLCG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function RandomizedVisualizer() {
  const [samples, setSamples] = useState<{ x: number; y: number; inCircle: boolean }[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [insideCircle, setInsideCircle] = useState<number>(0);
  const [currentSeed, setCurrentSeed] = useState<number>(42);
  const [batchSize, setBatchSize] = useState<number>(100);

  const runSampling = (count: number, seed: number = currentSeed, append: boolean = true) => {
    const prng = createLCG(seed + (append ? totalPoints : 0));
    const newPts: { x: number; y: number; inCircle: boolean }[] = [];
    let insideDelta = 0;

    for (let i = 0; i < count; i++) {
      const x = prng();
      const y = prng();
      const inCircle = x * x + y * y <= 1;
      if (inCircle) insideDelta++;
      newPts.push({ x: x * 100, y: y * 100, inCircle });
    }

    if (append) {
      setSamples((prev) => [...prev.slice(-200), ...newPts.slice(-80)]);
      setTotalPoints((prev) => prev + count);
      setInsideCircle((prev) => prev + insideDelta);
    } else {
      setSamples(newPts.slice(-250));
      setTotalPoints(count);
      setInsideCircle(insideDelta);
    }
  };

  const reset = () => {
    setSamples([]);
    setTotalPoints(0);
    setInsideCircle(0);
  };

  const handleApplyPreset = (p: MonteCarloConfig) => {
    setCurrentSeed(p.seed);
    setBatchSize(p.sampleCount);
    runSampling(p.sampleCount, p.seed, false);
  };

  const handleApplyRaw = (raw: string) => {
    const sMatch = raw.match(/samples?:\s*(\d+)/i);
    const seedMatch = raw.match(/seed:\s*(\d+)/i);

    const errors: string[] = [];
    let count = batchSize;
    let seed = currentSeed;

    if (sMatch) {
      const parsedCount = Number(sMatch[1]);
      if (parsedCount >= 10 && parsedCount <= 5000) {
        count = parsedCount;
      } else {
        errors.push("Sample count must be between 10 and 5,000.");
      }
    }

    if (seedMatch) {
      seed = Number(seedMatch[1]);
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setBatchSize(count);
    setCurrentSeed(seed);
    runSampling(count, seed, false);
    return { isValid: true };
  };

  const piEstimate = totalPoints > 0 ? (4 * insideCircle) / totalPoints : 0;
  const errorPercent = totalPoints > 0 ? (Math.abs(piEstimate - Math.PI) / Math.PI) * 100 : 0;
  const theoreticalStdError = totalPoints > 0 ? (1 / Math.sqrt(totalPoints)).toFixed(4) : "N/A";

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-purple-500/10 bg-purple-50 text-purple-500 border border-purple-500/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Monte Carlo Probabilistic Convergence
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Randomized Algorithms: Monte Carlo π Estimation &amp; Seed Variance
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => runSampling(100, currentSeed + totalPoints, true)}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <Play className="w-3.5 h-3.5" /> Sample +100 Points
          </button>
          <button
            type="button"
            onClick={reset}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Sample Count & PRNG Seed"
        subtitle="Set total sample count (N) and pseudo-random seed for deterministic reproduction (format: Samples: 1000 | Seed: 42)."
        initialValue={`Samples: ${batchSize} | Seed: ${currentSeed}`}
        placeholder="Samples: 1000 | Seed: 42"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`N = ${totalPoints.toLocaleString()} Samples | Seed = ${currentSeed}`}
      />

      {/* 2D Unit Quarter-Circle Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-xl border dark:border-white/10 border-[#E5E5E5] dark:bg-black/40 bg-[#F7F7F7] overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Quarter circle arc: radius 100 */}
            <path
              d="M 0 100 A 100 100 0 0 0 100 0 L 0 0 Z"
              className="fill-cyan-500/10 stroke-cyan-400/40 stroke-[0.5]"
            />
            {samples.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={100 - p.y}
                r={1.2}
                className={p.inCircle ? "fill-emerald-400" : "fill-rose-400"}
              />
            ))}
          </svg>
        </div>

        {/* Statistical Metrics */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Samples (N):</span>
              <span className="font-bold">{totalPoints.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Points Inside Circle (M):</span>
              <span className="font-bold text-emerald-500">{insideCircle.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t dark:border-white/10 border-slate-200 pt-1.5">
              <span className="text-[#FF7A00] dark:text-[#0A84FF] font-bold">Estimated π = 4 × (M/N):</span>
              <span className="text-base font-bold dark:text-white text-[#171717]">
                {piEstimate.toFixed(5)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Actual π:</span>
              <span>{Math.PI.toFixed(5)} (Error: {errorPercent.toFixed(2)}%)</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Theoretical Error Bound (1/√N):</span>
              <span>&plusmn; {theoreticalStdError}</span>
            </div>
          </div>
          <p className="text-[11px] dark:text-slate-400 text-[#737373] leading-relaxed">
            <strong>Monte Carlo Guarantee:</strong> Constant evaluation time per sample. Error probability &epsilon; shrinks proportionally to 1/&radic;N by Chebyshev&apos;s Inequality and the Law of Large Numbers.
          </p>
        </div>
      </div>
    </div>
  );
}
