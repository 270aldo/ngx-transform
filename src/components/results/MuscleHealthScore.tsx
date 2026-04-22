"use client";

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
  BAJO: { label: "Bajo", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  MEDIO: { label: "Medio", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  ALTO: { label: "Alto", color: "text-red-300", bg: "bg-red-500/10", border: "border-red-500/30" },
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
        <div className="relative overflow-hidden rounded-[32px] landing-surface-strong p-6 md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(109,0,255,0.14),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(184,148,255,0.08),transparent_28%)]" />

          <div className="relative z-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
              <div>
                <p className="landing-kicker mb-4">Genesis · lectura inicial</p>
                <h2 className="landing-heading text-[2.2rem] leading-[0.92] text-white md:text-[3rem]">
                  Señales de salud
                  <br />
                  muscular.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/58 md:text-base">
                  Esta lectura no sustituye una evaluación médica. Sirve para aterrizar el wow de la visualización en algo más útil: contexto, palancas y dirección.
                </p>

                <div className="mt-8 rounded-[28px] landing-surface p-5 md:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Indicador inicial</p>
                      <p className="mt-3 text-[4rem] font-black italic leading-none tracking-[-0.08em] text-white md:text-[4.8rem]">
                        {score}
                        <span className="ml-2 text-xl font-medium not-italic tracking-normal text-white/35 md:text-2xl">/100</span>
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/42">
                      Score orientativo
                    </div>
                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full border border-white/8 bg-white/6">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#5B21B6] via-[#6D00FF] to-[#B98CFF]"
                    />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/32">Edad cronológica</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{chronologicalAge}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/32">Edad biológica est.</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{biologicalAge}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/32">Diferencia</p>
                      <p className={cn("mt-2 text-2xl font-semibold", ageDelta > 0 ? "text-amber-300" : "text-emerald-300")}>
                        {ageDelta > 0 ? `+${ageDelta}` : ageDelta}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] landing-surface p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Riesgo de sarcopenia</p>
                      <p className="mt-2 text-base font-semibold text-white">Lectura inicial del punto de partida</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]",
                        risk.color,
                        risk.bg,
                        risk.border
                      )}
                    >
                      {risk.label}
                    </span>
                  </div>

                  <div className="landing-divider my-5" />

                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/32">Tus 3 palancas accionables</p>
                    {levers.slice(0, 3).map((lever, index) => (
                      <div key={lever} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6D00FF]/16 text-xs font-semibold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-white/72">{lever}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-500/18 bg-amber-500/[0.06] p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                    <div>
                      <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em] !text-amber-200/80">Error dominante</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/76">{dominantError}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] landing-surface p-5 md:p-6">
                  <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Siguiente paso recomendado</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/68">
                    Antes de pensar en HYBRID, conviene entender qué hábitos, estructura y nivel de compromiso te acercarían a esa versión.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <a
                      href={`/s/${shareId}/plan`}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#6D00FF] px-5 py-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(109,0,255,0.26)] transition-all hover:scale-[1.01] hover:bg-[#5F00DE]"
                    >
                      <Zap className="h-4 w-4" />
                      Ver el roadmap
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href={process.env.NEXT_PUBLIC_BOOKING_URL || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/85 transition-all hover:bg-white/[0.06]"
                    >
                      <Shield className="h-4 w-4" />
                      Hablar con un coach
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed text-white/28">
              Estas señales son orientativas y motivacionales. No sustituyen evaluación médica ni medición clínica.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
