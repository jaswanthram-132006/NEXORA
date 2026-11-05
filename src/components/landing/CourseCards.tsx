import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  {
    id: "daa",
    href: "/daa",
    label: "DAA Track",
    title: "Design & Analysis of Algorithms",
    description:
      "Master algorithmic paradigm foundations: divide & conquer recurrences, dynamic programming state spaces, greedy exchange arguments, and NP-completeness reductions.",
    topics: [
      "Sorting & Lower Bounds",
      "Graph Traversals & MST",
      "Dynamic Programming",
      "Greedy Strategies",
      "Divide & Conquer",
      "NP-Completeness",
    ],
    meta: { lessons: 42, hours: "18h", difficulty: "Intermediate" },
    gradient: "from-[#0A84FF]/15 via-blue-600/5 to-transparent",
    accentGlow: "dark:group-hover:border-[#0A84FF]/40 group-hover:border-[#FF7A00]/40 group-hover:shadow-[0_12px_40px_rgba(255,122,0,0.12)]",
    badgeClass: "dark:bg-[#0A84FF]/10 dark:text-blue-300 dark:border-[#0A84FF]/25 bg-[rgba(255,122,0,0.08)] text-[#FF7A00] border-[#FF7A00]/25",
    arrowClass: "dark:text-[#0A84FF] dark:group-hover:text-cyan-300 text-[#FF7A00] group-hover:text-[#EA580C]",
  },
  {
    id: "poai",
    href: "/poai",
    label: "AI Track",
    title: "Principles of Artificial Intelligence",
    description:
      "Construct the theoretical and practical foundations of AI: informed A* search, constraint satisfaction (AC-3), resolution refutation, backpropagation, and MDPs.",
    topics: [
      "State-Space Search & A*",
      "Constraint Satisfaction",
      "Knowledge & Logic",
      "Machine Learning Math",
      "Neural Networks",
      "Planning & Agents",
    ],
    meta: { lessons: 36, hours: "15h", difficulty: "Intermediate" },
    gradient: "from-[#00D2FF]/15 via-cyan-600/5 to-transparent",
    accentGlow: "dark:group-hover:border-cyan-400/40 group-hover:border-[#FF7A00]/40 group-hover:shadow-[0_12px_40px_rgba(255,122,0,0.12)]",
    badgeClass: "dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/25 bg-[rgba(255,122,0,0.08)] text-[#EA580C] border-[#FF7A00]/25",
    arrowClass: "dark:text-cyan-400 dark:group-hover:text-cyan-200 text-[#EA580C] group-hover:text-[#FF7A00]",
  },
  {
    id: "advanced",
    href: "/advanced",
    label: "Advanced Track",
    title: "Advanced Intractable Computing",
    subtitle: "Beyond the university syllabus",
    description:
      "Go beyond traditional curricula: PTAS approximation algorithms, randomized universal hashing, PSPACE complexity, double descent theory, and parameterized FPT.",
    topics: [
      "Approximation (PTAS)",
      "Randomized Methods",
      "PSPACE & #P Complexity",
      "Deep Learning Theory",
      "Online Competitive Ratio",
      "Parameterized (FPT)",
    ],
    meta: { lessons: 28, hours: "22h", difficulty: "Advanced" },
    gradient: "from-emerald-600/15 via-teal-600/5 to-transparent",
    accentGlow: "dark:group-hover:border-emerald-400/40 group-hover:border-emerald-500/40 group-hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)]",
    badgeClass: "dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 bg-emerald-50 text-emerald-700 border-emerald-200",
    arrowClass: "dark:text-emerald-400 dark:group-hover:text-emerald-200 text-emerald-600 group-hover:text-emerald-700",
  },
];

type DifficultyKey = "Beginner" | "Intermediate" | "Advanced";

const difficultyColors: Record<DifficultyKey, string> = {
  Beginner: "text-emerald-500",
  Intermediate: "dark:text-amber-400 text-[#EA580C]",
  Advanced: "text-rose-500",
};

export default function CourseCards() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border dark:border-[#00D2FF]/25 border-[#FF7A00]/25 text-xs font-mono font-medium dark:text-cyan-300 text-[#FF7A00] uppercase tracking-widest mb-4 dark:bg-white/[0.05] bg-[rgba(255,122,0,0.08)] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full dark:bg-[#00D2FF] bg-[#FF7A00] animate-pulse" />
            Curriculum Paths
          </span>
          <h2 className="section-title dark:text-white text-[#171717]">
            <span>Select your</span>{" "}
            <span className="gradient-text-electric">mastery trajectory</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base dark:text-slate-400 text-[#737373] max-w-xl mx-auto leading-relaxed font-sans">
            Three comprehensive paths packed with interactive simulations,
            formal proofs, and verifiable executable code.
          </p>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={course.href}
              className={cn(
                "group relative card-base card-hover flex flex-col justify-between p-8 border dark:border-white/10 border-[#E5E5E5]",
                course.accentGlow
              )}
            >
              {/* Gradient Underlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br dark:opacity-50 opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-60",
                  course.gradient
                )}
                aria-hidden
              />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  {/* Badge */}
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold border mb-5",
                      course.badgeClass
                    )}
                  >
                    {course.label}
                  </span>

                  {/* Title & Description */}
                  <h3 className="font-heading text-xl sm:text-2xl font-bold dark:text-white text-[#171717] mb-3 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* Topics Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {course.topics.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg dark:bg-white/[0.04] bg-[#F7F7F7] dark:border-white/[0.06] border-[#E5E5E5] text-xs font-mono dark:text-slate-300 text-[#171717]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-6 border-t dark:border-white/[0.08] border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-mono dark:text-slate-400 text-[#737373]">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
                      {course.meta.lessons} modules
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 dark:text-slate-500 text-slate-400" />
                      {course.meta.hours}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 font-semibold",
                        difficultyColors[course.meta.difficulty as DifficultyKey]
                      )}
                    >
                      <BarChart className="w-3.5 h-3.5" />
                      {course.meta.difficulty}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-mono font-semibold transition-all duration-200 group-hover:translate-x-1",
                      course.arrowClass
                    )}
                  >
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
