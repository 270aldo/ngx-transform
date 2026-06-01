"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, ScanLine, Sparkles } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import { HeroTransformation } from "./HeroTransformation";

export function LandingHero() {
  const { config, trackCta } = useLandingConfig();
  const { theme } = config;
  const { hero } = config.copy;

  const textScaleClass = theme.textScale > 1 ? "scale-[1.1]" : "";
  const heroAssurances = [
    { icon: ScanLine, label: "Ves tu punto de partida", text: hero.supportingPoints[0] },
    { icon: Sparkles, label: "Visualizas una posibilidad", text: hero.supportingPoints[1] },
    { icon: ArrowRight, label: "Sales con dirección", text: hero.supportingPoints[2] },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-14 lg:pt-16 mb-12 md:mb-20">
      {/* Atmospheric glows — cinematic brand energy without wrapping the hero in a card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-6%] top-[-4%] h-[460px] w-[460px] rounded-full blur-[140px]"
        style={{ backgroundColor: "rgba(109, 0, 255, 0.28)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-4%] top-[28%] h-[380px] w-[380px] rounded-full blur-[130px]"
        style={{ backgroundColor: "rgba(184, 148, 255, 0.14)" }}
      />

      <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(460px,560px)] lg:gap-14 xl:gap-16">
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

            <h1 className={`ngx-display ngx-display-hero ${textScaleClass} origin-left max-w-[12ch] sm:max-w-[14ch] mx-auto lg:mx-0`}>
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

            {hero.punchline ? (
              <p className="mx-auto mt-5 max-w-[560px] border-l border-white/[0.12] pl-4 text-left font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.24em] text-white/50 lg:mx-0">
                {hero.punchline}
              </p>
            ) : null}

            <div data-testid="mobile-hero-preview" className="mt-6 lg:hidden">
              <HeroTransformation compact className="mx-auto max-w-[440px]" />
            </div>

            <div className="mt-6 md:mt-8 grid w-full max-w-[540px] grid-cols-1 gap-3 sm:grid-cols-2 mx-auto lg:mx-0">
              <Link
                href="/wizard"
                onClick={() => trackCta("hero_primary", hero.primaryCta.intent, hero.primaryCta.label)}
                className="ngx-primary-cta group inline-flex w-full px-6 text-[0.92rem]"
              >
                <span>{hero.primaryCta.label}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#reporte-ejemplo"
                onClick={() => trackCta("hero_report_preview", "view_report_example", hero.secondaryCta)}
                className="ngx-secondary-cta group inline-flex w-full px-6 text-[0.92rem]"
              >
                <PlayCircle className="h-5 w-5 text-white/80 transition-transform group-hover:scale-105" />
                <span>{hero.secondaryCta}</span>
              </a>
            </div>

            {hero.socialProof.count ? (
              <p className="mt-4 ngx-caption text-center lg:text-left">
                {hero.socialProof.count}
              </p>
            ) : null}
          </div>

          <HeroTransformation className="hidden lg:block w-full" />
        </div>

        <div className="relative mt-12 md:mt-14 grid gap-0 overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.025] md:grid-cols-3">
          {heroAssurances.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} relative p-4 md:p-5`}
              >
                {index > 0 ? (
                  <div className="absolute left-0 top-5 hidden h-[calc(100%-2.5rem)] w-px bg-white/[0.07] md:block" />
                ) : null}
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: "rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                    </div>
                    <span className="ngx-eyebrow !text-[11px]">{item.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--ngx-fg-2)" }}>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
    </section>
  );
}
