"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain } from "lucide-react";
import { HYBRID_COPY } from "@/config/ngxTransformCopy";

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
    color: "#60a5fa",
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
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "#";

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
        Tu scan muestra una dirección posible.
      </h3>
      <p className="text-white/70 mb-2">{HYBRID_COPY.map}</p>
      <p className="text-white/50 italic mb-6 text-sm">{HYBRID_COPY.thesis}</p>

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
          {HYBRID_COPY.cta}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>

      {/* Trust badges (honest) */}
      <ul className="flex flex-wrap gap-2 mt-6">
        {HYBRID_COPY.trustBadges.map((badge) => (
          <li
            key={badge}
            className="text-[10px] uppercase tracking-widest text-white/40 px-2 py-1 rounded-full border border-white/5"
          >
            {badge}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
