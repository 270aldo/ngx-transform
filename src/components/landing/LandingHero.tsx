"use client";

import Link from "next/link";
import { ArrowRight, Brain, PlayCircle, ShieldCheck } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import { HeroTransformation } from "./HeroTransformation";

export function LandingHero() {
  const { config, trackCta } = useLandingConfig();
  const { theme } = config;
  const { hero } = config.copy;

  // Scale class for mayores variant
  const textScaleClass = theme.textScale > 1 ? "scale-[1.1]" : "";
  const heroAssurances = [
    { icon: ShieldCheck, label: "Contrato claro", text: hero.supportingPoints[0] },
    { icon: Brain, label: "GENESIS interpreta", text: hero.supportingPoints[1] },
    { icon: ArrowRight, label: "Después del wow", text: hero.supportingPoints[2] },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 mb-32 md:mb-44">
      <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] landing-surface-strong px-5 py-6 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div
          className="absolute left-[-12%] top-[10%] h-[320px] w-[320px] rounded-full blur-[120px]"
          style={{ backgroundColor: `${theme.primary}22` }}
        />
        <div
          className="absolute right-[-10%] bottom-[-4%] h-[300px] w-[300px] rounded-full blur-[120px]"
          style={{ backgroundColor: `${theme.accent}22` }}
        />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:gap-12">
          <div className="text-center lg:text-left">
            <div
              className="animate-on-scroll inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-7 shadow-[0_0_40px_-10px_rgba(109,0,255,0.4)] cursor-default"
              style={{ borderColor: `${theme.primary}40` }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] text-slate-300 tracking-wide font-mono">Sin costo</span>
              <span className="h-3 w-px bg-white/20" />
              <span className="text-[11px] text-slate-300 tracking-wide font-mono">Acceso privado</span>
              <span className="h-3 w-px bg-white/20" />
              <span className="text-[11px] tracking-wide font-mono" style={{ color: theme.accent }}>Proceso guiado</span>
            </div>

            <p className="animate-on-scroll delay-100 landing-kicker mb-4">
              Visualización privada con salida más seria
            </p>

            <h1
              className={`animate-on-scroll delay-100 landing-heading text-[3rem] leading-[0.88] text-white sm:text-[4rem] md:text-[5rem] lg:text-[5.65rem] ${textScaleClass} origin-left`}
            >
              {hero.headline.line1}
              <br />
              <span className="text-[#F1ECFF]">{hero.headline.line2}</span>
            </h1>

            <p
              className={`animate-on-scroll delay-200 mt-5 max-w-xl text-[1.02rem] leading-relaxed text-slate-300 md:text-[1.2rem] ${textScaleClass} mx-auto lg:mx-0`}
            >
              {hero.subtitle}
            </p>

            <div className="animate-on-scroll delay-300 mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/wizard"
                onClick={() => trackCta("hero_primary", hero.primaryCta.intent, hero.primaryCta.label)}
                className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full text-white text-base font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 hover:-translate-y-0.5 min-h-[56px] inline-flex items-center justify-center"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: `0 0 40px -5px ${theme.primary}99`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                <span className="relative flex items-center gap-2 font-body">
                  {hero.primaryCta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full border border-white/15 bg-white/5 text-white font-body text-base whitespace-nowrap hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 min-h-[56px]"
              >
                <PlayCircle className="w-5 h-5" />
                {hero.secondaryCta}
              </a>
            </div>

            <div className="animate-on-scroll delay-300 mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-slate-500 lg:justify-start">
              <span>{hero.socialProof.count}</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:inline-flex" />
              <span>{hero.socialProof.label}</span>
            </div>
          </div>

          <HeroTransformation className="w-full" />
        </div>

        <div className="relative z-10 mt-6 md:mt-8 grid gap-3 md:grid-cols-3">
          {heroAssurances.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} landing-surface rounded-2xl p-4 md:p-5`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: `${theme.primary}33`,
                      backgroundColor: `${theme.primary}14`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: theme.accent }} />
                  </div>
                  <span className="landing-kicker !text-[0.64rem] !tracking-[0.22em]">{item.label}</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
