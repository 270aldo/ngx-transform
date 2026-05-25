"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Diagnostic, Bottleneck } from "@/types/ai";

interface UserInputSnapshot {
  age?: number;
  sleepQuality?: number;
  disciplineRating?: number;
  stressLevel?: number;
  weeklyTime?: number;
  goal?: "definicion" | "masa" | "mixto";
}

interface MuscleHealthScoreProps {
  /** Mantenido para compatibilidad con call sites existentes; ya no se usa internamente. */
  shareId?: string;
  diagnostic?: Diagnostic;
  userInput?: UserInputSnapshot;
  className?: string;
}

const RISK_CONFIG: Record<
  "BAJO" | "MEDIO" | "ALTO",
  { label: string; color: string; bg: string; border: string }
> = {
  BAJO: {
    label: "Bajo",
    color: "text-[var(--ngx-success)]",
    bg: "bg-[var(--ngx-success)]/10",
    border: "border-[var(--ngx-success)]/30",
  },
  MEDIO: {
    label: "Medio",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  ALTO: {
    label: "Alto",
    color: "text-[var(--ngx-error)]",
    bg: "bg-[var(--ngx-error)]/10",
    border: "border-[var(--ngx-error)]/30",
  },
};

const BOTTLENECK_TO_LEVERAGES: Record<Bottleneck, string[]> = {
  training_progression: [
    "Progresar carga 2.5–5% por semana en básicos (sentadilla, banca, peso muerto, remo)",
    "Registrar series y reps cada sesión — sin trazabilidad no hay progresión real",
    "Auto-regular intensidad por RPE, no por motivación del día",
  ],
  nutrition_consistency: [
    "Subir proteína a 1.6–2g por kg de peso, en 4 ingestas estables",
    "Estandarizar 80% de las comidas; el caos viene de improvisar",
    "Tracking de calorías 5 días/semana, no 7 — sostenibilidad sobre perfección",
  ],
  recovery: [
    "Bloquear 7–9 horas de sueño con horario consistente (mismo dormir/levantarse)",
    "Una semana de descarga cada 4–6 semanas, no opcional",
    "Reducir cardio si el estrés ya está alto — la recuperación es finita",
  ],
  structure: [
    "Plan semanal escrito antes del lunes — no improvisar día a día",
    "Sesiones con duración fija (no más de 60–75 min de gym efectivo)",
    "Bloquear 3–4 sesiones inamovibles antes que aspirar a 6 que no ocurren",
  ],
  expectations: [
    "Objetivos de proceso (3 sesiones/sem) antes que de resultado (perder X kg)",
    "Métrica primaria mensual, no diaria — el espejo y la báscula mienten en ventana corta",
    "Definir éxito como adherencia >85%, no como transformación visible en una ventana corta",
  ],
  accountability: [
    "Reportar progreso semanal a alguien que pregunte de vuelta",
    "Calendario público de entrenamientos — mismo principio que reuniones de trabajo",
    "Revisión mensual con criterio externo, no solo auto-evaluación",
  ],
};

const BOTTLENECK_TO_ERROR: Record<Bottleneck, string> = {
  training_progression:
    "Entrenas con consistencia pero sin progresión trazable: el sistema deja de adaptarse a las pocas semanas y entras en plateau silencioso.",
  nutrition_consistency:
    "Tu nutrición varía demasiado entre días: la inconsistencia es el factor #1 que neutraliza ganancias de fuerza, antes que la calidad del plan.",
  recovery:
    "Estás acumulando deuda de recuperación: sueño y descarga insuficientes hacen que el volumen extra de entrenamiento te quite resultado, no te dé más.",
  structure:
    "Entrenas sin estructura semanal clara: lo que parece flexibilidad termina siendo improvisación, y la improvisación cuesta meses.",
  expectations:
    "Estás midiendo el progreso con la ventana equivocada: una ventana corta no muestra transformación, y la frustración prematura sabotea la siguiente etapa.",
  accountability:
    "Estás operando sin accountability externo: sin alguien que pregunte de vuelta, la disciplina necesita ser identidad — y eso lleva años, no semanas.",
};

const FALLBACK_LEVERAGES = [
  "Entrenamiento de fuerza 3x/semana con progresión clara y trazable",
  "Proteína >1.6g/kg/día distribuida en 4 ingestas",
  "Sueño de 7–9h con horario consistente para sostener adaptación",
];

const FALLBACK_ERROR =
  "Sin estructura semanal trazable, lo que parece flexibilidad se traduce en meses perdidos: el bottleneck no es esfuerzo, es sistema.";

interface ResolvedSignals {
  score: number;
  chronologicalAge: number;
  biologicalAge: number;
  metabolicRisk: "BAJO" | "MEDIO" | "ALTO";
  leverages: string[];
  dominantError: string;
}

function resolveSignals(
  diagnostic: Diagnostic | undefined,
  input: UserInputSnapshot | undefined
): ResolvedSignals {
  // Heuristic baseline derived from user input — NOT hardcoded constants.
  const age = input?.age ?? 32;
  const sleepQ = input?.sleepQuality ?? 6;
  const disciplineR = input?.disciplineRating ?? 6;
  const stress = input?.stressLevel ?? 5;

  const stressPenalty = Math.max(0, stress - 5) * 0.3;
  const sleepPenalty = Math.max(0, 7 - sleepQ) * 0.55;
  const disciplinePenalty = Math.max(0, 7 - disciplineR) * 0.35;

  const heuristicBio = Math.round(
    age + sleepPenalty + disciplinePenalty + stressPenalty
  );

  const ageDelta = heuristicBio - age;
  const heuristicScore = Math.max(
    35,
    Math.min(95, 88 - Math.round(ageDelta * 2.4))
  );

  let heuristicRisk: "BAJO" | "MEDIO" | "ALTO" = "BAJO";
  if (age > 40 && (sleepQ < 6 || disciplineR < 5)) {
    heuristicRisk = "ALTO";
  } else if (sleepQ < 6 || disciplineR < 5 || stress > 7 || age > 40) {
    heuristicRisk = "MEDIO";
  }

  const bottleneck = diagnostic?.bottleneck;
  const fromBottleneck = bottleneck
    ? BOTTLENECK_TO_LEVERAGES[bottleneck]
    : undefined;
  const errorFromBottleneck = bottleneck
    ? BOTTLENECK_TO_ERROR[bottleneck]
    : undefined;

  return {
    score: diagnostic?.muscle_health_score ?? heuristicScore,
    chronologicalAge: age,
    biologicalAge: diagnostic?.biological_age_estimate ?? heuristicBio,
    metabolicRisk: diagnostic?.metabolic_risk ?? heuristicRisk,
    leverages:
      diagnostic?.leverages?.length && diagnostic.leverages.length >= 2
        ? diagnostic.leverages.slice(0, 3)
        : fromBottleneck ?? FALLBACK_LEVERAGES,
    dominantError:
      diagnostic?.dominant_error ?? errorFromBottleneck ?? FALLBACK_ERROR,
  };
}

export function MuscleHealthScore({
  diagnostic,
  userInput,
  className,
}: MuscleHealthScoreProps) {
  const signals = resolveSignals(diagnostic, userInput);
  const risk = RISK_CONFIG[signals.metabolicRisk];
  const ageDelta = signals.biologicalAge - signals.chronologicalAge;

  const handleScrollToRoadmap = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    const target = document.getElementById("season-roadmap");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full px-4 py-10", className)}
    >
      <div className="mx-auto max-w-5xl">
        <div className="ngx-section-panel">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,0,255,0.06),transparent_38%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <span className="ngx-eyebrow-pill mb-4">
                  Genesis · lectura inicial
                </span>
                <h2 className="ngx-h1 !text-left">
                  Señales de salud muscular.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                  Esta lectura no sustituye una evaluación médica. Sirve para
                  aterrizar el wow de la visualización en algo más útil:
                  contexto, palancas y dirección.
                </p>

                <div className="mt-8 ngx-metal-card !p-5 md:!p-6">
                  <div className="relative z-10">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <span
                          className="ngx-eyebrow !text-[10px]"
                          style={{ color: "var(--ngx-fg-3)" }}
                        >
                          Indicador inicial
                        </span>
                        <p className="mt-2 font-mono font-bold text-[4rem] tabular-nums leading-none tracking-[-0.04em] text-white md:text-[4.8rem]">
                          {signals.score}
                          <span className="ml-2 text-xl font-medium tracking-normal text-white/35 md:text-2xl">
                            /100
                          </span>
                        </p>
                      </div>
                      <div className="rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/45 whitespace-nowrap">
                        Score orientativo
                      </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${signals.score}%` }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--ngx-purple-deep), var(--ngx-purple), var(--ngx-purple-light))",
                          boxShadow: "0 0 12px rgba(109,0,255,0.40)",
                        }}
                      />
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="ngx-metal-card !p-4">
                        <div className="relative z-10">
                          <span
                            className="ngx-eyebrow !text-[10px]"
                            style={{ color: "var(--ngx-fg-3)" }}
                          >
                            Edad cronológica
                          </span>
                          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
                            {signals.chronologicalAge}
                          </p>
                        </div>
                      </div>
                      <div className="ngx-metal-card !p-4">
                        <div className="relative z-10">
                          <span
                            className="ngx-eyebrow !text-[10px]"
                            style={{ color: "var(--ngx-fg-3)" }}
                          >
                            Edad biológica est.
                          </span>
                          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">
                            {signals.biologicalAge}
                          </p>
                        </div>
                      </div>
                      <div className="ngx-metal-card !p-4">
                        <div className="relative z-10">
                          <span
                            className="ngx-eyebrow !text-[10px]"
                            style={{ color: "var(--ngx-fg-3)" }}
                          >
                            Diferencia
                          </span>
                          <p
                            className="mt-2 font-mono text-2xl font-bold tabular-nums"
                            style={{
                              color:
                                ageDelta > 0
                                  ? "rgb(252, 211, 77)"
                                  : "var(--ngx-success)",
                            }}
                          >
                            {ageDelta > 0 ? `+${ageDelta}` : ageDelta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="ngx-metal-card !p-5 md:!p-6">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span
                          className="ngx-eyebrow !text-[10px]"
                          style={{ color: "var(--ngx-fg-3)" }}
                        >
                          Riesgo metabólico
                        </span>
                        <p className="mt-2 text-base font-bold text-white">
                          Lectura inicial del punto de partida
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]",
                          risk.color,
                          risk.bg,
                          risk.border
                        )}
                      >
                        {risk.label}
                      </span>
                    </div>

                    <div className="my-5 h-px bg-white/[0.06]" />

                    <div className="space-y-3">
                      <span
                        className="ngx-eyebrow !text-[10px]"
                        style={{ color: "var(--ngx-fg-3)" }}
                      >
                        Tus 3 palancas accionables
                      </span>
                      {signals.leverages.slice(0, 3).map((lever, index) => {
                        const isPrimary = index === 0;
                        return (
                          <div
                            key={lever}
                            className="ngx-metal-card !p-4"
                            style={
                              isPrimary
                                ? {
                                    borderColor: "rgba(109,0,255,0.32)",
                                    background:
                                      "linear-gradient(180deg, rgba(109,0,255,0.10), rgba(109,0,255,0.03))",
                                  }
                                : undefined
                            }
                          >
                            <div className="relative z-10 flex items-start gap-3">
                              <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums"
                                style={{
                                  background: isPrimary
                                    ? "var(--ngx-purple)"
                                    : "var(--ngx-purple-glass)",
                                  color: isPrimary
                                    ? "white"
                                    : "var(--ngx-purple-light)",
                                }}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                {isPrimary && (
                                  <span
                                    className="ngx-eyebrow !text-[9px] block mb-1"
                                    style={{ color: "var(--ngx-purple-light)" }}
                                  >
                                    Empieza por aquí
                                  </span>
                                )}
                                <p
                                  className={`text-sm leading-relaxed ${
                                    isPrimary ? "text-white" : "text-white/75"
                                  }`}
                                >
                                  {lever}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="ngx-metal-card !p-5 md:!p-6"
                  style={{ borderColor: "rgba(245, 158, 11, 0.25)" }}
                >
                  <div className="relative z-10 flex items-start gap-3">
                    <span
                      className="ngx-icon-box h-9 w-9 shrink-0"
                      style={{
                        background: "rgba(245, 158, 11, 0.12)",
                        borderColor: "rgba(245, 158, 11, 0.30)",
                        color: "rgb(252, 211, 77)",
                      }}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <span
                        className="ngx-eyebrow !text-[10px]"
                        style={{ color: "rgba(252, 211, 77, 0.8)" }}
                      >
                        Error dominante
                      </span>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">
                        {signals.dominantError}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="ngx-metal-card !p-5 md:!p-6">
                  <div className="relative z-10">
                    <span
                      className="ngx-eyebrow !text-[10px]"
                      style={{ color: "var(--ngx-fg-3)" }}
                    >
                      Siguiente paso recomendado
                    </span>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Antes de pensar en HYBRID, conviene entender qué hábitos,
                      estructura y nivel de compromiso te acercarían a esa
                      versión.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <a
                        href="#season-roadmap"
                        onClick={handleScrollToRoadmap}
                        className="ngx-primary-cta inline-flex px-5 py-4 text-sm"
                      >
                        <Zap className="h-4 w-4" />
                        Ver el roadmap
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <a
                        href="#hybrid-offer"
                        className="ngx-glass-clear inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
                      >
                        <Shield className="h-4 w-4" />
                        Hablar con un coach
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-white/35">
              Estas señales son orientativas y motivacionales. No sustituyen
              evaluación médica ni medición clínica.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
