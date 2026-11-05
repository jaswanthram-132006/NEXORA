import React from "react";
import { platformStats } from "@/lib/config/platformStats";

export default function StatsBar() {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Specular divider lines */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent dark:via-[#0A84FF]/25 via-[#FF7A00]/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent dark:via-[#00D2FF]/20 via-[#FF7A00]/20 to-transparent"
      />

      <div className="section-padding">
        <div className="glass rounded-2xl p-6 sm:p-8 border dark:border-white/10 border-[#E5E5E5] shadow-sm dark:shadow-[0_12px_36px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.12)]">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x dark:divide-white/[0.08] divide-[#E5E5E5]">
            {platformStats.overviewMetrics.map((stat) => (
              <div
                key={stat.label}
                className="text-center pt-4 sm:pt-0 group relative"
              >
                <div className="text-2xl mb-1.5 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200">
                  {stat.icon}
                </div>
                <dt className="font-heading text-2xl sm:text-3xl font-black gradient-text-electric">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs font-mono dark:text-slate-400 text-[#737373] dark:group-hover:text-slate-200 group-hover:text-[#171717] transition-colors">
                  {stat.label}
                </dd>
                {stat.description && (
                  <p className="hidden sm:block text-[10px] dark:text-slate-500 text-slate-400 mt-0.5">
                    {stat.description}
                  </p>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
