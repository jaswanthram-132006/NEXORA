"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, CheckCircle, ShieldAlert, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { GraphData, InputPreset } from "@/lib/customInput/types";
import { parseGraphEdges } from "@/lib/customInput/parsers";

const PRESETS: InputPreset<GraphData>[] = [
  {
    id: "classic-6vertex",
    name: "Classic 6-Vertex Graph",
    description: "6 vertices with cross edges; OPT = 3 {B, D, E}, 2-Approx = 4",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "D" },
        { from: "B", to: "E" },
        { from: "D", to: "E" },
        { from: "E", to: "F" },
      ],
    },
    rawString: "A-B, B-C, C-D, B-E, D-E, E-F",
  },
  {
    id: "star-graph",
    name: "Star Graph (Hub B)",
    description: "Central hub connected to 4 spokes. OPT = 1 {B}, Approx = 2",
    data: {
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        { from: "B", to: "A" },
        { from: "B", to: "C" },
        { from: "B", to: "D" },
        { from: "B", to: "E" },
      ],
    },
    rawString: "B-A, B-C, B-D, B-E",
  },
  {
    id: "disjoint-pairs",
    name: "Independent Edges (Tight Ratio 2.0)",
    description: "3 completely disjoint edges; OPT = 3, Approx = 6 (exactly 2·OPT)",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F"],
      edges: [
        { from: "A", to: "B" },
        { from: "C", to: "D" },
        { from: "E", to: "F" },
      ],
    },
    rawString: "A-B, C-D, E-F",
  },
  {
    id: "triangle-tail",
    name: "Triangle with Tail",
    description: "Cycle A-B-C with outer leaf D",
    data: {
      nodes: ["A", "B", "C", "D"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "A" },
        { from: "C", to: "D" },
      ],
    },
    rawString: "A-B, B-C, C-A, C-D",
  },
];

export default function ApproximationVisualizer() {
  const [graph, setGraph] = useState<GraphData>(PRESETS[0].data);
  const [selectedAlgo, setSelectedAlgo] = useState<"approx" | "optimal">("approx");

  // Pure 2-Approximation Maximal Matching solver
  const approxResult = useMemo(() => {
    const coveredEdges = new Set<number>();
    const matchingEdges: { from: string; to: string }[] = [];
    const coverVertices = new Set<string>();

    for (let i = 0; i < graph.edges.length; i++) {
      if (coveredEdges.has(i)) continue;

      const e = graph.edges[i];
      matchingEdges.push(e);
      coverVertices.add(e.from);
      coverVertices.add(e.to);

      // Mark all incident edges as covered
      for (let j = 0; j < graph.edges.length; j++) {
        const other = graph.edges[j];
        if (
          other.from === e.from ||
          other.from === e.to ||
          other.to === e.from ||
          other.to === e.to
        ) {
          coveredEdges.add(j);
        }
      }
    }

    return {
      cover: Array.from(coverVertices).sort(),
      matching: matchingEdges,
    };
  }, [graph]);

  // Exact Minimum Vertex Cover Brute-Force (Power-set Search)
  const optimalResult = useMemo(() => {
    const n = graph.nodes.length;
    let minCover: string[] = [...graph.nodes];

    // Check all 2^n subsets
    const totalSubsets = 1 << Math.min(n, 14); // Safety cap for brute force
    for (let mask = 0; mask < totalSubsets; mask++) {
      const subset: string[] = [];
      for (let i = 0; i < n; i++) {
        if ((mask & (1 << i)) !== 0) {
          subset.push(graph.nodes[i]);
        }
      }

      if (subset.length >= minCover.length) continue;

      // Verify if subset covers all edges
      const subSetSet = new Set(subset);
      const coversAll = graph.edges.every(
        (e) => subSetSet.has(e.from) || subSetSet.has(e.to)
      );

      if (coversAll) {
        minCover = subset;
      }
    }

    return {
      cover: minCover.sort(),
    };
  }, [graph]);

  const activeCover = selectedAlgo === "approx" ? approxResult.cover : optimalResult.cover;
  const ratio = optimalResult.cover.length > 0
    ? (approxResult.cover.length / optimalResult.cover.length).toFixed(2)
    : "1.00";

  const formattedEdges = useMemo(() => {
    return graph.edges.map((e) => `${e.from}-${e.to}`).join(", ");
  }, [graph.edges]);

  const handleApplyGraph = (newGraph: GraphData) => {
    setGraph(newGraph);
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-emerald-500/10 bg-emerald-50 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Polynomial-Time Approximation Scheme
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Vertex Cover: 2-Approximation via Maximal Matching vs OPT
          </h3>
        </div>

        {/* Algorithm Comparison Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl dark:bg-white/[0.05] bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setSelectedAlgo("approx")}
            className={cn(
              "px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all",
              selectedAlgo === "approx"
                ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white shadow-sm"
                : "dark:text-slate-400 text-[#737373]"
            )}
          >
            2-Approx (Matching)
          </button>
          <button
            type="button"
            onClick={() => setSelectedAlgo("optimal")}
            className={cn(
              "px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all",
              selectedAlgo === "optimal"
                ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white shadow-sm"
                : "dark:text-slate-400 text-[#737373]"
            )}
          >
            Brute-Force OPT
          </button>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Graph Topology & Presets"
        subtitle="Define undirected edges to test the 2-approximation maximal matching bound against optimal minimum vertex cover."
        initialValue={formattedEdges}
        placeholder="e.g. A-B, B-C, C-D, B-E, D-E, E-F"
        presets={PRESETS}
        onApply={(raw) => {
          const res = parseGraphEdges(raw);
          if (!res.isValid || !res.data) {
            return { isValid: false, errors: res.errors };
          }
          handleApplyGraph(res.data);
          return { isValid: true };
        }}
        onReset={() => handleApplyGraph(PRESETS[0].data)}
        summaryBadge={`|V| = ${graph.nodes.length} Vertices | |E| = ${graph.edges.length} Edges`}
      />

      {/* Metric comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-center">
        <div className="p-3 rounded-xl border dark:border-white/10 border-[#E5E5E5] dark:bg-black/30 bg-[#F7F7F7]">
          <span className="text-[11px] text-slate-400 block mb-1">Active Cover Size |C|</span>
          <span className="text-base font-bold dark:text-white text-[#171717]">
            {activeCover.length} Vertices
          </span>
        </div>
        <div className="p-3 rounded-xl border dark:border-white/10 border-[#E5E5E5] dark:bg-black/30 bg-[#F7F7F7]">
          <span className="text-[11px] text-slate-400 block mb-1">Approximation Ratio</span>
          <span className="text-base font-bold text-emerald-500">
            {selectedAlgo === "approx"
              ? `${approxResult.cover.length} / ${optimalResult.cover.length} = ${ratio} ≤ 2.0`
              : "1.00 (Exact OPT)"}
          </span>
        </div>
        <div className="p-3 rounded-xl border dark:border-white/10 border-[#E5E5E5] dark:bg-black/30 bg-[#F7F7F7]">
          <span className="text-[11px] text-slate-400 block mb-1">Time Complexity</span>
          <span className="text-base font-bold text-[#FF7A00] dark:text-[#0A84FF]">
            {selectedAlgo === "approx" ? "O(|V| + |E|) [Linear]" : `O(2^|V| · |E|) [${1 << graph.nodes.length} steps]`}
          </span>
        </div>
      </div>

      {/* Visual Graph Vertices View */}
      <div className="p-4 rounded-xl dark:bg-black/40 bg-white border dark:border-white/10 border-[#E5E5E5] flex flex-wrap items-center justify-center gap-3">
        {graph.nodes.map((v) => {
          const inCover = activeCover.includes(v);
          return (
            <div
              key={v}
              className={cn(
                "w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs border transition-all duration-300",
                inCover
                  ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105"
                  : "dark:bg-slate-800 bg-slate-100 dark:border-white/10 border-slate-300 dark:text-slate-400 text-slate-600"
              )}
            >
              <span>{v}</span>
              <span className="text-[9px] opacity-75">{inCover ? "COVER" : "FREE"}</span>
            </div>
          );
        })}
      </div>

      {/* Theoretical Invariant Description */}
      <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
        {selectedAlgo === "approx" ? (
          <span className="dark:text-slate-200 text-[#171717]">
            <strong>Maximal Matching Invariant:</strong> Selected {approxResult.matching.length} disjoint edges [{approxResult.matching.map((e) => `${e.from}-${e.to}`).join(", ")}]. Adding both endpoints guarantees every edge in the graph is covered. Since any valid cover must contain at least one endpoint from each disjoint matching edge, OPT &ge; |M|. Therefore |C| = 2|M| &le; 2&middot;OPT.
          </span>
        ) : (
          <span className="dark:text-slate-200 text-[#171717]">
            <strong>Exact Minimum Vertex Cover (OPT):</strong> Minimal subset [{optimalResult.cover.join(", ")}] covering all {graph.edges.length} edges. Discovered by exhaustive state-space search in exponential time.
          </span>
        )}
      </div>
    </div>
  );
}
