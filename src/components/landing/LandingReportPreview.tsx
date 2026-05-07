"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";
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
  dimensions: [],
  insights: [],
  ctaLabel: "Ver mi punto de partida",
  ctaHref: "/wizard",
  microcopy: "Ejemplo ilustrativo. Tu resultado se genera con tus datos.",
};

const LEFT_BULLETS = [
  "Lo que puede estar frenándote.",
  "La palanca que conviene mover primero.",
  "Un paso concreto para empezar con criterio.",
] as const;

// Mockup fiel al output real del producto (MuscleHealthScore + bottleneck +
// SeasonRoadmap). Estos son DATOS DE PERFIL TIPO, no copy de marketing —
// se hardcodean aquí para que el visitante vea exactamente la estructura
// que recibe en /s/[shareId]. No los expongas vía config para evitar
// que un cambio de copy mal calibrado distorsione la promesa del producto.
const PROFILE_MOCK = {
  chronologicalAge: 35,
  biologicalAge: 38,
  metabolicRisk: "MEDIO" as const,
  bottleneck: {
    label: "Falta de estructura semanal",
    description:
      "Lo que parece flexibilidad termina siendo improvisación. Sin un plan escrito antes del lunes, las decisiones de cada día consumen más de lo que producen.",
  },
  leverages: [
    "Plan semanal escrito antes del lunes — no improvisar día a día",
    "Proteína 1.6 g/kg en 4 ingestas estables; estandarizar 80% de las comidas",
    "Sueño 7-9h con horario consistente; descarga cada 4-6 semanas",
  ],
  dominantError:
    "Entrenas con consistencia pero sin progresión trazable: el sistema deja de adaptarse a las pocas semanas y entras en plateau silencioso.",
  roadmap: [
    { phase: 1, weeks: "1-3", title: "Fundación" },
    { phase: 2, weeks: "4-7", title: "Construcción" },
    { phase: 3, weeks: "8-11", title: "Optimización" },
    { phase: 4, weeks: "12", title: "Evaluación" },
  ],
} as const;

const RISK_BADGE = {
  BAJO: { label: "Bajo", color: "var(--ngx-success)" },
  MEDIO: { label: "Medio", color: "rgb(252, 211, 77)" },
  ALTO: { label: "Alto", color: "var(--ngx-error)" },
} as const;

export function LandingReportPreview() {
  const { config, trackCta } = useLandingConfig();
  const copy = config.copy.reportPreview ?? FALLBACK;

  const scorePct = Math.round((copy.scoreValue / copy.scoreMax) * 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePct / 100) * circumference;

  const ageDelta = PROFILE_MOCK.biologicalAge - PROFILE_MOCK.chronologicalAge;
  const risk = RISK_BADGE[PROFILE_MOCK.metabolicRisk];

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

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10 lg:items-start">
          {/* Mock dashboard — first on mobile (visual anchor), right on desktop */}
          <div className="order-1 lg:order-2 animate-on-scroll-right delay-100 flex flex-col gap-4">
            {/* HERO: Score + edad biológica vs cronológica + riesgo metabólico */}
            <div className="ngx-metal-card p-5 md:p-6">
              <div className="relative z-10 grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                {/* Score circular */}
                <div className="relative mx-auto sm:mx-0 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] flex-shrink-0">
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
                        transition:
                          "stroke-dashoffset 1200ms cubic-bezier(0.33, 1, 0.68, 1)",
                        filter: "drop-shadow(0 0 8px rgba(109,0,255,0.5))",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono font-bold text-[2.4rem] sm:text-[2.8rem] text-ngx-fg-1 leading-none tabular-nums">
                      {copy.scoreValue}
                    </span>
                    <span className="font-mono font-semibold text-xs text-white/55 mt-1.5 tabular-nums tracking-[0.05em]">
                      / {copy.scoreMax}
                    </span>
                  </div>
                </div>

                {/* Stat cluster: edad bio + cronológica + riesgo metabólico */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[color:var(--ngx-border-subtle)] bg-white/[0.025] p-3.5">
                    <span className="ngx-eyebrow !text-[10px] block" style={{ color: "var(--ngx-fg-3)" }}>
                      Edad cronológica
                    </span>
                    <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
                      {PROFILE_MOCK.chronologicalAge}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--ngx-border-subtle)] bg-white/[0.025] p-3.5">
                    <span className="ngx-eyebrow !text-[10px] block" style={{ color: "var(--ngx-fg-3)" }}>
                      Edad biológica est.
                    </span>
                    <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
                      {PROFILE_MOCK.biologicalAge}
                      <span
                        className="ml-1.5 align-middle text-xs font-medium"
                        style={{ color: "rgb(252, 211, 77)" }}
                      >
                        +{ageDelta}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--ngx-border-subtle)] bg-white/[0.025] p-3.5">
                    <span className="ngx-eyebrow !text-[10px] block" style={{ color: "var(--ngx-fg-3)" }}>
                      Riesgo metabólico
                    </span>
                    <p
                      className="mt-2 font-mono text-2xl font-bold tabular-nums"
                      style={{ color: risk.color }}
                    >
                      {risk.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score description */}
              <p className="relative z-10 mt-5 pt-5 border-t border-white/[0.06] font-body text-sm leading-relaxed text-ngx-fg-2">
                <span className="ngx-eyebrow !text-[10px] block mb-1.5" style={{ color: "var(--ngx-fg-3)" }}>
                  {copy.scoreLabel}
                </span>
                {copy.scoreDescription}
              </p>
            </div>

            {/* DIAGNÓSTICO: bottleneck + 3 palancas + error dominante */}
            <div className="ngx-metal-card p-5 md:p-6" style={{ borderColor: "rgba(109,0,255,0.28)" }}>
              <div className="relative z-10 space-y-5">
                {/* Bottleneck */}
                <div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-purple-light)" }}>
                      Tu palanca principal
                    </span>
                  </div>
                  <p className="mt-2 font-body font-bold text-base text-white leading-tight">
                    {PROFILE_MOCK.bottleneck.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    {PROFILE_MOCK.bottleneck.description}
                  </p>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* 3 palancas accionables */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                      Tus 3 palancas accionables
                    </span>
                  </div>
                  <ol className="space-y-3">
                    {PROFILE_MOCK.leverages.map((lever, idx) => {
                      const isPrimary = idx === 0;
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-3"
                          style={
                            isPrimary
                              ? {
                                  borderRadius: "0.75rem",
                                  padding: "0.75rem",
                                  background: "rgba(109,0,255,0.08)",
                                  border: "1px solid rgba(109,0,255,0.24)",
                                }
                              : undefined
                          }
                        >
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums"
                            style={{
                              background: isPrimary
                                ? "var(--ngx-purple)"
                                : "var(--ngx-purple-glass)",
                              color: isPrimary
                                ? "white"
                                : "var(--ngx-purple-light)",
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            {isPrimary && (
                              <span
                                className="ngx-eyebrow !text-[9px] block mb-1"
                                style={{ color: "var(--ngx-purple-light)" }}
                              >
                                Empieza por aquí
                              </span>
                            )}
                            <span
                              className={`text-sm leading-relaxed ${
                                isPrimary ? "text-white" : "text-white/72"
                              }`}
                            >
                              {lever}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Error dominante */}
                <div className="rounded-2xl p-4" style={{ background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.20)" }}>
                  <div className="flex items-start gap-3">
                    <span
                      className="ngx-icon-box h-8 w-8 shrink-0"
                      style={{
                        background: "rgba(245, 158, 11, 0.12)",
                        borderColor: "rgba(245, 158, 11, 0.28)",
                        color: "rgb(252, 211, 77)",
                      }}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="ngx-eyebrow !text-[10px] block" style={{ color: "rgba(252, 211, 77, 0.85)" }}>
                        Error dominante
                      </span>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/72">
                        {PROFILE_MOCK.dominantError}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROADMAP: mini-strip horizontal de 4 fases */}
            <div className="ngx-metal-card p-5 md:p-6">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                  <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                    Estructura HYBRID · 12 semanas
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {PROFILE_MOCK.roadmap.map((phase) => (
                    <div
                      key={phase.phase}
                      className="rounded-2xl border border-[color:var(--ngx-border-subtle)] bg-white/[0.025] p-3"
                    >
                      <span className="ngx-eyebrow !text-[9px] block" style={{ color: "var(--ngx-fg-3)" }}>
                        Fase {phase.phase}
                      </span>
                      <p className="mt-1.5 font-body font-bold text-sm text-white leading-tight">
                        {phase.title}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/40 tabular-nums">
                        Sem {phase.weeks}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Narrative + CTA — second on mobile, left on desktop. Sticky en
              desktop para que el CTA quede visible mientras el visitante
              scrollea por el dashboard mock (que es vertical y largo). */}
          <div className="order-2 lg:order-1 animate-on-scroll-left flex flex-col gap-6 lg:sticky lg:top-24">
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

            <div className="flex flex-col gap-3">
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

        {/* Disclaimer reforzado — separa promesa estimada de promesa clínica.
            Aplica para edad biológica est. y riesgo metabólico, que son
            heurísticas derivadas de mental logs + biometría declarada. */}
        <p className="mt-8 border-t border-white/[0.06] pt-5 text-center text-[11px] leading-relaxed text-white/45">
          Estimaciones derivadas de mental logs y biometría declarada. La edad
          biológica y el riesgo metabólico no sustituyen evaluación clínica ni
          medición de composición corporal (DEXA, BIA, marcadores de sangre).
        </p>
      </div>
    </section>
  );
}
