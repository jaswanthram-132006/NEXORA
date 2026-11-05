"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface NetConfig {
  x1: number;
  x2: number;
  actFn: "sigmoid" | "relu";
}

const PRESETS: InputPreset<NetConfig>[] = [
  {
    id: "balanced-positive",
    name: "Balanced Positive (0.8, 0.4)",
    description: "Standard forward pass with intermediate hidden activations",
    data: { x1: 0.8, x2: 0.4, actFn: "sigmoid" },
    rawString: "x1: 0.8 | x2: 0.4 | act: sigmoid",
  },
  {
    id: "orthogonal-features",
    name: "Orthogonal Features (0.1, 0.9)",
    description: "Dominant x2 input exciting asymmetric hidden pathways",
    data: { x1: 0.1, x2: 0.9, actFn: "sigmoid" },
    rawString: "x1: 0.1 | x2: 0.9 | act: sigmoid",
  },
  {
    id: "relu-saturation",
    name: "ReLU Non-Linear Saturated (0.5, -0.6)",
    description: "Negative net pre-activation demonstrates dead neuron clipping (z < 0 → a = 0)",
    data: { x1: 0.5, x2: -0.6, actFn: "relu" },
    rawString: "x1: 0.5 | x2: -0.6 | act: relu",
  },
  {
    id: "zero-baseline",
    name: "Zero Baseline (0.0, 0.0)",
    description: "Demonstrates bias-only forward response",
    data: { x1: 0.0, x2: 0.0, actFn: "sigmoid" },
    rawString: "x1: 0.0 | x2: 0.0 | act: sigmoid",
  },
];

export default function NeuralNetVisualizer() {
  const [x1, setX1] = useState<number>(0.8);
  const [x2, setX2] = useState<number>(0.4);
  const [actFn, setActFn] = useState<"sigmoid" | "relu">("sigmoid");

  // Educational weights
  const w1 = [
    [0.5, -0.3], // h1 weights [w11, w21]
    [-0.2, 0.8], // h2 weights [w12, w22]
    [0.7, 0.4],  // h3 weights [w13, w23]
  ];
  const b1 = [0.1, -0.2, 0.05];

  const w2 = [0.6, -0.5, 0.9]; // Output weights
  const b2 = 0.2;

  const activate = (z: number) => {
    if (actFn === "sigmoid") return 1 / (1 + Math.exp(-z));
    return Math.max(0, z); // ReLU
  };

  // Forward Pass Calculations
  const z_h = [
    x1 * w1[0][0] + x2 * w1[0][1] + b1[0],
    x1 * w1[1][0] + x2 * w1[1][1] + b1[1],
    x1 * w1[2][0] + x2 * w1[2][1] + b1[2],
  ];

  const a_h = z_h.map(activate);

  const z_out = a_h[0] * w2[0] + a_h[1] * w2[1] + a_h[2] * w2[2] + b2;
  const a_out = activate(z_out);

  const handleApplyPreset = (p: NetConfig) => {
    setX1(p.x1);
    setX2(p.x2);
    setActFn(p.actFn);
  };

  const handleApplyRaw = (raw: string) => {
    // Expected format: x1: 0.8 | x2: 0.4 | act: sigmoid
    const x1Match = raw.match(/x1:\s*(-?\d+(?:\.\d+)?)/i);
    const x2Match = raw.match(/x2:\s*(-?\d+(?:\.\d+)?)/i);
    const actMatch = raw.match(/act(?:ivation)?:\s*(sigmoid|relu)/i);

    const errors: string[] = [];

    let newX1 = x1;
    let newX2 = x2;
    let newAct = actFn;

    if (x1Match) {
      const v = Number(x1Match[1]);
      if (v >= -2 && v <= 2) {
        newX1 = v;
      } else {
        errors.push("x1 must be between -2.0 and 2.0.");
      }
    }

    if (x2Match) {
      const v = Number(x2Match[1]);
      if (v >= -2 && v <= 2) {
        newX2 = v;
      } else {
        errors.push("x2 must be between -2.0 and 2.0.");
      }
    }

    if (actMatch) {
      newAct = actMatch[1].toLowerCase() as "sigmoid" | "relu";
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setX1(newX1);
    setX2(newX2);
    setActFn(newAct);
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Multi-Layer Perceptron (MLP) Forward Engine
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Forward Propagation: z = Wx + b → a = σ(z)
          </h3>
        </div>

        {/* Activation Function Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-white/[0.05] bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setActFn("sigmoid")}
            className={cn(
              "px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all",
              actFn === "sigmoid"
                ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white shadow-sm"
                : "dark:text-slate-400 text-[#737373]"
            )}
          >
            Sigmoid σ(z)
          </button>
          <button
            type="button"
            onClick={() => setActFn("relu")}
            className={cn(
              "px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all",
              actFn === "relu"
                ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white shadow-sm"
                : "dark:text-slate-400 text-[#737373]"
            )}
          >
            ReLU max(0,z)
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Input Vector & Activation Function"
        subtitle="Set numeric input vector x1, x2 and activation function (format: x1: 0.8 | x2: 0.4 | act: sigmoid)."
        initialValue={`x1: ${x1} | x2: ${x2} | act: ${actFn}`}
        placeholder="x1: 0.8 | x2: 0.4 | act: sigmoid"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`x = [${x1.toFixed(2)}, ${x2.toFixed(2)}] | σ = ${actFn.toUpperCase()} | ŷ = ${a_out.toFixed(4)}`}
      />

      {/* Network Architecture SVG & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Sliders for Inputs */}
        <div className="space-y-4 p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
          <span className="font-bold dark:text-slate-200 text-[#171717] block mb-2">
            Fine-Tune Input Activations:
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>x₁ = {x1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={x1}
              onChange={(e) => setX1(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#FF7A00] dark:accent-[#0A84FF] bg-slate-300 dark:bg-slate-700"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>x₂ = {x2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={x2}
              onChange={(e) => setX2(Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#FF7A00] dark:accent-[#0A84FF] bg-slate-300 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* 3-Layer Visual Representation */}
        <div className="lg:col-span-2 h-56 dark:bg-black/40 bg-white rounded-xl border dark:border-white/10 border-[#E5E5E5] p-2 flex items-center justify-center">
          <svg viewBox="0 0 320 160" className="w-full h-full max-w-md">
            {/* Synaptic Weights Lines */}
            {[45, 115].map((y1Pos, i) =>
              [30, 80, 130].map((y2Pos, j) => (
                <line
                  key={`in-${i}-${j}`}
                  x1={50}
                  y1={y1Pos}
                  x2={160}
                  y2={y2Pos}
                  className="dark:stroke-[#0A84FF]/40 stroke-[#FF7A00]/40 stroke-1"
                />
              ))
            )}
            {[30, 80, 130].map((y2Pos, j) => (
              <line
                key={`out-${j}`}
                x1={160}
                y1={y2Pos}
                x2={270}
                y2={80}
                className="dark:stroke-cyan-400/50 stroke-[#EA580C]/50 stroke-1"
              />
            ))}

            {/* Input Layer Nodes */}
            <circle cx={50} cy={45} r={14} className="fill-[#0A84FF] stroke-white stroke-2" />
            <text x={50} y={49} textAnchor="middle" className="fill-white font-mono text-[10px] font-bold">x₁</text>

            <circle cx={50} cy={115} r={14} className="fill-[#0A84FF] stroke-white stroke-2" />
            <text x={50} y={119} textAnchor="middle" className="fill-white font-mono text-[10px] font-bold">x₂</text>

            {/* Hidden Layer Nodes */}
            {[30, 80, 130].map((y, idx) => (
              <g key={idx}>
                <circle cx={160} cy={y} r={14} className="dark:fill-slate-800 fill-slate-100 stroke-cyan-400 stroke-2" />
                <text x={160} y={y + 4} textAnchor="middle" className="dark:fill-white fill-[#171717] font-mono text-[9px] font-bold">
                  {a_h[idx].toFixed(2)}
                </text>
              </g>
            ))}

            {/* Output Node */}
            <circle cx={270} cy={80} r={16} className="fill-[#FF7A00] stroke-white stroke-2 shadow-lg" />
            <text x={270} y={84} textAnchor="middle" className="fill-white font-mono text-[10px] font-bold">
              {a_out.toFixed(2)}
            </text>
          </svg>
        </div>
      </div>

      {/* Numerical Summary */}
      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs flex flex-wrap items-center justify-between gap-2">
        <span>Hidden Activations: [h₁={a_h[0].toFixed(3)}, h₂={a_h[1].toFixed(3)}, h₃={a_h[2].toFixed(3)}]</span>
        <span className="font-bold text-[#FF7A00] dark:text-cyan-300">
          Network Output ŷ = {a_out.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
