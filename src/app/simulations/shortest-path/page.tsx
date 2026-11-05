"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, SkipForward, RotateCcw, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseGraphEdges } from "@/lib/customInput/parsers";
import { GraphData, InputPreset } from "@/lib/customInput/types";

interface NodePos {
  id: string;
  x: number;
  y: number;
}

const PRESETS: InputPreset<GraphData>[] = [
  {
    id: "default-st",
    name: "Classic S-T Network (Default)",
    description: "6 vertices with multiple competing paths from S to T",
    data: {
      nodes: ["S", "A", "B", "C", "D", "T"],
      edges: [
        { from: "S", to: "A", weight: 4 },
        { from: "S", to: "B", weight: 2 },
        { from: "A", to: "C", weight: 5 },
        { from: "B", to: "A", weight: 1 },
        { from: "B", to: "D", weight: 8 },
        { from: "C", to: "T", weight: 3 },
        { from: "D", to: "C", weight: 2 },
        { from: "D", to: "T", weight: 6 },
      ],
    },
    rawString: "S-A:4, S-B:2, A-C:5, B-A:1, B-D:8, C-T:3, D-C:2, D-T:6",
  },
  {
    id: "scenic-hops",
    name: "Scenic Multi-Hop Advantage",
    description: "4 rapid unit hops beat a direct high-cost edge (S-B-C-D-T cost 4 vs S-A-T cost 20)",
    data: {
      nodes: ["S", "A", "B", "C", "D", "T"],
      edges: [
        { from: "S", to: "A", weight: 10 },
        { from: "A", to: "T", weight: 10 },
        { from: "S", to: "B", weight: 1 },
        { from: "B", to: "C", weight: 1 },
        { from: "C", to: "D", weight: 1 },
        { from: "D", to: "T", weight: 1 },
      ],
    },
    rawString: "S-A:10, A-T:10, S-B:1, B-C:1, C-D:1, D-T:1",
  },
  {
    id: "triangular-bridge",
    name: "Triangular Bridge",
    description: "Cross edge A-B with weight 1 redirects shortest path",
    data: {
      nodes: ["S", "A", "B", "T"],
      edges: [
        { from: "S", to: "A", weight: 2 },
        { from: "S", to: "B", weight: 5 },
        { from: "A", to: "B", weight: 1 },
        { from: "A", to: "T", weight: 7 },
        { from: "B", to: "T", weight: 3 },
      ],
    },
    rawString: "S-A:2, S-B:5, A-B:1, A-T:7, B-T:3",
  },
  {
    id: "diamond-bypass",
    name: "Diamond Bypass",
    description: "Symmetrical diamond routing",
    data: {
      nodes: ["S", "A", "B", "C", "T"],
      edges: [
        { from: "S", to: "A", weight: 3 },
        { from: "S", to: "B", weight: 4 },
        { from: "A", to: "C", weight: 6 },
        { from: "B", to: "C", weight: 2 },
        { from: "C", to: "T", weight: 5 },
      ],
    },
    rawString: "S-A:3, S-B:4, A-C:6, B-C:2, C-T:5",
  },
];

export default function ShortestPathSimulationPage() {
  const [graphData, setGraphData] = useState<GraphData>(PRESETS[0].data);
  const [source, setSource] = useState<string>("S");
  const [target, setTarget] = useState<string>("T");
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Position nodes along canvas (viewBox 460 x 240)
  const nodePositions: NodePos[] = useMemo(() => {
    const total = graphData.nodes.length;
    if (total === 0) return [];

    const cx = 230;
    const cy = 120;
    const rx = 180;
    const ry = 80;

    return graphData.nodes.map((nodeId, idx) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / total;
      return {
        id: nodeId,
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
      };
    });
  }, [graphData.nodes]);

  // Dijkstra state steps computation
  const computeDijkstraSteps = useCallback(() => {
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};

    graphData.nodes.forEach((id) => {
      dist[id] = id === source ? 0 : Infinity;
      prev[id] = null;
    });

    const pq: { node: string; dist: number }[] = [{ node: source, dist: 0 }];
    const visited: string[] = [];
    const steps: {
      currentNode: string;
      distSnapshot: Record<string, number>;
      visitedSnapshot: string[];
      pqSnapshot: { node: string; dist: number }[];
      explanation: string;
    }[] = [];

    steps.push({
      currentNode: source,
      distSnapshot: { ...dist },
      visitedSnapshot: [],
      pqSnapshot: [{ node: source, dist: 0 }],
      explanation: `Initialized Priority Queue with source [${source}] (dist=0). All other vertices initialized to dist=∞.`,
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const curr = pq.shift()!;
      if (visited.includes(curr.node)) continue;
      visited.push(curr.node);

      // Relax outgoing edges (undirected graph representation)
      const incidentEdges = graphData.edges.filter(
        (e) => e.from === curr.node || e.to === curr.node
      );

      for (const edge of incidentEdges) {
        const neighbor = edge.from === curr.node ? edge.to : edge.from;
        const w = edge.weight !== undefined ? edge.weight : 1;

        if (!visited.includes(neighbor)) {
          const newDist = dist[curr.node] + w;
          if (newDist < dist[neighbor]) {
            dist[neighbor] = newDist;
            prev[neighbor] = curr.node;
            pq.push({ node: neighbor, dist: newDist });
          }
        }
      }

      steps.push({
        currentNode: curr.node,
        distSnapshot: { ...dist },
        visitedSnapshot: [...visited],
        pqSnapshot: [...pq],
        explanation: `Extracted min vertex [${curr.node}] (dist=${curr.dist}). Relaxed outgoing incident edges.`,
      });

      if (curr.node === target) break;
    }

    if (!visited.includes(target)) {
      steps.push({
        currentNode: target,
        distSnapshot: { ...dist },
        visitedSnapshot: [...visited],
        pqSnapshot: [],
        explanation: `Dijkstra completed. Vertex [${target}] reached with shortest path cost = ${dist[target] === Infinity ? "Unreachable (∞)" : dist[target]}.`,
      });
    }

    return { steps, prev, dist };
  }, [graphData, source, target]);

  const { steps, dist } = useMemo(() => computeDijkstraSteps(), [computeDijkstraSteps]);
  const currentStep = steps[stepIdx] || steps[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (stepIdx < steps.length - 1) {
          setStepIdx((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 700);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, stepIdx, steps.length]);

  const formattedEdges = useMemo(() => {
    return graphData.edges
      .map((e) => `${e.from}-${e.to}${e.weight !== undefined ? `:${e.weight}` : ""}`)
      .join(", ");
  }, [graphData.edges]);

  const handleApplyCustomGraph = (newGraph: GraphData) => {
    setGraphData(newGraph);
    const firstNode = newGraph.nodes[0] || "S";
    const lastNode = newGraph.nodes[newGraph.nodes.length - 1] || "T";
    setSource(firstNode);
    setTarget(lastNode);
    setStepIdx(0);
    setIsPlaying(false);
  };

  const handleApplyRaw = (raw: string) => {
    const res = parseGraphEdges(raw);
    if (!res.isValid || !res.data) {
      return { isValid: false, errors: res.errors };
    }
    handleApplyCustomGraph(res.data);
    return { isValid: true };
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-28 pb-24">
        <div className="section-padding space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono dark:text-slate-500 text-[#737373]">
            <Link href="/simulations" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Simulations
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-cyan-500/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-cyan-300 text-[#FF7A00] font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Weighted Graph Search
              </span>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-white text-[#171717]">
                Shortest Path Engine (Dijkstra)
              </h1>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 rounded-xl"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play Run"}
              </button>
              <button
                type="button"
                onClick={() => setStepIdx(Math.min(stepIdx + 1, steps.length - 1))}
                disabled={stepIdx >= steps.length - 1}
                className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1 rounded-xl disabled:opacity-40"
              >
                <SkipForward className="w-4 h-4" /> Step
              </button>
              <button
                type="button"
                onClick={() => { setStepIdx(0); setIsPlaying(false); }}
                className="btn-secondary text-xs px-3 py-2 flex items-center gap-1 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Custom Input Panel */}
          <CustomInputPanel
            title="Custom Weighted Graph & Shortest Path Presets"
            subtitle="Specify weighted edges (e.g. S-A:4, S-B:2, A-C:5). Non-negative edge weights guarantee greedy Dijkstra optimality."
            initialValue={formattedEdges}
            placeholder="e.g. S-A:4, S-B:2, A-C:5, B-A:1, B-D:8, C-T:3"
            presets={PRESETS}
            onApply={handleApplyRaw}
            onReset={() => handleApplyCustomGraph(PRESETS[0].data)}
            summaryBadge={`Source: [${source}] → Target: [${target}] | Shortest Path: ${dist[target] === Infinity ? "∞" : dist[target]}`}
          />

          {/* Source and Target Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="dark:text-slate-400 text-slate-600 font-bold">Source Vertex:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {graphData.nodes.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setSource(n); setStepIdx(0); }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border text-xs font-bold transition-all",
                      source === n
                        ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white"
                        : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="dark:text-slate-400 text-slate-600 font-bold">Target Vertex:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {graphData.nodes.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setTarget(n); setStepIdx(0); }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg border text-xs font-bold transition-all",
                      target === n
                        ? "dark:bg-emerald-500 bg-emerald-600 text-white"
                        : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Graph Canvas */}
          <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl">
            <div className="h-64 sm:h-80 w-full dark:bg-black/40 bg-[#F7F7F7] rounded-xl flex items-center justify-center p-4 relative">
              <svg viewBox="0 0 460 240" className="w-full h-full max-w-xl">
                {/* Edges with Weights */}
                {graphData.edges.map((e, i) => {
                  const nodeU = nodePositions.find((n) => n.id === e.from);
                  const nodeV = nodePositions.find((n) => n.id === e.to);
                  if (!nodeU || !nodeV) return null;

                  const isVisited =
                    currentStep.visitedSnapshot.includes(e.from) &&
                    currentStep.visitedSnapshot.includes(e.to);

                  const midX = (nodeU.x + nodeV.x) / 2;
                  const midY = (nodeU.y + nodeV.y) / 2;

                  return (
                    <g key={i}>
                      <line
                        x1={nodeU.x}
                        y1={nodeU.y}
                        x2={nodeV.x}
                        y2={nodeV.y}
                        className={cn(
                          "transition-all duration-300",
                          isVisited ? "stroke-cyan-400 stroke-2" : "dark:stroke-slate-700 stroke-slate-300 stroke-1"
                        )}
                      />
                      {/* Weight pill */}
                      <circle cx={midX} cy={midY} r={10} className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 stroke-1" />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        className="text-[9px] font-mono font-bold fill-[#FF7A00] dark:fill-cyan-400"
                      >
                        {e.weight !== undefined ? e.weight : 1}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodePositions.map((node) => {
                  const isSource = node.id === source;
                  const isTarget = node.id === target;
                  const isCurrent = currentStep.currentNode === node.id;
                  const isVisited = currentStep.visitedSnapshot.includes(node.id);
                  const distVal = currentStep.distSnapshot[node.id];

                  return (
                    <g key={node.id} className="transition-all duration-300">
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={18}
                        className={cn(
                          "transition-all duration-300",
                          isCurrent
                            ? "fill-[#FF7A00] dark:fill-[#0A84FF] stroke-white stroke-2 shadow-lg"
                            : isVisited
                            ? "fill-emerald-500 stroke-emerald-300 stroke-2"
                            : isSource
                            ? "fill-blue-600 stroke-blue-400 stroke-2"
                            : isTarget
                            ? "fill-purple-600 stroke-purple-400 stroke-2"
                            : "dark:fill-slate-800 fill-white dark:stroke-slate-600 stroke-slate-300 stroke-1"
                        )}
                      />
                      <text
                        x={node.x}
                        y={node.y - 1}
                        textAnchor="middle"
                        className={cn(
                          "text-[11px] font-mono font-bold select-none",
                          isCurrent || isVisited || isSource || isTarget ? "fill-white" : "dark:fill-slate-200 fill-[#171717]"
                        )}
                      >
                        {node.id}
                      </text>
                      <text
                        x={node.x}
                        y={node.y + 10}
                        textAnchor="middle"
                        className={cn(
                          "text-[8px] font-mono font-bold select-none",
                          isCurrent || isVisited || isSource || isTarget ? "fill-white/80" : "fill-slate-400"
                        )}
                      >
                        {distVal === Infinity ? "∞" : distVal}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] font-mono text-xs">
              <span className="dark:text-slate-200 text-[#171717]">
                Step {stepIdx + 1}/{steps.length}: {currentStep.explanation}
              </span>
              <span className="text-[11px] font-bold text-emerald-500">
                Target Cost = {currentStep.distSnapshot[target] === Infinity ? "∞" : currentStep.distSnapshot[target]}
              </span>
            </div>
          </div>

          {/* Theory Links */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200 flex flex-wrap items-center gap-6">
            <Link
              href="/poai/search"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full State-Space Search, A* &amp; Heuristic Optimization Documentation
            </Link>
            <Link
              href="/daa/graphs"
              className="text-xs dark:text-slate-400 text-slate-600 hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read DAA Graph Traversals &amp; Dijkstra Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
