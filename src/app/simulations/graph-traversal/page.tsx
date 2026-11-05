"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  GitGraph,
  Layers,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { parseGraphEdges } from "@/lib/customInput/parsers";
import { GraphData, InputPreset } from "@/lib/customInput/types";

type TraversalMode = "bfs" | "dfs";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface TraversalStep {
  visited: string[];
  frontier: string[]; // Queue for BFS, Stack for DFS
  currentNode: string | null;
  activeEdge: [string, string] | null;
  treeEdges: [string, string][];
  description: string;
}

const PRESETS: InputPreset<GraphData>[] = [
  {
    id: "default-7node",
    name: "Classic 7-Vertex Network (Default)",
    description: "7 vertices with cross edges and cycles (A through G)",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F", "G"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "D" },
        { from: "B", to: "C" },
        { from: "B", to: "E" },
        { from: "C", to: "F" },
        { from: "D", to: "E" },
        { from: "D", to: "G" },
        { from: "E", to: "F" },
        { from: "E", to: "G" },
      ],
    },
    rawString: "A-B, A-D, B-C, B-E, C-F, D-E, D-G, E-F, E-G",
  },
  {
    id: "star-hub",
    name: "Star Hub (Central Node A)",
    description: "Single central hub node A connected to 6 spoke vertices",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F", "G"],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "A", to: "D" },
        { from: "A", to: "E" },
        { from: "A", to: "F" },
        { from: "A", to: "G" },
      ],
    },
    rawString: "A-B, A-C, A-D, A-E, A-F, A-G",
  },
  {
    id: "cycle-heptagon",
    name: "Cycle Heptagon Ring",
    description: "Closed 7-vertex ring demonstrating single perimeter traversal",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F", "G"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "D" },
        { from: "D", to: "E" },
        { from: "E", to: "F" },
        { from: "F", to: "G" },
        { from: "G", to: "A" },
      ],
    },
    rawString: "A-B, B-C, C-D, D-E, E-F, F-G, G-A",
  },
  {
    id: "binary-tree-7",
    name: "Binary Tree Hierarchy",
    description: "Root A with left subtree {B, D, E} and right subtree {C, F, G}",
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
    id: "disconnected-graph",
    name: "Disconnected Components",
    description: "Component {A,B,C,D} isolated from component {E,F,G}",
    data: {
      nodes: ["A", "B", "C", "D", "E", "F", "G"],
      edges: [
        { from: "A", to: "B" },
        { from: "B", to: "C" },
        { from: "C", to: "D" },
        { from: "E", to: "F" },
        { from: "F", to: "G" },
      ],
    },
    rawString: "A-B, B-C, C-D, E-F, F-G",
  },
];

export default function GraphTraversalSimulationPage() {
  const [graphData, setGraphData] = useState<GraphData>(PRESETS[0].data);
  const [mode, setMode] = useState<TraversalMode>("bfs");
  const [startNode, setStartNode] = useState<string>("A");
  const [speed, setSpeed] = useState<number>(500); // ms
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [steps, setSteps] = useState<TraversalStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Dynamically position graph nodes on an ellipse (viewBox 460 x 340)
  const dynamicNodes: GraphNode[] = useMemo(() => {
    const total = graphData.nodes.length;
    if (total === 0) return [];

    const cx = 230;
    const cy = 170;
    const rx = 175;
    const ry = 115;

    return graphData.nodes.map((nodeId, idx) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / total;
      return {
        id: nodeId,
        x: Math.round(cx + rx * Math.cos(angle)),
        y: Math.round(cy + ry * Math.sin(angle)),
        label: nodeId,
      };
    });
  }, [graphData.nodes]);

  // Build Adjacency List (undirected)
  const getAdj = useCallback(() => {
    const adj: Record<string, string[]> = {};
    for (const node of graphData.nodes) adj[node] = [];
    for (const edge of graphData.edges) {
      if (!adj[edge.from]) adj[edge.from] = [];
      if (!adj[edge.to]) adj[edge.to] = [];
      adj[edge.from].push(edge.to);
      adj[edge.to].push(edge.from);
    }
    for (const key in adj) adj[key].sort();
    return adj;
  }, [graphData]);

  // Compute real traversal execution steps
  const computeTraversalSteps = useCallback(
    (start: string, traversalMode: TraversalMode) => {
      const recorded: TraversalStep[] = [];
      const adj = getAdj();

      if (!graphData.nodes.includes(start)) {
        return recorded;
      }

      if (traversalMode === "bfs") {
        const visited = new Set<string>();
        const queue: string[] = [start];
        const treeEdges: [string, string][] = [];

        visited.add(start);

        recorded.push({
          visited: [start],
          frontier: [start],
          currentNode: null,
          activeEdge: null,
          treeEdges: [],
          description: `Initialized BFS Queue with start node [${start}]`,
        });

        while (queue.length > 0) {
          const current = queue.shift()!;

          recorded.push({
            visited: Array.from(visited),
            frontier: [...queue],
            currentNode: current,
            activeEdge: null,
            treeEdges: [...treeEdges],
            description: `Popped node (${current}) from front of queue to explore neighbors`,
          });

          for (const neighbor of adj[current] || []) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
              treeEdges.push([current, neighbor]);

              recorded.push({
                visited: Array.from(visited),
                frontier: [...queue],
                currentNode: current,
                activeEdge: [current, neighbor],
                treeEdges: [...treeEdges],
                description: `Discovered unvisited neighbor (${neighbor}) via edge (${current}-${neighbor}). Enqueued [${neighbor}].`,
              });
            }
          }
        }

        recorded.push({
          visited: Array.from(visited),
          frontier: [],
          currentNode: null,
          activeEdge: null,
          treeEdges: [...treeEdges],
          description: `BFS traversal complete! Visited ${visited.size} connected nodes out of ${graphData.nodes.length} total.`,
        });
      } else {
        // DFS
        const visited = new Set<string>();
        const stack: string[] = [start];
        const treeEdges: [string, string][] = [];

        recorded.push({
          visited: [],
          frontier: [start],
          currentNode: null,
          activeEdge: null,
          treeEdges: [],
          description: `Pushed start node [${start}] onto DFS Call Stack`,
        });

        const parentMap: Record<string, string> = {};

        while (stack.length > 0) {
          const current = stack.pop()!;

          if (!visited.has(current)) {
            visited.add(current);
            if (parentMap[current]) {
              treeEdges.push([parentMap[current], current]);
            }

            recorded.push({
              visited: Array.from(visited),
              frontier: [...stack],
              currentNode: current,
              activeEdge: parentMap[current] ? [parentMap[current], current] : null,
              treeEdges: [...treeEdges],
              description: `Popped (${current}) from stack and marked visited. Exploring deepest branch.`,
            });

            // Push neighbors in reverse so alphabetical order is popped first
            const neighbors = [...(adj[current] || [])].reverse();
            for (const neighbor of neighbors) {
              if (!visited.has(neighbor)) {
                parentMap[neighbor] = current;
                stack.push(neighbor);
                recorded.push({
                  visited: Array.from(visited),
                  frontier: [...stack],
                  currentNode: current,
                  activeEdge: [current, neighbor],
                  treeEdges: [...treeEdges],
                  description: `Pushed unvisited neighbor (${neighbor}) onto stack`,
                });
              }
            }
          }
        }

        recorded.push({
          visited: Array.from(visited),
          frontier: [],
          currentNode: null,
          activeEdge: null,
          treeEdges: [...treeEdges],
          description: `DFS traversal complete! All reachable branches (${visited.size} nodes) fully backtracked.`,
        });
      }

      return recorded;
    },
    [getAdj, graphData.nodes]
  );

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    const newSteps = computeTraversalSteps(startNode, mode);
    setSteps(newSteps);
    setCurrentStepIndex(0);
  }, [startNode, mode, computeTraversalSteps]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [steps.length]);

  // Playback timer effect with clean auto-cleanup
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [isPlaying, speed, steps.length]);

  // Clean auto-pause when reaching the end of traversal
  useEffect(() => {
    if (currentStepIndex >= steps.length - 1 && steps.length > 0) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  const currentStep = steps[currentStepIndex] || {
    visited: [],
    frontier: [],
    currentNode: null,
    activeEdge: null,
    treeEdges: [],
    description: "Ready",
  };

  const nodeMap = useMemo(() => {
    return Object.fromEntries(dynamicNodes.map((n) => [n.id, n]));
  }, [dynamicNodes]);

  const formattedEdges = useMemo(() => {
    return graphData.edges.map((e) => `${e.from}-${e.to}`).join(", ");
  }, [graphData.edges]);

  const handleApplyCustomGraph = (newGraph: GraphData) => {
    setGraphData(newGraph);
    const firstNode = newGraph.nodes[0] || "A";
    setStartNode(firstNode);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-gray-100 text-[#171717] transition-colors duration-200">
      {/* Ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-cyan-600/[0.07] rounded-full blur-[140px]" />
          <div className="absolute bottom-1/3 right-1/4 translate-x-1/3 w-[600px] h-[500px] bg-violet-600/[0.07] rounded-full blur-[140px]" />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[rgba(255,122,0,0.06)] rounded-full blur-[140px]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <div className="section-padding space-y-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-mono dark:text-gray-400 text-[#737373]"
          >
            <Link href="/" className="dark:hover:text-gray-200 hover:text-[#171717] transition-colors">
              NEXORA
            </Link>
            <ChevronRight className="w-3.5 h-3.5 dark:text-gray-600 text-gray-400" />
            <Link
              href="/simulations"
              className="dark:hover:text-gray-200 hover:text-[#171717] transition-colors"
            >
              Simulations
            </Link>
            <ChevronRight className="w-3.5 h-3.5 dark:text-gray-600 text-gray-400" />
            <span className="dark:text-cyan-400 text-[#FF7A00] font-semibold">Graph Traversal</span>
          </nav>

          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full dark:bg-white/[0.04] bg-[rgba(255,122,0,0.08)] border dark:border-cyan-500/30 border-[#FF7A00]/30 text-xs dark:text-cyan-300 text-[#FF7A00] backdrop-blur-md mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 dark:text-cyan-400 text-[#FF7A00]" />
              <span>Real Graph Exploration &amp; Frontier Visualization</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold dark:text-gray-100 text-[#171717] tracking-tight">
              BFS &amp; DFS{" "}
              <span className="gradient-text-cyan">Graph Traversal Simulation</span>
            </h1>
            <p className="text-sm sm:text-base dark:text-gray-400 text-[#737373] mt-2 max-w-2xl leading-relaxed">
              Observe how Breadth-First Search uses a FIFO Queue to find shortest paths,
              while Depth-First Search utilizes a LIFO Stack to plunge down branches.
            </p>
          </div>

          {/* Custom Input Panel */}
          <CustomInputPanel
            title="Custom Graph Topology & Traversal Presets"
            subtitle="Specify undirected graph edges (e.g. A-B, A-D, B-C) to instantiate a custom graph and test BFS/DFS traversal mechanics."
            initialValue={formattedEdges}
            placeholder="e.g. A-B, A-D, B-C, B-E, C-F"
            presets={PRESETS}
            onApply={(raw) => {
              const res = parseGraphEdges(raw);
              if (!res.isValid || !res.data) {
                return { isValid: false, errors: res.errors };
              }
              handleApplyCustomGraph(res.data);
              return { isValid: true };
            }}
            onReset={() => handleApplyCustomGraph(PRESETS[0].data)}
            summaryBadge={`|V| = ${graphData.nodes.length} Vertices | |E| = ${graphData.edges.length} Edges | Start = ${startNode}`}
          />

          {/* Mode Switcher & Start Node Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="p-1 rounded-2xl dark:bg-white/[0.04] bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] backdrop-blur-xl flex gap-1.5 shadow-sm">
              <button
                onClick={() => setMode("bfs")}
                className={cn(
                  "px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  mode === "bfs"
                    ? "dark:bg-gradient-to-r dark:from-[#00D2FF] dark:to-cyan-500 bg-[#FF7A00] text-white shadow-sm"
                    : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.04] hover:bg-white/60"
                )}
              >
                Breadth-First Search (Queue)
              </button>
              <button
                onClick={() => setMode("dfs")}
                className={cn(
                  "px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  mode === "dfs"
                    ? "dark:bg-gradient-to-r dark:from-[#0A84FF] dark:to-blue-600 bg-[#EA580C] text-white shadow-sm"
                    : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.04] hover:bg-white/60"
                )}
              >
                Depth-First Search (Stack)
              </button>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl dark:bg-white/[0.04] bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] backdrop-blur-xl text-xs font-mono">
              <span className="dark:text-slate-400 text-[#737373]">Start Node:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {graphData.nodes.map((n) => (
                  <button
                    key={n}
                    onClick={() => setStartNode(n)}
                    className={cn(
                      "w-6 h-6 rounded-lg font-bold transition-all text-xs flex items-center justify-center",
                      startNode === n
                        ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white shadow-md font-extrabold"
                        : "dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-black dark:hover:bg-white/[0.08] hover:bg-slate-200"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SVG Graph Viewport (2 cols) */}
            <div className="lg:col-span-2 card-base p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] text-xs font-mono text-slate-400">
                <span className="font-semibold dark:text-slate-300 text-[#171717]">
                  Graph Topology ({graphData.nodes.length} Vertices, {graphData.edges.length} Edges)
                </span>
                <span className="dark:text-cyan-400 text-[#FF7A00] font-bold px-2 py-0.5 rounded-md dark:bg-[#00D2FF]/10 bg-[rgba(255,122,0,0.1)] border dark:border-[#00D2FF]/25 border-[#FF7A00]/30 shadow-xs">
                  Time: O(V + E)
                </span>
              </div>

              {/* Interactive SVG */}
              <div className="w-full flex items-center justify-center py-6 min-h-[300px]">
                <svg
                  viewBox="0 0 460 340"
                  className="w-full max-w-[500px] h-auto select-none"
                >
                  <defs>
                    <radialGradient id="nodeCurrentGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                    <radialGradient id="nodeBfsGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#00D2FF" />
                      <stop offset="100%" stopColor="#0891b2" />
                    </radialGradient>
                    <radialGradient id="nodeDfsGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0A84FF" />
                      <stop offset="100%" stopColor="#0066cc" />
                    </radialGradient>
                    <radialGradient id="nodeVisitedGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </radialGradient>
                  </defs>

                  {/* Edges */}
                  {graphData.edges.map((e, idx) => {
                    const fromNode = nodeMap[e.from];
                    const toNode = nodeMap[e.to];
                    if (!fromNode || !toNode) return null;

                    const isActive =
                      currentStep.activeEdge &&
                      ((currentStep.activeEdge[0] === e.from &&
                        currentStep.activeEdge[1] === e.to) ||
                        (currentStep.activeEdge[0] === e.to &&
                          currentStep.activeEdge[1] === e.from));
                    const isTreeEdge = currentStep.treeEdges.some(
                      (te) =>
                        (te[0] === e.from && te[1] === e.to) ||
                        (te[0] === e.to && te[1] === e.from)
                    );

                    let strokeColor = "rgba(150, 150, 150, 0.3)";
                    let strokeWidth = 2;
                    if (isActive) {
                      strokeColor = "#f59e0b";
                      strokeWidth = 3.5;
                    } else if (isTreeEdge) {
                      strokeColor = mode === "bfs" ? "#00D2FF" : "#0A84FF";
                      strokeWidth = 3;
                    }

                    return (
                      <line
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {dynamicNodes.map((node) => {
                    const isVisited = currentStep.visited.includes(node.id);
                    const isCurrent = currentStep.currentNode === node.id;
                    const inFrontier = currentStep.frontier.includes(node.id);

                    let fillColor = "#141c2e";
                    let strokeColor = "rgba(150, 150, 150, 0.4)";
                    if (isCurrent) {
                      fillColor = "url(#nodeCurrentGlow)";
                      strokeColor = "#ffffff";
                    } else if (inFrontier) {
                      fillColor = mode === "bfs" ? "url(#nodeBfsGlow)" : "url(#nodeDfsGlow)";
                      strokeColor = mode === "bfs" ? "#00D2FF" : "#60a5fa";
                    } else if (isVisited) {
                      fillColor = "url(#nodeVisitedGlow)";
                      strokeColor = "#34d399";
                    }

                    return (
                      <g
                        key={node.id}
                        onClick={() => setStartNode(node.id)}
                        className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="20"
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth="2.5"
                          className="transition-all duration-200"
                        />
                        <text
                          x={node.x}
                          y={node.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-4 border-t dark:border-white/[0.08] border-slate-200 text-xs font-mono dark:text-slate-400 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                  <span>Visiting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full shadow-sm",
                      mode === "bfs" ? "bg-[#00D2FF]" : "bg-[#0A84FF]"
                    )}
                  />
                  <span>Frontier ({mode === "bfs" ? "Queue" : "Stack"})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  <span>Visited</span>
                </div>
              </div>
            </div>

            {/* Frontier Data Structure & Traversal Order Display (1 col) */}
            <div className="card-base p-6 border border-white/10 flex flex-col justify-between shadow-xl space-y-6">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b dark:border-white/[0.08] border-slate-200">
                  <Layers className="w-4 h-4 dark:text-cyan-400 text-[#FF7A00]" />
                  <h3 className="font-heading font-bold dark:text-gray-100 text-[#171717] text-sm tracking-wide">
                    {mode === "bfs" ? "FIFO Queue State" : "LIFO Stack State"}
                  </h3>
                </div>

                {/* Queue / Stack Container */}
                <div className="p-4 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-slate-200 min-h-[100px] flex flex-wrap items-center gap-2 mb-6">
                  {currentStep.frontier.length === 0 ? (
                    <span className="text-xs font-mono text-gray-400 italic">
                      Empty {mode === "bfs" ? "Queue" : "Stack"}
                    </span>
                  ) : (
                    currentStep.frontier.map((item, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm border shadow-sm backdrop-blur-md",
                          mode === "bfs"
                            ? "dark:bg-cyan-500/20 bg-cyan-100 dark:border-cyan-400/50 border-cyan-400 text-cyan-600 dark:text-cyan-200"
                            : "dark:bg-violet-500/20 bg-violet-100 dark:border-violet-400/50 border-violet-400 text-violet-600 dark:text-violet-200"
                        )}
                      >
                        {item}
                      </div>
                    ))
                  )}
                </div>

                {/* Visited Order sequence */}
                <div className="mb-6">
                  <span className="text-xs font-mono dark:text-gray-400 text-slate-500 block mb-2 uppercase tracking-wider">
                    Visited Order:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {currentStep.visited.length === 0 ? (
                      <span className="text-gray-400 italic">None yet</span>
                    ) : (
                      currentStep.visited.map((v, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold">
                            {v}
                          </span>
                          {i < currentStep.visited.length - 1 && (
                            <span className="text-gray-400">&rarr;</span>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Step info log */}
              <div className="p-4 rounded-xl dark:bg-white/[0.03] bg-[#F7F7F7] border dark:border-white/[0.08] border-slate-200 text-xs font-mono text-gray-300">
                <span className="dark:text-gray-400 text-slate-500 block mb-1 font-semibold">
                  Step {currentStepIndex + 1} / {steps.length}:
                </span>
                <p className="dark:text-gray-200 text-[#171717] leading-relaxed">{currentStep.description}</p>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 card-base p-6 border border-white/10 shadow-lg">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start Traversal
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  stepForward();
                }}
                disabled={currentStepIndex >= steps.length - 1}
                className="btn-secondary text-xs px-3.5 py-2.5 disabled:opacity-40"
                title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={resetSimulation}
                className="btn-secondary text-xs px-3.5 py-2.5"
                title="Reset Traversal"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Speed: <strong className="dark:text-cyan-400 text-[#FF7A00] font-bold">{speed}ms</strong></span>
                <span className="text-slate-500">Fast &larr; &rarr; Slow</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-[#FF7A00] dark:accent-[#00D2FF] cursor-pointer"
              />
            </div>
          </div>

          {/* Theory Link */}
          <div className="pt-6 border-t dark:border-white/[0.08] border-slate-200">
            <Link
              href="/daa/graphs"
              className="text-xs dark:text-[#00D2FF] text-[#FF7A00] hover:underline font-semibold font-mono flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Read Full Graph Theory, Shortest Paths &amp; Spanning Trees Documentation
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
