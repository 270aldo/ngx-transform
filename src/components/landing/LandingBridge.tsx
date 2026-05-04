"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingBridge() {
  const { config, trackCta } = useLandingConfig();
  const { bridge } = config.copy;
  if (!bridge) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 mb-32 md:mb-48">
      <div className="animate-on-scroll landing-surface-strong rounded-[28px] md:rounded-[36px] p-6 md:p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 cta-gradient" />
        <div className="absolute inset-0 opacity-[0.18] bg-[url('/noise.svg')] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full bg-[#6D00FF]/10 border border-[#6D00FF]/20 text-[10px] text-[#B98CFF] font-mono uppercase tracking-widest mb-6">
              {bridge.sectionLabel}
              </span>
              <h2 className="landing-heading-section text-[2rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[2.85rem] max-w-[16ch]">
                {bridge.title}
                <br />
                <span className="text-[#EDE9FE]">{bridge.highlight}</span>
              </h2>
              <p className="mt-5 text-slate-300 text-sm md:text-base max-w-xl leading-relaxed font-body">
                {bridge.subtitle}
              </p>
            </div>

            <div className="mt-8 lg:mt-10">
              <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 mb-5 font-mono uppercase tracking-[0.22em]">
                {bridge.footnote}
              </p>
              <div>
                <a
                  href="#cta-final"
                  onClick={() => trackCta("bridge_primary", bridge.buttonIntent, bridge.buttonText)}
                  className="inline-flex px-8 py-4 rounded-full bg-[#6D00FF] text-white font-semibold font-body shadow-[0_0_30px_-5px_rgba(109,0,255,0.6)] hover:bg-[#5B21B6] transition-colors"
                >
                  {bridge.buttonText}
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {bridge.cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="landing-surface rounded-[24px] p-5 md:p-6 border-glow-hover">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6D00FF]/20 bg-[#6D00FF]/10">
                    <Icon className="w-6 h-6 text-[#B98CFF]" />
                  </div>
                  <h3 className="text-white text-[1.2rem] leading-[1.04] font-body font-semibold tracking-[-0.03em] mb-2">{card.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-body">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
