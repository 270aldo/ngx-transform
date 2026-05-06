"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MuscleHealthScoreProps {
  shareId: string;
  score?: number;
  chronologicalAge?: number;
  biologicalAge?: number;
  sarcopeniaRisk?: "BAJO" | "MEDIO" | "ALTO";
  levers?: string[];
  dominantError?: string;
  className?: string;
}

const DEFAULT_LEVERS = [
  "Entrenamiento de fuerza 3x/semana con progresión clara",
  "Proteína >1.6g/kg/día con foco en recuperación",
  "Sueño de 7-9h para sostener adaptación muscular",
];

const DEFAULT_ERROR =
  "Cardio excesivo sin contrarrestar pérdida muscular: el error que más acelera el envejecimiento metabólico.";

const RISK_CONFIG: Record<
  "BAJO" | "MEDIO" | "ALTO",
  { label: string; color: string; bg: string; border: string }
> = {
  BAJO: { label: "Bajo", color: "text-[var(--ngx-success)]", bg: "bg-[var(--ngx-success)]/10", border: "border-[var(--ngx-success)]/30" },
  MEDIO: { label: "Medio", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  ALTO: { label: "Alto", color: "text-[var(--ngx-error)]", bg: "bg-[var(--ngx-error)]/10", border: "border-[var(--ngx-error)]/30" },
};

export function MuscleHealthScore({
  shareId,
  score = 78,
  chronologicalAge = 38,
  biologicalAge = 41,
  sarcopeniaRisk = "MEDIO",
  levers = DEFAULT_LEVERS,
  dominantError = DEFAULT_ERROR,
  className,
}: MuscleHealthScoreProps) {
  const risk = RISK_CONFIG[sarcopeniaRisk];
  const ageDelta = biologicalAge - chronologicalAge;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("w-full px-4 py-10", className)}
    >
      <div className="mx-auto max-w-5xl">
        <div className="ngx-section-panel">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,0,255,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(184,148,255,0.08),transparent_28%)] pointer-events-none" />

          <div className="relative z-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <span className="ngx-eyebrow-pill mb-4">Genesis · lectura inicial</span>
                <h2 className="ngx-h1 !text-left">
                  Señales de salud muscular.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
                  Esta lectura no sustituye una evaluación médica. Sirve para aterrizar el wow de la visualización en algo más útil: contexto, palancas y dirección.
                </p>

                <div className="mt-8 ngx-metal-card !p-5 md:!p-6">
                  <div className="relative z-10">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Indicador inicial</span>
                      <p className="mt-2 font-mono font-bold text-[4rem] tabular-nums leading-none tracking-[-0.04em] text-white md:text-[4.8rem]">
                        {score}
                        <span className="ml-2 text-xl font-medium tracking-normal text-white/35 md:text-2xl">/100</span>
                      </p>
                    </div>
                    <div className="rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/45 whitespace-nowrap">
                      Score orientativo
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full border border-[color:var(--ngx-border-subtle)] bg-white/[0.06]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, var(--ngx-purple-deep), var(--ngx-purple), var(--ngx-purple-light))",
                        boxShadow: "0 0 12px rgba(109,0,255,0.40)",
                      }}
                    />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Edad cronológica</span>
                        <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">{chronologicalAge}</p>
                      </div>
                    </div>
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Edad biológica est.</span>
                        <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">{biologicalAge}</p>
                      </div>
                    </div>
                    <div className="ngx-metal-card !p-4">
                      <div className="relative z-10">
                        <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Diferencia</span>
                        <p
                          className="mt-2 font-mono text-2xl font-bold tabular-nums"
                          style={{ color: ageDelta > 0 ? "rgb(252, 211, 77)" : "var(--ngx-success)" }}
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
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Riesgo de sarcopenia</span>
                      <p className="mt-2 text-base font-bold text-white">Lectura inicial del punto de partida</p>
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
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Tus 3 palancas accionables</span>
                    {levers.slice(0, 3).map((lever, index) => (
                      <div key={lever} className="ngx-metal-card !p-4">
                        <div className="relative z-10 flex items-start gap-3">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums"
                            style={{
                              background: "var(--ngx-purple-glass)",
                              color: "var(--ngx-purple-light)",
                            }}
                          >
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed text-white/75">{lever}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>

                <div className="ngx-metal-card !p-5 md:!p-6" style={{ borderColor: "rgba(245, 158, 11, 0.25)" }}>
                  <div className="relative z-10 flex items-start gap-3">
                    <span className="ngx-icon-box h-9 w-9 shrink-0" style={{ background: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.30)", color: "rgb(252, 211, 77)" }}>
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="ngx-eyebrow !text-[10px]" style={{ color: "rgba(252, 211, 77, 0.8)" }}>Error dominante</span>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">{dominantError}</p>
                    </div>
                  </div>
                </div>

                <div className="ngx-metal-card !p-5 md:!p-6">
                  <div className="relative z-10">
                  <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Siguiente paso recomendado</span>
                  <p className="mt-2 text-sm leading-relaxed text-white/68">
                    Antes de pensar en HYBRID, conviene entender qué hábitos, estructura y nivel de compromiso te acercarían a esa versión.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/s/${shareId}/plan`}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97]"
                      style={{
                        backgroundColor: "var(--ngx-purple)",
                        boxShadow: "var(--ngx-glow-primary)",
                      }}
                    >
                      <Zap className="h-4 w-4" />
                      Ver el roadmap
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={process.env.NEXT_PUBLIC_BOOKING_URL || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
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
              Estas señales son orientativas y motivacionales. No sustituyen evaluación médica ni medición clínica.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
