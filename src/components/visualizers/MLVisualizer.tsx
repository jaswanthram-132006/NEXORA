"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface DataPoint {
  x: number;
  y: number;
  label: "Class A" | "Class B";
}

interface MLDatasetConfig {
  points: DataPoint[];
  defaultQuery: { x: number; y: number };
  defaultK: number;
}

const PRESETS: InputPreset<MLDatasetConfig>[] = [
  {
    id: "separable-clusters",
    name: "Linearly Separable Clusters",
    description: "Distinct Class A cluster (left) and Class B cluster (right)",
    data: {
      points: [
        { x: 25, y: 35, label: "Class A" },
        { x: 35, y: 45, label: "Class A" },
        { x: 20, y: 65, label: "Class A" },
        { x: 40, y: 70, label: "Class A" },
        { x: 30, y: 85, label: "Class A" },
        { x: 70, y: 30, label: "Class B" },
        { x: 80, y: 45, label: "Class B" },
        { x: 65, y: 65, label: "Class B" },
        { x: 85, y: 75, label: "Class B" },
        { x: 75, y: 90, label: "Class B" },
      ],
      defaultQuery: { x: 50, y: 55 },
      defaultK: 3,
    },
    rawString: "Cluster: Separable | Query: 50,55 | K: 3",
  },
  {
    id: "interleaved-noise",
    name: "Interleaved Boundary Noise",
    description: "Points overlapping near boundary x ≈ 50, creating non-linear decision regions",
    data: {
      points: [
        { x: 30, y: 30, label: "Class A" },
        { x: 48, y: 45, label: "Class A" },
        { x: 55, y: 70, label: "Class A" },
        { x: 35, y: 80, label: "Class A" },
        { x: 25, y: 55, label: "Class A" },
        { x: 45, y: 60, label: "Class B" },
        { x: 52, y: 35, label: "Class B" },
        { x: 75, y: 40, label: "Class B" },
        { x: 80, y: 75, label: "Class B" },
        { x: 68, y: 85, label: "Class B" },
      ],
      defaultQuery: { x: 50, y: 50 },
      defaultK: 5,
    },
    rawString: "Cluster: Interleaved | Query: 50,50 | K: 5",
  },
  {
    id: "imbalanced-distribution",
    name: "Class Imbalance (80% Class A)",
    description: "Dominant Class A population demonstrating majority vote bias",
    data: {
      points: [
        { x: 20, y: 30, label: "Class A" },
        { x: 30, y: 50, label: "Class A" },
        { x: 40, y: 35, label: "Class A" },
        { x: 45, y: 75, label: "Class A" },
        { x: 55, y: 45, label: "Class A" },
        { x: 60, y: 80, label: "Class A" },
        { x: 35, y: 85, label: "Class A" },
        { x: 25, y: 70, label: "Class A" },
        { x: 80, y: 30, label: "Class B" },
        { x: 85, y: 70, label: "Class B" },
      ],
      defaultQuery: { x: 65, y: 55 },
      defaultK: 3,
    },
    rawString: "Cluster: Imbalanced | Query: 65,55 | K: 3",
  },
];

export default function MLVisualizer() {
  const [dataset, setDataset] = useState<DataPoint[]>(PRESETS[0].data.points);
  const [k, setK] = useState<number>(3);
  const [queryX, setQueryX] = useState<number>(50);
  const [queryY, setQueryY] = useState<number>(55);

  // Euclidean distances to all training points
  const pointsWithDistance = dataset.map((pt) => {
    const dist = Math.hypot(pt.x - queryX, pt.y - queryY);
    return { ...pt, dist };
  }).sort((a, b) => a.dist - b.dist);

  const nearestNeighbors = pointsWithDistance.slice(0, k);
  const countA = nearestNeighbors.filter((p) => p.label === "Class A").length;
  const countB = nearestNeighbors.filter((p) => p.label === "Class B").length;
  const predictedClass = countA > countB ? "Class A" : "Class B";

  const maxDist = nearestNeighbors[nearestNeighbors.length - 1]?.dist || 0;

  const handleApplyPreset = (p: MLDatasetConfig) => {
    setDataset(p.points);
    setQueryX(p.defaultQuery.x);
    setQueryY(p.defaultQuery.y);
    setK(p.defaultK);
  };

  const handleApplyRaw = (raw: string) => {
    // Expected format: Query: X,Y | K: 3
    const qMatch = raw.match(/query:\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)/i);
    const kMatch = raw.match(/k:\s*(\d+)/i);

    const errors: string[] = [];

    if (qMatch) {
      const qx = Number(qMatch[1]);
      const qy = Number(qMatch[2]);
      if (qx >= 5 && qx <= 95 && qy >= 5 && qy <= 95) {
        setQueryX(Math.round(qx));
        setQueryY(Math.round(qy));
      } else {
        errors.push("Query point coordinates (X, Y) must be between 5 and 95.");
      }
    }

    if (kMatch) {
      const valK = Number(kMatch[1]);
      if (valK >= 1 && valK <= dataset.length) {
        setK(valK);
      } else {
        errors.push(`K must be between 1 and ${dataset.length} (total samples).`);
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Non-Parametric Supervised Learning
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            K-Nearest Neighbors (KNN) Decision Boundary Classifier
          </h3>
        </div>

        {/* K-Value Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">Hyperparameter K:</span>
          <div className="flex items-center gap-1">
            {[1, 3, 5, 7].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setK(val)}
                className={cn(
                  "px-2.5 py-1 text-xs font-mono rounded-lg border transition-all",
                  k === val
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] font-bold dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-[#E5E5E5] dark:text-slate-400 text-[#737373]"
                )}
              >
                K={val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Query Coordinates & Cluster Distributions"
        subtitle="Set custom query point (X, Y) and K parameter, or select cluster topology presets."
        initialValue={`Query: ${queryX}, ${queryY} | K: ${k}`}
        placeholder="Query: 50, 50 | K: 3"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`Query (${queryX}, ${queryY}) | K = ${k} | ${dataset.length} Samples`}
      />

      {/* Interactive 2D Feature Space Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 relative h-64 dark:bg-black/40 bg-[#F7F7F7] rounded-xl border dark:border-white/10 border-[#E5E5E5] p-2 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full cursor-crosshair select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              setQueryX(Math.max(5, Math.min(95, x)));
              setQueryY(Math.max(5, Math.min(95, y)));
            }}
          >
            {/* Neighborhood Circle */}
            <circle
              cx={queryX}
              cy={queryY}
              r={maxDist}
              className="fill-cyan-500/10 stroke-cyan-400/40 stroke-[0.5] stroke-dasharray-[2,2]"
            />

            {/* Connecting lines to K nearest */}
            {nearestNeighbors.map((p, i) => (
              <line
                key={i}
                x1={queryX}
                y1={queryY}
                x2={p.x}
                y2={p.y}
                className="stroke-amber-400/60 stroke-[0.75]"
              />
            ))}

            {/* Training Data Points */}
            {dataset.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={3}
                className={cn(
                  "transition-transform",
                  pt.label === "Class A" ? "fill-[#0A84FF] stroke-white stroke-[0.5]" : "fill-[#FF7A00] stroke-white stroke-[0.5]"
                )}
              />
            ))}

            {/* Query Point */}
            <circle
              cx={queryX}
              cy={queryY}
              r={4.5}
              className={cn(
                "stroke-white stroke-[1.5] shadow-lg animate-pulse",
                predictedClass === "Class A" ? "fill-[#0A84FF]" : "fill-[#FF7A00]"
              )}
            />
          </svg>
        </div>

        {/* Prediction Results & Vote Matrix */}
        <div className="flex flex-col justify-between p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs space-y-4">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Query Point (X={queryX}, Y={queryY}):
            </span>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold dark:text-white text-[#171717]">Predicted:</span>
              <span className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold text-white",
                predictedClass === "Class A" ? "bg-[#0A84FF]" : "bg-[#FF7A00]"
              )}>
                {predictedClass}
              </span>
            </div>
            <p className="text-[11px] dark:text-slate-400 text-[#737373] leading-relaxed">
              Click anywhere on the feature canvas or set custom coordinates above.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t dark:border-white/[0.08] border-[#E5E5E5]">
            <span className="text-[11px] font-bold dark:text-slate-300 text-[#171717] block">
              Majority Vote Tally (K={k}):
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[#0A84FF] font-semibold">Class A votes:</span>
              <span>{countA} / {k} ({Math.round((countA / k) * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#FF7A00] font-semibold">Class B votes:</span>
              <span>{countB} / {k} ({Math.round((countB / k) * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
