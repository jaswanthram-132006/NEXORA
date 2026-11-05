"use client";

import React, { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp, AlertCircle, Check, RotateCcw, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { InputPreset } from "@/lib/customInput/types";

interface CustomInputPanelProps {
  title?: string;
  subtitle?: string;
  initialValue: string;
  placeholder?: string;
  presets?: InputPreset<any>[];
  onApply: (rawValue: string) => { isValid: boolean; errors?: string[] };
  onReset: () => void;
  helperText?: string;
  summaryBadge?: string;
  defaultOpen?: boolean;
}

export default function CustomInputPanel({
  title = "Custom Problem Instance",
  subtitle = "Test algorithm behavior with your own dataset, edge cases, and boundary configurations.",
  initialValue,
  placeholder = "Enter custom values...",
  presets = [],
  onApply,
  onReset,
  helperText,
  summaryBadge,
  defaultOpen = true,
}: CustomInputPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [value, setValue] = useState(initialValue);
  const [errors, setErrors] = useState<string[]>([]);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);

  const handleApply = () => {
    const res = onApply(value);
    if (!res.isValid && res.errors) {
      setErrors(res.errors);
      setAppliedSuccessfully(false);
    } else {
      setErrors([]);
      setAppliedSuccessfully(true);
      setTimeout(() => setAppliedSuccessfully(false), 2000);
    }
  };

  const handleSelectPreset = (preset: InputPreset<any>) => {
    setValue(preset.rawString);
    const res = onApply(preset.rawString);
    if (!res.isValid && res.errors) {
      setErrors(res.errors);
      setAppliedSuccessfully(false);
    } else {
      setErrors([]);
      setAppliedSuccessfully(true);
      setTimeout(() => setAppliedSuccessfully(false), 2000);
    }
  };

  const handleReset = () => {
    onReset();
    setValue(initialValue);
    setErrors([]);
    setAppliedSuccessfully(false);
  };

  return (
    <div className="card-base rounded-2xl border dark:border-white/10 border-[#E5E5E5] overflow-hidden transition-all duration-200 mb-6 shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left hover:dark:bg-white/[0.02] hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl dark:bg-[#0A84FF]/10 bg-[rgba(255,122,0,0.08)] border dark:border-[#0A84FF]/30 border-[#FF7A00]/30 flex items-center justify-center dark:text-[#0A84FF] text-[#FF7A00] shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm sm:text-base dark:text-white text-[#171717]">
                {title}
              </span>
              {summaryBadge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 text-slate-500">
                  {summaryBadge}
                </span>
              )}
            </div>
            <p className="text-xs dark:text-slate-400 text-[#737373] hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono dark:text-[#0A84FF] text-[#FF7A00] font-semibold hidden md:inline">
            {isOpen ? "Collapse Inputs" : "Customize Inputs"}
          </span>
          <div className="w-6 h-6 rounded-lg dark:bg-white/5 bg-slate-100 flex items-center justify-center text-slate-400">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Input Drawer */}
      {isOpen && (
        <div className="p-4 sm:p-6 pt-0 border-t dark:border-white/5 border-slate-200 space-y-4">
          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="space-y-1.5 pt-3">
              <span className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase tracking-wider block font-semibold">
                Curated Problem Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 text-xs font-mono rounded-lg border dark:border-white/10 border-slate-300 dark:bg-white/[0.03] bg-white hover:dark:border-[#0A84FF] hover:border-[#FF7A00] transition-all text-slate-600 dark:text-slate-300 shadow-sm"
                    title={p.description}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input / Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono dark:text-slate-400 text-slate-500 uppercase tracking-wider block font-semibold">
              Raw Input Definition:
            </label>
            <textarea
              rows={2}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (errors.length > 0) setErrors([]);
              }}
              placeholder={placeholder}
              className="w-full p-3 font-mono text-xs sm:text-sm rounded-xl border dark:border-white/10 border-slate-300 dark:bg-black/30 bg-white dark:text-slate-100 text-[#171717] focus:outline-none focus:ring-1 dark:focus:ring-[#0A84FF] focus:ring-[#FF7A00] leading-relaxed resize-y"
            />
            {helperText && (
              <span className="text-[11px] font-mono dark:text-slate-500 text-slate-400 block">
                💡 {helperText}
              </span>
            )}
          </div>

          {/* Error Feedback */}
          {errors.length > 0 && (
            <div className="p-3 rounded-xl dark:bg-rose-950/20 bg-rose-50 border border-rose-500/30 text-rose-500 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Validation Failed:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border dark:border-white/10 border-slate-300 hover:dark:bg-white/5 hover:bg-slate-100 text-xs font-mono text-slate-500 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md text-white",
                appliedSuccessfully
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-[#FF7A00] hover:bg-[#EA580C] dark:bg-[#0A84FF] dark:hover:bg-blue-600"
              )}
            >
              {appliedSuccessfully ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Applied &amp; Synchronized!
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Apply &amp; Execute
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
