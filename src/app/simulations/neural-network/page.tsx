"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward, Sparkles, Sliders } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface NNLabConfig {
  x1: number;
  x2: number;
  targetY: number;
  lr: number;
}

const PRESETS: InputPreset<NNLabConfig>[] = [
  {
    id: "target-high-standard",
    name: "Target 1.0 (Standard Rate)",
    description: "Standard gradient descent convergence towards positive saturation",
    data: { x1: 1.0, x2: 0.5, targetY: 1.0, lr: 0.3 },
    rawString: "x1: 1.0 | x2: 0.5 | target: 1.0 | lr: 0.3",
  },
  {
    id: "target-zero-inversion",
    name: "Target 0.0 (Suppression)",
    description: "Forces synaptic weights to turn deeply negative to pull sigmoid output to 0",
    data: { x1: 1.0, x2: 0.8, targetY: 0.0, lr: 0.35 },
    rawString: "x1: 1.0 | x2: 0.8 | target: 0.0 | lr: 0.35",
  },
  {
    id: "high-lr-overshoot",
    name: "High Learning Rate (η=0.85)",
    description: "Fast weight shifts showing large gradient steps and rapid initial loss decline",
    data: { x1: 0.8, x2: 1.2, targetY: 1.0, lr: 0.85 },
    rawString: "x1: 0.8 | x2: 1.2 | target: 1.0 | lr: 0.85",
  },
  {
    id: "fine-tuning-small-steps",
    name: "Fine-Tuning (η=0.05)",
    description: "Cautious, micro-step parameter descent minimizing gradient jitter",
    data: { x1: 0.5, x2: 0.5, targetY: 0.75, lr: 0.05 },
    rawString: "x1: 0.5 | x2: 0.5 | target: 0.75 | lr: 0.05",
  },
];

export default function NeuralNetworkSimulationPage() {
  const [x1, setX1] = useState<number>(1.0);
  const [x2, setX2] = useState<number>(0.5);
  const [targetY, setTargetY] = useState<number>(1.0);
  const [lr, setLr] = useState<number>(0.3);

  const [epoch, setEpoch] = useState<number>(0);
  const [w1, setW1] = useState<number>(0.4);
  const [w2, setW2] = useState<number>(-0.6);
  const [lossHistory, setLossHistory] = useState<number[]>([0.48]);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const autoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sigmoid = (zVal: number) => 1 / (1 + Math.exp(-zVal));

  // Forward Pass
  const z = x1 * w1 + x2 * w2;
  const yHat = sigmoid(z);
  const loss = 0.5 * Math.pow(targetY - yHat, 2);

  const trainStep = useCallback(() => {
    // Backpropagation:
    // dL/dyHat = -(targetY - yHat)
    // dyHat/dz = yHat * (1 - yHat)
    // dz/dw1 = x1, dz/dw2 = x2
    const currentZ = x1 * w1 + x2 * w2;
    const currentYHat = sigmoid(currentZ);
    const delta = -(targetY - currentYHat) * (currentYHat * (1 - currentYHat));
    const gradW1 = delta * x1;
    const gradW2 = delta * x2;

    const newW1 = w1 - lr * gradW1;
    const newW2 = w2 - lr * gradW2;

    const newZ = x1 * newW1 + x2 * newW2;
    const newYHat = sigmoid(newZ);
    const newLoss = 0.5 * Math.pow(targetY - newYHat, 2);

    setW1(newW1);
    setW2(newW2);
    setEpoch((prev) => prev + 1);
    setLossHistory((prev) => [...prev.slice(-15), newLoss]);
  }, [x1, x2, w1, w2, lr, targetY]);

  // Handle auto-training loop
  useEffect(() => {
    if (isAutoPlaying) {
      autoTimerRef.current = setInterval(() => {
        trainStep();
      }, 400);
    } else {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isAutoPlaying, trainStep]);

  const reset = () => {
    setIsAutoPlaying(false);
    setEpoch(0);
    setW1(0.4);
    setW2(-0.6);
    const initialZ = x1 * 0.4 + x2 * -0.6;
    const initialYHat = sigmoid(initialZ);
    setLossHistory([0.5 * Math.pow(targetY - initialYHat, 2)]);
  };

  const handleApplyRaw = (raw: string) => {
    const x1Match = raw.match(/x1:\s*(-?\d+(?:\.\d+)?)/i);
    const x2Match = raw.match(/x2:\s*(-?\d+(?:\.\d+)?)/i);
    const targetMatch = raw.match(/target(?:Y)?:\s*(\d+(?:\.\d+)?)/i);
    const lrMatch = raw.match(/lr:\s*(\d+(?:\.\d+)?)/i);

    const errors: string[] = [];

    // Fallback: check comma separated numbers: x1, x2, target, lr
    const tokens = raw.split(/[,|\s]+/).filter(Boolean).map(Number);
    if (!x1Match && !x2Match && !targetMatch && tokens.length >= 2 && !tokens.some(isNaN)) {
      const parsedX1 = tokens[0];
      const parsedX2 = tokens[1];
      const parsedTarget = tokens.length > 2 ? tokens[2] : targetY;
      const parsedLr = tokens.length > 3 ? tokens[3] : lr;

      if (parsedTarget < 0 || parsedTarget > 1) {
        errors.push("Target y must be in range [0.0, 1.0].");
      }
      if (parsedLr <= 0 || parsedLr > 2.0) {
        errors.push("Learning rate η must be between 0.01 and 2.0.");
      }

      if (errors.length === 0) {
        setIsAutoPlaying(false);
        setX1(parsedX1);
        setX2(parsedX2);
        setTargetY(parsedTarget);
        setLr(parsedLr);
        setEpoch(0);
        setW1(0.4);
        setW2(-0.6);
        const initZ = parsedX1 * 0.4 + parsedX2 * -0.6;
        setLossHistory([0.5 * Math.pow(parsedTarget - sigmoid(initZ), 2)]);
        return { isValid: true };
      }
      return { isValid: false, errors };
    }

    let nextX1 = x1;
    let nextX2 = x2;
    let nextTarget = targetY;
    let nextLr = lr;

    if (x1Match) {
      const v = Number(x1Match[1]);
      if (v >= -5 && v <= 5) nextX1 = v;
      else errors.push("x1 must be within [-5.0, 5.0].");
    }
    if (x2Match) {
      const v = Number(x2Match[1]);
      if (v >= -5 && v <= 5) nextX2 = v;
      else errors.push("x2 must be within [-5.0, 5.0].");
    }
    if (targetMatch) {
      const v = Number(targetMatch[1]);
      if (v >= 0 && v <= 1) nextTarget = v;
      else errors.push("Target output must be within [0.0, 1.0].");
    }
    if (lrMatch) {
      const v = Number(lrMatch[1]);
      if (v >= 0.01 && v <= 2.0) nextLr = v;
      else errors.push("Learning rate η must be within [0.01, 2.0].");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setIsAutoPlaying(false);
    setX1(nextX1);
    setX2(nextX2);
    setTargetY(nextTarget);
    setLr(nextLr);
    setEpoch(0);
    setW1(0.4);
    setW2(-0.6);
    const initZ = nextX1 * 0.4 + nextX2 * -0.6;
    setLossHistory([0.5 * Math.pow(nextTarget - sigmoid(initZ), 2)]);
    return { isValid: true };
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding">
          <div className="flex items-center gap-2 text-xs font-mono dark:text-slate-500 text-[#737373] mb-6">
            <Link href="/simulations" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Simulations
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-cyan-500/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-cyan-300 text-[#FF7A00] font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Backpropagation &amp; Gradient Descent
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717]">
                Neural Network Training Engine
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm",
                  isAutoPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "btn-primary"
                )}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAutoPlaying ? "Pause Training" : "Auto Train"}
              </button>

              <button
                type="button"
                onClick={trainStep}
                disabled={isAutoPlaying}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 rounded-xl disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" /> Train Epoch ({epoch})
              </button>

              <button
                type="button"
                onClick={reset}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Custom Input Engine Panel */}
          <div className="mb-6">
            <CustomInputPanel
              title="Custom Training Configuration"
              subtitle="Configure custom inputs (x1, x2), regression/classification target y, and learning rate η"
              initialValue={`x1: ${x1} | x2: ${x2} | target: ${targetY} | lr: ${lr}`}
              placeholder="e.g. x1: 1.0 | x2: 0.5 | target: 1.0 | lr: 0.3"
              presets={PRESETS}
              onApply={handleApplyRaw}
              onReset={reset}
              summaryBadge={`x=[${x1}, ${x2}] → target=${targetY} | η=${lr}`}
            />
          </div>

          {/* Network Architecture & Live Loss Curve */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Network SVG Viewport */}
            <div className="lg:col-span-2 card-base rounded-2xl p-6 border dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base dark:text-white text-[#171717]">
                  Architecture: Perceptron with Synaptic Weight Updates
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  z = x₁w₁ + x₂w₂ = {z.toFixed(4)}
                </span>
              </div>

              <div className="h-56 dark:bg-black/40 bg-[#F7F7F7] rounded-xl flex items-center justify-center p-2 border dark:border-white/5 border-slate-200">
                <svg viewBox="0 0 320 140" className="w-full h-full max-w-md">
                  {/* Edges with weight text */}
                  <line x1={60} y1={35} x2={240} y2={70} className="stroke-[#0A84FF] stroke-2" />
                  <rect x={125} y={32} width={70} height={18} rx={4} className="fill-black/60 dark:fill-black/80" />
                  <text x={160} y={45} textAnchor="middle" className="fill-[#0A84FF] font-mono text-[10px] font-bold">
                    w₁ = {w1.toFixed(4)}
                  </text>

                  <line x1={60} y1={105} x2={240} y2={70} className="stroke-[#FF7A00] stroke-2" />
                  <rect x={125} y={90} width={70} height={18} rx={4} className="fill-black/60 dark:fill-black/80" />
                  <text x={160} y={103} textAnchor="middle" className="fill-[#FF7A00] font-mono text-[10px] font-bold">
                    w₂ = {w2.toFixed(4)}
                  </text>

                  {/* Input node x1 */}
                  <circle cx={60} cy={35} r={18} className="fill-[#0A84FF] stroke-white stroke-2" />
                  <text x={60} y={32} textAnchor="middle" className="fill-white font-mono text-[9px] font-bold">x₁</text>
                  <text x={60} y={44} textAnchor="middle" className="fill-white font-mono text-[9px]">{x1}</text>

                  {/* Input node x2 */}
                  <circle cx={60} cy={105} r={18} className="fill-[#FF7A00] stroke-white stroke-2" />
                  <text x={60} y={102} textAnchor="middle" className="fill-white font-mono text-[9px] font-bold">x₂</text>
                  <text x={60} y={114} textAnchor="middle" className="fill-white font-mono text-[9px]">{x2}</text>

                  {/* Output neuron */}
                  <circle cx={240} cy={70} r={22} className="dark:fill-slate-800 fill-white stroke-emerald-400 stroke-2" />
                  <text x={240} y={66} textAnchor="middle" className="text-slate-400 font-mono text-[8px]">ŷ = σ(z)</text>
                  <text x={240} y={79} textAnchor="middle" className="dark:fill-white fill-[#171717] font-mono text-[11px] font-bold">
                    {yHat.toFixed(4)}
                  </text>
                </svg>
              </div>

              {/* Loss History Mini-Chart */}
              <div className="mt-4 pt-3 border-t dark:border-white/10 border-slate-200">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span>Loss History (Last 15 Epochs)</span>
                  <span className="font-bold text-rose-500">Current MSE: {loss.toFixed(5)}</span>
                </div>
                <div className="h-10 flex items-end gap-1.5 bg-black/5 dark:bg-black/30 p-1.5 rounded-lg">
                  {lossHistory.map((val, idx) => {
                    const maxLoss = Math.max(...lossHistory, 0.5);
                    const heightPercent = Math.max(10, Math.min(100, (val / maxLoss) * 100));
                    return (
                      <div
                        key={idx}
                        className="flex-1 rounded-sm bg-rose-500/80 hover:bg-rose-500 transition-all"
                        style={{ height: `${heightPercent}%` }}
                        title={`Epoch ${Math.max(0, epoch - lossHistory.length + idx + 1)}: Loss ${val.toFixed(5)}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hyperparameters & Loss Telemetry */}
            <div className="card-base rounded-2xl p-6 border dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between font-mono text-xs space-y-4">
              <div>
                <span className="font-bold text-sm dark:text-white text-[#171717] block mb-3 font-heading">
                  Training Convergence Telemetry
                </span>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center py-1 border-b dark:border-white/5 border-slate-100">
                    <span className="text-slate-400">Current Epoch:</span>
                    <span className="font-bold text-sm">{epoch}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-white/5 border-slate-100">
                    <span className="text-slate-400">Target Output y:</span>
                    <span className="font-bold text-emerald-500">{targetY.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-white/5 border-slate-100">
                    <span className="text-slate-400">Predicted Output ŷ:</span>
                    <span className="font-bold text-[#FF7A00] dark:text-[#0A84FF]">{yHat.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b dark:border-white/5 border-slate-100">
                    <span className="text-slate-400">Output Error (y - ŷ):</span>
                    <span className="font-bold text-amber-500">{(targetY - yHat).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-bold text-rose-500">Mean Squared Error:</span>
                    <span className="font-bold text-rose-500 text-sm">{loss.toFixed(5)}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-2 font-semibold">Learning Rate (η): {lr}</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.05, 0.1, 0.3, 0.85].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setLr(v)}
                      className={cn(
                        "py-1.5 rounded-lg border text-center text-xs font-mono transition-all",
                        lr === v
                          ? "bg-[#0A84FF] text-white font-bold border-transparent"
                          : "dark:border-white/10 border-slate-200 text-slate-400 hover:border-slate-400"
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theory Link */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200">
            <Link
              href="/poai/neural-networks"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Neural Network Calculus &amp; Backpropagation Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
