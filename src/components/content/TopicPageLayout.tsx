"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  FlaskConical,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TopicContent } from "@/lib/content/types";
import { cn } from "@/lib/utils";
import TopicVisualizer from "@/components/visualizers/TopicVisualizer";

interface TopicPageLayoutProps {
  topic: TopicContent;
}

export default function TopicPageLayout({ topic }: TopicPageLayoutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(topic.codeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentStyles = {
    violet: {
      badge: "dark:bg-[#0A84FF]/10 dark:text-blue-300 dark:border-[#0A84FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border-[#FF7A00]/25",
      glow: "dark:from-[#0A84FF]/15 dark:via-blue-600/5 from-[rgba(255,122,0,0.06)] to-transparent",
      accentText: "dark:text-[#0A84FF] text-[#FF7A00]",
      borderGlow: "dark:border-[#0A84FF]/30 border-[#FF7A00]/30",
      btn: "btn-primary",
    },
    cyan: {
      badge: "dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/25 bg-[rgba(255,122,0,0.08)] text-[#EA580C] border-[#FF7A00]/25",
      glow: "dark:from-[#00D2FF]/15 dark:via-teal-600/5 from-[rgba(255,122,0,0.06)] to-transparent",
      accentText: "dark:text-cyan-400 text-[#EA580C]",
      borderGlow: "dark:border-cyan-500/30 border-[#FF7A00]/30",
      btn: "btn-primary",
    },
    emerald: {
      badge: "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 bg-emerald-50 text-emerald-700 border-emerald-200",
      glow: "dark:from-emerald-600/15 dark:via-teal-600/5 from-emerald-500/5 to-transparent",
      accentText: "dark:text-emerald-400 text-emerald-600",
      borderGlow: "dark:border-emerald-500/30 border-emerald-500/30",
      btn: "btn-primary",
    },
  }[topic.accentColor];

  return (
    <div className="min-h-screen relative overflow-x-hidden dark:bg-[#080B12] bg-[#FFFFFF] dark:text-slate-100 text-[#171717] transition-colors duration-200">
      {/* Background ambient lighting */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="dark:block hidden">
          <div
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[150px] opacity-25",
              topic.accentColor === "violet" && "bg-[#0A84FF]/25",
              topic.accentColor === "cyan" && "bg-[#00D2FF]/20",
              topic.accentColor === "emerald" && "bg-emerald-600/20"
            )}
          />
        </div>
        <div className="dark:hidden block">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[150px] bg-[rgba(255,122,0,0.06)]" />
        </div>
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 sm:pt-28 pb-24">
        <div className="section-padding">
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-mono dark:text-slate-500 text-[#737373] mb-8"
          >
            <Link
              href="/"
              className="dark:hover:text-slate-300 hover:text-[#171717] transition-colors flex items-center gap-1"
            >
              NEXORA
            </Link>
            <ChevronRight className="w-3 h-3 dark:text-slate-700 text-slate-400" />
            <Link
              href={topic.courseHref}
              className="dark:hover:text-slate-300 hover:text-[#171717] transition-colors"
            >
              {topic.courseTitle}
            </Link>
            <ChevronRight className="w-3 h-3 dark:text-slate-700 text-slate-400" />
            <span className={cn("font-semibold", accentStyles.accentText)}>
              {topic.title}
            </span>
          </nav>

          {/* Hero Header Card */}
          <div className="card-base p-8 sm:p-10 mb-12 dark:border-white/10 border-[#E5E5E5] relative overflow-hidden shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]">
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                accentStyles.glow
              )}
            />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-mono font-semibold border",
                    accentStyles.badge
                  )}
                >
                  {topic.badge}
                </span>
                <span className="text-xs font-mono dark:text-slate-400 text-[#737373]">
                  {topic.courseTitle}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-black dark:text-white text-[#171717] tracking-tight mb-4">
                {topic.title}
              </h1>
              <p className="text-base sm:text-lg dark:text-slate-300 text-[#737373] max-w-3xl leading-relaxed mb-6 font-sans">
                {topic.subtitle}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {topic.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg dark:bg-white/[0.04] bg-[#F7F7F7] dark:border-white/[0.08] border-[#E5E5E5] text-xs dark:text-slate-400 text-[#737373] font-mono shadow-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Complexity Snapshot Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl dark:bg-black/40 bg-[#F7F7F7] border dark:border-white/[0.08] border-[#E5E5E5] backdrop-blur-xl">
                <div>
                  <span className="text-[11px] font-mono dark:text-slate-500 text-[#737373] uppercase tracking-wider block mb-1">
                    Time Complexity
                  </span>
                  <span className="text-base font-bold font-mono dark:text-amber-300 text-[#EA580C]">
                    {topic.complexity.time}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono dark:text-slate-500 text-[#737373] uppercase tracking-wider block mb-1">
                    Space Complexity
                  </span>
                  <span className="text-base font-bold font-mono dark:text-cyan-300 text-[#FF7A00]">
                    {topic.complexity.space}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono dark:text-slate-500 text-[#737373] uppercase tracking-wider block mb-1">
                    Paradigm
                  </span>
                  <span className="text-sm font-semibold dark:text-slate-200 text-[#171717]">
                    {topic.complexity.paradigm}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono dark:text-slate-500 text-[#737373] uppercase tracking-wider block mb-1">
                    Worst Case
                  </span>
                  <span className="text-xs font-mono dark:text-rose-300/90 text-rose-600 truncate block">
                    {topic.complexity.worstCase ?? "O(2ⁿ)"}
                  </span>
                </div>
              </div>

              {/* Simulation CTA button if available */}
              {topic.simulationLink && (
                <div className="mt-8 flex items-center">
                  <Link
                    href={topic.simulationLink.href}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
                      accentStyles.btn
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    {topic.simulationLink.label}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Section: Dedicated Interactive Visualizer */}
          <div className="mb-14">
            <TopicVisualizer slug={topic.slug} course={topic.course} />
          </div>

          {/* Section: Overview & Motivation */}
          <div className="grid lg:grid-cols-2 gap-8 mb-14">
            <div className="card-base p-6 sm:p-8 dark:border-white/10 border-[#E5E5E5] space-y-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] border dark:border-white/10 border-[#FF7A00]/25 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 dark:text-[#0A84FF] text-[#FF7A00]" />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold dark:text-white text-[#171717]">
                  Conceptual Overview
                </h2>
              </div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-sans">
                {topic.overview}
              </p>
            </div>

            <div className="card-base p-6 sm:p-8 dark:border-white/10 border-[#E5E5E5] space-y-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] border dark:border-white/10 border-[#FF7A00]/25 flex items-center justify-center">
                  <Zap className="w-4 h-4 dark:text-amber-400 text-[#FF7A00]" />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold dark:text-white text-[#171717]">
                  Why It Matters
                </h2>
              </div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-sans">
                {topic.motivation}
              </p>
            </div>
          </div>

          {/* Section: Key Concepts */}
          <div className="mb-14">
            <h2 className="font-heading text-2xl font-bold dark:text-white text-[#171717] mb-6">
              Foundational Principles
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {topic.keyConcepts.map((kc, i) => (
                <div
                  key={i}
                  className="card-base p-6 dark:border-white/10 border-[#E5E5E5] space-y-3 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full dark:bg-[#0A84FF] bg-[#FF7A00]" />
                    <h3 className="font-heading font-bold text-sm sm:text-base dark:text-white text-[#171717]">
                      {kc.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-sans">
                    {kc.description}
                  </p>
                  {kc.detail && (
                    <div className="pt-2 text-xs font-mono dark:text-slate-400 text-slate-500 border-t dark:border-white/5 border-slate-200">
                      {kc.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Working Principles (Step-by-Step Mechanism) */}
          <div className="mb-14">
            <h2 className="font-heading text-2xl font-bold dark:text-white text-[#171717] mb-6">
              Algorithmic State Transitions
            </h2>
            <div className="card-base dark:border-white/10 border-[#E5E5E5] divide-y dark:divide-white/[0.06] divide-[#E5E5E5] overflow-hidden">
              {topic.workingPrinciples.map((wp) => (
                <div
                  key={wp.step}
                  className="p-5 flex items-start gap-4 hover:dark:bg-white/[0.01] hover:bg-slate-50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-xl dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] border dark:border-[#0A84FF]/25 border-[#FF7A00]/25 flex items-center justify-center font-mono text-xs font-bold dark:text-[#0A84FF] text-[#FF7A00] shrink-0">
                    0{wp.step}
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base dark:text-white text-[#171717] mb-1">
                      {wp.title}
                    </h3>
                    <p className="text-xs sm:text-sm dark:text-slate-300 text-slate-600 leading-relaxed font-sans">
                      {wp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Interactive Implementation */}
          <div className="mb-14">
            <div className="card-base dark:border-white/10 border-[#E5E5E5] overflow-hidden shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]">
              <div className="p-5 sm:p-6 border-b dark:border-white/[0.08] border-[#E5E5E5] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] border dark:border-white/10 border-[#FF7A00]/25 flex items-center justify-center">
                    <Code2 className="w-4 h-4 dark:text-[#0A84FF] text-[#FF7A00]" />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold dark:text-white text-[#171717]">
                      {topic.codeExample.title}
                    </h2>
                    <span className="text-xs font-mono dark:text-slate-500 text-[#737373]">
                      Language: {topic.codeExample.language}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 rounded-lg"
                  aria-label="Copy code to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-5 sm:p-6 dark:bg-[#06080e] bg-slate-900 text-slate-100 overflow-x-auto">
                <pre className="font-mono text-xs sm:text-sm leading-relaxed">
                  <code>{topic.codeExample.code}</code>
                </pre>
              </div>

              <div className="p-4 sm:p-5 dark:bg-white/[0.02] bg-[#F7F7F7] border-t dark:border-white/[0.08] border-[#E5E5E5] text-xs font-mono dark:text-slate-400 text-[#737373]">
                💡 {topic.codeExample.explanation}
              </div>
            </div>
          </div>

          {/* Section: Algorithmic Trace Walkthrough */}
          <div className="mb-14">
            <h2 className="font-heading text-2xl font-bold dark:text-white text-[#171717] mb-2">
              {topic.walkthrough.title}
            </h2>
            <p className="text-xs sm:text-sm font-mono dark:text-slate-400 text-[#737373] mb-6">
              Scenario: <code className="dark:text-[#00D2FF] text-[#FF7A00]">{topic.walkthrough.scenario}</code>
            </p>

            <div className="card-base dark:border-white/10 border-[#E5E5E5] overflow-hidden shadow-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="divide-y dark:divide-white/[0.06] divide-[#E5E5E5]">
                {topic.walkthrough.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:dark:bg-white/[0.01] hover:bg-[#F7F7F7] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-7 h-7 rounded-full dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] border dark:border-white/10 border-[#FF7A00]/25 flex items-center justify-center font-mono text-xs dark:text-slate-300 text-[#FF7A00] font-semibold shrink-0">
                        {step.step}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-medium dark:text-slate-200 text-[#171717]">
                          {step.note}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs dark:text-cyan-300 text-[#EA580C] px-3 py-1 rounded-lg dark:bg-cyan-500/10 bg-[rgba(255,122,0,0.08)] border dark:border-cyan-500/25 border-[#FF7A00]/25 self-start sm:self-auto shrink-0">
                      {step.state}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-5 dark:bg-white/[0.02] bg-emerald-50/50 border-t dark:border-white/[0.08] border-emerald-200/50 text-xs sm:text-sm text-emerald-600 dark:text-emerald-300 font-mono">
                ✓ {topic.walkthrough.conclusion}
              </div>
            </div>
          </div>

          {/* Section: Real-World Applications */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-bold dark:text-white text-[#171717] mb-6">
              Production Applications
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topic.applications.map((app, i) => (
                <div
                  key={i}
                  className="card-base p-5 dark:border-white/10 border-[#E5E5E5] flex items-start gap-3 shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <span className="text-lg">⚡</span>
                  <p className="text-xs sm:text-sm dark:text-slate-300 text-[#737373] leading-relaxed">
                    {app}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Interactive Laboratories & Practice Challenges Cross-Links */}
          <div className="mb-16 pt-8 border-t dark:border-white/10 border-[#E5E5E5]">
            <h2 className="font-heading text-2xl font-bold dark:text-white text-[#171717] mb-2">
              Practice in the Simulation Labs &amp; Sandbox
            </h2>
            <p className="dark:text-slate-400 text-[#737373] text-sm mb-6 font-sans">
              Take the concepts learned in this module and experiment with our full-screen state machine simulators or solve algorithmic challenges in the sandbox.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <Link
                href={
                  topic.slug === "sorting-algorithms"
                    ? "/simulations/sorting"
                    : topic.slug === "graph-algorithms"
                    ? "/simulations/graph-traversal"
                    : topic.slug === "dynamic-programming"
                    ? "/simulations/dp-matrix"
                    : topic.slug === "search-optimization"
                    ? "/simulations/shortest-path"
                    : topic.slug === "constraint-satisfaction"
                    ? "/simulations/csp-solver"
                    : topic.slug === "neural-networks" || topic.slug === "deep-learning"
                    ? "/simulations/neural-net"
                    : "/simulations"
                }
                className="group card-base card-hover p-6 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 flex items-center justify-center dark:text-[#0A84FF] text-[#FF7A00]">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider dark:text-[#0A84FF] text-[#FF7A00]">
                      Interactive Lab
                    </span>
                  </div>
                  <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg mb-2 group-hover:text-[#FF7A00] dark:group-hover:text-blue-300 transition-colors">
                    {topic.slug === "sorting-algorithms"
                      ? "Launch Sorting Visualizer"
                      : topic.slug === "graph-algorithms"
                      ? "Launch Graph Traversal Lab"
                      : topic.slug === "dynamic-programming"
                      ? "Launch DP Matrix Simulator"
                      : topic.slug === "search-optimization"
                      ? "Launch Shortest Path Simulator"
                      : topic.slug === "constraint-satisfaction"
                      ? "Launch AC-3 CSP Solver"
                      : topic.slug === "neural-networks" || topic.slug === "deep-learning"
                      ? "Launch Neural Network Engine"
                      : "Explore Full Simulations Hub"}
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] leading-relaxed">
                    Step through execution with clocks, custom inputs, and real-time state telemetry.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono dark:text-[#0A84FF] text-[#FF7A00] mt-4 font-semibold group-hover:translate-x-1 transition-transform">
                  Launch Simulator <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href="/challenges"
                className="group card-base card-hover p-6 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl dark:bg-emerald-500/10 bg-emerald-50 border dark:border-emerald-500/30 border-emerald-200 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Code Sandbox
                    </span>
                  </div>
                  <h3 className="font-heading font-bold dark:text-white text-[#171717] text-lg mb-2 group-hover:text-[#FF7A00] dark:group-hover:text-blue-300 transition-colors">
                    Solve Practice Challenges
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] leading-relaxed">
                    Write real JavaScript/TypeScript solutions with automated test suites, hidden edge cases, and runtime benchmarking.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-4 font-semibold group-hover:translate-x-1 transition-transform">
                  Open Challenge Sandbox <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Section: Related Topics Navigation */}
          {topic.relatedTopics.length > 0 && (
            <div className="pt-8 border-t dark:border-white/10 border-[#E5E5E5]">
              <h2 className="font-heading text-xl font-bold dark:text-white text-[#171717] mb-6">
                Connected Curriculum Paths
              </h2>
              <div className="grid md:grid-cols-3 gap-5">
                {topic.relatedTopics.map((rel) => (
                  <Link
                    key={rel.href}
                    href={rel.href}
                    className="group card-base card-hover p-5 dark:border-white/10 border-[#E5E5E5] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-heading font-bold dark:text-white text-[#171717] group-hover:text-[#FF7A00] dark:group-hover:text-blue-300 transition-colors">
                          {rel.title}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF7A00] dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs dark:text-slate-400 text-[#737373] leading-relaxed">
                        {rel.relationship}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-[#FF7A00] dark:text-slate-500 mt-4 block">
                      Explore Route →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="mt-12 flex items-center justify-between">
            <Link
              href={topic.courseHref}
              className="btn-secondary text-xs flex items-center gap-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {topic.courseTitle}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
