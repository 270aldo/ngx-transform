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
    { icon: ShieldCheck, label: "Contrato claro", text: hero.supportingPoints[0] },
    { icon: Brain, label: "GENESIS interpreta", text: hero.supportingPoints[1] },
    { icon: ArrowRight, label: "Después del wow", text: hero.supportingPoints[2] },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 mb-32 md:mb-44">
      <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] ngx-glass ngx-glass-shine ngx-bg-gradient px-6 py-10 md:px-10 md:py-16 lg:px-14 lg:py-20">
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

            <p className="ngx-eyebrow mb-4">
              {hero.socialProof.label}
            </p>

            <h1 className={`ngx-display ${textScaleClass} origin-left max-w-[15ch] mx-auto lg:mx-0`}>
              {hero.headline.line1}
              <br />
              <span style={{ color: "var(--ngx-fg-2)" }}>{hero.headline.line2}</span>
            </h1>

            <p
              className={`mt-5 max-w-xl text-[1.02rem] leading-relaxed md:text-[1.2rem] ${textScaleClass} mx-auto lg:mx-0`}
              style={{ color: "var(--ngx-fg-2)" }}
            >
              {hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start">
              <Link
                href="/wizard"
                onClick={() => trackCta("hero_primary", hero.primaryCta.intent, hero.primaryCta.label)}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white text-base font-bold font-body transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
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
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#como-funciona"
                className="ngx-glass-clear inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-body text-base transition-all duration-150 hover:[backdrop-filter:blur(24px)_saturate(180%)] active:scale-[0.97]"
              >
                <PlayCircle className="w-5 h-5" />
                <span>{hero.secondaryCta}</span>
              </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 ngx-caption lg:justify-start">
              <span>{hero.socialProof.count}</span>
              <span className="hidden h-1 w-1 rounded-full sm:inline-flex" style={{ backgroundColor: "var(--ngx-fg-3)" }} />
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
                className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ngx-glass ngx-action-accent-l-hover p-4 md:p-5`}
              >
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
