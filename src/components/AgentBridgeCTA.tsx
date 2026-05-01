"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Calendar, Sparkles, Brain } from "lucide-react";

interface AgentBridgeCTAProps {
  userProfile: {
    focusZone?: "upper" | "lower" | "abs" | "full";
    goal?: "definicion" | "masa" | "mixto";
    stressLevel?: number;
  };
  shareId: string;
  sessionId?: string;
}

// v11.0: GENESIS capabilities (not individual agents)
const CAPABILITIES = {
  entrenamiento: {
    label: "Entrenamiento de Precisión",
    description: "Programas de fuerza y cardio diseñados para tu nivel y objetivos",
    color: "#fb923c",
  },
  nutricion: {
    label: "Estrategia Nutricional",
    description: "Planes alimenticios calibrados para tu metabolismo y metas",
    color: "#34d399",
  },
  recuperacion: {
    label: "Biohacking y Recuperación",
    description: "Optimización del descanso y recuperación entre sesiones",
    color: "#7D1AFF",
  },
  habitos: {
    label: "Arquitectura de Hábitos",
    description: "Rutinas y mentalidad para resultados sostenibles",
    color: "#a78bfa",
  },
} as const;

type CapabilityKey = keyof typeof CAPABILITIES;

function selectCapability(profile: AgentBridgeCTAProps["userProfile"]): CapabilityKey {
  const { focusZone, goal, stressLevel } = profile;

  if (stressLevel && stressLevel > 7) return "recuperacion";
  if (focusZone === "upper" && goal === "masa") return "entrenamiento";
  if (focusZone === "lower") return "entrenamiento";
  return "nutricion";
}

export function AgentBridgeCTA({
  userProfile,
  shareId,
  sessionId,
}: AgentBridgeCTAProps) {
  const capKey = selectCapability(userProfile);
  const capability = CAPABILITIES[capKey];
  const bookingUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "#";

  // Track event helper
  const trackEvent = useCallback(
    (event: string, metadata?: Record<string, unknown>) => {
      if (!sessionId) return;
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          event,
          metadata: { shareId, capability: capKey, ...metadata },
        }),
      }).catch(console.error);
    },
    [sessionId, shareId, capKey]
  );

  // Track view on mount
  useEffect(() => {
    trackEvent("agent_cta_viewed");
  }, [trackEvent]);

  const handleClick = () => {
    trackEvent("agent_cta_clicked");
    window.open(bookingUrl, "_blank");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-12 p-6 md:p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent"
    >
      {/* GENESIS badge */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#6D00FF]/20">
          <Brain className="w-6 h-6 text-[#6D00FF]" />
        </div>
        <div>
          <p className="text-sm text-white/50">{capability.label}</p>
          <p className="font-semibold text-white">GENESIS</p>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
        GENESIS está listo para ser tu coach
      </h3>
      <p className="text-white/60 mb-2">{capability.description}</p>
      <p className="text-white/60 mb-6">
        Este es tu potencial. Pero el potencial sin acción es solo fantasía.
        <br />
        El sistema NGX te ayuda a convertirlo en realidad.
      </p>

      {/* CTA */}
      <button
        onClick={handleClick}
        className="w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-white transition-all group"
        style={{
          background: `linear-gradient(135deg, ${capability.color}, #6D00FF)`,
          boxShadow: `0 0 30px ${capability.color}40`,
        }}
      >
        <span className="flex items-center justify-center gap-2">
          Empezar mi temporada
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-white/40">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" /> Sin tarjeta requerida
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Cancela cuando quieras
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> 4 capacidades de IA integradas
        </span>
      </div>
    </motion.section>
  );
}
