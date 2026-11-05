import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  href?: string;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "relative inline-flex items-center justify-center gap-2 font-medium text-white " +
    "bg-gradient-to-r from-[#0A84FF] via-[#0066CC] to-[#00D2FF] bg-[length:200%_auto] " +
    "border border-white/25 shadow-[0_8px_24px_-4px_rgba(10,132,255,0.45),inset_0_1px_1px_rgba(255,255,255,0.35)] " +
    "hover:shadow-[0_12px_32px_-4px_rgba(10,132,255,0.65),inset_0_1px_1px_rgba(255,255,255,0.5)] " +
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",

  secondary:
    "relative inline-flex items-center justify-center gap-2 font-medium text-slate-200 " +
    "bg-white/[0.04] hover:bg-white/[0.08] hover:text-white " +
    "backdrop-blur-xl border border-white/10 hover:border-[#0A84FF]/40 " +
    "shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3)] " +
    "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",

  ghost:
    "inline-flex items-center justify-center gap-2 font-medium text-slate-400 hover:text-slate-100 " +
    "hover:bg-white/[0.05] rounded-xl transition-all duration-150 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(variantClasses[variant], sizeClasses[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
