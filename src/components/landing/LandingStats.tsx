"use client";

import { useLandingConfig } from "./LandingProvider";
import { AnimatedCounter } from "./AnimatedCounter";

export function LandingStats() {
  const { config } = useLandingConfig();
  const { stats } = config.copy;
  const [primary, ...secondary] = stats;

  return (
    <section id="stats" className="ngx-section">
      <div className="relative overflow-hidden border-y border-white/[0.08] bg-[linear-gradient(135deg,rgba(5,5,8,0.96),rgba(18,7,32,0.72)_52%,rgba(5,5,8,0.98))]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ngx-purple-light)]/45 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:px-8 md:py-14 lg:px-10">
          {primary ? (
            <div className="animate-on-scroll flex min-h-[220px] flex-col justify-between">
              <div>
                <span className="ngx-eyebrow-pill mb-5">Prueba operativa</span>
                <p className="max-w-xl text-sm leading-relaxed text-white/58 md:text-base">
                  La visualización abre la conversación. Los números ordenan el siguiente paso.
                </p>
              </div>
              <div className="pt-10">
                <AnimatedCounter
                  value={primary.value}
                  suffix={primary.suffix}
                  duration={1800}
                  className="font-display font-black uppercase text-white leading-none text-[4.2rem] md:text-[6.5rem]"
                  suffixStyle={{ color: "var(--ngx-success)" }}
                />
                <p className="mt-3 max-w-md text-[11px] font-mono uppercase tracking-[0.22em] leading-relaxed text-white/45">
                  {primary.label}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid content-stretch gap-3">
            {secondary.map((stat, i) => (
              <div
                key={stat.label}
                className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""} grid grid-cols-[auto_1fr] items-center gap-5 border-t border-white/[0.08] py-5 first:border-t-0 md:py-6`}
              >
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={1600}
                  className="min-w-[7ch] font-display text-[2.2rem] font-black uppercase leading-none text-white md:text-[3rem]"
                  suffixStyle={{
                    color: i % 2 === 0 ? "var(--ngx-purple-light)" : "var(--ngx-success)",
                  }}
                />
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] leading-relaxed text-white/45">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
