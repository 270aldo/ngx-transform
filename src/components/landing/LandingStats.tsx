"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingStats() {
  const { config } = useLandingConfig();
  const { stats } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      <div className="landing-surface rounded-[28px] p-5 md:p-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-on-scroll ${
              i > 0 ? `delay-${i}00` : ""
            } rounded-2xl border border-white/6 bg-white/[0.03] p-5 md:p-6 text-left md:text-center`}
          >
            <div className="text-2xl md:text-[2.4rem] text-white font-body font-black italic tracking-[-0.06em] mb-2 uppercase">
              {stat.value}
              <span style={{ color: theme.accent }}>{stat.suffix}</span>
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-[0.24em] font-mono">
              {stat.label}
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}
