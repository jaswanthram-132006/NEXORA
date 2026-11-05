import React from "react";
import Link from "next/link";
import { Zap, Github, Twitter, BookOpen, ShieldCheck } from "lucide-react";

const footerLinks = {
  Curriculum: [
    { label: "Design & Analysis of Algorithms", href: "/daa" },
    { label: "Principles of AI", href: "/poai" },
    { label: "Advanced Algorithms", href: "/advanced" },
    { label: "Interactive Simulations", href: "/simulations" },
    { label: "Algorithmic Challenges", href: "/challenges" },
  ],
  "DAA Modules": [
    { label: "Sorting Algorithms", href: "/daa/sorting" },
    { label: "Graph Traversals & MST", href: "/daa/graphs" },
    { label: "Dynamic Programming", href: "/daa/dp" },
    { label: "Greedy Strategies", href: "/daa/greedy" },
    { label: "Divide & Conquer", href: "/daa/divide-conquer" },
    { label: "NP-Completeness", href: "/daa/np-completeness" },
  ],
  "AI & Advanced": [
    { label: "State-Space Search & A*", href: "/poai/search" },
    { label: "Constraint Satisfaction", href: "/poai/csp" },
    { label: "Machine Learning Math", href: "/poai/ml" },
    { label: "Neural Networks", href: "/poai/neural-networks" },
    { label: "Approximation Algorithms", href: "/advanced/approximation" },
    { label: "Complexity Classes", href: "/advanced/complexity" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t dark:border-white/[0.08] border-[#E5E5E5] dark:bg-[#06080F]/80 bg-[#F7F7F7] backdrop-blur-xl">
      {/* Ambient top specular line */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[1px] bg-gradient-to-r from-transparent dark:via-[#0A84FF]/50 via-[#FF7A00]/40 to-transparent"
      />

      <div className="section-padding py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="relative w-8 h-8 rounded-xl dark:bg-gradient-to-br dark:from-[#0A84FF] dark:via-[#0066CC] dark:to-[#00D2FF] bg-gradient-to-br from-[#FF7A00] via-[#EA580C] to-[#FF7A00] p-[1px] dark:shadow-[0_4px_16px_rgba(10,132,255,0.4)] shadow-[0_4px_14px_rgba(255,122,0,0.3)]">
                <div className="w-full h-full rounded-[11px] dark:bg-[#0A0E1A] bg-white flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 dark:text-cyan-300 text-[#FF7A00]" strokeWidth={2.5} />
                </div>
              </div>
              <span className="font-heading text-lg font-bold tracking-tight dark:text-white text-[#171717] flex items-center">
                <span>NEX</span>
                <span className="text-[#FF7A00] dark:text-[#0A84FF]">ORA</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] leading-relaxed max-w-sm mb-6">
              A premium, interactive educational platform designed to elevate
              algorithmic intuition and AI theory through verified visualizations,
              proof breakdowns, and mathematical rigor.
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:border-white/20 bg-white border-[#E5E5E5] text-[#737373] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:border-white/20 bg-white border-[#E5E5E5] text-[#737373] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                aria-label="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <Link
                href="/about"
                className="p-2.5 rounded-xl border dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-400 dark:hover:text-white dark:hover:border-white/20 bg-white border-[#E5E5E5] text-[#737373] hover:text-[#FF7A00] hover:border-[#FF7A00]/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 text-xs font-mono shadow-sm"
                aria-label="Documentation"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </Link>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-mono font-semibold dark:text-slate-300 text-[#171717] uppercase tracking-wider mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#FF7A00] transition-colors duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t dark:border-white/[0.06] border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono dark:text-slate-500 text-[#737373]">
          <p>
            &copy; {new Date().getFullYear()} NEXORA. Engineered for deep theoretical mastery.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="dark:hover:text-slate-300 hover:text-[#FF7A00] transition-colors">
              Platform Architecture
            </Link>
            <span>·</span>
            <span className="flex items-center gap-1 dark:text-slate-400 text-[#737373]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Zero Mockups Certified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
