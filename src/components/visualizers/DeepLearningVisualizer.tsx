"use client";

import React, { useState } from "react";
import { Sparkles, Play, RotateCcw, SkipForward, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface OptimizationConfig {
  initialW: number;
  learningRate: number;
}

const PRESETS: InputPreset<OptimizationConfig>[] = [
  {
    id: "smooth-convergence",
    name: "Smooth Monotonic Descent (η = 0.20)",
    description: "Ideal learning rate: fast exponential contraction toward global minimum w* = 0",
    data: { initialW: 3.5, learningRate: 0.2 },
    rawString: "w0: 3.5 | lr: 0.20",
  },
  {
    id: "slow-stagnation",
    name: "Slow Crawl (η = 0.03)",
    description: "Excessively conservative learning rate requiring dozens of iterations to converge",
    data: { initialW: 3.5, learningRate: 0.03 },
    rawString: "w0: 3.5 | lr: 0.03",
  },
  {
    id: "oscillating-overshoot",
    name: "Severe Oscillation (η = 0.95)",
    description: "Step overshoots the minimum, alternating signs while barely contracting",
    data: { initialW: 3.5, learningRate: 0.95 },
    rawString: "w0: 3.5 | lr: 0.95",
  },
  {
    id: "divergent-explosion",
    name: "Exploding Divergence (η = 1.08)",
    description: "Unstable learning rate: gradient steps overshoot into exponential divergence (|w| → ∞)",
    data: { initialW: 2.0, learningRate: 1.08 },
    rawString: "w0: 2.0 | lr: 1.08",
  },
];

export default function DeepLearningVisualizer() {
  const [lr, setLr] = useState<number>(0.2);
  const [initialW, setInitialW] = useState<number>(3.5);
  const [w, setW] = useState<number>(3.5);
  const [stepCount, setStepCount] = useState<number>(0);
  const [lossHistory, setLossHistory] = useState<number[]>([3.5 * 3.5]);

  const stepGradientDescent = () => {
    // Loss L(w) = w^2. Gradient dL/dw = 2w.
    // Update: w := w - lr * 2w
    const currentW = w;
    const grad = 2 * currentW;
    const nextW = currentW - lr * grad;
    const nextLoss = nextW * nextW;

    setW(nextW);
    setStepCount((prev) => prev + 1);
    setLossHistory((prev) => [...prev.slice(-20), nextLoss]);
  };

  const reset = (start = initialW) => {
    setW(start);
    setStepCount(0);
    setLossHistory([start * start]);
  };

  const handleApplyPreset = (p: OptimizationConfig) => {
    setInitialW(p.initialW);
    setLr(p.learningRate);
    reset(p.initialW);
  };

  const handleApplyRaw = (raw: string) => {
    const wMatch = raw.match(/w0:\s*(-?\d+(?:\.\d+)?)/i);
    const lrMatch = raw.match(/lr:\s*(\d+(?:\.\d+)?)/i);

    const errors: string[] = [];
    let newW = initialW;
    let newLr = lr;

    if (wMatch) {
      const parsedW = Number(wMatch[1]);
      if (parsedW >= -5 && parsedW <= 5) {
        newW = parsedW;
      } else {
        errors.push("Initial weight w0 must be between -5.0 and +5.0.");
      }
    }

    if (lrMatch) {
      const parsedLr = Number(lrMatch[1]);
      if (parsedLr > 0 && parsedLr <= 1.5) {
        newLr = parsedLr;
      } else {
        errors.push("Learning rate η must be between 0.01 and 1.50.");
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setInitialW(newW);
    setLr(newLr);
    reset(newW);
    return { isValid: true };
  };

  const currentLoss = w * w;
  const isDiverging = Math.abs(w) > 20;

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Non-Convex Optimization Dynamics
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Deep Learning Theory: Gradient Descent Convergence &amp; Loss Landscapes
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stepGradientDescent}
            disabled={isDiverging}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Step Gradient Descent
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Initial Weight & Learning Rate (η)"
        subtitle="Set initial parameter w0 and learning rate η to observe convergence regimes (format: w0: 3.5 | lr: 0.20)."
        initialValue={`w0: ${initialW} | lr: ${lr}`}
        placeholder="w0: 3.5 | lr: 0.20"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`w = ${w.toFixed(3)} | η = ${lr.toFixed(2)} | Loss = ${currentLoss.toFixed(4)}`}
      />

      {/* Learning rate controls & telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-3 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Learning Rate (η):</span>
            <span className="font-bold text-[#FF7A00] dark:text-[#0A84FF]">{lr.toFixed(2)}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {[0.05, 0.2, 0.45, 0.95, 1.05].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => { setLr(val); reset(); }}
                className={cn(
                  "px-2 py-0.5 rounded border text-[11px] font-semibold transition-all",
                  lr === val
                    ? "bg-[#FF7A00] dark:bg-[#0A84FF] text-white"
                    : "dark:border-white/10 border-slate-300 text-slate-400"
                )}
              >
                {val === 1.05 ? "1.05 (Explode)" : val === 0.95 ? "0.95 (Overshoot)" : val}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t dark:border-white/5 border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span>Steps Taken:</span>
              <span className="font-bold">{stepCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Parameter w:</span>
              <span className={cn("font-bold", isDiverging ? "text-rose-500" : "dark:text-white text-[#171717]")}>
                {isDiverging ? `${w.toExponential(2)} (DIVERGED)` : w.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Loss L(w) = w²:</span>
              <span className="font-bold text-rose-500">
                {isDiverging ? "> 10⁴ (Infinite)" : currentLoss.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Parabolic Loss Curve SVG */}
        <div className="md:col-span-2 h-48 dark:bg-black/40 bg-white rounded-xl border dark:border-white/10 border-[#E5E5E5] p-2 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 200 100" className="w-full h-full max-w-sm">
            {/* Parabola: y = 90 - (x-100)^2 / 100 */}
            <path
              d="M 20 26 Q 100 120 180 26"
              fill="none"
              className="dark:stroke-slate-700 stroke-slate-300 stroke-[1.5]"
            />
            {/* Current point */}
            {!isDiverging && (
              <circle
                cx={Math.max(20, Math.min(180, 100 + (w / 4) * 70))}
                cy={Math.max(20, Math.min(90, 85 - (currentLoss / 16) * 55))}
                r={5}
                className="fill-rose-500 stroke-white stroke-2 shadow-lg animate-pulse"
              />
            )}
            {/* Optimum indicator */}
            <circle cx={100} cy={85} r={3} className="fill-emerald-400" />
            <text x={100} y={96} textAnchor="middle" className="text-[8px] font-mono fill-emerald-500 font-bold">
              Global Optimum w* = 0
            </text>
          </svg>

          {isDiverging && (
            <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-xs flex items-center justify-center p-4 text-center font-mono text-xs text-rose-600 dark:text-rose-300 font-bold">
              Gradient Exploded! Learning rate η &gt; 1.0 causes update step to surpass the Lipschitz stability bound.
            </div>
          )}
        </div>
      </div>

      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>
          Gradient update: w := w - η&nabla;L = {w.toFixed(3)} - ({lr} &times; {(2 * w).toFixed(3)}) = {(w - lr * 2 * w).toFixed(3)}
        </span>
        <span className="text-[11px] text-slate-400">
          Convergence Condition: |1 - 2η| &lt; 1 &rarr; 0 &lt; η &lt; 1.0
        </span>
      </div>
    </div>
  );
}
