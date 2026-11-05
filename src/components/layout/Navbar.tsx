"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface SubLink {
  label: string;
  href: string;
}

interface NavLinkItem {
  label: string;
  href: string;
  description?: string;
  sub?: SubLink[];
}

const navLinks: NavLinkItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "DAA",
    href: "/daa",
    description: "Design & Analysis of Algorithms",
    sub: [
      { label: "Sorting Algorithms", href: "/daa/sorting" },
      { label: "Graph Algorithms", href: "/daa/graphs" },
      { label: "Dynamic Programming", href: "/daa/dp" },
      { label: "Greedy Algorithms", href: "/daa/greedy" },
      { label: "Divide & Conquer", href: "/daa/divide-conquer" },
      { label: "NP-Completeness", href: "/daa/np-completeness" },
    ],
  },
  {
    label: "AI Principles",
    href: "/poai",
    description: "Principles of Artificial Intelligence",
    sub: [
      { label: "Search & A*", href: "/poai/search" },
      { label: "Constraint Satisfaction", href: "/poai/csp" },
      { label: "Knowledge & Logic", href: "/poai/knowledge" },
      { label: "Machine Learning", href: "/poai/ml" },
      { label: "Neural Networks", href: "/poai/neural-networks" },
      { label: "Planning & Agents", href: "/poai/agents" },
    ],
  },
  {
    label: "Advanced",
    href: "/advanced",
    description: "Beyond the syllabus",
    sub: [
      { label: "Approximation Algorithms", href: "/advanced/approximation" },
      { label: "Randomized Algorithms", href: "/advanced/randomized" },
      { label: "Computational Complexity", href: "/advanced/complexity" },
      { label: "Deep Learning Theory", href: "/advanced/deep-learning" },
      { label: "Online Algorithms", href: "/advanced/online-algorithms" },
      { label: "Parameterized Complexity", href: "/advanced/parameterized" },
    ],
  },
  { label: "Simulations", href: "/simulations" },
  { label: "Challenges", href: "/challenges" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null);

  const navRef = useRef<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (href: string) => {
    clearHoverTimeout();
    setOpenDropdown(href);
  };

  const handleMouseLeave = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  const handleTriggerClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    e.stopPropagation();
    clearHoverTimeout();
    setOpenDropdown((prev) => (prev === href ? null : href));
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      clearHoverTimeout();
      setOpenDropdown((prev) => (prev === href ? null : href));
    } else if (e.key === "Escape") {
      e.preventDefault();
      clearHoverTimeout();
      setOpenDropdown(null);
    }
  };

  const toggleMobileSub = (href: string) => {
    setMobileSubOpen((prev) => (prev === href ? null : href));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileSubOpen(null);
    clearHoverTimeout();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        clearHoverTimeout();
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearHoverTimeout();
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      clearHoverTimeout();
    };
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "dark:bg-[#080B12]/85 bg-white/85 backdrop-blur-2xl border-b dark:border-white/[0.08] border-[#E5E5E5] dark:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.06)] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav ref={navRef} className="section-padding flex items-center justify-between h-16 sm:h-20" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="NEXORA Home">
          <div className="relative w-9 h-9 rounded-xl dark:bg-gradient-to-br dark:from-[#0A84FF] dark:via-[#0066CC] dark:to-[#00D2FF] bg-gradient-to-br from-[#FF7A00] via-[#EA580C] to-[#FF7A00] p-[1px] dark:shadow-[0_4px_20px_rgba(10,132,255,0.4)] shadow-[0_4px_16px_rgba(255,122,0,0.3)] group-hover:scale-105 transition-all duration-300">
            <div className="w-full h-full rounded-[11px] dark:bg-[#0A0E1A] bg-white flex items-center justify-center">
              <Zap className="w-4 h-4 dark:text-cyan-300 text-[#FF7A00] transition-colors" strokeWidth={2.5} />
            </div>
          </div>
          <span className="font-heading text-lg font-bold tracking-tight dark:text-white text-[#171717] flex items-center">
            <span>NEX</span>
            <span className="text-[#FF7A00] dark:text-[#0A84FF]">ORA</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <ul className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full dark:bg-white/[0.03] bg-[#F7F7F7] dark:border-white/[0.08] border-[#E5E5E5] backdrop-blur-xl shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            const isOpen = openDropdown === link.href;
            const dropdownId = `dropdown-${link.label.replace(/\s+/g, "-").toLowerCase()}`;

            return (
              <li key={link.href} className="relative">
                {link.sub ? (
                  <div
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.href)}
                    onMouseLeave={handleMouseLeave}
                    onPointerEnter={() => handleMouseEnter(link.href)}
                    onPointerLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      onClick={(e) => handleTriggerClick(e, link.href)}
                      onKeyDown={(e) => handleTriggerKeyDown(e, link.href)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={dropdownId}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none",
                        active || isOpen
                          ? "dark:text-white text-[#FF7A00] dark:bg-white/[0.1] bg-white font-semibold shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.05] hover:bg-white/80"
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 transition-transform duration-200",
                          isOpen ? "rotate-180" : "",
                          active || isOpen
                            ? "dark:text-white text-[#FF7A00]"
                            : "dark:text-slate-500 text-[#737373]"
                        )}
                      />
                    </button>

                    {/* Dropdown Menu Container with Zero-Gap Hover Bridge */}
                    {isOpen && (
                      <div
                        id={dropdownId}
                        className="absolute top-full left-0 pt-2 w-64 animate-fade-in z-50"
                        onMouseEnter={() => handleMouseEnter(link.href)}
                        onMouseLeave={handleMouseLeave}
                        onPointerEnter={() => handleMouseEnter(link.href)}
                        onPointerLeave={handleMouseLeave}
                      >
                        <div className="rounded-2xl p-2.5 dark:glass-strong bg-white shadow-xl dark:shadow-[0_24px_50px_rgba(0,0,0,0.8)] border dark:border-white/10 border-[#E5E5E5]">
                          <div className="flex items-center justify-between px-3 py-1.5">
                            <p className="text-[11px] font-mono dark:text-slate-500 text-[#737373] uppercase tracking-wider">
                              {link.description}
                            </p>
                            <Link
                              href={link.href}
                              className="text-[10px] font-medium dark:text-[#0A84FF] text-[#FF7A00] hover:underline"
                            >
                              Overview →
                            </Link>
                          </div>
                          <div className="my-1 border-t dark:border-white/[0.06] border-[#E5E5E5]" />
                          <div className="space-y-0.5" role="menu">
                            {link.sub.map((sub) => {
                              const isSubActive = pathname === sub.href;
                              return (
                                <Link
                                  key={sub.href}
                                  href={sub.href}
                                  role="menuitem"
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 group",
                                    isSubActive
                                      ? "dark:text-white text-[#FF7A00] dark:bg-white/[0.08] bg-[#F7F7F7] font-semibold"
                                      : "dark:text-slate-300 text-[#171717] dark:hover:text-white hover:text-[#FF7A00] dark:hover:bg-white/[0.08] hover:bg-[#F7F7F7]"
                                  )}
                                >
                                  <span>{sub.label}</span>
                                  <span
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all",
                                      isSubActive
                                        ? "dark:bg-[#00D2FF] bg-[#FF7A00] scale-125 shadow-[0_0_8px_rgba(255,122,0,0.8)] dark:shadow-[0_0_8px_rgba(0,210,255,0.8)]"
                                        : "dark:bg-cyan-400/40 dark:group-hover:bg-[#00D2FF] dark:group-hover:shadow-[0_0_8px_rgba(0,210,255,0.8)] bg-[#FF7A00]/40 group-hover:bg-[#FF7A00] group-hover:shadow-[0_0_8px_rgba(255,122,0,0.6)] group-hover:scale-125"
                                    )}
                                  />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                      active
                        ? "dark:text-white text-[#FF7A00] dark:bg-white/[0.1] bg-white font-semibold shadow-sm dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                        : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.05] hover:bg-white/80"
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* CTA & Theme Controls */}
        <div className="hidden lg:flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/challenges" className="btn-secondary text-xs px-4 py-2 rounded-xl">
            Challenges
          </Link>
          <Link href="/daa" className="btn-primary text-xs px-4 py-2 rounded-xl">
            Start Learning
          </Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 rounded-xl border dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-300 dark:hover:text-white bg-[#F7F7F7] border-[#E5E5E5] text-[#171717]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t dark:border-white/[0.08] border-[#E5E5E5] dark:bg-[#080B12]/95 bg-white/95 backdrop-blur-2xl animate-fade-in">
          <ul className="section-padding py-6 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const isExpanded = mobileSubOpen === link.href;

              return (
                <li key={link.href} className="flex flex-col">
                  {link.sub ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleMobileSub(link.href)}
                        aria-expanded={isExpanded}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                          active || isExpanded
                            ? "dark:text-white text-[#FF7A00] dark:bg-[#0A84FF]/15 bg-[rgba(255,122,0,0.08)] dark:border-[#0A84FF]/30 border-[#FF7A00]/30 border shadow-sm font-semibold"
                            : "dark:text-slate-300 text-[#171717] dark:hover:bg-white/[0.04] hover:bg-[#F7F7F7]"
                        )}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isExpanded ? "rotate-180 text-[#FF7A00] dark:text-[#0A84FF]" : "text-slate-400"
                          )}
                        />
                      </button>

                      {isExpanded && (
                        <div className="pl-4 mt-2 flex flex-col gap-1 border-l-2 dark:border-[#0A84FF]/40 border-[#FF7A00]/40 ml-4 animate-fade-in">
                          <Link
                            href={link.href}
                            className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold dark:text-[#0A84FF] text-[#FF7A00]"
                          >
                            <span>Overview & All Topics</span>
                            <span className="text-[10px] font-mono">→</span>
                          </Link>
                          {link.sub.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-colors",
                                  isSubActive
                                    ? "dark:text-white text-[#FF7A00] font-semibold dark:bg-white/[0.06] bg-[#F7F7F7]"
                                    : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#FF7A00]"
                                )}
                              >
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isSubActive
                                      ? "dark:bg-[#00D2FF] bg-[#FF7A00]"
                                      : "dark:bg-[#00D2FF]/60 bg-[#FF7A00]/60"
                                  )}
                                />
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                        active
                          ? "dark:text-white text-[#FF7A00] dark:bg-[#0A84FF]/15 bg-[rgba(255,122,0,0.08)] dark:border-[#0A84FF]/30 border-[#FF7A00]/30 border shadow-sm font-semibold"
                          : "dark:text-slate-400 text-[#737373] dark:hover:text-white hover:text-[#171717] dark:hover:bg-white/[0.04] hover:bg-[#F7F7F7]"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              );
            })}
            <li className="pt-4 flex flex-col gap-2">
              <Link
                href="/daa"
                className="btn-primary w-full justify-center text-xs py-3 rounded-xl"
              >
                Start Learning
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
