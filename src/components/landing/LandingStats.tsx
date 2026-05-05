"use client";

import { useLandingConfig } from "./LandingProvider";
import { AnimatedCounter } from "./AnimatedCounter";

export function LandingStats() {
  const { config } = useLandingConfig();
  const { stats } = config.copy;

  return (
    <section id="stats" className="ngx-section">
      <div className="ngx-section-panel !p-5 md:!p-7">
        <div className="ngx-card-grid ngx-card-grid-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""} rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 text-left md:text-center`}
            >
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                duration={1800}
                className="font-display font-black tracking-[-0.04em] uppercase text-ngx-fg-1 mb-2 leading-none text-[2rem] md:text-[2.4rem]"
                suffixStyle={{ color: "var(--ngx-purple-light)" }}
              />
              <div className="text-[10px] text-ngx-fg-3 uppercase tracking-[0.22em] font-mono leading-relaxed">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
