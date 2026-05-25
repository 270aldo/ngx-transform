"use client";

/**
 * SeasonRoadmap — Roadmap de temporada de 12 semanas (v12.1).
 *
 * Sustituye conceptualmente al "Plan de 7 días" hardcoded. No entrega contenido
 * prescriptivo (ejercicios, comidas, checklists); entrega DIRECCIÓN: las 4 fases
 * que vería un usuario que entra a NGX HYBRID. Es un puente entre el diagnóstico
 * (TransformationSummary + MuscleHealthScore) y la salida comercial (HybridOfferV2).
 *
 * Sin datos por usuario — el contenido es el de HYBRID, no del individuo. La
 * personalización vive en MuscleHealthScore (riesgo, palancas) y TransformationSummary
 * (bottleneck), no aquí.
 */

import { motion } from "framer-motion";
import {
  Anchor,
  ArrowRight,
  CheckCircle2,
  Flag,
  Hammer,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PhaseContent {
  number: 1 | 2 | 3 | 4;
  weeks: string;
  title: string;
  focus: string;
  outcomes: string[];
  icon: LucideIcon;
}

const PHASES: PhaseContent[] = [
  {
    number: 1,
    weeks: "Bloque 1",
    title: "Fundación",
    focus: "Baseline, técnica, frecuencia",
    outcomes: [
      "Establecer mínimos viables: proteína, sueño, adherencia",
      "Calibrar volumen real de entrenamiento (no aspiracional)",
      "Limpiar ruido en hábitos antes de meter intensidad",
    ],
    icon: Anchor,
  },
  {
    number: 2,
    weeks: "Bloque 2",
    title: "Construcción",
    focus: "Progresión de fuerza, recomposición",
    outcomes: [
      "Progresión semanal trazable en básicos",
      "Ajustes nutricionales con datos, no con intuición",
      "Hábitos sostenibles antes de optimización fina",
    ],
    icon: Hammer,
  },
  {
    number: 3,
    weeks: "Bloque 3",
    title: "Optimización",
    focus: "Refinar lo que funciona, reducir fricción",
    outcomes: [
      "Identificar qué entrenamiento te está dando ROI real",
      "Consolidar nutrición sin tracking obsesivo",
      "Recuperación como sistema, no como recurso",
    ],
    icon: Sparkles,
  },
  {
    number: 4,
    weeks: "Cierre",
    title: "Evaluación",
    focus: "Decidir siguiente temporada",
    outcomes: [
      "Medir resultados contra el baseline de Fase 1",
      "Decidir: ajustar, sostener, o upgrade a temporada nueva",
      "Salida con criterio, no con un plan PDF",
    ],
    icon: Flag,
  },
];

export function SeasonRoadmap() {
  return (
    <motion.section
      id="season-roadmap"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative w-full px-4 py-12 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="ngx-section-panel relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_22%_18%,rgba(109,0,255,0.06),transparent_38%)]" />

          <div className="relative z-10">
            <div className="max-w-3xl">
              <span className="ngx-eyebrow-pill mb-4">
                Estructura · NGX HYBRID
              </span>
              <h2 className="ngx-h1 !text-left">
                Así se vería tu temporada en HYBRID.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/62 md:text-base">
                Esto no es un plan personalizado que te bajas hoy. Es la estructura
                que sigue una temporada de 12 semanas en NGX HYBRID — GENESIS
                adapta cada semana, un coach humano valida, y cuatro fases con
                criterio de salida claro reemplazan el PDF que se pierde en la
                carpeta de descargas.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PHASES.map((phase, index) => {
                const Icon = phase.icon;
                const isLast = phase.number === 4;
                return (
                  <motion.div
                    key={phase.number}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.45,
                      ease: "easeOut",
                      delay: index * 0.08,
                    }}
                    className="ngx-metal-card !p-5 md:!p-6 relative overflow-hidden"
                    style={{
                      borderColor: isLast
                        ? "rgba(109,0,255,0.32)"
                        : undefined,
                    }}
                  >
                    {isLast && (
                      <div
                        className="absolute inset-x-0 top-0 h-[2px]"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light), var(--ngx-purple))",
                        }}
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <span
                          className="ngx-eyebrow !text-[10px]"
                          style={{ color: "var(--ngx-fg-3)" }}
                        >
                          Fase {phase.number} · {phase.weeks}
                        </span>
                        <span
                          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: isLast
                              ? "rgba(109,0,255,0.18)"
                              : "rgba(255,255,255,0.04)",
                            border: isLast
                              ? "1px solid rgba(109,0,255,0.38)"
                              : "1px solid rgba(255,255,255,0.10)",
                          }}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{
                              color: isLast
                                ? "var(--ngx-purple-light)"
                                : "rgba(255,255,255,0.78)",
                            }}
                          />
                        </span>
                      </div>

                      <h3 className="text-xl font-bold leading-tight text-white">
                        {phase.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                        {phase.focus}
                      </p>

                      <div className="my-4 h-px bg-white/[0.06]" />

                      <ul className="space-y-2.5">
                        {phase.outcomes.map((outcome) => (
                          <li
                            key={outcome}
                            className="flex items-start gap-2.5"
                          >
                            <CheckCircle2
                              className="mt-0.5 h-3.5 w-3.5 shrink-0"
                              style={{
                                color: isLast
                                  ? "var(--ngx-purple-light)"
                                  : "rgba(255,255,255,0.45)",
                              }}
                            />
                            <span className="text-xs leading-relaxed text-white/70">
                              {outcome}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-sm leading-relaxed text-white/55 max-w-2xl">
                NGX HYBRID es eso: 12 semanas con dirección, no 7 días con
                rutinas. La decisión es si quieres ejecutarlo solo, con
                acompañamiento, o probar primero.
              </p>
              <a
                href="#hybrid-offer"
                className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/85 transition-colors hover:text-white"
              >
                Ver opciones de entrada
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default SeasonRoadmap;
