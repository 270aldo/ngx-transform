"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingValueStack() {
  const { config } = useLandingConfig();
  const { valueStack } = config.copy;
  if (!valueStack) return null;

  return (
    <section id="que-recibes" className="max-w-6xl mx-auto px-4 mb-32 md:mb-48 scroll-mt-32">
      {/* Section header */}
      <div className="grid gap-8 mb-12 md:mb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div className="animate-on-scroll">
          <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-6">
            {valueStack.sectionLabel}
          </span>
          <h2 className="landing-heading-section text-[1.95rem] leading-[1.05] sm:text-[2.3rem] md:text-[2.85rem] text-white max-w-[18ch]">
            {valueStack.title}
            <br />
            <span className="text-[#EDE9FE]">{valueStack.highlight}</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-body lg:ml-auto">
          {valueStack.subtitle}
        </p>
      </div>

      {/* 2x2 uniform grid */}
      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {valueStack.items.map((item, index) => {
          const Icon = item.icon;
          const animationDelay = ["", "delay-100", "delay-200", "delay-300"][index] ?? "";
          return (
            <article
              key={item.title}
              className={`group relative animate-on-scroll ${animationDelay} landing-surface rounded-[24px] p-6 md:p-8 border-glow-hover overflow-hidden transition-transform duration-500 hover:-translate-y-1`}
            >
              {/* Subtle top-left glow on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(circle at top left, rgba(109,0,255,0.18), transparent 55%)",
                }}
              />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6D00FF]/25 bg-[#6D00FF]/10 flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#B98CFF]" />
                </div>
                <div className="min-w-0">
                  <span className="landing-kicker !text-[0.62rem] !tracking-[0.22em] block mb-2 text-[#B98CFF]/80">
                    {`activo 0${index + 1}`}
                  </span>
                  <h3 className="text-white font-body font-semibold text-[1.2rem] leading-[1.15] tracking-[-0.02em] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed font-body text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
