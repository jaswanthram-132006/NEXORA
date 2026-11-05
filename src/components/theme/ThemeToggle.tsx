"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mounting on the client, preserve default dark state to avoid hydration mismatch
  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "relative p-2 rounded-xl transition-all duration-200 border flex items-center justify-center cursor-pointer",
        "dark:bg-white/[0.04] dark:border-white/10 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.08]",
        "bg-[#F7F7F7] border-[#E5E5E5] text-[#171717] hover:border-[#FF7A00]/40 hover:text-[#FF7A00] hover:bg-white shadow-sm",
        className
      )}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun icon for light mode */}
        <Sun
          className={cn(
            "w-4 h-4 transition-all duration-300 transform",
            isDark
              ? "opacity-0 rotate-90 scale-0 absolute pointer-events-none"
              : "opacity-100 rotate-0 scale-100 text-[#FF7A00]"
          )}
        />
        {/* Moon icon for dark mode */}
        <Moon
          className={cn(
            "w-4 h-4 transition-all duration-300 transform",
            isDark
              ? "opacity-100 rotate-0 scale-100 text-cyan-300"
              : "opacity-0 -rotate-90 scale-0 absolute pointer-events-none"
          )}
        />
      </div>
    </button>
  );
}
