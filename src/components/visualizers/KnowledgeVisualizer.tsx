"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, SkipForward, SkipBack, RotateCcw, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Network, Activity, Sliders, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import CustomInputPanel from "@/components/ui/CustomInputPanel";
import { InputPreset } from "@/lib/customInput/types";

// ==========================================
// 1. HORN LOGIC DEFINITIONS & PRESETS
// ==========================================
interface HornRule {
  id: string;
  premises: string[];
  conclusion: string;
  text: string;
}

const DEFAULT_RULES: HornRule[] = [
  { id: "R1", premises: ["A", "B"], conclusion: "C", text: "A ∧ B ⇒ C" },
  { id: "R2", premises: ["C", "D"], conclusion: "E", text: "C ∧ D ⇒ E" },
  { id: "R3", premises: ["C"], conclusion: "D", text: "C ⇒ D" },
  { id: "R4", premises: ["E"], conclusion: "GOAL", text: "E ⇒ GOAL" },
  { id: "R5", premises: ["B", "D"], conclusion: "F", text: "B ∧ D ⇒ F" },
];

interface KnowledgeConfig {
  initialFacts: string[];
  goal: string;
}

const PRESETS: InputPreset<KnowledgeConfig>[] = [
  {
    id: "standard-chain",
    name: "Complete Proof Chain (A, B ⊨ GOAL)",
    description: "Standard 4-step deduction proving GOAL from initial facts {A, B}",
    data: { initialFacts: ["A", "B"], goal: "GOAL" },
    rawString: "Facts: A, B | Goal: GOAL",
  },
  {
    id: "partial-advance",
    name: "Advanced State (C, D ⊨ GOAL)",
    description: "Begins with {C, D} already proven, skipping R1 and R3",
    data: { initialFacts: ["C", "D"], goal: "GOAL" },
    rawString: "Facts: C, D | Goal: GOAL",
  },
  {
    id: "insufficient-facts",
    name: "Insufficient Facts (Only A known)",
    description: "Missing fact B halts deduction: R1 never fires, GOAL cannot be proven",
    data: { initialFacts: ["A"], goal: "GOAL" },
    rawString: "Facts: A | Goal: GOAL",
  },
  {
    id: "intermediate-target",
    name: "Intermediate Target (A, B ⊨ D)",
    description: "Deduce target D in 2 steps from {A, B}",
    data: { initialFacts: ["A", "B"], goal: "D" },
    rawString: "Facts: A, B | Goal: D",
  },
];

type ReasoningMode = "forward" | "backward" | "bayes" | "fuzzy";

interface ForwardStep {
  inferred: string[];
  firedRule: HornRule | null;
  agenda: string[];
  explanation: string;
  isGoalProven: boolean;
}

interface BackwardStep {
  currentSubgoal: string;
  subgoalStack: string[];
  provenGoals: string[];
  matchedRule: HornRule | null;
  explanation: string;
  isProven: boolean;
  isFailed: boolean;
}

export default function KnowledgeVisualizer() {
  const [mode, setMode] = useState<ReasoningMode>("forward");
  const [facts, setFacts] = useState<string[]>(["A", "B"]);
  const [goal, setGoal] = useState<string>("GOAL");
  const [stepIdx, setStepIdx] = useState<number>(0);

  // ==========================================
  // BAYESIAN NETWORK STATE (Alarm Network)
  // B: Burglary, E: Earthquake, A: Alarm, J: JohnCalls, M: MaryCalls
  // ==========================================
  const [evidence, setEvidence] = useState<{
    B?: boolean;
    E?: boolean;
    A?: boolean;
    J?: boolean;
    M?: boolean;
  }>({ J: true, M: true });

  // ==========================================
  // FUZZY LOGIC STATE (Temperature Controller)
  // ==========================================
  const [temperature, setTemperature] = useState<number>(45);

  // ==========================================
  // 1. FORWARD CHAINING
  // ==========================================
  const forwardSteps: ForwardStep[] = useMemo(() => {
    const recordedSteps: ForwardStep[] = [];
    const known = new Set<string>(facts);
    const firedRuleIds = new Set<string>();

    recordedSteps.push({
      inferred: Array.from(known),
      firedRule: null,
      agenda: Array.from(known),
      explanation: `Forward Chaining started: Known axiomatic facts = {${Array.from(known).join(", ")}}. Goal query: ${goal}.`,
      isGoalProven: known.has(goal),
    });

    if (known.has(goal)) {
      recordedSteps[0].explanation += ` Target ${goal} is already an axiom!`;
      return recordedSteps;
    }

    let progress = true;
    while (progress) {
      progress = false;

      for (const rule of DEFAULT_RULES) {
        if (firedRuleIds.has(rule.id)) continue;

        const allPremisesSatisfied = rule.premises.every((p) => known.has(p));
        if (allPremisesSatisfied) {
          firedRuleIds.add(rule.id);
          known.add(rule.conclusion);
          progress = true;

          const isGoalReached = known.has(goal);

          recordedSteps.push({
            inferred: Array.from(known),
            firedRule: rule,
            agenda: [rule.conclusion],
            explanation: `Modus Ponens on Rule ${rule.id} (${rule.text}): All premises [${rule.premises.join(", ")}] are TRUE! Inferred: ${rule.conclusion}.${
              isGoalReached ? ` GOAL REACHED: KB ⊨ ${goal} is proved!` : ""
            }`,
            isGoalProven: isGoalReached,
          });

          if (isGoalReached) {
            return recordedSteps;
          }
          break;
        }
      }
    }

    if (!known.has(goal)) {
      recordedSteps.push({
        inferred: Array.from(known),
        firedRule: null,
        agenda: [],
        explanation: `Inference halted: No further rules can fire. Target "${goal}" cannot be derived from given base facts (KB ⊭ ${goal}).`,
        isGoalProven: false,
      });
    }

    return recordedSteps;
  }, [facts, goal]);

  // ==========================================
  // 2. BACKWARD CHAINING
  // ==========================================
  const backwardSteps: BackwardStep[] = useMemo(() => {
    const steps: BackwardStep[] = [];
    const knownFacts = new Set<string>(facts);
    const proven = new Set<string>();
    const stack: string[] = [goal];

    steps.push({
      currentSubgoal: goal,
      subgoalStack: [...stack],
      provenGoals: Array.from(proven),
      matchedRule: null,
      explanation: `Backward Chaining initialized: Query Goal "${goal}" placed on subgoal stack. Checking if goal is already a base axiom or requires rule reduction.`,
      isProven: false,
      isFailed: false,
    });

    function prove(target: string): boolean {
      if (knownFacts.has(target)) {
        proven.add(target);
        steps.push({
          currentSubgoal: target,
          subgoalStack: [...stack],
          provenGoals: Array.from(proven),
          matchedRule: null,
          explanation: `Axiom Match: Subgoal "${target}" is directly present in base facts {${Array.from(knownFacts).join(", ")}}! Subgoal satisfied.`,
          isProven: target === goal,
          isFailed: false,
        });
        return true;
      }

      const candidateRules = DEFAULT_RULES.filter((r) => r.conclusion === target);
      if (candidateRules.length === 0) {
        steps.push({
          currentSubgoal: target,
          subgoalStack: [...stack],
          provenGoals: Array.from(proven),
          matchedRule: null,
          explanation: `Subgoal Failure: No rules in knowledge base conclude "${target}", and it is not an axiom. Branch fails!`,
          isProven: false,
          isFailed: true,
        });
        return false;
      }

      for (const rule of candidateRules) {
        steps.push({
          currentSubgoal: target,
          subgoalStack: [...stack],
          provenGoals: Array.from(proven),
          matchedRule: rule,
          explanation: `Rule Match for "${target}": Rule ${rule.id} (${rule.text}) concludes "${target}". Spawning premises [${rule.premises.join(", ")}] as subgoals to prove.`,
          isProven: false,
          isFailed: false,
        });

        let allPremisesProven = true;
        for (const premise of rule.premises) {
          stack.push(premise);
          const premiseOk = prove(premise);
          stack.pop();

          if (!premiseOk) {
            allPremisesProven = false;
            break;
          }
        }

        if (allPremisesProven) {
          proven.add(target);
          steps.push({
            currentSubgoal: target,
            subgoalStack: [...stack],
            provenGoals: Array.from(proven),
            matchedRule: rule,
            explanation: `Rule ${rule.id} premise proofs complete! Modus Ponens concludes "${target}" is TRUE.`,
            isProven: target === goal,
            isFailed: false,
          });
          return true;
        }
      }

      return false;
    }

    const success = prove(goal);
    if (!success) {
      steps.push({
        currentSubgoal: goal,
        subgoalStack: [],
        provenGoals: Array.from(proven),
        matchedRule: null,
        explanation: `Backward Chaining Finished: Unable to establish all necessary subgoals. KB ⊭ ${goal}.`,
        isProven: false,
        isFailed: true,
      });
    } else {
      steps.push({
        currentSubgoal: goal,
        subgoalStack: [],
        provenGoals: Array.from(proven),
        matchedRule: null,
        explanation: `Proof Tree Complete! Goal "${goal}" is mathematically entailed by Knowledge Base axioms through backward chaining.`,
        isProven: true,
        isFailed: false,
      });
    }

    return steps;
  }, [facts, goal]);

  // ==========================================
  // 3. EXACT INFERENCE BY ENUMERATION IN BAYES NET
  // Alarm Network: B -> A, E -> A, A -> J, A -> M
  // ==========================================
  const bayesInference = useMemo(() => {
    // Joint probability function P(b, e, a, j, m)
    function pJoint(b: boolean, e: boolean, a: boolean, j: boolean, m: boolean): number {
      const pB = b ? 0.001 : 0.999;
      const pE = e ? 0.002 : 0.998;

      let pA = 0.001;
      if (b && e) pA = 0.95;
      else if (b && !e) pA = 0.94;
      else if (!b && e) pA = 0.29;
      else pA = 0.001;
      const pA_actual = a ? pA : 1 - pA;

      const pJ = a ? (j ? 0.90 : 0.10) : (j ? 0.05 : 0.95);
      const pM = a ? (m ? 0.70 : 0.30) : (m ? 0.01 : 0.99);

      return pB * pE * pA_actual * pJ * pM;
    }

    // Enumerate all 32 joint states consistent with evidence
    let sumTrue = 0; // P(B = true, e)
    let sumFalse = 0; // P(B = false, e)

    const booleans = [false, true];
    for (const b of booleans) {
      if (evidence.B !== undefined && evidence.B !== b) continue;
      for (const e of booleans) {
        if (evidence.E !== undefined && evidence.E !== e) continue;
        for (const a of booleans) {
          if (evidence.A !== undefined && evidence.A !== a) continue;
          for (const j of booleans) {
            if (evidence.J !== undefined && evidence.J !== j) continue;
            for (const m of booleans) {
              if (evidence.M !== undefined && evidence.M !== m) continue;

              const joint = pJoint(b, e, a, j, m);
              if (b) sumTrue += joint;
              else sumFalse += joint;
            }
          }
        }
      }
    }

    const totalEvidenceProb = sumTrue + sumFalse;
    const probBTrue = totalEvidenceProb > 0 ? sumTrue / totalEvidenceProb : 0;
    const probBFalse = totalEvidenceProb > 0 ? sumFalse / totalEvidenceProb : 1;

    return {
      pB_given_e: probBTrue,
      pNotB_given_e: probBFalse,
      pe: totalEvidenceProb,
    };
  }, [evidence]);

  // ==========================================
  // 4. FUZZY LOGIC (Mamdani Inference Engine)
  // ==========================================
  const fuzzyInference = useMemo(() => {
    const t = temperature;
    // Triangular / Trapezoidal Membership functions:
    // Cold: [0, 40]
    const muCold = Math.max(0, Math.min(1, (40 - t) / 40));
    // Warm: [20, 50, 80]
    const muWarm = t <= 50 ? Math.max(0, (t - 20) / 30) : Math.max(0, (80 - t) / 30);
    // Hot: [60, 100]
    const muHot = Math.max(0, Math.min(1, (t - 60) / 40));

    // Centroid Defuzzification:
    // Action centers: Cold -> Fan 20%, Warm -> Fan 50%, Hot -> Fan 90%
    const num = muCold * 20 + muWarm * 50 + muHot * 90;
    const den = muCold + muWarm + muHot;
    const fanSpeed = den > 0 ? num / den : 50;

    return {
      muCold,
      muWarm,
      muHot,
      fanSpeed: Math.round(fanSpeed * 10) / 10,
    };
  }, [temperature]);

  const activeForward = forwardSteps[stepIdx] || forwardSteps[0];
  const activeBackward = backwardSteps[stepIdx] || backwardSteps[0];
  const maxSteps = mode === "forward" ? forwardSteps.length : backwardSteps.length;

  const handleApplyPreset = (p: KnowledgeConfig) => {
    setFacts(p.initialFacts);
    setGoal(p.goal);
    setStepIdx(0);
  };

  const handleApplyRaw = (raw: string) => {
    const factsMatch = raw.match(/facts?:\s*([^|]+)/i);
    const goalMatch = raw.match(/goal:\s*([A-Za-z0-9_]+)/i);

    if (!factsMatch) {
      return {
        isValid: false,
        errors: ["Missing facts specification. Format: 'Facts: A, B | Goal: GOAL'"],
      };
    }

    const parsedFacts = factsMatch[1]
      .split(/[,\s]+/)
      .map((f) => f.trim().toUpperCase())
      .filter(Boolean);

    const parsedGoal = goalMatch ? goalMatch[1].trim().toUpperCase() : "GOAL";

    if (parsedFacts.length === 0) {
      return {
        isValid: false,
        errors: ["Please provide at least 1 known fact (e.g. A or B)."],
      };
    }

    setFacts(parsedFacts);
    setGoal(parsedGoal);
    setStepIdx(0);
    return { isValid: true };
  };

  const toggleEvidence = (node: "B" | "E" | "A" | "J" | "M") => {
    setEvidence((prev) => {
      const current = prev[node];
      if (current === undefined) return { ...prev, [node]: true };
      if (current === true) return { ...prev, [node]: false };
      const next = { ...prev };
      delete next[node];
      return next;
    });
  };

  return (
    <div className="card-base rounded-2xl overflow-hidden border dark:border-white/10 border-[#E5E5E5] p-5 sm:p-6 dark:bg-[#0A0E1A]/80 bg-white shadow-xl space-y-5">
      {/* Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-white/[0.08] border-[#E5E5E5]">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] dark:text-cyan-300 text-[#FF7A00] border dark:border-[#0A84FF]/25 border-[#FF7A00]/30 font-semibold mb-1">
            <Sparkles className="w-3 h-3" /> Knowledge Representation &amp; Reasoning Studio
          </span>
          <h3 className="font-heading font-bold text-lg dark:text-white text-[#171717]">
            {mode === "forward" && "Forward Chaining: Data-Driven Modus Ponens Entailment"}
            {mode === "backward" && "Backward Chaining: Goal-Driven Subgoal Reduction Engine"}
            {mode === "bayes" && "Bayesian Network: Exact Probabilistic Inference by Enumeration"}
            {mode === "fuzzy" && "Fuzzy Logic: Mamdani Membership & Centroid Defuzzification"}
          </h3>
        </div>

        {(mode === "forward" || mode === "backward") && (
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
              onClick={() => setStepIdx((prev) => Math.min(prev + 1, maxSteps - 1))}
              disabled={stepIdx >= maxSteps - 1}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 rounded-lg disabled:opacity-40"
            >
              <SkipForward className="w-3.5 h-3.5" /> Step Next
            </button>
            <button
              type="button"
              onClick={() => setStepIdx(0)}
              className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1 rounded-lg"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* Mode Toggle Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setMode("forward"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            mode === "forward"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <ArrowRight className="w-3.5 h-3.5" /> 1. Forward Chaining
        </button>
        <button
          type="button"
          onClick={() => { setMode("backward"); setStepIdx(0); }}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            mode === "backward"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 2. Backward Chaining
        </button>
        <button
          type="button"
          onClick={() => setMode("bayes")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            mode === "bayes"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Network className="w-3.5 h-3.5" /> 3. Bayesian Network (Alarm Net)
        </button>
        <button
          type="button"
          onClick={() => setMode("fuzzy")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 border",
            mode === "fuzzy"
              ? "dark:bg-[#0A84FF]/20 bg-[rgba(255,122,0,0.15)] dark:border-[#0A84FF] border-[#FF7A00] dark:text-cyan-300 text-[#FF7A00] shadow-sm"
              : "dark:border-white/10 border-slate-200 dark:text-slate-400 text-slate-600 hover:border-slate-300"
          )}
        >
          <Activity className="w-3.5 h-3.5" /> 4. Fuzzy Logic
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1 & 2. FORWARD AND BACKWARD CHAINING */}
      {/* ========================================================= */}
      {(mode === "forward" || mode === "backward") && (
        <div className="space-y-4">
          <CustomInputPanel
            title="Custom Horn Facts & Goal Query"
            subtitle="Configure the base axioms and target entailment query (format: Facts: A, B | Goal: GOAL)."
            initialValue={`Facts: ${facts.join(", ")} | Goal: ${goal}`}
            placeholder="Facts: A, B | Goal: GOAL"
            presets={PRESETS}
            onApply={handleApplyRaw}
            onReset={() => handleApplyPreset(PRESETS[0].data)}
            summaryBadge={`Facts: {${facts.join(", ")}} | Query: ${goal}`}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] space-y-2">
              <span className="text-xs font-mono font-bold dark:text-slate-300 text-[#171717] block mb-2">
                Horn Clause Rule Base:
              </span>
              {DEFAULT_RULES.map((r) => {
                const hasFired =
                  mode === "forward"
                    ? forwardSteps.slice(0, stepIdx + 1).some((s) => s.firedRule?.id === r.id)
                    : backwardSteps.slice(0, stepIdx + 1).some((s) => s.matchedRule?.id === r.id);

                return (
                  <div
                    key={r.id}
                    className={cn(
                      "p-2 rounded-lg font-mono text-xs flex items-center justify-between border transition-all",
                      hasFired
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 font-bold"
                        : "dark:bg-white/[0.02] bg-white dark:border-white/[0.05] border-[#E5E5E5] dark:text-slate-400 text-[#737373]"
                    )}
                  >
                    <span>{r.id}: {r.text}</span>
                    {hasFired && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl dark:bg-black/30 bg-[#F7F7F7] border dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold dark:text-slate-300 text-[#171717] block mb-2">
                  {mode === "forward" ? "Belief State (Inferred Facts):" : "Subgoal Stack & Proven Targets:"}
                </span>

                {mode === "forward" ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {activeForward.inferred.map((fact) => (
                      <span
                        key={fact}
                        className={cn(
                          "px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all",
                          fact === goal
                            ? "bg-[#FF7A00] dark:bg-[#0A84FF] text-white border-transparent shadow-sm"
                            : "dark:bg-emerald-500/20 bg-emerald-100 border-emerald-400 text-emerald-600 dark:text-emerald-300"
                        )}
                      >
                        {fact} {fact === goal ? "★ GOAL" : ""}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block mb-1">Active Subgoal Stack (LIFO):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeBackward.subgoalStack.length > 0 ? (
                          activeBackward.subgoalStack.map((sg, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 border border-purple-400 text-purple-400"
                            >
                              {sg}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-mono text-slate-500">Stack Empty</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block mb-1">Proven Atoms:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeBackward.provenGoals.map((g) => (
                          <span
                            key={g}
                            className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t dark:border-white/10 border-slate-200 text-xs font-mono flex items-center justify-between">
                <span className="dark:text-slate-400 text-slate-500">Target Entailment:</span>
                <span
                  className={cn(
                    "font-bold flex items-center gap-1",
                    (mode === "forward" ? activeForward.isGoalProven : activeBackward.isProven)
                      ? "text-emerald-500"
                      : "text-amber-500"
                  )}
                >
                  {(mode === "forward" ? activeForward.isGoalProven : activeBackward.isProven) ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> KB ⊨ {goal} (PROVEN)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> KB ⊭ {goal} (Pending / Unproven)
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] font-mono text-xs">
            <span className="dark:text-slate-200 text-[#171717]">
              {mode === "forward" ? activeForward.explanation : activeBackward.explanation}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. BAYESIAN NETWORK (ALARM NETWORK) */}
      {/* ========================================================= */}
      {mode === "bayes" && (
        <div className="space-y-5">
          {/* Telemetry Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono">
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Query Variable:</span>
              <strong className="text-sm dark:text-white text-[#171717]">Burglary B</strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Posterior P(Burglary | Evidence):</span>
              <strong className="text-base text-rose-500 font-bold">
                {(bayesInference.pB_given_e * 100).toFixed(2)}%
              </strong>
            </div>
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">P(¬Burglary | Evidence):</span>
              <strong className="text-base text-emerald-500 font-bold">
                {(bayesInference.pNotB_given_e * 100).toFixed(2)}%
              </strong>
            </div>
          </div>

          {/* Alarm Network Topology */}
          <div className="p-6 rounded-xl dark:bg-black/40 bg-slate-50 border dark:border-white/5 border-slate-200 space-y-6">
            {/* Quick Benchmark Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl dark:bg-white/[0.03] bg-slate-100 border dark:border-white/10 border-slate-200 text-xs font-mono">
              <span className="text-slate-400 font-semibold">Evidence Presets:</span>
              <button
                type="button"
                onClick={() => setEvidence({})}
                className="px-2.5 py-1 rounded-lg border dark:border-white/10 border-slate-300 dark:hover:bg-white/5 hover:bg-slate-200 transition-all"
              >
                1. Prior Baseline (No Evidence: P=0.10%)
              </button>
              <button
                type="button"
                onClick={() => setEvidence({ J: true, M: true })}
                className="px-2.5 py-1 rounded-lg border dark:border-cyan-500/40 border-[#FF7A00]/40 dark:text-cyan-300 text-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] transition-all font-semibold"
              >
                2. John &amp; Mary Call (J=T, M=T: P=28.42%)
              </button>
              <button
                type="button"
                onClick={() => setEvidence({ J: true, M: true, E: true })}
                className="px-2.5 py-1 rounded-lg border dark:border-emerald-500/40 border-emerald-400 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 bg-emerald-50 transition-all font-semibold"
              >
                3. Explaining Away (J=T, M=T, E=T: P=0.33%)
              </button>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-bold dark:text-slate-300 text-slate-700">
                Click any node below to toggle observed evidence (True / False / Unobserved):
              </span>
              <button
                type="button"
                onClick={() => setEvidence({})}
                className="btn-secondary text-[11px] px-2.5 py-1 rounded-md"
              >
                Clear Evidence
              </button>
            </div>

            {/* Network Nodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: "B", name: "Burglary", prior: "P(B) = 0.001" },
                { id: "E", name: "Earthquake", prior: "P(E) = 0.002" },
                { id: "A", name: "Alarm", prior: "CPT: P(A | B, E)" },
                { id: "J", name: "JohnCalls", prior: "CPT: P(J | A)" },
                { id: "M", name: "MaryCalls", prior: "CPT: P(M | A)" },
              ].map((n) => {
                const nodeKey = n.id as "B" | "E" | "A" | "J" | "M";
                const evState = evidence[nodeKey];

                return (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => toggleEvidence(nodeKey)}
                    className={cn(
                      "p-3.5 rounded-xl border font-mono text-left transition-all duration-200 cursor-pointer shadow-sm",
                      evState === true
                        ? "dark:bg-emerald-950/30 bg-emerald-50 border-emerald-500 text-emerald-600 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                        : evState === false
                        ? "dark:bg-rose-950/30 bg-rose-50 border-rose-500 text-rose-600 dark:text-rose-300 ring-2 ring-rose-500/30"
                        : "dark:bg-white/[0.03] bg-white dark:border-white/10 border-slate-200 dark:text-slate-300 text-slate-700 hover:border-slate-400"
                    )}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-sm">{n.name} ({n.id})</strong>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                        evState === true
                          ? "bg-emerald-500 text-white"
                          : evState === false
                          ? "bg-rose-500 text-white"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      )}>
                        {evState === true ? "TRUE" : evState === false ? "FALSE" : "UNOBSERVED"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{n.prior}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Insight Callout */}
          <div className="p-4 rounded-xl dark:bg-[#0A84FF]/5 bg-[rgba(255,122,0,0.04)] border dark:border-[#0A84FF]/20 border-[#FF7A00]/20 text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold dark:text-cyan-300 text-[#FF7A00]">
              <Award className="w-3.5 h-3.5" /> Explaining Away (Discounting) in Bayesian Networks
            </div>
            <p className="dark:text-slate-300 text-slate-600 leading-relaxed text-[11px]">
              When both John and Mary call (J=true, M=true), P(Burglary) jumps from 0.1% to <strong>28.4%</strong>.
              However, if we also observe Earthquake=true, P(Burglary) plummets to <strong>0.33%</strong>!
              Even though Burglary and Earthquake are independent priors, they become conditionally dependent given their common child Alarm (V-structure / Explaining Away).
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. FUZZY LOGIC (MAMDANI CONTROLLER) */}
      {/* ========================================================= */}
      {mode === "fuzzy" && (
        <div className="space-y-5">
          {/* Temperature Slider Control */}
          <div className="p-4 rounded-xl dark:bg-white/[0.02] bg-[#F7F7F7] border dark:border-white/[0.06] border-[#E5E5E5] space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold dark:text-white text-[#171717] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#FF7A00] dark:text-[#0A84FF]" />
                Input Linguistic Variable: Temperature T
              </span>
              <span className="text-sm font-bold dark:text-cyan-300 text-[#FF7A00]">
                {temperature}°C
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-[#FF7A00] dark:accent-[#0A84FF]"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>0°C (Freezing)</span>
              <span>50°C (Moderate)</span>
              <span>100°C (Boiling)</span>
            </div>
          </div>

          {/* Fuzzification & Membership Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: "Cold (μ)", val: fuzzyInference.muCold, color: "text-blue-500", bar: "bg-blue-500" },
              { name: "Warm (μ)", val: fuzzyInference.muWarm, color: "text-amber-500", bar: "bg-amber-500" },
              { name: "Hot (μ)", val: fuzzyInference.muHot, color: "text-rose-500", bar: "bg-rose-500" },
            ].map((m) => (
              <div
                key={m.name}
                className="p-3.5 rounded-xl border dark:bg-white/[0.02] bg-white dark:border-white/10 border-slate-200 font-mono text-xs space-y-2"
              >
                <div className="flex justify-between">
                  <span>{m.name}:</span>
                  <strong className={m.color}>{m.val.toFixed(2)}</strong>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div style={{ width: `${m.val * 100}%` }} className={cn("h-full rounded-full transition-all duration-200", m.bar)} />
                </div>
              </div>
            ))}
          </div>

          {/* Defuzzification Output */}
          <div className="p-4 rounded-xl dark:bg-black/40 bg-slate-50 border dark:border-white/5 border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs">
            <div>
              <span className="dark:text-slate-400 text-slate-600 block text-[11px]">Centroid Defuzzification Result:</span>
              <strong className="text-xl text-emerald-500 font-bold">
                Fan Speed = {fuzzyInference.fanSpeed}%
              </strong>
            </div>
            <div className="text-[11px] dark:text-slate-300 text-slate-600 max-w-sm">
              Mamdani rules evaluate membership degrees and compute the crisp centroid Center of Gravity (CoG):
              y* = Σ(μ_i · y_i) / Σ(μ_i).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
