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
    "Primer cambio visible: postura, energía y señales de adaptación empiezan a responder.",
    "La estructura empieza a consolidarse. El cuerpo ya no depende solo de motivación.",
    "La visión completa muestra qué dirección tendría sentido sostener con un sistema real.",
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
        "Hola, acabo de ver mi Season Vision Report en NGX Transform y quiero entender HYBRID."
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
    <article className="relative min-h-screen text-white">
      <section className="relative min-h-[92vh] overflow-hidden px-4 pb-12 pt-20 md:pt-24">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_15%,rgba(109,0,255,0.22),transparent_34%),radial-gradient(circle_at_76%_18%,rgba(184,148,255,0.12),transparent_26%)]" />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(460px,1.14fr)] lg:items-center">
          <div className="max-w-2xl">
            <span className="ngx-eyebrow-pill mb-5">GENESIS · Season Vision Report</span>
            <h1 className="ngx-h1 !text-left">
              Tu dirección física, convertida en reporte.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/64 md:text-lg">
              GENESIS tomó tu punto de partida, tu contexto y las visualizaciones de temporada para separar lo aspiracional de lo accionable: qué se ve posible, qué te frena y qué siguiente paso tiene sentido.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#season-visuals"
                className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--ngx-purple)",
                  boxShadow: "var(--ngx-glow-primary)",
                }}
              >
                Ver mis Seasons
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#report-actions"
                className="ngx-glass-clear inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
              >
                Siguiente paso
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statLabels.map((stat) => (
                <div key={stat.key} className="border-t border-white/[0.10] pt-3">
                  <p className="font-mono text-2xl font-bold tabular-nums text-white">
                    {getDelta(baselineStats[stat.key], finalStats[stat.key])}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid gap-3 sm:grid-cols-2">
              <ImagePanel
                label={getSeasonMilestoneLabel("m0")}
                imageUrl={originalImage}
                alt="Punto de partida"
                muted
              />
              <ImagePanel
                label={getSeasonMilestoneLabel("m12")}
                imageUrl={heroAfterImage}
                alt="Season 3"
                accent
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Estado</p>
                <p className="mt-1 text-sm font-medium text-white/78">
                  {isReady ? "Reporte listo" : "Reporte parcial mientras se generan visuales"}
                </p>
              </div>
              <SocialShareButton shareId={shareId} imageUrl={heroAfterImage} />
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
                <h2 className="text-3xl font-bold tracking-[-0.02em] text-white md:text-4xl">
                  Tu punto de partida no es un juicio. Es el mapa.
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
                      "La lectura inicial sugiere que el cuello de botella no es solo esfuerzo: es la falta de un sistema que convierta intención en ejecución repetible."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="season-visuals" className="px-4 py-12 scroll-mt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <span className="ngx-eyebrow-pill mb-4">Tres visualizaciones</span>
            <h2 className="ngx-h1 !text-left">Season 1, 2 y 3 no son fechas. Son estados.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
              Cada visual muestra una etapa distinta de la misma dirección: adaptación, consolidación y visión completa.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {SEASON_STEPS.map((step, index) => {
              const entry = ai.timeline[step];
              const stats = getStats(entry);
              const imageUrl = imageUrls.images?.[step];
              return (
                <section key={step} className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-black/50">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/[0.10] bg-black/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                      {getSeasonMilestoneLabel(step)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold leading-tight text-white">
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
                        {entry.mental || "Sostener el sistema importa más que perseguir intensidad aislada."}
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
        <div className="mx-auto max-w-6xl rounded-[28px] border border-amber-400/20 bg-amber-400/[0.055] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <ShieldCheck className="h-6 w-6 shrink-0 text-amber-200" />
            <div>
              <h2 className="text-lg font-bold text-white">Lectura aspiracional, no diagnóstico.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/66">
                Este Season Vision Report usa IA para visualizar una dirección posible con base en tu foto y tus datos. No promete resultados, no sustituye evaluación médica y no debe interpretarse como diagnóstico corporal, metabólico o psicológico.
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
                <h2 className="ngx-h1 !text-left">Convierte esta visión en ejecución.</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/62 md:text-base">
                  Si la visualización te movió, el siguiente paso no es otra imagen. Es decidir si quieres estructura, revisión humana y seguimiento real.
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
                  Ver opciones HYBRID
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#hybrid-offer"
                  className="ngx-glass-clear inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-150 hover:bg-white/[0.10]"
                >
                  <FileText className="h-4 w-4" />
                  Recibir brief
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
      className="relative aspect-[4/5] overflow-hidden rounded-[28px] border bg-white/[0.035]"
      style={{
        borderColor: accent ? "rgba(109,0,255,0.45)" : "rgba(255,255,255,0.08)",
        boxShadow: accent ? "var(--ngx-glow-primary-soft)" : undefined,
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
      <div className="absolute inset-x-4 bottom-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
          {label}
        </p>
      </div>
    </div>
  );
}
