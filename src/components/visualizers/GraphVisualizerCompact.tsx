"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, RotateCcw, SkipForward } from "lucide-react";
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
    id: "classic-mesh",
    name: "Classic Mesh (5 Nodes)",
    description: "Standard graph with cross edges",
    data: {
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "D" },
        { from: "B", to: "C" },
        { from: "B", to: "E" },
        { from: "C", to: "E" },
        { from: "D", to: "E" },
      ],
    },
    rawString: "A-B, A-D, B-C, B-E, C-E, D-E",
  },
  {
    id: "star-hub",
    name: "Star Hub (Central Node A)",
    description: "Hub node connecting to 5 outer spokes",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "A", to: "D" },
        { from: "A", to: "E" },
        { from: "A", to: "F" },
      ],
    },
    rawString: "A-B, A-C, A-D, A-E, A-F",
  },
  {
    id: "cycle-ring",
    name: "Cycle Ring (6 Nodes)",
    description: "Closed polygon ring topology",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "D" },
        { from: "D", to: "E" },
        { from: "E", to: "F" },
        { from: "F", to: "A" },
      ],
    },
    rawString: "A-B, B-C, C-D, D-E, E-F, F-A",
  },
  {
    id: "binary-tree",
    name: "Binary Tree Hierarchy",
    description: "Root A with left and right subtrees",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F", "G"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "B", to: "D" },
        { from: "B", to: "E" },
        { from: "C", to: "F" },
        { from: "C", to: "G" },
      ],
    },
    rawString: "A-B, A-C, B-D, B-E, C-F, C-G",
  },
  {
    id: "disconnected",
    name: "Disconnected Components",
    description: "Component {A,B,C} separate from {D,E}",
    data: {
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "D", to: "E" },
      ],
    },
    rawString: "A-B, B-C, D-E",
  },
];

export default function GraphVisualizerCompact() {
  const [graph, setGraph] = useState<GraphData>(PRESETS[0].data);
  const [startNode, setStartNode] = useState<string>("A");
  const [visited, setVisited] = useState<string[]>(["A"]);
  const [queue, setQueue] = useState<string[]>([]);
  const [current, setCurrent] = useState<string>("A");
  const [stepMsg, setStepMsg] = useState<string>("Ready to explore from starting node A.");

  // Dynamically calculate node positions in SVG canvas (width 320, height 180)
  const nodePositions: NodePos[] = useMemo(() => {
    const total = graph.nodes.length;
    if (total === 0) return [];

    // Position nodes along an ellipse for clean presentation
    const cx = 160;
    const cy = 90;
    const rx = 125;
    const ry = 65;

    return graph.nodes.map((nodeId, idx) => {
      // Start from top angle -PI/2
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / total;
      return {
        id: nodeId,
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
      };
    });
  }, [graph.nodes]);

  // Handle applying new custom graph
  const handleApplyGraph = (newGraph: GraphData) => {
    setGraph(newGraph);
    const start = newGraph.nodes[0] || "A";
    setStartNode(start);
    resetWithStart(start, newGraph);
  };

  const resetWithStart = (start: string, g: GraphData = graph) => {
    // Initial neighbors of start
    const neighbors = g.edges
      .filter((e) => e.from === start || e.to === start)
      .map((e) => (e.from === start ? e.to : e.from));

    const initialQueue = Array.from(new Set(neighbors));
    setVisited([start]);
    setQueue(initialQueue);
    setCurrent(start);
    setStepMsg(`Initialized BFS at start node [${start}]. Enqueued direct neighbors: [${initialQueue.join(", ") || "none"}].`);
  };

  const stepBFS = () => {
    if (queue.length === 0) {
      setStepMsg(`BFS complete for this connected component! (${visited.length}/${graph.nodes.length} nodes visited).`);
      return;
    }

    const nextNode = queue[0];
    const newQueue = queue.slice(1);
    const newVisited = [...visited, nextNode];

    // Find unvisited neighbors of nextNode
    const neighbors = graph.edges
      .filter((e) => e.from === nextNode || e.to === nextNode)
      .map((e) => (e.from === nextNode ? e.to : e.from))
      .filter((n) => !newVisited.includes(n) && !newQueue.includes(n));

    const updatedQueue = [...newQueue, ...Array.from(new Set(neighbors))];

    setVisited(newVisited);
    setQueue(updatedQueue);
    setCurrent(nextNode);
    setStepMsg(
      `Dequeued [${nextNode}]. Discovered new unvisited neighbors: [${neighbors.join(", ") || "none"}].`
    );
  };

  const formattedEdgesString = useMemo(() => {
    return graph.edges.map((e) => `${e.from}-${e.to}`).join(", ");
  }, [graph.edges]);

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Graph Frontier Queue Engine
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Breadth-First Search (BFS) Traversal
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={stepBFS}
            disabled={queue.length === 0 && visited.length > 1}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Step BFS
          </button>
          <button
            type="button"
            onClick={() => resetWithStart(startNode)}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <Link
            href="/simulations/graph-traversal"
            className="text-xs font-mono font-semibold dark:text-cyan-400 text-[#FF7A00] hover:underline flex items-center gap-1 ml-2"
          >
            Full Lab <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Custom Graph Input Panel */}
      <CustomInputPanel
        title="Custom Graph Topology & Presets"
        subtitle="Enter undirected graph edges (e.g. A-B, A-C, B-D). Vertex names are extracted automatically."
        initialValue={formattedEdgesString}
        placeholder="e.g. A-B, B-C, C-D, D-A, A-C"
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

      {/* Start Node Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="dark:text-slate-400 text-[#737373]">Start Vertex:</span>
          <div className="flex items-center gap-1 flex-wrap">
            {graph.nodes.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setStartNode(n);
                  resetWithStart(n);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-xs font-bold transition-all",
                  startNode === n
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Queue Strategy: FIFO (First-In, First-Out)
        </div>
      </div>

      {/* SVG Graph Viewport */}
      <div className="h-48 w-full dark:bg-black/40 bg-[#F7F7F7] rounded-xl flex items-center justify-center p-2 border dark:border-white/5 border-[#E5E5E5]">
        <svg viewBox="0 0 320 180" className="w-full h-full max-w-sm">
          {/* Edges */}
          {graph.edges.map((edge, i) => {
            const nodeU = nodePositions.find((n) => n.id === edge.from);
            const nodeV = nodePositions.find((n) => n.id === edge.to);
            if (!nodeU || !nodeV) return null;

            const isTraversed = visited.includes(edge.from) && visited.includes(edge.to);

            return (
              <line
                key={i}
                x1={nodeU.x}
                y1={nodeU.y}
                x2={nodeV.x}
                y2={nodeV.y}
                className={cn(
                  "transition-all duration-300",
                  isTraversed ? "stroke-emerald-400 stroke-2" : "dark:stroke-slate-700 stroke-slate-300 stroke-1"
                )}
              />
            );
          })}

          {/* Nodes */}
          {nodePositions.map((node) => {
            const isCurrent = current === node.id;
            const isVisited = visited.includes(node.id);
            const inQueue = queue.includes(node.id);

            return (
              <g key={node.id} className="transition-all duration-300">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={13}
                  className={cn(
                    "transition-all duration-300",
                    isCurrent
                      ? "fill-[#FF7A00] dark:fill-[#0A84FF] stroke-white stroke-2 shadow-lg"
                      : isVisited
                      ? "fill-emerald-500 stroke-emerald-300 stroke-2"
                      : inQueue
                      ? "fill-amber-500 stroke-amber-300 stroke-2"
                      : "dark:fill-slate-800 fill-white dark:stroke-slate-600 stroke-slate-300 stroke-1"
                  )}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className={cn(
                    "text-[10px] font-mono font-bold select-none",
                    isVisited || isCurrent || inQueue ? "fill-white" : "dark:fill-slate-300 fill-[#171717]"
                  )}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* State info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
        <span className="dark:text-slate-200 text-[#171717]">{stepMsg}</span>
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span className="text-emerald-500 font-bold">Visited: [{visited.join(", ")}]</span>
          <span className="text-amber-500 font-bold">Frontier: [{queue.join(", ") || "∅"}]</span>
        </div>
      </div>
    </div>
  );
}
