"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingStats() {
  const { config } = useLandingConfig();
  const { stats } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-40">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-on-scroll ${
              i > 0 ? `delay-${i}00` : ""
            } glass-panel rounded-2xl p-8 text-center border-glow-hover`}
          >
            <div className="text-4xl md:text-5xl text-white font-display font-semibold tracking-tight mb-2">
              {stat.value}
              <span style={{ color: theme.accent }}>{stat.suffix}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
