"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MuscleHealthScoreProps {
  score?: number;                                 // 0-100, default 78
  chronologicalAge?: number;                      // default 38
  biologicalAge?: number;                         // default 41
  sarcopeniaRisk?: "BAJO" | "MEDIO" | "ALTO";    // default "MEDIO"
  levers?: string[];                              // 3 actionable items
  dominantError?: string;                         // 1 dominant error
  className?: string;
}

const DEFAULT_LEVERS = [
  "Entrenamiento de fuerza 3x/semana (protocolo de progresión lineal)",
  "Proteína >1.6g/kg/día en ventana post-entrenamiento",
  "Sueño de recuperación: 7-9h con foco en fases profundas",
];

const DEFAULT_ERROR =
  "Cardio excesivo sin contrarrestar pérdida muscular — el error más común que acelera el envejecimiento metabólico.";

const RISK_CONFIG: Record<
  "BAJO" | "MEDIO" | "ALTO",
  { label: string; color: string; bg: string; border: string }
> = {
  BAJO:  { label: "BAJO",  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  MEDIO: { label: "MEDIO", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  ALTO:  { label: "ALTO",  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"     },
};

export function MuscleHealthScore({
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
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.35em] uppercase text-[#6D00FF] mb-1">
            GENESIS · Análisis Muscular
          </p>
          <h2 className="text-2xl font-black text-white">
            Muscle Health Score
          </h2>
        </div>

        {/* Score Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
              Tu puntuación
            </span>
            <span
              className="text-5xl font-black"
              style={{ color: "#6D00FF" }}
            >
              {score}
              <span className="text-xl text-neutral-400">/100</span>
            </span>
          </div>
          {/* Progress bar */}
          <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #5B21B6 0%, #6D00FF 60%, #7D1AFF 100%)",
                boxShadow: "0 0 12px rgba(109,0,255,0.5)",
              }}
            />
          </div>
        </div>

        {/* Age comparison */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-6">
          <p className="text-xs font-bold text-neutral-400 tracking-widest uppercase mb-4">
            Edad biológica vs. cronológica
          </p>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{chronologicalAge}</p>
              <p className="text-xs text-neutral-500 mt-1">Edad cronológica</p>
            </div>
            <div className="text-center">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  ageDelta > 0
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                )}
              >
                {ageDelta > 0 ? `+${ageDelta} años` : `${ageDelta} años`}
              </span>
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "text-3xl font-black",
                  ageDelta > 0 ? "text-amber-400" : "text-emerald-400"
                )}
              >
                {biologicalAge}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Edad biológica est.</p>
            </div>
          </div>
        </div>

        {/* Sarcopenia risk */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-neutral-400 tracking-widest uppercase">
              Riesgo de sarcopenia
            </p>
            <span
              className={cn(
                "text-xs font-black px-3 py-1.5 rounded-full border",
                risk.color,
                risk.bg,
                risk.border
              )}
            >
              {risk.label}
            </span>
          </div>
        </div>

        {/* 3 Actionable levers */}
        <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-6">
          <p className="text-xs font-bold text-neutral-400 tracking-widest uppercase mb-4">
            Tus 3 palancas accionables
          </p>
          <ul className="space-y-3">
            {levers.slice(0, 3).map((lever, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mt-0.5"
                  style={{ background: "linear-gradient(135deg, #6D00FF, #5B21B6)" }}
                >
                  {i + 1}
                </span>
                <p className="text-white/80 text-sm leading-relaxed">{lever}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Dominant error (warning) */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">
                Error dominante
              </p>
              <p className="text-white/80 text-sm leading-relaxed">{dominantError}</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center text-neutral-600 px-4 leading-relaxed">
          Proyección basada en tus datos y modelos científicos. Tu plan es lo que lo vuelve real.
        </p>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <a
            href={process.env.NEXT_PUBLIC_BOOKING_URL || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #6D00FF 0%, #5B21B6 100%)",
              boxShadow: "0 8px 32px rgba(109,0,255,0.4)",
            }}
          >
            <Shield className="w-5 h-5" />
            Hablar con coach — HYBRID
          </a>
          <a
            href="/wizard"
            className={cn(
              "w-full flex items-center justify-center gap-3",
              "px-6 py-4 rounded-2xl",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              "text-white font-medium",
              "transition-all duration-200"
            )}
          >
            <Zap className="w-5 h-5 text-[#6D00FF]" />
            Empezar solo — ASCEND
          </a>
        </div>
      </div>
    </motion.section>
  );
}
