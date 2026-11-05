"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Sparkles, ArrowRight, RotateCcw, Bot, Play, Compass, ArrowUp, ArrowDown, ArrowLeft, ArrowUpRight, Award, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

interface AgentConfig {
  start: { r: number; c: number };
  goal: { r: number; c: number };
  pits: { r: number; c: number }[];
  stepPenalty: number;
  goalReward: number;
}

const PRESETS: InputPreset<AgentConfig>[] = [
  {
    id: "standard-mdp",
    name: "Classic Gridworld (Default)",
    description: "Start (0,0), Goal (2,3) [+10], Pit (1,2) [-10], Step Cost -1",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 3 },
      pits: [{ r: 1, c: 2 }],
      stepPenalty: -1,
      goalReward: 10,
    },
    rawString: "Start: 0,0 | Goal: 2,3 | Pits: 1-2 | Cost: -1 | Reward: 10",
  },
  {
    id: "double-hazard",
    name: "Double Hazard Trench",
    description: "Two pits guarding center corridor, requiring outer perimeter navigation",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 3 },
      pits: [{ r: 1, c: 1 }, { r: 1, c: 2 }],
      stepPenalty: -1,
      goalReward: 10,
    },
    rawString: "Start: 0,0 | Goal: 2,3 | Pits: 1-1, 1-2 | Cost: -1 | Reward: 10",
  },
  {
    id: "high-urgency",
    name: "High Urgency (Cost: -3/step)",
    description: "Heavy step penalty incentivizing immediate direct trajectory",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 3 },
      pits: [{ r: 1, c: 1 }],
      stepPenalty: -3,
      goalReward: 20,
    },
    rawString: "Start: 0,0 | Goal: 2,3 | Pits: 1-1 | Cost: -3 | Reward: 20",
  },
  {
    id: "safe-horizon",
    name: "Safe Exploration (Cost: -0.2/step)",
    description: "Low cost allows extensive safe detours without significant penalty",
    data: {
      start: { r: 0, c: 0 },
      goal: { r: 2, c: 3 },
      pits: [{ r: 1, c: 2 }],
      stepPenalty: -0.2,
      goalReward: 10,
    },
    rawString: "Start: 0,0 | Goal: 2,3 | Pits: 1-2 | Cost: -0.2 | Reward: 10",
  },
];

type ActionDir = "UP" | "DOWN" | "LEFT" | "RIGHT";

const ACTIONS: { name: ActionDir; dr: number; dc: number; leftDr: number; leftDc: number; rightDr: number; rightDc: number }[] = [
  { name: "UP", dr: -1, dc: 0, leftDr: 0, leftDc: -1, rightDr: 0, rightDc: 1 },
  { name: "DOWN", dr: 1, dc: 0, leftDr: 0, leftDc: 1, rightDr: 0, rightDc: -1 },
  { name: "LEFT", dr: 0, dc: -1, leftDr: 1, leftDc: 0, rightDr: -1, rightDc: 0 },
  { name: "RIGHT", dr: 0, dc: 1, leftDr: -1, leftDc: 0, rightDr: 1, rightDc: 0 },
];

export default function AgentVisualizer() {
  const [startPos, setStartPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [goal, setGoal] = useState<{ r: number; c: number }>({ r: 2, c: 3 });
  const [pits, setPits] = useState<{ r: number; c: number }[]>([{ r: 1, c: 2 }]);
  const [stepPenalty, setStepPenalty] = useState<number>(-1);
  const [goalReward, setGoalReward] = useState<number>(10);
  const [gamma, setGamma] = useState<number>(0.9);
  const [transitionModel, setTransitionModel] = useState<"stochastic" | "deterministic">("stochastic");
  const [viewMode, setViewMode] = useState<"interactive" | "values" | "policy">("values");
  const [iterationK, setIterationK] = useState<number>(10);

  const [agentPos, setAgentPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [totalReward, setTotalReward] = useState<number>(0);
  const [actionHistory, setActionHistory] = useState<string[]>([]);

  const isGoal = useCallback((r: number, c: number) => r === goal.r && c === goal.c, [goal.r, goal.c]);
  const isPit = useCallback((r: number, c: number) => pits.some((p) => p.r === r && p.c === c), [pits]);

  // ==========================================
  // BELLMAN VALUE ITERATION ENGINE
  // V_{k+1}(s) = max_a [ R(s,a) + γ * sum(P(s'|s,a) * V_k(s')) ]
  // ==========================================
  const valueIterationHistory = useMemo(() => {
    const history: { values: number[][]; policy: (ActionDir | null)[][] }[] = [];

    // Initialize V_0
    let currentV: number[][] = Array.from({ length: 3 }, () => Array(4).fill(0));
    // Set terminal rewards
    currentV[goal.r][goal.c] = goalReward;
    for (const p of pits) {
      currentV[p.r][p.c] = -10;
    }

    // Initial policy
    let currentP: (ActionDir | null)[][] = Array.from({ length: 3 }, () => Array(4).fill(null));

    history.push({
      values: currentV.map((row) => [...row]),
      policy: currentP.map((row) => [...row]),
    });

    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    // Run 20 Bellman backup iterations
    for (let iter = 1; iter <= 20; iter++) {
      const nextV: number[][] = Array.from({ length: 3 }, () => Array(4).fill(0));
      const nextP: (ActionDir | null)[][] = Array.from({ length: 3 }, () => Array(4).fill(null));

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          if (isGoal(r, c)) {
            nextV[r][c] = goalReward;
            nextP[r][c] = null;
            continue;
          }
          if (isPit(r, c)) {
            nextV[r][c] = -10;
            nextP[r][c] = null;
            continue;
          }

          let bestExpected = -Infinity;
          let bestAction: ActionDir = "RIGHT";

          for (const act of ACTIONS) {
            const nr = clamp(r + act.dr, 0, 2);
            const nc = clamp(c + act.dc, 0, 3);
            let expectedFuture = currentV[nr][nc];

            if (transitionModel === "stochastic") {
              const lr = clamp(r + act.leftDr, 0, 2);
              const lc = clamp(c + act.leftDc, 0, 3);
              const rr = clamp(r + act.rightDr, 0, 2);
              const rc = clamp(c + act.rightDc, 0, 3);
              expectedFuture = 0.8 * currentV[nr][nc] + 0.1 * currentV[lr][lc] + 0.1 * currentV[rr][rc];
            }

            const qVal = stepPenalty + gamma * expectedFuture;

            if (qVal > bestExpected) {
              bestExpected = qVal;
              bestAction = act.name;
            }
          }

          nextV[r][c] = Math.round(bestExpected * 100) / 100;
          nextP[r][c] = bestAction;
        }
      }

      currentV = nextV;
      currentP = nextP;

      history.push({
        values: currentV.map((row) => [...row]),
        policy: currentP.map((row) => [...row]),
      });
    }

    return history;
  }, [goal, pits, goalReward, stepPenalty, gamma, transitionModel, isGoal, isPit]);

  const activeIteration = valueIterationHistory[Math.min(iterationK, valueIterationHistory.length - 1)];

  // ==========================================
  // AGENT MANUAL & AUTO CONTROLLER
  // ==========================================
  const move = (dir: ActionDir) => {
    if (isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c)) return;

    let nr = agentPos.r;
    let nc = agentPos.c;

    if (dir === "UP" && nr > 0) nr--;
    if (dir === "DOWN" && nr < 2) nr++;
    if (dir === "LEFT" && nc > 0) nc--;
    if (dir === "RIGHT" && nc < 3) nc++;

    const newPos = { r: nr, c: nc };
    setAgentPos(newPos);

    let stepReward = stepPenalty;
    if (newPos.r === goal.r && newPos.c === goal.c) stepReward = goalReward;
    if (pits.some((p) => p.r === newPos.r && p.c === newPos.c)) stepReward = -10;

    setTotalReward((prev) => Math.round((prev + stepReward) * 10) / 10);
    setActionHistory((prev) => [...prev, `${dir} → (${nr},${nc}) [r=${stepReward}]`]);
  };

  // Follow Bellman Optimal Policy
  const autoStepPolicy = () => {
    if (isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c)) return;
    const optimalDir = activeIteration.policy[agentPos.r][agentPos.c];
    if (optimalDir) {
      move(optimalDir);
    }
  };

  const reset = (s = startPos) => {
    setAgentPos(s);
    setTotalReward(0);
    setActionHistory([]);
  };

  const handleApplyPreset = (p: AgentConfig) => {
    setStartPos(p.start);
    setGoal(p.goal);
    setPits(p.pits);
    setStepPenalty(p.stepPenalty);
    setGoalReward(p.goalReward);
    reset(p.start);
  };

  const handleApplyRaw = (raw: string) => {
    const startMatch = raw.match(/start:\s*(\d+)[,\s]+(\d+)/i);
    const goalMatch = raw.match(/goal:\s*(\d+)[,\s]+(\d+)/i);
    const pitsMatch = raw.match(/pits?:\s*([^\n|]+)/i);
    const costMatch = raw.match(/cost:\s*(-?\d+(?:\.\d+)?)/i);
    const rewardMatch = raw.match(/reward:\s*(\d+(?:\.\d+)?)/i);

    const errors: string[] = [];

    let newStart = startPos;
    let newGoal = goal;
    let newPits = pits;
    let newCost = stepPenalty;
    let newReward = goalReward;

    if (startMatch) {
      const r = Number(startMatch[1]);
      const c = Number(startMatch[2]);
      if (r >= 0 && r < 3 && c >= 0 && c < 4) {
        newStart = { r, c };
      } else {
        errors.push("Start position must be within 3x4 grid.");
      }
    }

    if (goalMatch) {
      const r = Number(goalMatch[1]);
      const c = Number(goalMatch[2]);
      if (r >= 0 && r < 3 && c >= 0 && c < 4) {
        newGoal = { r, c };
      } else {
        errors.push("Goal position must be within 3x4 grid.");
      }
    }

    if (pitsMatch) {
      const parsedPits: { r: number; c: number }[] = [];
      const tokens = pitsMatch[1].trim().split(/[\s,;]+/);
      for (const tok of tokens) {
        if (!tok || tok.toLowerCase() === "none") continue;
        const coords = tok.split(/[-:,]/);
        if (coords.length === 2) {
          const pr = Number(coords[0]);
          const pc = Number(coords[1]);
          if (!isNaN(pr) && !isNaN(pc) && pr >= 0 && pr < 3 && pc >= 0 && pc < 4) {
            parsedPits.push({ r: pr, c: pc });
          }
        }
      }
      newPits = parsedPits;
    }

    if (costMatch) {
      newCost = parseFloat(costMatch[1]);
    }

    if (rewardMatch) {
      newReward = parseFloat(rewardMatch[1]);
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    setStartPos(newStart);
    setGoal(newGoal);
    setPits(newPits);
    setStepPenalty(newCost);
    setGoalReward(newReward);
    reset(newStart);
    return { isValid: true };
  };

  const getArrowIcon = (dir: ActionDir | null) => {
    if (dir === "UP") return <ArrowUp className="w-4 h-4 text-[#FF7A00] dark:text-cyan-300" />;
    if (dir === "DOWN") return <ArrowDown className="w-4 h-4 text-[#FF7A00] dark:text-cyan-300" />;
    if (dir === "LEFT") return <ArrowLeft className="w-4 h-4 text-[#FF7A00] dark:text-cyan-300" />;
    if (dir === "RIGHT") return <ArrowRight className="w-4 h-4 text-[#FF7A00] dark:text-cyan-300" />;
    return null;
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Markov Decision Process (MDP) Engine
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            Bellman Value Iteration &amp; Optimal Policy Extraction π*(s)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={autoStepPolicy}
            disabled={isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c)}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 rounded-lg disabled:opacity-40"
          >
            <Compass className="w-3.5 h-3.5" /> Follow π*(s) Step
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

      {/* Layer / View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="dark:text-slate-400 text-[#737373]">Display Layer:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("values")}
              className={cn(
                "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all",
                viewMode === "values"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                  : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
              )}
            >
              State Values V(s)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("policy")}
              className={cn(
                "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all",
                viewMode === "policy"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                  : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
              )}
            >
              Policy Arrows π*(s)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("interactive")}
              className={cn(
                "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all",
                viewMode === "interactive"
                  ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00]"
                  : "dark:border-white/10 border-slate-300 dark:text-slate-400 text-[#737373]"
              )}
            >
              Agent View
            </button>
            <button
              type="button"
              onClick={() => setTransitionModel((m) => (m === "stochastic" ? "deterministic" : "stochastic"))}
              className={cn(
                "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ml-1.5",
                transitionModel === "stochastic"
                  ? "dark:bg-purple-900/30 bg-purple-100 border-purple-400 text-purple-600 dark:text-purple-300"
                  : "dark:bg-white/[0.04] bg-slate-100 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {transitionModel === "stochastic" ? "Stochastic (80/10/10)" : "Deterministic (100%)"}
            </button>
          </div>
        </div>

        {/* Iteration Slider */}
        <div className="flex items-center gap-2">
          <span className="dark:text-slate-400 text-slate-500">Bellman Step k:</span>
          <input
            type="range"
            min="0"
            max="20"
            value={iterationK}
            onChange={(e) => setIterationK(Number(e.target.value))}
            className="w-24 accent-[#FF7A00] dark:accent-[#0A84FF]"
          />
          <span className="font-bold dark:text-cyan-300 text-[#FF7A00]">k = {iterationK}</span>
        </div>
      </div>

      {/* Custom Input Panel */}
      <CustomInputPanel
        title="Custom Gridworld Environment & Reward Structure"
        subtitle="Configure agent start, goal, hazard pits, and step/goal reward parameters."
        initialValue={`Start: ${startPos.r},${startPos.c} | Goal: ${goal.r},${goal.c} | Pits: ${pits.map((p) => `${p.r}-${p.c}`).join(", ")} | Cost: ${stepPenalty} | Reward: ${goalReward}`}
        placeholder="Start: 0,0 | Goal: 2,3 | Pits: 1-2 | Cost: -1 | Reward: 10"
        presets={PRESETS}
        onApply={handleApplyRaw}
        onReset={() => handleApplyPreset(PRESETS[0].data)}
        summaryBadge={`Start (${startPos.r},${startPos.c}) → Goal (${goal.r},${goal.c}) | γ = ${gamma}`}
      />

      {/* Gridworld Arena & Controller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 3x4 Grid */}
        <div className="p-4 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] flex flex-col items-center justify-center">
          <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 4 }).map((_, c) => {
                const hasAgent = agentPos.r === r && agentPos.c === c;
                const cellGoal = isGoal(r, c);
                const cellPit = isPit(r, c);
                const cellVal = activeIteration.values[r][c];
                const cellDir = activeIteration.policy[r][c];

                return (
                  <div
                    key={`${r}-${c}`}
                    className={cn(
                      "aspect-square rounded-xl border flex flex-col items-center justify-center font-mono font-bold text-xs transition-all relative select-none",
                      hasAgent
                        ? "bg-[#FF7A00] dark:bg-[#0A84FF] text-white border-white scale-105 shadow-md z-10"
                        : cellGoal
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-500"
                        : cellPit
                        ? "bg-rose-500/20 border-rose-400 text-rose-500"
                        : "dark:bg-white/[0.03] bg-white dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-700"
                    )}
                  >
                    {hasAgent && <Bot className="w-4 h-4 mb-0.5 animate-bounce" />}
                    <span className="text-[10px]">
                      {hasAgent ? "AGENT" : cellGoal ? `+${goalReward} GOAL` : cellPit ? "-10 PIT" : `(${r},${c})`}
                    </span>

                    {/* Value Iteration Value Display */}
                    {viewMode === "values" && !cellGoal && !cellPit && (
                      <span className="text-[11px] font-mono dark:text-cyan-300 text-[#FF7A00] mt-0.5 font-bold">
                        V = {cellVal.toFixed(1)}
                      </span>
                    )}

                    {/* Policy Arrow Display */}
                    {viewMode === "policy" && !cellGoal && !cellPit && (
                      <div className="mt-0.5">{getArrowIcon(cellDir)}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Controls & Telemetry */}
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-2">
            <span className="font-bold dark:text-slate-200 text-[#171717] block">
              MDP Telemetry &amp; Bellman Properties:
            </span>
            <div className="flex items-center justify-between">
              <span>Transition Model:</span>
              <span className={cn("font-bold text-[11px]", transitionModel === "stochastic" ? "text-purple-400" : "text-cyan-400")}>
                {transitionModel === "stochastic" ? "Stochastic (80/10/10)" : "Deterministic (100%)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cumulative Agent Return:</span>
              <span className={cn("font-bold text-sm", totalReward >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {totalReward > 0 ? `+${totalReward}` : totalReward}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount Factor γ:</span>
              <span className="font-bold dark:text-cyan-300 text-[#FF7A00]">{gamma}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Current Bellman Iteration:</span>
              <span>Step k = {iterationK} of 20</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>R(s,a) = {stepPenalty}</span>
              <span>V*(Goal) = +{goalReward}</span>
            </div>
          </div>

          {/* D-Pad Controller */}
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => move("UP")}
              disabled={isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c) || agentPos.r === 0}
              className="btn-secondary px-4 py-1.5 rounded-lg disabled:opacity-30"
            >
              ▲ UP
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move("LEFT")}
                disabled={isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c) || agentPos.c === 0}
                className="btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-30"
              >
                ◀ LEFT
              </button>
              <button
                type="button"
                onClick={() => move("DOWN")}
                disabled={isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c) || agentPos.r === 2}
                className="btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-30"
              >
                ▼ DOWN
              </button>
              <button
                type="button"
                onClick={() => move("RIGHT")}
                disabled={isGoal(agentPos.r, agentPos.c) || isPit(agentPos.r, agentPos.c) || agentPos.c === 3}
                className="btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-30"
              >
                ▶ RIGHT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Trail */}
      <div className="p-3 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs flex items-center justify-between">
        <span className="dark:text-slate-300 text-[#171717]">
          {isGoal(agentPos.r, agentPos.c)
            ? `Goal state reached! Positive terminal reward (+${goalReward}) awarded.`
            : isPit(agentPos.r, agentPos.c)
            ? "Hazard penalty triggered in pit (-10 penalty)."
            : actionHistory.length > 0
            ? `Latest Action: ${actionHistory[actionHistory.length - 1]}`
            : "Use D-Pad controls or click 'Follow π*(s) Step' to execute the optimal Bellman policy."}
        </span>
      </div>

      {/* Academic Theory Callout */}
      <div className="p-4 rounded-xl dark:bg-[#0A84FF]/5 bg-[rgba(255,122,0,0.04)] border dark:border-[#0A84FF]/20 border-[#FF7A00]/20 text-xs font-mono space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold dark:text-cyan-300 text-[#FF7A00]">
          <Award className="w-3.5 h-3.5" /> Bellman Optimality Equation: V*(s) = max_a [R(s) + γ Σ P(s'|s,a) V*(s')]
        </div>
        <p className="dark:text-slate-300 text-slate-600 leading-relaxed text-[11px]">
          Value iteration guarantees convergence to the unique optimal value function $V^*(s)$ via the Banach fixed-point contraction mapping with rate $\gamma &lt; 1$.
          The optimal policy $\pi^*(s)$ greedily acts with respect to $V^*(s)$, navigating the agent safely toward the terminal goal while steering away from stochastic hazard pits!
        </p>
      </div>
    </div>
  );
}
