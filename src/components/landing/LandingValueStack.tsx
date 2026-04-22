"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingValueStack() {
  const { config } = useLandingConfig();
  const { valueStack } = config.copy;

  return (
    <section id="que-recibes" className="max-w-6xl mx-auto px-4 mb-32 md:mb-48 scroll-mt-32">
      <div className="grid gap-8 mb-10 md:mb-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-end">
        <div className="animate-on-scroll">
          <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-6">
            {valueStack.sectionLabel}
          </span>
          <h2 className="landing-heading text-[2.1rem] leading-[0.94] sm:text-[2.6rem] md:text-[3.4rem] text-white">
            {valueStack.title}
            <br />
            <span className="text-[#EDE9FE]">{valueStack.highlight}</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-body lg:ml-auto">
          {valueStack.subtitle}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {valueStack.items.map((item, index) => {
          const Icon = item.icon;
          const isFeatured = index === 0;
          return (
            <div
              key={item.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ${isFeatured ? "md:col-span-2" : ""} landing-surface rounded-[24px] p-5 md:p-8 border-glow-hover`}
            >
              <div className={`flex ${isFeatured ? "flex-col gap-6 md:flex-row md:items-center md:justify-between" : "items-start gap-4"}`}>
                <div className={`flex ${isFeatured ? "items-center gap-5" : "items-start gap-4"}`}>
                  <div className={`rounded-2xl bg-[#6D00FF]/10 border border-[#6D00FF]/20 flex items-center justify-center flex-shrink-0 ${isFeatured ? "w-14 h-14" : "w-12 h-12"}`}>
                    <Icon className={`${isFeatured ? "w-7 h-7" : "w-6 h-6"} text-[#B98CFF]`} />
                  </div>
                  <div>
                    <span className="landing-kicker !text-[0.62rem] !tracking-[0.22em] block mb-3">
                      {isFeatured ? "activo central" : `activo 0${index + 1}`}
                    </span>
                    <h3 className={`text-white mb-2 ${isFeatured ? "text-[1.7rem] md:text-[2rem] leading-[0.98] font-body font-bold italic tracking-[-0.05em] uppercase" : "font-body font-semibold text-[1.2rem] leading-[1.05] tracking-[-0.03em]"}`}>
                      {item.title}
                    </h3>
                    <p className={`text-slate-400 leading-relaxed font-body ${isFeatured ? "text-base max-w-2xl" : "text-sm"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                {isFeatured ? (
                  <div className="grid gap-2 sm:grid-cols-3 md:max-w-[360px]">
                    {["Privado", "Aproximado", "Compartible"].map((pill) => (
                      <div key={pill} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-center text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {pill}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
