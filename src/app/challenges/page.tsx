"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CHALLENGES, Challenge, TestCase } from "@/lib/challenges/challengesData";
import { transform } from "sucrase";
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Clock,
  Sparkles,
  Search,
  Filter,
  Terminal,
  Send,
  AlertTriangle,
} from "lucide-react";

type Language = "javascript" | "typescript";

interface TestResult {
  index: number;
  description: string;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  executionTimeMs: number;
  hidden?: boolean;
}

export default function ChallengesPage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CHALLENGES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("javascript");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [showHint, setShowHint] = useState(false);

  // User code state per challenge and language
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  // Solved challenges stored in localStorage
  const [solvedChallenges, setSolvedChallenges] = useState<string[]>([]);
  // Test run state
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [consoleTab, setConsoleTab] = useState<"results" | "hint">("results");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedChallenge = useMemo(() => {
    return CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];
  }, [selectedChallengeId]);

  // Load solved status from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexora_solved_challenges");
      if (saved) {
        setSolvedChallenges(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Sync active code when challenge or language changes
  const currentCode = useMemo(() => {
    const key = `${selectedChallenge.id}_${selectedLanguage}`;
    if (userCode[key] !== undefined) {
      return userCode[key];
    }
    return selectedChallenge.starterCode[selectedLanguage];
  }, [userCode, selectedChallenge, selectedLanguage]);

  const handleCodeChange = (newCode: string) => {
    const key = `${selectedChallenge.id}_${selectedLanguage}`;
    setUserCode((prev) => ({ ...prev, [key]: newCode }));
  };

  const handleResetCode = () => {
    const key = `${selectedChallenge.id}_${selectedLanguage}`;
    setUserCode((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    setTestResults(null);
  };

  // Safe client-side code runner
  const executeTests = (includeHidden: boolean) => {
    setIsRunning(true);
    setTestResults(null);
    setConsoleTab("results");

    setTimeout(() => {
      const casesToRun = includeHidden
        ? selectedChallenge.testCases
        : selectedChallenge.testCases.filter((tc) => !tc.hidden);

      const results: TestResult[] = [];
      let allPassed = true;

      for (let i = 0; i < casesToRun.length; i++) {
        const tc = casesToRun[i];
        const inputCopy = JSON.parse(JSON.stringify(tc.input));
        const startTime = performance.now();

        try {
          // Construct isolated evaluation context
          // Strip TypeScript type annotations if needed (basic strip)
          let executableCode = currentCode;
          if (selectedLanguage === "typescript") {
            try {
              executableCode = transform(executableCode, {
                transforms: ["typescript"],
              }).code;
            } catch (transpileErr: any) {
              throw new Error(`TypeScript Compilation Error: ${transpileErr.message}`);
            }
          }

          const runnerFunction = new Function(
            `"use strict";
            ${executableCode}
            if (typeof ${selectedChallenge.functionName} !== "function") {
              throw new Error("Function '${selectedChallenge.functionName}' is not defined");
            }
            return ${selectedChallenge.functionName}.apply(null, arguments[0]);`
          );

          const actual = runnerFunction(inputCopy);
          const endTime = performance.now();
          const executionTimeMs = parseFloat((endTime - startTime).toFixed(2));

          const passed = deepEqual(actual, tc.expected);
          if (!passed) allPassed = false;

          results.push({
            index: i + 1,
            description: tc.description,
            passed,
            input: JSON.stringify(tc.input),
            expected: JSON.stringify(tc.expected),
            actual: JSON.stringify(actual),
            executionTimeMs,
            hidden: tc.hidden,
          });
        } catch (err: any) {
          const endTime = performance.now();
          allPassed = false;
          results.push({
            index: i + 1,
            description: tc.description,
            passed: false,
            input: JSON.stringify(tc.input),
            expected: JSON.stringify(tc.expected),
            actual: "Error",
            error: err.message || String(err),
            executionTimeMs: parseFloat((endTime - startTime).toFixed(2)),
            hidden: tc.hidden,
          });
        }
      }

      setTestResults(results);
      setIsRunning(false);

      if (includeHidden && allPassed) {
        if (!solvedChallenges.includes(selectedChallenge.id)) {
          const updated = [...solvedChallenges, selectedChallenge.id];
          setSolvedChallenges(updated);
          try {
            localStorage.setItem("nexora_solved_challenges", JSON.stringify(updated));
          } catch {
            // Ignore write errors
          }
        }
      }
    }, 250);
  };

  // Helper for deep equality comparison
  function deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    if (typeof a === "object") {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) return false;
      }
      return true;
    }

    return false;
  }

  // Handle Tab key inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const newVal = val.substring(0, start) + "  " + val.substring(end);
      handleCodeChange(newVal);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Filter challenges
  const topics = useMemo(() => {
    const set = new Set(CHALLENGES.map((c) => c.topic));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredChallenges = useMemo(() => {
    return CHALLENGES.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchTopic = selectedTopic === "All" || c.topic === selectedTopic;
      const matchDiff = selectedDifficulty === "All" || c.difficulty === selectedDifficulty;
      return matchSearch && matchTopic && matchDiff;
    });
  }, [searchQuery, selectedTopic, selectedDifficulty]);

  const isCurrentSolved = solvedChallenges.includes(selectedChallenge.id);

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Banner */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-white/10 border-slate-200 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-semibold dark:text-blue-300 text-[#FF7A00] uppercase tracking-wider dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)]">
                  <Sparkles className="w-3 h-3" />
                  Algorithm Arena
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {solvedChallenges.length} / {CHALLENGES.length} Mastered
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold dark:text-white text-[#171717]">
                Algorithmic <span className="gradient-text-electric">Challenges & Sandbox</span>
              </h1>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <div className="w-48 h-2 rounded-full dark:bg-white/10 bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r dark:from-[#0A84FF] dark:to-[#00D2FF] from-[#FF7A00] to-[#EA580C] transition-all duration-500"
                  style={{ width: `${(solvedChallenges.length / CHALLENGES.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold">
                {Math.round((solvedChallenges.length / CHALLENGES.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Main Split-View Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Problem Catalog & Filters (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Search & Topic Filters */}
              <div className="glass-panel p-4 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search challenges, tags..."
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border dark:border-white/10 border-slate-200 dark:bg-black/20 bg-slate-50 focus:outline-none focus:ring-1 dark:focus:ring-[#0A84FF] focus:ring-[#FF7A00]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="flex-1 py-1.5 px-2 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-200 dark:bg-black/20 bg-slate-50 dark:text-slate-200 text-slate-700"
                  >
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-28 py-1.5 px-2 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-200 dark:bg-black/20 bg-slate-50 dark:text-slate-200 text-slate-700"
                  >
                    <option value="All">All Diff</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Problem List */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {filteredChallenges.length === 0 ? (
                  <div className="p-8 text-center text-xs font-mono text-slate-400">
                    No matching challenges found.
                  </div>
                ) : (
                  filteredChallenges.map((ch, idx) => {
                    const isSelected = ch.id === selectedChallenge.id;
                    const isSolved = solvedChallenges.includes(ch.id);

                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setSelectedChallengeId(ch.id);
                          setTestResults(null);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? "dark:border-[#0A84FF] border-[#FF7A00] dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.06)] shadow-sm"
                            : "dark:border-white/10 border-[#E5E5E5] hover:dark:bg-white/[0.04] hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-mono dark:text-[#0A84FF] text-[#FF7A00] font-bold">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.2 rounded border ${
                                ch.difficulty === "Easy"
                                  ? "border-emerald-500/30 text-emerald-500 dark:bg-emerald-500/10 bg-emerald-50"
                                  : ch.difficulty === "Medium"
                                  ? "border-amber-500/30 text-amber-500 dark:bg-amber-500/10 bg-amber-50"
                                  : "border-rose-500/30 text-rose-500 dark:bg-rose-500/10 bg-rose-50"
                              }`}
                            >
                              {ch.difficulty}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 truncate">
                              {ch.topic}
                            </span>
                          </div>
                          <div className="font-heading font-bold text-xs sm:text-sm dark:text-white text-[#171717] truncate">
                            {ch.title}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5 pt-1">
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Code Workbench & Runner (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Challenge Details Header */}
              <div className="glass-panel p-5 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono dark:text-[#0A84FF] text-[#FF7A00] font-bold">
                        {selectedChallenge.topic}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {selectedChallenge.timeLimit}
                      </span>
                      {isCurrentSolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-heading font-extrabold dark:text-white text-[#171717]">
                      {selectedChallenge.title}
                    </h2>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl border dark:border-white/10 border-slate-200 dark:bg-black/20 bg-slate-50">
                    <button
                      onClick={() => setSelectedLanguage("javascript")}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        selectedLanguage === "javascript"
                          ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white font-bold shadow-sm"
                          : "dark:text-slate-400 text-slate-600"
                      }`}
                    >
                      JavaScript
                    </button>
                    <button
                      onClick={() => setSelectedLanguage("typescript")}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        selectedLanguage === "typescript"
                          ? "dark:bg-[#0A84FF] bg-[#FF7A00] text-white font-bold shadow-sm"
                          : "dark:text-slate-400 text-slate-600"
                      }`}
                    >
                      TypeScript
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm leading-relaxed dark:text-slate-300 text-slate-700 font-sans">
                  {selectedChallenge.description}
                </p>

                {/* Constraints */}
                <div className="p-3 rounded-xl dark:bg-black/20 bg-slate-50 border dark:border-white/5 border-slate-200 text-xs font-mono space-y-1">
                  <div className="font-bold text-slate-400 uppercase text-[10px]">Constraints:</div>
                  <ul className="list-disc list-inside space-y-0.5 dark:text-slate-300 text-slate-600">
                    {selectedChallenge.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Code Editor Container */}
              <div className="glass-panel rounded-2xl border dark:border-white/10 border-[#E5E5E5] overflow-hidden">
                {/* Editor Bar */}
                <div className="px-4 py-2.5 border-b dark:border-white/10 border-slate-200 flex items-center justify-between dark:bg-black/30 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 dark:text-[#0A84FF] text-[#FF7A00]" />
                    <span className="text-xs font-mono font-bold dark:text-slate-200 text-slate-700">
                      Solution Workspace ({selectedLanguage})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetCode}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-200 hover:dark:bg-white/[0.05] hover:bg-slate-200 text-slate-500 flex items-center gap-1 transition-all"
                      title="Reset to starter template"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>

                {/* Interactive Textarea Editor */}
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={13}
                    spellCheck={false}
                    className="w-full p-4 font-mono text-xs sm:text-sm dark:bg-[#07090F] bg-white dark:text-slate-200 text-[#171717] focus:outline-none resize-y leading-relaxed selection:bg-[#0A84FF]/30"
                  />
                </div>

                {/* Bottom Action Bar */}
                <div className="p-3 border-t dark:border-white/10 border-slate-200 dark:bg-black/20 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setConsoleTab("hint");
                      setShowHint(true);
                    }}
                    className="text-xs font-mono dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-black flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    Need an algorithmic hint?
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executeTests(false)}
                      disabled={isRunning}
                      className="py-1.5 px-3.5 rounded-xl border dark:border-white/10 border-slate-300 hover:dark:bg-white/[0.08] hover:bg-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Run Public Tests
                    </button>

                    <button
                      onClick={() => executeTests(true)}
                      disabled={isRunning}
                      className="py-1.5 px-4 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#EA580C] dark:bg-[#0A84FF] dark:hover:bg-blue-600 text-white transition-all shadow-md disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Solution
                    </button>
                  </div>
                </div>
              </div>

              {/* Console & Test Results */}
              <div className="glass-panel p-4 rounded-2xl border dark:border-white/10 border-[#E5E5E5] space-y-3">
                <div className="flex items-center justify-between border-b dark:border-white/10 border-slate-200 pb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConsoleTab("results")}
                      className={`text-xs font-mono font-bold flex items-center gap-1.5 pb-1 -mb-2 border-b-2 transition-all ${
                        consoleTab === "results"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:text-[#0A84FF] text-[#FF7A00]"
                          : "border-transparent text-slate-400"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      Test Execution Console
                    </button>
                    <button
                      onClick={() => setConsoleTab("hint")}
                      className={`text-xs font-mono font-bold flex items-center gap-1.5 pb-1 -mb-2 border-b-2 transition-all ${
                        consoleTab === "hint"
                          ? "dark:border-[#0A84FF] border-[#FF7A00] dark:text-[#0A84FF] text-[#FF7A00]"
                          : "border-transparent text-slate-400"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      Hint & Invariant
                    </button>
                  </div>

                  {testResults && (
                    <span className="text-xs font-mono">
                      {testResults.filter((r) => r.passed).length} / {testResults.length} Passed
                    </span>
                  )}
                </div>

                {consoleTab === "hint" ? (
                  <div className="p-4 rounded-xl dark:bg-amber-500/[0.05] bg-amber-50/70 border dark:border-amber-500/20 border-amber-200 text-xs font-sans leading-relaxed space-y-2">
                    <div className="font-heading font-bold text-amber-600 dark:text-amber-300">
                      Algorithmic Blueprint:
                    </div>
                    <p className="dark:text-amber-200/90 text-amber-900">
                      {selectedChallenge.solutionHint}
                    </p>
                  </div>
                ) : isRunning ? (
                  <div className="p-6 text-center text-xs font-mono dark:text-slate-400 text-slate-500 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00] animate-ping" />
                    Executing test cases against sandbox runtime...
                  </div>
                ) : testResults ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {testResults.map((tr) => (
                      <div
                        key={tr.index}
                        className={`p-3 rounded-xl border text-xs font-mono transition-all ${
                          tr.passed
                            ? "dark:border-emerald-500/30 border-emerald-300 dark:bg-emerald-500/[0.04] bg-emerald-50/50"
                            : "dark:border-rose-500/30 border-rose-300 dark:bg-rose-500/[0.04] bg-rose-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {tr.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                            <span className="font-bold">
                              Case #{tr.index}: {tr.description} {tr.hidden && "(Hidden Benchmark)"}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">{tr.executionTimeMs} ms</span>
                        </div>

                        {tr.error ? (
                          <div className="p-2 rounded dark:bg-rose-950/30 bg-rose-100 text-rose-500 text-[11px]">
                            Runtime Error: {tr.error}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1 border-t dark:border-white/5 border-slate-200">
                            <div>
                              <span className="text-slate-400">Input:</span>{" "}
                              <code className="text-slate-500">{tr.input}</code>
                            </div>
                            <div>
                              <span className="text-slate-400">Expected:</span>{" "}
                              <code className="text-emerald-500">{tr.expected}</code>
                            </div>
                            <div>
                              <span className="text-slate-400">Actual:</span>{" "}
                              <code className={tr.passed ? "text-emerald-500" : "text-rose-500"}>
                                {tr.actual}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-slate-400">
                    Click &ldquo;Run Public Tests&rdquo; to execute test suites or &ldquo;Submit Solution&rdquo; to test against hidden edge cases.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
