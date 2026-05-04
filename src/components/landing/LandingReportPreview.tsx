"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { ReportPreviewCopy } from "@/config/landing/types";

/**
 * Fallback copy for variants that don't define reportPreview.
 * Mirrors the canonical content in `general.ts`.
 */
const FALLBACK: ReportPreviewCopy = {
  sectionLabel: "Ejemplo de reporte",
  headline: "Mira lo que recibes antes de subir tu foto.",
  subtitle:
    "El resultado no debe sentirse como una imagen suelta. Debe sentirse como una lectura inicial: dónde estás, qué te frena y qué paso tiene más sentido.",
  scoreLabel: "Readiness Score",
  scoreValue: 72,
  scoreMax: 100,
  scoreDescription:
    "Listo para empezar, pero con riesgo de abandono si no hay estructura.",
  dimensions: [
    { label: "Entrenamiento", value: 78 },
    { label: "Nutrición", value: 64 },
    { label: "Recuperación", value: 58 },
    { label: "Adherencia", value: 71 },
  ],
  insights: [
    {
      label: "Obstáculo principal",
      text: "Tu plan actual depende demasiado de motivación y muy poco de estructura semanal.",
    },
    {
      label: "Palanca #1",
      text: "2-3 sesiones de fuerza bien diseñadas por semana pueden crear el estímulo mínimo para avanzar.",
    },
    {
      label: "Palanca #2",
      text: "Proteína suficiente, sueño más consistente y ajustes de carga reducen el riesgo de abandonar.",
    },
    {
      label: "Siguiente paso",
      text: "Ruta inicial de 7 días. HYBRID solo si necesitas accountability humana para sostenerla.",
    },
  ],
  ctaLabel: "Ver mi punto de partida",
  ctaHref: "/wizard",
  microcopy: "Demo ilustrativo. Tu reporte se genera con tus datos.",
};

export function LandingReportPreview() {
  const { config, trackCta } = useLandingConfig();
  const copy = config.copy.reportPreview ?? FALLBACK;

  const scorePct = Math.round((copy.scoreValue / copy.scoreMax) * 100);
  // SVG circle gauge config
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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:items-center">
          {/* Left — narrative + CTA */}
          <div className="animate-on-scroll-left flex flex-col gap-6">
            <div>
              <span className="ngx-eyebrow text-xs">Ejemplo · perfil tipo</span>
              <h3 className="mt-2 font-body font-bold text-2xl md:text-3xl text-ngx-fg-1 leading-tight tracking-[-0.02em]">
                Una lectura inicial, no una imagen suelta.
              </h3>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-ngx-fg-2">
                Combina un score de readiness con palancas concretas y un siguiente paso. Así sabes desde el día uno por dónde empezar — y si lo puedes sostener solo o necesitas un coach.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={copy.ctaHref}
                onClick={() => trackCta("report_preview_cta", "scan_start", copy.ctaLabel)}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white font-bold font-body text-sm transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
                style={{
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

          {/* Right — mock dashboard */}
          <div className="animate-on-scroll-right delay-100 flex flex-col gap-4">
            {/* Score card with circular gauge */}
            <div className="ngx-glass-clear flex items-center gap-5 p-5 md:p-6 rounded-2xl">
              <div className="relative flex-shrink-0 w-[120px] h-[120px]">
                <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
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
                  <span className="font-mono font-bold text-3xl md:text-[2.25rem] text-ngx-fg-1 leading-none tabular-nums">
                    {copy.scoreValue}
                  </span>
                  <span className="ngx-caption mt-1">/ {copy.scoreMax}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <span className="ngx-eyebrow">{copy.scoreLabel}</span>
                <p className="mt-2 font-body text-sm leading-relaxed text-ngx-fg-2">
                  {copy.scoreDescription}
                </p>
              </div>
            </div>

            {/* Dimensions bars */}
            <div className="ngx-glass-clear p-5 md:p-6 rounded-2xl">
              <span className="ngx-eyebrow">Dimensiones</span>
              <div className="mt-4 flex flex-col gap-3">
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

            {/* Insights — 2x2 mini-cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.insights.map((insight) => (
                <div
                  key={insight.label}
                  className="ngx-glass-clear p-4 rounded-2xl"
                >
                  <span className="ngx-eyebrow text-[10px]">{insight.label}</span>
                  <p className="mt-2 font-body text-xs leading-relaxed text-ngx-fg-2">
                    {insight.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
