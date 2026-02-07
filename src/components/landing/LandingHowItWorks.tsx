"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingHowItWorks() {
  const { config } = useLandingConfig();
  const { howItWorks } = config.copy;
  const { theme } = config;

  return (
    <section id="como-funciona" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-32 md:mb-48 scroll-mt-32">
      <div className="text-center mb-16 md:mb-20 animate-on-scroll">
        <span className="inline-flex px-3 py-1 rounded-full bg-[#6D00FF]/10 border border-[#6D00FF]/20 text-[10px] text-[#B98CFF] font-mono uppercase tracking-widest mb-6">
          Cómo funciona
        </span>
        <h2 className="text-4xl md:text-6xl text-white mb-4 tracking-tight font-display font-semibold leading-[1.05]">
          3 pasos. 60 segundos.
          <br />
          <span className="text-[#D7C7FF]">Tu potencial revelado.</span>
        </h2>
      </div>

      <div className="relative">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-7 bottom-7 w-[1.5px] hidden md:block"
          style={{
            background: `linear-gradient(to bottom, transparent, ${theme.primary}, ${theme.primary}, transparent)`,
            opacity: 0.92,
          }}
        />

        <div className="space-y-16 md:space-y-20">
          {howItWorks.steps.map((item, i) => {
            const Icon = item.icon;
            const isLeftCard = i % 2 === 0;

            return (
              <div key={item.step} className="relative grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
                <div
                  className={`${isLeftCard ? "md:col-start-1 md:justify-self-end" : "md:col-start-3 md:justify-self-start"} w-full ${i === 1 ? "md:max-w-[470px]" : "md:max-w-[460px]"} animate-on-scroll${isLeftCard ? "-left" : "-right"} ${i > 0 ? `delay-${i}00` : ""}`}
                >
                  <article className="glass-panel rounded-3xl border border-white/10 p-8 md:p-10 border-glow-hover">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5"
                      style={{
                        backgroundColor: `${theme.primary}1a`,
                        border: `1px solid ${theme.primary}33`,
                      }}
                    >
                      <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: theme.accent }}>
                        PASO {item.step}
                      </span>
                    </div>
                    <h3 className="text-[2rem] md:text-4xl text-white mb-4 font-display font-medium tracking-tight leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-body">
                      {item.description}
                    </p>
                  </article>
                </div>

                <div className={`relative z-10 md:col-start-2 justify-self-center animate-on-scroll-scale ${i > 0 ? `delay-${i}00` : ""}`}>
                  <div
                    className="w-[60px] h-[60px] rounded-full border border-[#8B5CF6]/45 flex items-center justify-center"
                    style={{
                      backgroundColor: theme.primary,
                      boxShadow: `0 0 30px ${theme.primary}88`,
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className={`${isLeftCard ? "md:col-start-3" : "md:col-start-1"} hidden md:block`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
