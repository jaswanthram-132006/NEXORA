"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { platformStats } from "@/lib/config/platformStats";

// Pure canvas particle animation with subtle ambient motion (dark mode)
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 75;
    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    };

    const colors = [
      "rgba(10, 132, 255,", // electric blue
      "rgba(0, 210, 255,",  // radiant cyan
      "rgba(56, 189, 248,", // sky
    ];

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.35 + 0.08,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const CONNECTION_DIST = 130;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(10, 132, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
      aria-hidden="true"
    />
  );
}

const codeLines = [
  { tokens: [{ t: "function", c: "dark:text-[#0A84FF] text-[#FF7A00] font-semibold" }, { t: " mergeSort", c: "dark:text-cyan-300 text-[#EA580C]" }, { t: "(arr) {", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "  if", c: "dark:text-[#0A84FF] text-[#FF7A00] font-semibold" }, { t: " (arr.length <= 1)", c: "dark:text-slate-300 text-[#171717]" }, { t: " return", c: "dark:text-[#0A84FF] text-[#FF7A00] font-semibold" }, { t: " arr;", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "  const", c: "dark:text-[#0A84FF] text-[#FF7A00] font-semibold" }, { t: " mid", c: "dark:text-cyan-300 text-[#EA580C]" }, { t: " =", c: "dark:text-slate-300 text-[#171717]" }, { t: " Math.floor(n / 2);", c: "dark:text-emerald-400 text-emerald-600" }] },
  { tokens: [{ t: "  // Recurrence: T(n) = 2T(n/2) + Θ(n)", c: "dark:text-slate-500 text-[#737373] italic" }] },
  { tokens: [{ t: "  return", c: "dark:text-[#0A84FF] text-[#FF7A00] font-semibold" }, { t: " merge(", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "    mergeSort", c: "dark:text-cyan-300 text-[#EA580C]" }, { t: "(arr.slice(0, mid)),", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "    mergeSort", c: "dark:text-cyan-300 text-[#EA580C]" }, { t: "(arr.slice(mid))", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "  );", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "}", c: "dark:text-slate-300 text-[#171717]" }] },
  { tokens: [{ t: "// Complexity: ", c: "dark:text-slate-500 text-[#737373]" }, { t: "Θ(n log n) [Master Case 2]", c: "dark:text-amber-300 text-[#EA580C]" }] },
];

function CodePreview() {
  return (
    <div className="card-base rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] border dark:border-white/10 border-[#E5E5E5]">
      {/* Chrome Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.08] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <span className="ml-3 text-xs dark:text-slate-400 text-[#737373] font-mono">merge-sort.ts</span>
        </div>
        <span className="text-[10px] font-mono dark:text-slate-500 text-[#737373]">TypeScript · Strict</span>
      </div>

      {/* Code Area */}
      <div className="p-5 font-mono text-xs leading-6 overflow-x-auto dark:bg-black/40 bg-white">
        {codeLines.map((line, i) => (
          <div key={i} className="flex">
            <span className="select-none mr-4 dark:text-slate-600 text-slate-400 w-4 text-right shrink-0">
              {i + 1}
            </span>
            <span>
              {line.tokens.map((tok, j) => (
                <span key={j} className={tok.c}>
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* Status Pills */}
      <div className="px-5 py-3.5 border-t dark:border-white/[0.06] border-[#E5E5E5] dark:bg-white/[0.02] bg-[#F7F7F7] flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Time: Θ(n log n)
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-300 bg-[rgba(255,122,0,0.08)] border border-[#FF7A00]/25 text-[#FF7A00] text-xs font-mono">
          Space: O(n)
        </span>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      <div className="dark:block hidden">
        <ParticleCanvas />
      </div>

      {/* Ambient gradient */}
      <div
        aria-hidden
        className="absolute inset-0 bg-hero-gradient pointer-events-none"
      />

      <div className="section-padding relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Copy */}
          <div className="space-y-8 animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 text-xs font-mono dark:text-blue-300 text-[#FF7A00] dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 dark:text-[#0A84FF] text-[#FF7A00]" />
              <span>Interactive Algorithm &amp; AI Platform</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] font-heading">
                <span className="dark:text-white text-[#171717]">Master</span>
                <br />
                <span className="gradient-text-electric">Algorithms</span>
                <br />
                <span className="dark:text-slate-300 text-[#737373]">&amp;</span>{" "}
                <span className="gradient-text-cyan">Artificial Intelligence</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg dark:text-slate-400 text-[#737373] leading-relaxed max-w-xl">
                Go beyond memorization. Experience sorting step-by-step, traverse
                graphs with live frontier queues, analyze dynamic programming states,
                and master the mathematics powering modern AI.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/daa" className="btn-primary text-xs sm:text-sm">
                Start with DAA
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/simulations" className="btn-secondary text-xs sm:text-sm">
                <Play className="w-4 h-4 dark:text-cyan-400 text-[#FF7A00] mr-1" />
                Live Simulations
              </Link>
            </div>

            {/* Trust Metric Signals */}
            <div className="flex flex-wrap items-center gap-8 pt-4 border-t dark:border-white/[0.06] border-[#E5E5E5]">
              {platformStats.heroSignals.map((item) => (
                <div key={item.label}>
                  <p className="font-heading text-2xl font-bold gradient-text-electric">
                    {item.value}
                  </p>
                  <p className="text-xs font-mono dark:text-slate-500 text-[#737373] mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Code Preview Card */}
          <div
            className="animate-fade-up animation-delay-200"
            aria-hidden="true"
          >
            <CodePreview />
          </div>
        </div>
      </div>
    </section>
  );
}
