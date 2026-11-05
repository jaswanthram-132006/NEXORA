import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "electric" | "violet" | "cyan" | "emerald" | "amber" | "red" | "default";

const variantClasses: Record<BadgeVariant, string> = {
  electric:
    "bg-[#0A84FF]/10 text-blue-300 border-[#0A84FF]/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]",
  violet:
    "bg-violet-500/10 text-violet-300 border-violet-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  cyan:
    "bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  emerald:
    "bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  amber:
    "bg-amber-500/10 text-amber-300 border-amber-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  red:
    "bg-rose-500/10 text-rose-300 border-rose-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]",
  default:
    "bg-white/[0.04] text-slate-300 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border backdrop-blur-md transition-colors",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shadow-sm",
            variant === "electric"
              ? "bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.8)]"
              : variant === "violet"
              ? "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]"
              : variant === "cyan"
              ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              : variant === "emerald"
              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
              : variant === "amber"
              ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              : "bg-slate-400"
          )}
        />
      )}
      {children}
    </span>
  );
}
