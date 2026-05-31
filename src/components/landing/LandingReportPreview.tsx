"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Target,
} from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { ReportPreviewCopy } from "@/config/landing/types";

const FALLBACK: ReportPreviewCopy = {
  sectionLabel: "Ejemplo de resultado",
  headline: "Así debería sentirse tu resultado.",
  subtitle:
    "No como una imagen suelta. Como una primera lectura: dónde estás, qué podría hacer falta y qué paso conviene tomar.",
  scoreLabel: "Score de preparación",
  scoreValue: 72,
  scoreMax: 100,
  scoreDescription:
    "Buen punto para empezar, pero con riesgo de abandono si no hay estructura semanal.",
  dimensions: [],
  insights: [],
  ctaLabel: "Iniciar diagnóstico",
  ctaHref: "/wizard",
  microcopy: "Ejemplo ilustrativo. Tu resultado se genera con tus datos.",
};

const LEFT_BULLETS = [
  "Qué podría hacer falta.",
  "La palanca que conviene mover primero.",
  "Un paso concreto para empezar con criterio.",
] as const;

/**
 * Mockup fiel al output real del producto (MuscleHealthScore + bottleneck +
 * SeasonRoadmap). DATOS de perfil tipo — hardcoded para mostrar la
 * estructura real que recibe el usuario en /s/[shareId].
 */
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
    "Horario fijo para entrenar antes de negociar con la semana",
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

/**
 * LandingReportPreview — "Así debería sentirse tu resultado".
 *
 * Una sola composición desktop: narrativa sticky a la izquierda y reporte
 * agrupado a la derecha. Evita el doble split que dejaba aire muerto entre
 * header, CTA y mockup.
 */
export function LandingReportPreview() {
  const { config, trackCta } = useLandingConfig();
  const copy = config.copy.reportPreview ?? FALLBACK;

  const scorePct = Math.round((copy.scoreValue / copy.scoreMax) * 100);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePct / 100) * circumference;

  const ageDelta = PROFILE_MOCK.biologicalAge - PROFILE_MOCK.chronologicalAge;
  const risk = RISK_BADGE[PROFILE_MOCK.metabolicRisk];

  return (
    <section
      id="reporte-ejemplo"
      className="relative w-full px-4 pt-16 pb-24 md:pt-20 md:pb-28 scroll-mt-0"
    >
      {/* Vignetting purple suave — la sección está en el centro del landing,
          tono brand neutro */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 80% 18%, rgba(109,0,255,0.08), transparent 38%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
          {/* COLUMNA IZQUIERDA — narrativa sticky */}
          <div className="animate-on-scroll-left lg:sticky lg:top-24">
            <div className="mb-6 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-10"
                style={{ background: "rgba(184,148,255,0.55)" }}
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--ngx-purple-light)" }}
              >
                {copy.sectionLabel}
              </span>
            </div>

            <h2 className="ngx-h1 !text-left max-w-[12ch]">
              {copy.headline}
            </h2>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/62">
              {copy.subtitle}
            </p>

            <div className="mt-10">
              <h3 className="ngx-h3 !text-left">
                Una lectura inicial,
                <br />
                no una imagen suelta.
              </h3>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-white/65">
                Combinas un score de preparación con palancas concretas y un
                siguiente paso. Sales sabiendo por dónde empezar — y si lo
                puedes sostener solo o necesitas soporte.
              </p>
            </div>

            <ul className="mt-6 flex flex-col gap-2.5">
              {LEFT_BULLETS.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-2.5 text-sm text-white/65"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--ngx-purple-light)" }}
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href={copy.ctaHref}
                onClick={() =>
                  trackCta("report_preview_cta", "diagnostic_start", copy.ctaLabel)
                }
                className="ngx-primary-cta group inline-flex w-full px-6 text-sm sm:w-auto sm:min-w-[220px]"
              >
                <span>{copy.ctaLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <p className="text-xs leading-relaxed text-white/40">
                {copy.microcopy}
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA — reporte agrupado */}
          <div className="animate-on-scroll-right delay-100 ngx-section-panel !p-0 overflow-hidden">
            {/* HERO STATS — score circular dominante + edad bio + metabolic */}
            <div className="grid gap-7 p-5 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-8 md:p-7">
              {/* Score circular grande (sin card) */}
              <div className="relative mx-auto h-[148px] w-[148px] flex-shrink-0 md:mx-0">
                <svg
                  viewBox="0 0 144 144"
                  className="h-full w-full -rotate-90"
                  aria-hidden
                >
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="var(--ngx-purple)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{
                      transition:
                        "stroke-dashoffset 1200ms cubic-bezier(0.33, 1, 0.68, 1)",
                      filter: "drop-shadow(0 0 14px rgba(109,0,255,0.55))",
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-[3rem] tabular-nums leading-none tracking-[-0.03em] text-white">
                    {copy.scoreValue}
                  </span>
                  <span className="font-mono font-semibold text-xs text-white/45 mt-2 tabular-nums tracking-[0.05em]">
                    / {copy.scoreMax}
                  </span>
                </div>
              </div>

              {/* Stats inline editorial — sin cards */}
              <div className="space-y-4">
                <div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-[0.28em]"
                    style={{ color: "var(--ngx-purple-light)" }}
                  >
                    {copy.scoreLabel}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-[0.97rem]">
                    {copy.scoreDescription}
                  </p>
                </div>

                {/* Edad bio + cronológica + riesgo metabólico — sin cards */}
                <div className="flex flex-wrap items-baseline gap-x-7 gap-y-3 pt-2">
                  <Stat label="Edad cronológica" value={String(PROFILE_MOCK.chronologicalAge)} />
                  <Stat
                    label="Edad biológica est."
                    value={String(PROFILE_MOCK.biologicalAge)}
                    suffix={ageDelta > 0 ? `+${ageDelta}` : `${ageDelta}`}
                    suffixColor="rgb(252, 211, 77)"
                  />
                  <Stat
                    label="Riesgo metabólico"
                    value={risk.label}
                    valueColor={risk.color}
                  />
                </div>
              </div>
            </div>

            <Hairline />

            {/* BOTTLENECK */}
            <div className="p-5 md:p-7">
              <div className="flex items-center gap-2 mb-3">
                <Target
                  className="h-4 w-4"
                  style={{ color: "var(--ngx-purple-light)" }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "var(--ngx-purple-light)" }}
                >
                  Tu palanca principal
                </span>
              </div>
              <p className="font-body font-bold text-lg md:text-xl text-white tracking-[-0.018em] leading-tight">
                {PROFILE_MOCK.bottleneck.label}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/62 md:text-[0.97rem]">
                {PROFILE_MOCK.bottleneck.description}
              </p>
            </div>

            <Hairline />

            {/* PALANCAS — palanca #1 destacada como "Empieza por aquí" */}
            <div className="p-5 md:p-7">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle2
                  className="h-4 w-4"
                  style={{ color: "var(--ngx-purple-light)" }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "rgba(184,148,255,0.7)" }}
                >
                  Tus 3 palancas accionables
                </span>
              </div>

              <ol className="space-y-3.5">
                {PROFILE_MOCK.leverages.map((lever, idx) => {
                  const isPrimary = idx === 0;
                  return (
                    <li
                      key={idx}
                      className="flex items-start gap-3.5"
                      style={
                        isPrimary
                          ? {
                              borderRadius: "0.75rem",
                              padding: "0.85rem 1rem",
                              background: "rgba(109,0,255,0.08)",
                              border: "1px solid rgba(109,0,255,0.22)",
                            }
                          : { padding: "0 1rem" }
                      }
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums"
                        style={{
                          background: isPrimary
                            ? "var(--ngx-purple)"
                            : "transparent",
                          border: isPrimary
                            ? "none"
                            : "1px solid rgba(184,148,255,0.35)",
                          color: isPrimary
                            ? "white"
                            : "rgba(184,148,255,0.85)",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {isPrimary && (
                          <span
                            className="font-mono text-[9px] uppercase tracking-[0.22em] block mb-1"
                            style={{ color: "var(--ngx-purple-light)" }}
                          >
                            Empieza por aquí
                          </span>
                        )}
                        <span
                          className={`text-sm leading-relaxed md:text-[0.95rem] ${
                            isPrimary ? "text-white" : "text-white/68"
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

            <Hairline />

            {/* ERROR DOMINANTE */}
            <div className="flex items-start gap-4 p-5 md:p-7">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "rgba(245, 158, 11, 0.10)",
                  border: "1px solid rgba(245, 158, 11, 0.32)",
                  color: "rgb(252, 211, 77)",
                }}
              >
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.28em]"
                  style={{ color: "rgba(252, 211, 77, 0.85)" }}
                >
                  Error dominante
                </span>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 md:text-[0.97rem]">
                  {PROFILE_MOCK.dominantError}
                </p>
              </div>
            </div>

            <Hairline />

            {/* ROADMAP — timeline horizontal inline (no cards) */}
            <div className="p-5 md:p-7">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.28em] block mb-5"
                style={{ color: "rgba(184,148,255,0.7)" }}
              >
                Estructura HYBRID · 12 semanas
              </span>

              <div className="relative">
                {/* Connector line horizontal entre fases */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-4 right-4 top-[14px] h-px hidden sm:block"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(184,148,255,0.45), rgba(184,148,255,0.18) 75%, transparent)",
                  }}
                />

                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
                  {PROFILE_MOCK.roadmap.map((phase, idx) => (
                    <div key={phase.phase} className="relative">
                      {/* Dot conector */}
                      <div
                        className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums sm:mx-0"
                        style={{
                          background:
                            idx === 0
                              ? "rgba(109,0,255,0.18)"
                              : "rgba(8,4,15,1)",
                          border:
                            idx === 0
                              ? "1.5px solid var(--ngx-purple-light)"
                              : "1px solid rgba(184,148,255,0.35)",
                          color:
                            idx === 0
                              ? "var(--ngx-purple-light)"
                              : "rgba(184,148,255,0.7)",
                        }}
                      >
                        {phase.phase}
                      </div>

                      <p className="text-center sm:text-left font-body font-bold text-sm md:text-[0.95rem] text-white leading-tight">
                        {phase.title}
                      </p>
                      <p className="mt-1 text-center sm:text-left font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 tabular-nums">
                        Sem {phase.weeks}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DISCLAIMER al pie — sin border-top, solo separation */}
        <p className="mt-20 max-w-3xl mx-auto text-center text-[11px] leading-relaxed text-white/40">
          Estimaciones derivadas de mental logs y biometría declarada. La edad
          biológica y el riesgo metabólico no sustituyen evaluación clínica ni
          medición de composición corporal (DEXA, BIA, marcadores de sangre).
        </p>
      </div>
    </section>
  );
}

/* ──────────── Helpers ──────────── */

function Hairline() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04) 60%, transparent)",
      }}
    />
  );
}

function Stat({
  label,
  value,
  suffix,
  suffixColor,
  valueColor,
}: {
  label: string;
  value: string;
  suffix?: string;
  suffixColor?: string;
  valueColor?: string;
}) {
  return (
    <div>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em] block"
        style={{ color: "var(--ngx-fg-3)" }}
      >
        {label}
      </span>
      <p
        className="mt-2 font-mono text-2xl font-bold tabular-nums leading-none"
        style={{ color: valueColor ?? "white" }}
      >
        {value}
        {suffix && (
          <span
            className="ml-1.5 align-middle text-xs font-medium"
            style={{ color: suffixColor ?? "rgba(255,255,255,0.55)" }}
          >
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
