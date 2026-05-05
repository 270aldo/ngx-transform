"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { ReportPreviewCopy } from "@/config/landing/types";

const FALLBACK: ReportPreviewCopy = {
  sectionLabel: "Ejemplo de resultado",
  headline: "Así debería sentirse tu resultado.",
  subtitle:
    "No como una imagen suelta. Como una primera lectura: dónde estás, qué puede frenarte y qué paso conviene tomar.",
  scoreLabel: "Score de preparación",
  scoreValue: 72,
  scoreMax: 100,
  scoreDescription:
    "Buen punto para empezar, pero con riesgo de abandono si no hay estructura semanal.",
  dimensions: [
    { label: "Entrenamiento", value: 78 },
    { label: "Nutrición", value: 64 },
    { label: "Recuperación", value: 58 },
    { label: "Constancia", value: 71 },
  ],
  insights: [
    {
      label: "Lo que puede frenarte",
      text: "Tu avance depende demasiado de motivación y poco de estructura.",
    },
    {
      label: "Primera palanca",
      text: "Fuerza bien programada 2-3 veces por semana para crear base.",
    },
    {
      label: "Ajuste clave",
      text: "Mejorar proteína, sueño y progresión antes de subir intensidad.",
    },
    {
      label: "Siguiente paso",
      text: "Empezar con una ruta inicial o revisar HYBRID si necesitas soporte.",
    },
  ],
  ctaLabel: "Ver mi punto de partida",
  ctaHref: "/wizard",
  microcopy: "Ejemplo ilustrativo. Tu resultado se genera con tus datos.",
};

const LEFT_BULLETS = [
  "Lo que puede estar frenándote.",
  "La palanca que conviene mover primero.",
  "Un paso concreto para empezar con criterio.",
] as const;

export function LandingReportPreview() {
  const { config, trackCta } = useLandingConfig();
  const copy = config.copy.reportPreview ?? FALLBACK;

  const scorePct = Math.round((copy.scoreValue / copy.scoreMax) * 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePct / 100) * circumference;

  return (
    <section id="reporte-ejemplo" className="ngx-section">
      <div className="ngx-section-header">
        <div className="animate-on-scroll">
          <span className="ngx-eyebrow-pill">{copy.sectionLabel}</span>
          <h2 className="ngx-section-heading">{copy.headline}</h2>
        </div>
        <p className="animate-on-scroll delay-100 max-w-2xl text-sm md:text-base leading-relaxed text-ngx-fg-2 lg:ml-auto">
          {copy.subtitle}
        </p>
      </div>

      <div className="ngx-section-panel">
        {/* Mock dashboard header */}
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/15 pb-4">
          <span className="ngx-eyebrow text-[11px]">
            Panel de ejemplo · Perfil tipo
          </span>
          <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
            Demo
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 lg:items-stretch">
          {/* Mock dashboard — first on mobile (visual anchor), right on desktop */}
          <div className="order-1 lg:order-2 animate-on-scroll-right delay-100 flex flex-col gap-4">
            {/* Score + Dimensions — stack on most viewports, side-by-side at 2xl+ to balance with narrative col */}
            <div className="grid gap-4 2xl:grid-cols-2 2xl:items-stretch">
            {/* Score card — hero of the mock */}
            <div className="ngx-metal-card flex flex-col sm:flex-row sm:items-center 2xl:flex-col 2xl:items-center gap-5 sm:gap-6 p-5 md:p-6">
              <div className="relative z-10 mx-auto sm:mx-0 2xl:mx-auto flex-shrink-0 w-[110px] h-[110px] sm:w-[140px] sm:h-[140px]">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="var(--ngx-purple)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{
                      transition: "stroke-dashoffset 1200ms cubic-bezier(0.33, 1, 0.68, 1)",
                      filter: "drop-shadow(0 0 8px rgba(109,0,255,0.5))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-3xl sm:text-[2.5rem] text-ngx-fg-1 leading-none tabular-nums">
                    {copy.scoreValue}
                  </span>
                  <span className="font-mono font-semibold text-xs text-white/55 mt-1.5 tabular-nums tracking-[0.05em]">
                    / {copy.scoreMax}
                  </span>
                </div>
              </div>
              <div className="relative z-10 min-w-0 flex-1 text-center sm:text-left 2xl:text-center">
                <span className="ngx-eyebrow">{copy.scoreLabel}</span>
                <p className="mt-2 font-body text-sm md:text-[0.95rem] leading-relaxed text-ngx-fg-2">
                  {copy.scoreDescription}
                </p>
              </div>
            </div>

            {/* Dimensions panel */}
            <div className="ngx-metal-card p-5 md:p-6">
              <div className="relative z-10">
                <span className="ngx-eyebrow">Dimensiones</span>
                <div className="mt-4 flex flex-col gap-3.5">
                  {copy.dimensions.map((dim) => (
                    <div key={dim.label}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="font-body text-sm text-ngx-fg-1">{dim.label}</span>
                        <span className="font-mono text-sm font-bold text-ngx-fg-1 tabular-nums">{dim.value}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${dim.value}%`,
                            background: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                            boxShadow: "0 0 8px rgba(109,0,255,0.4)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>

            {/* Insights — 1-col mobile / 2-col tablet+desktop / 4-col at 2xl+ to keep right col compact */}
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {copy.insights.map((insight) => (
                <div key={insight.label} className="ngx-metal-card p-5">
                  <div className="relative z-10">
                    <span className="ngx-eyebrow text-[11px]">{insight.label}</span>
                    <p className="mt-2 font-body text-sm leading-relaxed text-ngx-fg-2">
                      {insight.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Narrative + CTA — second on mobile, left on desktop */}
          <div className="order-2 lg:order-1 animate-on-scroll-left flex flex-col gap-6">
            <div>
              <h3 className="font-body font-bold text-2xl md:text-3xl text-ngx-fg-1 leading-tight tracking-[-0.02em]">
                Una lectura inicial,
                <br />
                no una imagen suelta.
              </h3>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-ngx-fg-2">
                Combinas un score de preparación con palancas concretas y un siguiente paso. Sales sabiendo por dónde empezar — y si lo puedes sostener solo o necesitas soporte.
              </p>
            </div>

            <ul className="flex flex-col gap-2.5">
              {LEFT_BULLETS.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm text-ngx-fg-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--ngx-purple-light)" }}
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 lg:mt-auto">
              <Link
                href={copy.ctaHref}
                onClick={() => trackCta("report_preview_cta", "scan_start", copy.ctaLabel)}
                className="group inline-flex h-13 w-full sm:w-auto sm:min-w-[220px] items-center justify-center gap-2 rounded-full px-6 text-white font-bold font-body text-sm transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
                style={{
                  height: "52px",
                  backgroundColor: "var(--ngx-purple)",
                  boxShadow: "var(--ngx-glow-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary)";
                }}
              >
                <span>{copy.ctaLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="ngx-caption">{copy.microcopy}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
