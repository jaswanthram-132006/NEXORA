import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function SortingBarsPreview() {
  const bars = [
    { h: 85, state: "sorted" },
    { h: 92, state: "sorted" },
    { h: 65, state: "active" },
    { h: 78, state: "active" },
    { h: 45, state: "default" },
    { h: 70, state: "default" },
    { h: 55, state: "default" },
    { h: 88, state: "default" },
    { h: 60, state: "default" },
    { h: 75, state: "default" },
    { h: 50, state: "default" },
    { h: 95, state: "default" },
  ];

  return (
    <div className="card-base rounded-2xl overflow-hidden shadow-sm dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] border dark:border-white/10 border-[#E5E5E5]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b dark:border-white/[0.08] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono dark:text-slate-200 text-[#171717] font-bold">Merge Sort</span>
          <span className="px-2 py-0.5 rounded-md dark:bg-[#0A84FF]/15 dark:text-blue-300 dark:border-[#0A84FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border border-[#FF7A00]/30 text-[11px] font-mono">
            Step 4 / 24
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono dark:text-slate-400 text-[#737373]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full dark:bg-[#00D2FF] bg-[#FF7A00]" />
            Sorted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full dark:bg-[#0A84FF] bg-[#EA580C]" />
            Comparing
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="px-6 py-6 flex items-end justify-center gap-1.5 sm:gap-2 h-44 dark:bg-black/40 bg-white border-y dark:border-transparent border-[#E5E5E5]">
        {bars.map((bar, i) => {
          const bgClass =
            bar.state === "sorted"
              ? "dark:bg-[#00D2FF] bg-[#FF7A00]"
              : bar.state === "active"
              ? "dark:bg-[#0A84FF] bg-[#EA580C]"
              : "dark:bg-slate-700/50 bg-[#E5E5E5]";

          return (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${bgClass}`}
              style={{
                height: `${bar.h}%`,
              }}
            />
          );
        })}
      </div>

      {/* Complexity display */}
      <div className="px-5 py-3 border-t dark:border-white/[0.06] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7] grid grid-cols-3 gap-3">
        {[
          { label: "Comparisons", value: "24" },
          { label: "Buffer Writes", value: "12" },
          { label: "Complexity", value: "Θ(n log n)" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-xs font-bold dark:text-slate-200 text-[#171717] font-mono">{m.value}</p>
            <p className="text-[10px] dark:text-slate-500 text-[#737373] font-mono">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GraphPreview() {
  const nodes = [
    { id: "A", cx: 60, cy: 50, state: "visited" },
    { id: "B", cx: 150, cy: 30, state: "visited" },
    { id: "C", cx: 240, cy: 60, state: "queue" },
    { id: "D", cx: 150, cy: 100, state: "visited" },
    { id: "E", cx: 70, cy: 130, state: "unvisited" },
    { id: "F", cx: 230, cy: 130, state: "unvisited" },
  ];

  const edges = [
    ["A", "B"], ["A", "D"], ["B", "C"], ["D", "C"], ["D", "E"], ["C", "F"],
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="card-base rounded-2xl overflow-hidden shadow-sm dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)] border dark:border-white/10 border-[#E5E5E5]">
      <div className="flex items-center justify-between px-5 py-3 border-b dark:border-white/[0.08] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7]">
        <span className="text-xs font-mono font-bold dark:text-slate-200 text-[#171717]">BFS Traversal</span>
        <span className="px-2 py-0.5 rounded-md dark:bg-[#00D2FF]/15 dark:text-cyan-300 dark:border-[#00D2FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border border-[#FF7A00]/30 text-[11px] font-mono">
          Queue: [C, E]
        </span>
      </div>

      <div className="dark:bg-black/40 bg-white p-4 border-y dark:border-transparent border-[#E5E5E5]">
        <svg
          viewBox="0 0 300 160"
          className="w-full"
          aria-label="BFS graph traversal diagram"
        >
          {edges.map(([from, to]) => {
            const f = nodeMap[from];
            const t = nodeMap[to];
            return (
              <line
                key={`${from}-${to}`}
                x1={f.cx}
                y1={f.cy}
                x2={t.cx}
                y2={t.cy}
                className="dark:stroke-white/20 stroke-gray-300"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}

          {nodes.map((n) => {
            const fill =
              n.state === "visited"
                ? "#10b981"
                : n.state === "queue"
                ? "#FF7A00"
                : "#E5E5E5";
            const stroke =
              n.state === "visited"
                ? "#059669"
                : n.state === "queue"
                ? "#EA580C"
                : "#D1D5DB";

            return (
              <g key={n.id}>
                <circle
                  cx={n.cx}
                  cy={n.cy}
                  r="16"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                  opacity={n.state === "unvisited" ? 0.6 : 1}
                />
                <text
                  x={n.cx}
                  y={n.cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={n.state === "unvisited" ? "#171717" : "#ffffff"}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="px-5 py-3 border-t dark:border-white/[0.06] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7] flex gap-4 text-[11px] font-mono dark:text-slate-400 text-[#737373]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF7A00]" />
          In Queue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Unvisited
        </span>
      </div>
    </div>
  );
}

export default function VisualizationPreview() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy */}
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#0A84FF]/25 border-[#FF7A00]/25 text-xs font-mono font-medium dark:text-blue-300 text-[#FF7A00] uppercase tracking-widest mb-4 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-pulse" />
              Real-Time Simulations
            </span>
            <h2 className="section-title dark:text-white text-[#171717] mb-6">
              <span>Observe algorithms</span>
              <br />
              <span className="gradient-text-electric">compute step-by-step</span>
            </h2>
            <p className="text-sm sm:text-base dark:text-slate-400 text-[#737373] leading-relaxed mb-8 max-w-xl font-sans">
              NEXORA simulation engines execute deterministic algorithm code in real time.
              Control playback velocity, scrub through individual comparisons and partition steps,
              and watch state-space frontier queues expand and contract.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/simulations" className="btn-primary text-xs sm:text-sm">
                Explore All Simulations
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/daa/sorting" className="btn-secondary text-xs sm:text-sm">
                Sorting Theory Deep-Dive
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Previews */}
          <div className="flex flex-col gap-6">
            <SortingBarsPreview />
            <GraphPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
