"use client";

/* eslint-disable @next/next/no-img-element */

import { Activity, ArrowRight, CalendarDays, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import type { Bottleneck, InsightsResult, TimelineEntry } from "@/types/ai";
import { getSeasonMilestoneLabel, type TransformMilestone } from "@/lib/seasonMilestones";
import { SocialShareButton } from "@/components/SocialShareButton";

interface UserInputSnapshot {
  age?: number;
  sex?: "male" | "female" | "other";
  heightCm?: number;
  weightKg?: number;
  level?: "novato" | "intermedio" | "avanzado";
  goal?: "definicion" | "masa" | "mixto";
  weeklyTime?: number;
  focusZone?: string;
  stressLevel?: number;
  sleepQuality?: number;
  disciplineRating?: number;
}

interface SeasonVisionReportProps {
  ai: InsightsResult;
  imageUrls: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
  shareId: string;
  isReady?: boolean;
  userInput?: UserInputSnapshot;
}

type SeasonStep = Extract<TransformMilestone, "m4" | "m8" | "m12">;

const SEASON_STEPS: SeasonStep[] = ["m4", "m8", "m12"];

const BOTTLENECK_LABELS: Record<Bottleneck, string> = {
  training_progression: "Entrenamiento sin progresión trazable",
  nutrition_consistency: "Nutrición inconsistente",
  recovery: "Recuperación insuficiente",
  structure: "Falta de estructura semanal",
  expectations: "Expectativas mal calibradas",
  accountability: "Falta de accountability externo",
};

const GOAL_LABELS: Record<NonNullable<UserInputSnapshot["goal"]>, string> = {
  definicion: "Definición",
  masa: "Masa muscular",
  mixto: "Recomposición",
};

const LEVEL_LABELS: Record<NonNullable<UserInputSnapshot["level"]>, string> = {
  novato: "Novato",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const FOCUS_LABELS: Record<string, string> = {
  upper: "Tren superior",
  lower: "Tren inferior",
  abs: "Core",
  full: "Cuerpo completo",
};

const statLabels = [
  { key: "strength", label: "Fuerza" },
  { key: "aesthetics", label: "Estética" },
  { key: "endurance", label: "Resistencia" },
  { key: "mental", label: "Mental" },
] as const;

function getStats(entry?: TimelineEntry) {
  return entry?.stats ?? { strength: 0, aesthetics: 0, endurance: 0, mental: 0 };
}

function getReadinessScore(ai: InsightsResult) {
  const diagnosticScore = ai.diagnostic?.muscle_health_score;
  if (typeof diagnosticScore === "number") return diagnosticScore;

  const baseline = getStats(ai.timeline.m0);
  return Math.round((baseline.strength + baseline.aesthetics + baseline.endurance + baseline.mental) / 4);
}

function getDelta(from: number, to: number) {
  const delta = to - from;
  if (delta === 0) return "0";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function getObservation(entry: TimelineEntry | undefined, index: number) {
  if (entry?.description) return entry.description;
  const fallbacks = [
    "Season 1 muestra la primera adaptación visible sobre el punto de partida.",
    "Season 2 muestra una etapa intermedia con más estructura, consistencia y control.",
    "Season 3 muestra la visualización final del ciclo completo de transformación.",
  ];
  return fallbacks[index];
}

function getCtaTargets() {
  const bookingUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "";
  const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappNumber = whatsappRaw.replace(/[^\d]/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hola, acabo de ver mi Season Vision Report en NGX Transform y quiero revisar el siguiente paso."
      )}`
    : "";

  return { bookingUrl, whatsappUrl };
}

export function SeasonVisionReport({
  ai,
  imageUrls,
  shareId,
  isReady = true,
  userInput,
}: SeasonVisionReportProps) {
  const originalImage = imageUrls.originalUrl;
  const season3Image = imageUrls.images?.m12 || imageUrls.images?.m8 || imageUrls.images?.m4;
  const heroAfterImage = season3Image || originalImage;
  const baselineStats = getStats(ai.timeline.m0);
  const finalStats = getStats(ai.timeline.m12);
  const readinessScore = getReadinessScore(ai);
  const bottleneck = ai.diagnostic?.bottleneck;
  const bottleneckLabel = bottleneck ? BOTTLENECK_LABELS[bottleneck] : "Lectura en calibración";
  const { bookingUrl, whatsappUrl } = getCtaTargets();

  const profileItems = [
    userInput?.age ? { label: "Edad", value: `${userInput.age}` } : null,
    userInput?.goal ? { label: "Objetivo", value: GOAL_LABELS[userInput.goal] } : null,
    userInput?.level ? { label: "Nivel", value: LEVEL_LABELS[userInput.level] } : null,
    userInput?.weeklyTime ? { label: "Tiempo", value: `${userInput.weeklyTime} h/sem` } : null,
    userInput?.focusZone ? { label: "Foco", value: FOCUS_LABELS[userInput.focusZone] ?? userInput.focusZone } : null,
    userInput?.sleepQuality ? { label: "Sueño", value: `${userInput.sleepQuality}/10` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <article className="relative text-white">
      <section className="relative px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="ngx-section-panel">
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                backgroundImage: "url('/images/backgrounds/results-abstract.svg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(109,0,255,0.12),transparent_32%),radial-gradient(circle_at_82%_22%,rgba(184,148,255,0.08),transparent_22%)] pointer-events-none" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div>
                <span className="ngx-eyebrow-pill mb-4">Season Vision Report</span>
                <h1 className="ngx-h1 !text-left">
                  Punto de partida, Season 1, Season 2 y Season 3.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/62 md:text-base">
                  Este reporte muestra tu punto de partida y tres visualizaciones generadas con IA para representar una posible evolución física durante el ciclo.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {statLabels.map((stat) => (
                    <div key={stat.key} className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <p className="font-mono text-2xl font-bold tabular-nums text-white">
                          {getDelta(baselineStats[stat.key], finalStats[stat.key])}
                        </p>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/42">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#season-visuals"
                    className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "var(--ngx-purple)",
                      boxShadow: "var(--ngx-glow-primary)",
                    }}
                  >
                    Ver visualizaciones
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#report-actions"
                    className="ngx-glass-clear inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
                  >
                    Ver siguiente paso
                  </a>
                </div>
              </div>

              <div className="ngx-metal-card !p-5 md:!p-6">
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                        Secuencia visual
                      </span>
                      <p className="mt-2 text-lg font-bold text-white">De hoy a Season 3</p>
                    </div>
                    <SocialShareButton shareId={shareId} imageUrl={heroAfterImage} />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ImagePanel
                      label={getSeasonMilestoneLabel("m0")}
                      imageUrl={originalImage}
                      alt="Punto de partida"
                      muted
                    />
                    {SEASON_STEPS.map((step) => (
                      <ImagePanel
                        key={step}
                        label={getSeasonMilestoneLabel(step)}
                        imageUrl={imageUrls.images?.[step]}
                        alt={getSeasonMilestoneLabel(step)}
                        accent={step === "m12"}
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Estado</p>
                      <p className="mt-1 text-sm font-medium text-white/78">
                        {isReady ? "Reporte listo" : "Reporte parcial mientras se generan visualizaciones"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/50">
                      4 hitos
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="ngx-section-panel !p-6 md:!p-8">
              <div className="relative z-10">
                <span className="ngx-eyebrow-pill mb-4">Baseline</span>
                <h2 className="ngx-section-heading">
                  Baseline del punto de partida.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/62">
                  {ai.insightsText}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Muscle Health Score</p>
                    <p className="mt-3 font-mono text-5xl font-bold tabular-nums text-white">
                      {readinessScore}
                      <span className="ml-2 text-lg text-white/35">/100</span>
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Palanca principal</p>
                    <p className="mt-3 text-base font-bold leading-snug text-white">
                      {bottleneckLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ngx-section-panel !p-6 md:!p-8">
              <div className="relative z-10">
                <span className="ngx-eyebrow-pill mb-4" data-accent="neutral">Contexto usado</span>
                {profileItems.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profileItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-3">
                        <span className="text-xs uppercase tracking-[0.16em] text-white/40">{item.label}</span>
                        <span className="text-sm font-semibold text-white/86">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-white/60">
                    El creador no compartió datos de perfil. El reporte público muestra solo la dirección visual autorizada.
                  </p>
                )}

                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Error dominante</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {ai.diagnostic?.dominant_error ||
                      "La lectura inicial identifica el factor principal que puede limitar el avance si no se trabaja con estructura."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="season-visuals" className="px-4 py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl">
          <div className="ngx-section-header">
            <div>
              <span className="ngx-eyebrow-pill mb-4">Tres visualizaciones</span>
              <h2 className="ngx-section-heading">Season 1, Season 2 y Season 3.</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
              Cada visualización representa una etapa distinta del ciclo: adaptación inicial, consolidación y cierre de temporada.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {SEASON_STEPS.map((step, index) => {
              const entry = ai.timeline[step];
              const stats = getStats(entry);
              const imageUrl = imageUrls.images?.[step];
              return (
                <section key={step} className="ngx-metal-card !p-4 md:!p-5">
                  <div className="relative z-10">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-white/[0.08] bg-black/50">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={getSeasonMilestoneLabel(step)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-white/35">
                          Procesando visual
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                      <div className="absolute left-3 top-3 rounded-full border border-white/[0.10] bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                        {getSeasonMilestoneLabel(step)}
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-bold leading-tight text-white">
                      {entry.title || getSeasonMilestoneLabel(step)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/62">
                      {getObservation(entry, index)}
                    </p>

                    <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/22 p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">Observación GENESIS</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/72">
                        {entry.mental || "La consistencia del sistema define si esta etapa puede sostenerse."}
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      {statLabels.map((stat) => (
                        <div key={stat.key} className="rounded-xl border border-white/[0.08] bg-white/[0.035] p-3">
                          <p className="font-mono text-lg font-bold tabular-nums text-white">
                            {stats[stat.key]}
                          </p>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/40">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <ShieldCheck className="h-6 w-6 shrink-0" style={{ color: "var(--ngx-purple-light)" }} />
            <div>
              <h2 className="text-lg font-bold text-white">Lectura aspiracional, no diagnóstico.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/66">
                Este Season Vision Report usa IA para generar visualizaciones a partir de una foto y datos de perfil. No promete resultados, no sustituye evaluación médica y no debe interpretarse como diagnóstico corporal, metabólico o psicológico.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="report-actions" className="px-4 py-12 scroll-mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="ngx-section-panel">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
              <div>
                <span className="ngx-eyebrow-pill mb-4">Siguiente paso</span>
                <h2 className="ngx-section-heading">Revisar el siguiente paso.</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/62 md:text-base">
                  Si quieres usar este reporte como punto de partida, puedes revisar las opciones de acompañamiento y solicitar una lectura del caso.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="#hybrid-offer"
                  className="inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--ngx-purple)",
                    boxShadow: "var(--ngx-glow-primary)",
                  }}
                >
                  Ver opciones
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#hybrid-offer"
                  className="ngx-glass-clear inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
                >
                  <FileText className="h-4 w-4" />
                  Solicitar revisión
                </a>
                {bookingUrl ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ngx-glass-clear inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Agendar revisión
                  </a>
                ) : null}
                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ngx-glass-clear inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function ImagePanel({
  label,
  imageUrl,
  alt,
  accent,
  muted,
}: {
  label: string;
  imageUrl?: string;
  alt: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[18px] border bg-white/[0.035]"
      style={{
        borderColor: accent ? "rgba(109,0,255,0.45)" : "rgba(255,255,255,0.08)",
        boxShadow: accent ? "0 0 24px rgba(109,0,255,0.16)" : undefined,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={`h-full w-full object-cover ${muted ? "grayscale-[0.45] brightness-[0.72]" : ""}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-white/[0.02] text-[10px] uppercase tracking-[0.18em] text-white/35">
          Procesando
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-x-3 bottom-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          {label}
        </p>
      </div>
    </div>
  );
}
