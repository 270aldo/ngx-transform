"use client";

import Link from "next/link";
import { ArrowRight, Brain, PlayCircle, ShieldCheck } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import { HeroTransformation } from "./HeroTransformation";

export function LandingHero() {
  const { config, trackCta } = useLandingConfig();
  const { theme } = config;
  const { hero } = config.copy;

  const textScaleClass = theme.textScale > 1 ? "scale-[1.1]" : "";
  const heroAssurances = [
    { icon: ShieldCheck, label: "Ves dónde estás", text: hero.supportingPoints[0] },
    { icon: Brain, label: "Entiendes qué te frena", text: hero.supportingPoints[1] },
    { icon: ArrowRight, label: "Sales con un primer paso", text: hero.supportingPoints[2] },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 mb-28 md:mb-40">
      <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] ngx-glass ngx-glass-shine ngx-bg-gradient px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
        <div
          className="pointer-events-none absolute left-[-10%] top-[8%] h-[360px] w-[360px] rounded-full blur-[120px]"
          style={{ backgroundColor: "rgba(109, 0, 255, 0.22)" }}
        />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,420px)] lg:gap-12">
          <div className="text-center lg:text-left">
            <div className="ngx-glass-clear inline-flex items-center gap-3 px-4 py-2 rounded-full mb-7 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "var(--ngx-success)" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "var(--ngx-success)" }} />
              </span>
              <span className="ngx-eyebrow !text-[var(--ngx-fg-2)]">{hero.badge.aiLabel}</span>
              <span className="h-3 w-px bg-white/15" />
              <span className="ngx-eyebrow">{hero.badge.version}</span>
            </div>

            <p className="ngx-eyebrow mb-4 max-w-xl mx-auto lg:mx-0">
              Visualización aspiracional · lectura inicial · ruta de acción
            </p>

            <h1 className={`ngx-display ${textScaleClass} origin-left max-w-[14ch] mx-auto lg:mx-0`}>
              {hero.headline.line1}
              <br />
              <span style={{ color: "var(--ngx-fg-2)" }}>{hero.headline.line2}</span>
            </h1>

            <p
              className={`mt-5 max-w-[590px] text-[1.02rem] leading-relaxed md:text-[1.18rem] ${textScaleClass} mx-auto lg:mx-0`}
              style={{ color: "var(--ngx-fg-2)" }}
            >
              {hero.subtitle}
            </p>

            <div className="mt-8 grid w-full max-w-[540px] grid-cols-1 gap-3 sm:grid-cols-2 mx-auto lg:mx-0">
              <Link
                href="/wizard"
                onClick={() => trackCta("hero_primary", hero.primaryCta.intent, hero.primaryCta.label)}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-bold font-body text-white transition-all duration-200 active:scale-[0.97] hover:-translate-y-0.5"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: "var(--ngx-glow-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary)";
                }}
              >
                <span>{hero.primaryCta.label}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#reporte-ejemplo"
                onClick={() => trackCta("hero_report_preview", "view_report_example", hero.secondaryCta)}
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-6 text-[0.95rem] font-bold font-body text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.97]"
              >
                <PlayCircle className="h-5 w-5 text-white/80 transition-transform group-hover:scale-105" />
                <span>{hero.secondaryCta}</span>
              </a>
            </div>

            <p className="mt-4 ngx-caption text-center lg:text-left">
              {hero.socialProof.count}
            </p>
          </div>

          <HeroTransformation className="w-full" />
        </div>

        <div className="relative z-10 mt-6 md:mt-8 grid gap-3 md:grid-cols-3">
          {heroAssurances.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ngx-metal-card p-4 md:p-5`}
              >
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: "var(--ngx-border-card)",
                        backgroundColor: "var(--ngx-purple-dim)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                    </div>
                    <span className="ngx-eyebrow !text-[10px]">{item.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ngx-fg-2)" }}>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
