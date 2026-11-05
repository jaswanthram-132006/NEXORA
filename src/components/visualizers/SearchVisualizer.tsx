"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Sparkles, SkipForward, SkipBack, RotateCcw, Compass, ArrowLeftRight, Layers, TrendingUp, Flame, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface Coord {
  r: number;
  c: number;
}

interface SearchPresetData {
  start: Coord;
  goal: Coord;
  obstacles: Coord[];
  heuristicType: "manhattan" | "euclidean";
}

const PRESETS: InputPreset<SearchPresetData>[] = [
  {
    id: "corridor-default",
    name: "Dual Corridor (Default)",
    description: "Start (0,0) to Goal (3,4) with central obstacle column",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 3, c: 4 },
      obstacles: [{ r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 3 }, { r: 2, c: 3 }],
      heuristicType: "manhattan",
    },
    rawString: "Start: 0,0 | Goal: 3,4 | Walls: 1-1, 2-1, 1-3, 2-3",
  },
  {
    id: "open-field",
    name: "Open Grid (No Walls)",
    description: "Unconstrained optimal diagonal descent",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 3, c: 4 },
      obstacles: [],
      heuristicType: "manhattan",
    },
    rawString: "Start: 0,0 | Goal: 3,4 | Walls: none",
  },
  {
    id: "chokepoint",
    name: "Chokepoint Barrier",
    description: "Vertical wall forcing route through row 3",
    data: {
      start: { r: 1, c: 0 },
      goal: { r: 1, c: 4 },
      obstacles: [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }],
      heuristicType: "euclidean",
    },
    rawString: "Start: 1,0 | Goal: 1,4 | Walls: 0-2, 1-2, 2-2",
  },
  {
    id: "local-trap",
    name: "U-Shaped Local Minimum Trap",
    description: "Forces Hill Climbing to get stuck in local trap before goal",
    data: {
      start: { r: 1, c: 1 },
      goal: { r: 1, c: 4 },
      obstacles: [{ r: 0, c: 3 }, { r: 1, c: 3 }, { r: 2, c: 3 }],
      heuristicType: "manhattan",
    },
    rawString: "Start: 1,1 | Goal: 1,4 | Walls: 0-3, 1-3, 2-3",
  },
];

type StrategyType = "astar" | "dls" | "bidirectional" | "hillClimbing" | "annealing" | "beam";

interface GenericSearchStep {
  current: Coord;
  exploredForward: Coord[];
  frontierForward: Coord[];
  exploredBackward?: Coord[];
  frontierBackward?: Coord[];
  intersection?: Coord;
  depth?: number;
  temperature?: number;
  deltaE?: number;
  probAccept?: number;
  beamStates?: Coord[];
  note: string;
  isFailureOrCutoff?: boolean;
}

const DIRS = [
  { r: -1, c: 0 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
  { r: 0, c: 1 },
];

export default function SearchVisualizer() {
  const [strategy, setStrategy] = useState<StrategyType>("astar");
  const [start, setStart] = useState<Coord>({ r: 0, c: 0 });
  const [goal, setGoal] = useState<Coord>({ r: 3, c: 4 });
  const [obstacles, setObstacles] = useState<Coord[]>([
    { r: 1, c: 1 }, { r: 2, c: 1 }, { r: 1, c: 3 }, { r: 2, c: 3 }
  ]);
  const [heuristicType, setHeuristicType] = useState<"manhattan" | "euclidean">("manhattan");
  const [depthLimit, setDepthLimit] = useState<number>(5);
  const [stepIdx, setStepIdx] = useState<number>(0);

  const ROWS = 4;
  const COLS = 5;

  const key = (r: number, c: number) => `${r},${c}`;

  const calculateH = useCallback(
    (r: number, c: number, g: Coord = goal, type = heuristicType): number => {
      if (type === "manhattan") {
        return Math.abs(r - g.r) + Math.abs(c - g.c);
      }
      return Math.round(Math.hypot(r - g.r, g.c - c) * 10) / 10;
    },
    [goal, heuristicType]
  );

  const isObstacle = useCallback(
    (r: number, c: number) => obstacles.some((o) => o.r === r && o.c === c),
    [obstacles]
  );

  // ==========================================
  // UNIFIED EXECUTION ENGINE ACROSS 4 STRATEGIES
  // ==========================================
  const execution = useMemo(() => {
    const steps: GenericSearchStep[] = [];

    // ------------------------------------------
    // 1. A* SEARCH
    // ------------------------------------------
    if (strategy === "astar") {
      const openSet: { r: number; c: number; g: number; h: number; f: number; parent?: string }[] = [];
      const closedSet = new Set<string>();
      const gScores: Record<string, number> = {};

      const hStart = calculateH(start.r, start.c, goal, heuristicType);
      openSet.push({ r: start.r, c: start.c, g: 0, h: hStart, f: hStart });
      gScores[key(start.r, start.c)] = 0;

      let reachedGoal = false;

      while (openSet.length > 0 && steps.length < 35) {
        openSet.sort((a, b) => a.f - b.f || a.h - b.h);
        const current = openSet.shift()!;
        const currentKey = key(current.r, current.c);

        closedSet.add(currentKey);

        const exploredList: Coord[] = Array.from(closedSet).map((k) => {
          const [r, c] = k.split(",").map(Number);
          return { r, c };
        });

        const frontierList: Coord[] = openSet.map((item) => ({ r: item.r, c: item.c }));

        if (current.r === goal.r && current.c === goal.c) {
          reachedGoal = true;
          steps.push({
            current: { r: current.r, c: current.c },
            exploredForward: exploredList,
            frontierForward: frontierList,
            note: `Goal reached! Optimal path confirmed with g-cost = ${current.g}. Admissible heuristic guided search.`,
          });
          break;
        }

        const discovered: string[] = [];
        for (const d of DIRS) {
          const nr = current.r + d.r;
          const nc = current.c + d.c;
          const nKey = key(nr, nc);

          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (isObstacle(nr, nc)) continue;
          if (closedSet.has(nKey)) continue;

          const tentativeG = current.g + 1;
          const existingG = gScores[nKey];

          if (existingG === undefined || tentativeG < existingG) {
            gScores[nKey] = tentativeG;
            const h = calculateH(nr, nc, goal, heuristicType);
            const f = tentativeG + h;

            const existingIndex = openSet.findIndex((item) => item.r === nr && item.c === nc);
            if (existingIndex >= 0) {
              openSet[existingIndex].g = tentativeG;
              openSet[existingIndex].f = f;
            } else {
              openSet.push({ r: nr, c: nc, g: tentativeG, h, f, parent: currentKey });
              discovered.push(`(${nr},${nc}) [f=${f}]`);
            }
          }
        }

        steps.push({
          current: { r: current.r, c: current.c },
          exploredForward: exploredList,
          frontierForward: frontierList,
          note: `Popped (${current.r},${current.c}) [g=${current.g}, h=${current.h}, f=${current.f}]. ${
            discovered.length > 0 ? `Enqueued: ${discovered.join(", ")}.` : "No unvisited valid neighbors."
          }`,
        });
      }

      if (!reachedGoal && steps.length > 0) {
        steps.push({
          current: steps[steps.length - 1].current,
          exploredForward: Array.from(closedSet).map((k) => {
            const [r, c] = k.split(",").map(Number);
            return { r, c };
          }),
          frontierForward: [],
          note: `No path exists to Goal (${goal.r},${goal.c})! Search space exhausted.`,
          isFailureOrCutoff: true,
        });
      }
      return { steps, reachedGoal };
    }

    // ------------------------------------------
    // 2. DEPTH-LIMITED SEARCH (DLS)
    // ------------------------------------------
    if (strategy === "dls") {
      const stack: { r: number; c: number; depth: number; path: Coord[] }[] = [];
      const visited = new Set<string>();
      stack.push({ r: start.r, c: start.c, depth: 0, path: [start] });

      let reachedGoal = false;
      let cutoffOccurred = false;

      while (stack.length > 0 && steps.length < 35) {
        const current = stack.pop()!;
        const cKey = key(current.r, current.c);
        visited.add(cKey);

        const exploredList = Array.from(visited).map((k) => {
          const [r, c] = k.split(",").map(Number);
          return { r, c };
        });
        const frontierList = stack.map((s) => ({ r: s.r, c: s.c }));

        if (current.r === goal.r && current.c === goal.c) {
          reachedGoal = true;
          steps.push({
            current: { r: current.r, c: current.c },
            exploredForward: exploredList,
            frontierForward: frontierList,
            depth: current.depth,
            note: `Goal found at depth ${current.depth} ≤ Limit ${depthLimit}! DLS successfully terminated.`,
          });
          break;
        }

        if (current.depth >= depthLimit) {
          cutoffOccurred = true;
          steps.push({
            current: { r: current.r, c: current.c },
            exploredForward: exploredList,
            frontierForward: frontierList,
            depth: current.depth,
            note: `Depth limit ${depthLimit} reached at (${current.r},${current.c}). Pruning branch and backtracking!`,
            isFailureOrCutoff: true,
          });
          continue;
        }

        // Push valid neighbors onto stack in reverse order
        const neighbors: Coord[] = [];
        for (const d of DIRS) {
          const nr = current.r + d.r;
          const nc = current.c + d.c;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (isObstacle(nr, nc)) continue;
          if (visited.has(key(nr, nc))) continue;
          neighbors.push({ r: nr, c: nc });
        }

        for (const n of neighbors.reverse()) {
          stack.push({ r: n.r, c: n.c, depth: current.depth + 1, path: [...current.path, n] });
        }

        steps.push({
          current: { r: current.r, c: current.c },
          exploredForward: exploredList,
          frontierForward: stack.map((s) => ({ r: s.r, c: s.c })),
          depth: current.depth,
          note: `Visited (${current.r},${current.c}) at depth ${current.depth}. Pushed ${neighbors.length} unvisited child node(s) to LIFO stack.`,
        });
      }

      if (!reachedGoal) {
        steps.push({
          current: steps.length > 0 ? steps[steps.length - 1].current : start,
          exploredForward: Array.from(visited).map((k) => {
            const [r, c] = k.split(",").map(Number);
            return { r, c };
          }),
          frontierForward: [],
          note: cutoffOccurred
            ? `DLS Cutoff Triggered: Goal not found within Depth Limit L = ${depthLimit}. Increase limit or use Iterative Deepening (IDS)!`
            : `Search exhausted: No path exists to Goal!`,
          isFailureOrCutoff: true,
        });
      }

      return { steps, reachedGoal };
    }

    // ------------------------------------------
    // 3. BIDIRECTIONAL SEARCH (Dual BFS)
    // ------------------------------------------
    if (strategy === "bidirectional") {
      const qForward: Coord[] = [start];
      const qBackward: Coord[] = [goal];

      const visitedForward = new Map<string, number>();
      const visitedBackward = new Map<string, number>();

      visitedForward.set(key(start.r, start.c), 0);
      visitedBackward.set(key(goal.r, goal.c), 0);

      let intersection: Coord | undefined;
      let reachedGoal = false;

      while ((qForward.length > 0 || qBackward.length > 0) && steps.length < 35) {
        // Step forward frontier
        if (qForward.length > 0) {
          const currF = qForward.shift()!;
          const currFKey = key(currF.r, currF.c);

          // Check if backward frontier already reached this node
          if (visitedBackward.has(currFKey)) {
            intersection = currF;
            reachedGoal = true;
            steps.push({
              current: currF,
              exploredForward: Array.from(visitedForward.keys()).map((k) => {
                const [r, c] = k.split(",").map(Number);
                return { r, c };
              }),
              frontierForward: [...qForward],
              exploredBackward: Array.from(visitedBackward.keys()).map((k) => {
                const [r, c] = k.split(",").map(Number);
                return { r, c };
              }),
              frontierBackward: [...qBackward],
              intersection: currF,
              note: `Frontiers collided at (${currF.r},${currF.c})! Bidirectional search met in the middle. Time complexity reduced to O(2·b^(d/2)).`,
            });
            break;
          }

          for (const d of DIRS) {
            const nr = currF.r + d.r;
            const nc = currF.c + d.c;
            const nKey = key(nr, nc);

            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            if (isObstacle(nr, nc)) continue;
            if (!visitedForward.has(nKey)) {
              visitedForward.set(nKey, (visitedForward.get(currFKey) || 0) + 1);
              qForward.push({ r: nr, c: nc });
            }
          }

          steps.push({
            current: currF,
            exploredForward: Array.from(visitedForward.keys()).map((k) => {
              const [r, c] = k.split(",").map(Number);
              return { r, c };
            }),
            frontierForward: [...qForward],
            exploredBackward: Array.from(visitedBackward.keys()).map((k) => {
              const [r, c] = k.split(",").map(Number);
              return { r, c };
            }),
            frontierBackward: [...qBackward],
            note: `Forward BFS expanded (${currF.r},${currF.c}). Forward frontier size: ${qForward.length}.`,
          });
        }

        // Step backward frontier
        if (qBackward.length > 0) {
          const currB = qBackward.shift()!;
          const currBKey = key(currB.r, currB.c);

          if (visitedForward.has(currBKey)) {
            intersection = currB;
            reachedGoal = true;
            steps.push({
              current: currB,
              exploredForward: Array.from(visitedForward.keys()).map((k) => {
                const [r, c] = k.split(",").map(Number);
                return { r, c };
              }),
              frontierForward: [...qForward],
              exploredBackward: Array.from(visitedBackward.keys()).map((k) => {
                const [r, c] = k.split(",").map(Number);
                return { r, c };
              }),
              frontierBackward: [...qBackward],
              intersection: currB,
              note: `Backward BFS met Forward frontier at (${currB.r},${currB.c})! Shortest connecting path established.`,
            });
            break;
          }

          for (const d of DIRS) {
            const nr = currB.r + d.r;
            const nc = currB.c + d.c;
            const nKey = key(nr, nc);

            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            if (isObstacle(nr, nc)) continue;
            if (!visitedBackward.has(nKey)) {
              visitedBackward.set(nKey, (visitedBackward.get(currBKey) || 0) + 1);
              qBackward.push({ r: nr, c: nc });
            }
          }

          steps.push({
            current: currB,
            exploredForward: Array.from(visitedForward.keys()).map((k) => {
              const [r, c] = k.split(",").map(Number);
              return { r, c };
            }),
            frontierForward: [...qForward],
            exploredBackward: Array.from(visitedBackward.keys()).map((k) => {
              const [r, c] = k.split(",").map(Number);
              return { r, c };
            }),
            frontierBackward: [...qBackward],
            note: `Backward BFS expanded (${currB.r},${currB.c}). Backward frontier size: ${qBackward.length}.`,
          });
        }
      }

      if (!reachedGoal && steps.length > 0) {
        steps.push({
          current: steps[steps.length - 1].current,
          exploredForward: Array.from(visitedForward.keys()).map((k) => {
            const [r, c] = k.split(",").map(Number);
            return { r, c };
          }),
          frontierForward: [],
          note: `Both frontiers exhausted without intersection! Path disconnected by obstacle barriers.`,
          isFailureOrCutoff: true,
        });
      }

      return { steps, reachedGoal };
    }

    // ------------------------------------------
    // 4. HILL CLIMBING SEARCH (Steepest Descent on h)
    // ------------------------------------------
    if (strategy === "hillClimbing") {
      let current = { ...start };
      const visited: Coord[] = [current];
      let reachedGoal = false;

      while (steps.length < 25) {
        const curH = calculateH(current.r, current.c, goal, heuristicType);

        if (current.r === goal.r && current.c === goal.c) {
          reachedGoal = true;
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [],
            note: `Global Optimum Reached! Reached Goal (${current.r},${current.c}) with h = 0.`,
          });
          break;
        }

        // Inspect all neighbors to find neighbor with strictly lowest h
        let bestNeighbor: Coord | null = null;
        let bestH = curH;

        for (const d of DIRS) {
          const nr = current.r + d.r;
          const nc = current.c + d.c;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (isObstacle(nr, nc)) continue;

          const nH = calculateH(nr, nc, goal, heuristicType);
          if (nH < bestH) {
            bestH = nH;
            bestNeighbor = { r: nr, c: nc };
          }
        }

        if (!bestNeighbor) {
          // Stuck in local minimum / plateau / ridge!
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [],
            note: `Local Minimum / Plateau Trap! At (${current.r},${current.c}) h = ${curH}. No neighbor has strictly lower h. Greedy search halted without goal!`,
            isFailureOrCutoff: true,
          });
          break;
        }

        steps.push({
          current,
          exploredForward: [...visited],
          frontierForward: [bestNeighbor],
          note: `Steepest descent: Transitioning from (${current.r},${current.c}) [h=${curH}] to best neighbor (${bestNeighbor.r},${bestNeighbor.c}) [h=${bestH}].`,
        });

        current = bestNeighbor;
        visited.push(current);
      }

      return { steps, reachedGoal };
    }

    // ------------------------------------------
    // 5. SIMULATED ANNEALING (Stochastic Escape)
    // ------------------------------------------
    if (strategy === "annealing") {
      let current = { ...start };
      const visited: Coord[] = [current];
      let temp = 100.0;
      const alphaCool = 0.82;
      let reachedGoal = false;

      // Seed pseudo-random sequences for deterministic reproduction
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      while (steps.length < 25 && temp >= 1.0) {
        const curH = calculateH(current.r, current.c, goal, heuristicType);

        if (current.r === goal.r && current.c === goal.c) {
          reachedGoal = true;
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [],
            temperature: temp,
            note: `Goal Reached! Optimal state found by Simulated Annealing at T = ${temp.toFixed(1)}°.`,
          });
          break;
        }

        // Get all legal neighbors
        const validNeighbors: Coord[] = [];
        for (const d of DIRS) {
          const nr = current.r + d.r;
          const nc = current.c + d.c;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (isObstacle(nr, nc)) continue;
          validNeighbors.push({ r: nr, c: nc });
        }

        if (validNeighbors.length === 0) {
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [],
            temperature: temp,
            note: `Trapped! No legal movements available from (${current.r},${current.c}).`,
            isFailureOrCutoff: true,
          });
          break;
        }

        // Pick neighbor (pseudo-random)
        const randIdx = Math.floor(pseudoRandom() * validNeighbors.length);
        const candidate = validNeighbors[randIdx];
        const nextH = calculateH(candidate.r, candidate.c, goal, heuristicType);
        const deltaE = nextH - curH; // negative is downhill improvement

        let accept = false;
        let prob = 1.0;

        if (deltaE <= 0) {
          accept = true;
          prob = 1.0;
        } else {
          prob = Math.exp(-deltaE / (temp / 10));
          accept = pseudoRandom() < prob;
        }

        if (accept) {
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [candidate],
            temperature: temp,
            deltaE,
            probAccept: prob,
            note: deltaE <= 0
              ? `Greedy Improvement (ΔE = ${deltaE} ≤ 0): Moving to (${candidate.r},${candidate.c}) [h=${nextH}]. T = ${temp.toFixed(1)}°.`
              : `Metropolis Uphill Jump (ΔE = +${deltaE}): Accepted worse move with P = ${(prob * 100).toFixed(1)}% to escape local trap! T = ${temp.toFixed(1)}°.`,
          });
          current = candidate;
          visited.push(current);
        } else {
          steps.push({
            current,
            exploredForward: [...visited],
            frontierForward: [candidate],
            temperature: temp,
            deltaE,
            probAccept: prob,
            note: `Uphill Move Rejected (ΔE = +${deltaE}): P = ${(prob * 100).toFixed(1)}% failed roll. Remaining at (${current.r},${current.c}). T = ${temp.toFixed(1)}°.`,
          });
        }

        temp *= alphaCool;
      }

      if (!reachedGoal && steps.length > 0) {
        steps.push({
          current,
          exploredForward: [...visited],
          frontierForward: [],
          temperature: temp,
          note: `Annealing Frozen (T < 1.0°): System reached thermal equilibrium. Search terminated.`,
          isFailureOrCutoff: true,
        });
      }

      return { steps, reachedGoal };
    }

    // ------------------------------------------
    // 6. LOCAL BEAM SEARCH (k=2 parallel states)
    // ------------------------------------------
    if (strategy === "beam") {
      const k = 2;
      let beam: Coord[] = [start];
      const visited = new Set<string>([key(start.r, start.c)]);
      let reachedGoal = false;

      while (steps.length < 25 && beam.length > 0) {
        // Check if any beam node reached goal
        const goalHit = beam.find((n) => n.r === goal.r && n.c === goal.c);
        if (goalHit) {
          reachedGoal = true;
          steps.push({
            current: goalHit,
            exploredForward: Array.from(visited).map((s) => {
              const [r, c] = s.split(",").map(Number);
              return { r, c };
            }),
            frontierForward: [],
            beamStates: [...beam],
            note: `Local Beam Search (k=${k}) reached Goal at (${goalHit.r},${goalHit.c})!`,
          });
          break;
        }

        // Generate all successors of current beam
        const successors: { coord: Coord; h: number }[] = [];
        for (const b of beam) {
          for (const d of DIRS) {
            const nr = b.r + d.r;
            const nc = b.c + d.c;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
            if (isObstacle(nr, nc)) continue;
            successors.push({ coord: { r: nr, c: nc }, h: calculateH(nr, nc, goal, heuristicType) });
          }
        }

        if (successors.length === 0) {
          steps.push({
            current: beam[0],
            exploredForward: Array.from(visited).map((s) => {
              const [r, c] = s.split(",").map(Number);
              return { r, c };
            }),
            frontierForward: [],
            beamStates: [...beam],
            note: `Local Beam Search dead-end: No successors generated!`,
            isFailureOrCutoff: true,
          });
          break;
        }

        // Sort successors by h and pick top k distinct coordinates
        successors.sort((a, b) => a.h - b.h);
        const nextBeam: Coord[] = [];
        const seenNext = new Set<string>();

        for (const s of successors) {
          const sKey = key(s.coord.r, s.coord.c);
          if (!seenNext.has(sKey)) {
            seenNext.add(sKey);
            nextBeam.push(s.coord);
            visited.add(sKey);
            if (nextBeam.length === k) break;
          }
        }

        steps.push({
          current: nextBeam[0],
          exploredForward: Array.from(visited).map((s) => {
            const [r, c] = s.split(",").map(Number);
            return { r, c };
          }),
          frontierForward: nextBeam.slice(1),
          beamStates: [...nextBeam],
          note: `Local Beam Step: Selected top ${nextBeam.length} lowest-h candidates across all children: ${nextBeam.map((n) => `(${n.r},${n.c}) [h=${calculateH(n.r, n.c)}]`).join(", ")}.`,
        });

        beam = nextBeam;
      }

      return { steps, reachedGoal };
    }

    return { steps: [], reachedGoal: false };
  }, [strategy, start, goal, heuristicType, depthLimit, calculateH, isObstacle]);

  const activeStep: GenericSearchStep = execution.steps[stepIdx] || execution.steps[0] || {
    current: start,
    exploredForward: [start],
    frontierForward: [],
    note: "Initial state.",
  };

  const handleToggleCellObstacle = (r: number, c: number) => {
    if ((r === start.r && c === start.c) || (r === goal.r && c === goal.c)) return;

    setObstacles((prev) => {
      const exists = prev.some((o) => o.r === r && o.c === c);
      if (exists) {
        return prev.filter((o) => !(o.r === r && o.c === c));
      }
      return [...prev, { r, c }];
    });
    setStepIdx(0);
  };

  const handleApplyPreset = (p: SearchPresetData) => {
    setStart(p.start);
    setGoal(p.goal);
    setObstacles(p.obstacles);
    setHeuristicType(p.heuristicType);
    setStepIdx(0);
  };

  const handleApplyRaw = (raw: string) => {
    const startMatch = raw.match(/start:\s*(\d+)[,\s]+(\d+)/i);
    const goalMatch = raw.match(/goal:\s*(\d+)[,\s]+(\d+)/i);
    const wallsMatch = raw.match(/walls?:\s*([^\n|]+)/i);

    const errors: string[] = [];

    let newStart = start;
    let newGoal = goal;
    let newObstacles = obstacles;

    if (startMatch) {
      const r = Number(startMatch[1]);
      const c = Number(startMatch[2]);
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        newStart = { r, c };
      } else {
        errors.push(`Start coordinate (${r},${c}) is outside the ${ROWS}x${COLS} grid boundaries.`);
      }
    }

    if (goalMatch) {
      const r = Number(goalMatch[1]);
      const c = Number(goalMatch[2]);
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        newGoal = { r, c };
      } else {
        errors.push(`Goal coordinate (${r},${c}) is outside the ${ROWS}x${COLS} grid boundaries.`);
      }
    }

    if (wallsMatch) {
      const wallTokens = wallsMatch[1].trim().split(/[\s,;]+/);
      const parsedWalls: Coord[] = [];
      for (const tok of wallTokens) {
        if (!tok || tok.toLowerCase() === "none") continue;
        const coords = tok.split(/[-:,]/);
        if (coords.length === 2) {
          const wr = Number(coords[0]);
          const wc = Number(coords[1]);
          if (!isNaN(wr) && !isNaN(wc) && wr >= 0 && wr < ROWS && wc >= 0 && wc < COLS) {
            parsedWalls.push({ r: wr, c: wc });
          }
        }
      }
      newObstacles = parsedWalls;
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setStart(newStart);
    setGoal(newGoal);
    setObstacles(newObstacles);
    setStepIdx(0);
    return { isValid: true };
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Strategy Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> State-Space Search Studio
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            {strategy === "astar" && "A* Search: f(n) = g(n) + h(n) Admissible Frontier Engine"}
            {strategy === "dls" && "Depth-Limited Search (DLS): Bound L Prevents Infinite Descents"}
            {strategy === "bidirectional" && "Bidirectional Search: Dual Frontiers Colliding in O(b^(d/2))"}
            {strategy === "hillClimbing" && "Hill Climbing: Greedy Local Search & Minimum Traps"}
            {strategy === "annealing" && "Simulated Annealing: Metropolis P = exp(-ΔE/T) Uphill Escapes"}
            {strategy === "beam" && "Local Beam Search: k=2 Parallel States Synchronized Descent"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={stepIdx <= 0}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipBack className="w-3.5 h-3.5" /> Back
          </button>
          <button
            type="button"
            onClick={() => setStepIdx((prev) => Math.min(prev + 1, execution.steps.length - 1))}
            disabled={stepIdx >= execution.steps.length - 1}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" /> Next Step
          </button>
          <button
            type="button"
            onClick={() => setStepIdx(0)}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Algorithm Strategy Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setStrategy("astar"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "astar"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Compass className="w-3.5 h-3.5" /> A* Search
        </button>
        <button
          type="button"
          onClick={() => { setStrategy("dls"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "dls"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Layers className="w-3.5 h-3.5" /> Depth-Limited (DLS)
        </button>
        <button
          type="button"
          onClick={() => { setStrategy("bidirectional"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "bidirectional"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" /> Bidirectional
        </button>
        <button
          type="button"
          onClick={() => { setStrategy("hillClimbing"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "hillClimbing"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Hill Climbing
        </button>
        <button
          type="button"
          onClick={() => { setStrategy("annealing"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "annealing"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Flame className="w-3.5 h-3.5" /> Simulated Annealing
        </button>
        <button
          type="button"
          onClick={() => { setStrategy("beam"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            strategy === "beam"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Network className="w-3.5 h-3.5" /> Local Beam (k=2)
        </button>
        <Link
          href="/simulations/minimax"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border dark:border-[#0A84FF]/40 border-[#FF7A00]/40 dark:text-cyan-300 text-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" /> Adversarial Minimax (α-β) →
        </Link>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Grid Configuration & Presets"
        subtitle="Set Start and Goal coordinates and define obstacle walls (format: Start: 0,0 | Goal: 3,4 | Walls: 1-1, 2-1)."
        initialValue={`Start: ${start.r},${start.c} | Goal: ${goal.r},${goal.c} | Walls: ${obstacles.map((o) => `${o.r}-${o.c}`).join(", ") || "none"}`}
        placeholder="Start: 0,0 | Goal: 3,4 | Walls: 1-1, 2-1"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`Start (${start.r},${start.c}) → Goal (${goal.r},${goal.c}) | ${obstacles.length} Obstacles`}
      />

      {/* Parameters & Strategy Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
        {strategy === "dls" ? (
          <div className="flex items-center gap-3">
            <span className="dark:text-slate-400 text-[#737373]">Depth Limit (L):</span>
            <input
              type="range"
              min="1"
              max="8"
              value={depthLimit}
              onChange={(e) => { setDepthLimit(Number(e.target.value)); setStepIdx(0); }}
              className="w-28 accent-[#FF7A00] dark:accent-[#0A84FF]"
            />
            <span className="font-bold dark:text-cyan-300 text-[#FF7A00]">L = {depthLimit}</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">(Cuts off search if depth &gt; L)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-slate-400" />
            <span className="dark:text-slate-400 text-[#737373]">Heuristic h(n):</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setHeuristicType("manhattan"); setStepIdx(0); }}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all",
                  heuristicType === "manhattan"
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
                )}
              >
                Manhattan (|Δr| + |Δc|)
              </button>
              <button
                type="button"
                onClick={() => { setHeuristicType("euclidean"); setStepIdx(0); }}
                className={cn(
                  "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all",
                  heuristicType === "euclidean"
                    ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                    : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
                )}
              >
                Euclidean (√(Δr² + Δc²))
              </button>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-500">
          Tip: Click any grid cell to toggle obstacle walls!
        </div>
      </div>

      {/* 4x5 Grid Layout */}
      <div className="flex flex-col items-center justify-center p-4 dark:bg-black/40 bg-[#F7F7F7] rounded-xl border dark:border-white/5 border-[#E5E5E5]">
        <div className="grid grid-cols-5 gap-2 max-w-sm w-full">
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const isStart = r === start.r && c === start.c;
              const isGoal = r === goal.r && c === goal.c;
              const isObstacle = obstacles.some((o) => o.r === r && o.c === c);
              const isCurrent = activeStep.current.r === r && activeStep.current.c === c;
              const isExploredF = activeStep.exploredForward?.some((e) => e.r === r && e.c === c);
              const inFrontierF = activeStep.frontierForward?.some((f) => f.r === r && f.c === c);
              const isExploredB = activeStep.exploredBackward?.some((e) => e.r === r && e.c === c);
              const inFrontierB = activeStep.frontierBackward?.some((f) => f.r === r && f.c === c);
              const isIntersect = activeStep.intersection && activeStep.intersection.r === r && activeStep.intersection.c === c;

              return (
                <button
                  type="button"
                  key={`${r}-${c}`}
                  onClick={() => handleToggleCellObstacle(r, c)}
                  className={cn(
                    "aspect-square rounded-xl border flex flex-col items-center justify-center text-xs font-mono font-bold transition-all duration-200 cursor-pointer select-none",
                    isObstacle
                      ? "dark:bg-slate-800 bg-slate-400 dark:border-slate-700 border-slate-500 text-white opacity-80 hover:opacity-100"
                      : isIntersect
                      ? "bg-purple-600 border-purple-400 text-white scale-110 shadow-[0_0_15px_rgba(168,85,247,0.8)] z-20 animate-bounce"
                      : isCurrent
                      ? "bg-[#FF7A00] dark:bg-[#0A84FF] text-white border-white scale-105 shadow-[0_0_12px_rgba(255,122,0,0.6)] z-10"
                      : isGoal
                      ? "bg-rose-500 border-rose-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      : isStart
                      ? "bg-emerald-500 border-emerald-400 text-white"
                      : inFrontierB
                      ? "bg-indigo-500/30 border-indigo-400 text-indigo-400 animate-pulse"
                      : isExploredB
                      ? "bg-indigo-900/40 border-indigo-500 text-indigo-300"
                      : inFrontierF
                      ? "dark:bg-amber-500/20 bg-amber-100 border-amber-400 text-amber-600 dark:text-amber-300 animate-pulse"
                      : isExploredF
                      ? "dark:bg-cyan-500/20 bg-[rgba(255,122,0,0.15)] dark:border-cyan-400 border-[#FF7A00] dark:text-cyan-200 text-[#FF7A00]"
                      : "dark:bg-white/[0.03] bg-white dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-500 hover:border-slate-400"
                  )}
                >
                  <span className="text-[10px]">
                    {isStart
                      ? "START"
                      : isGoal
                      ? "GOAL"
                      : isObstacle
                      ? "WALL"
                      : isIntersect
                      ? "COLLIDE"
                      : `(${r},${c})`}
                  </span>
                  {!isObstacle && (
                    <span className="text-[9px] opacity-75">
                      h={calculateH(r, c)}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Legend & Current Step */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5]">
        <div className="flex items-center gap-2">
          {activeStep.isFailureOrCutoff && (
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
              TRAP / CUTOFF
            </span>
          )}
          <span className="dark:text-slate-200 text-[#171717]">{activeStep.note}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Start
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Goal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] dark:bg-[#0A84FF]" /> Active
          </span>
          {strategy === "bidirectional" && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Backward
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
