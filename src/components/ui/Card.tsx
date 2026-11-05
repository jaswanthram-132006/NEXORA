import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glowColor?: "electric" | "violet" | "cyan" | "none";
}

export function Card({
  children,
  className,
  hover = false,
  glowColor = "none",
}: CardProps) {
  return (
    <div
      className={cn(
        "card-base relative group",
        hover && "card-hover cursor-pointer",
        hover && glowColor === "electric" && "hover:border-[#0A84FF]/40 hover:shadow-[0_20px_48px_-12px_rgba(10,132,255,0.3)]",
        hover && glowColor === "violet" && "hover:border-violet-500/30 hover:shadow-[0_20px_48px_-12px_rgba(139,92,246,0.25)]",
        hover && glowColor === "cyan" && "hover:border-cyan-500/30 hover:shadow-[0_20px_48px_-12px_rgba(6,182,212,0.25)]",
        className
      )}
    >
      {/* Delicate top specular reflection line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
      />
      {children}
    </div>
  );
}
