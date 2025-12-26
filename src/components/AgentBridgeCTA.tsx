"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Calendar, Sparkles } from "lucide-react";

interface AgentBridgeCTAProps {
  userProfile: {
    focusZone?: "upper" | "lower" | "abs" | "full";
    goal?: "definicion" | "masa" | "mixto";
    stressLevel?: number;
  };
  shareId: string;
  sessionId?: string;
}

const AGENTS = {
  BLAZE: {
    name: "BLAZE",
    title: "Coach de Entrenamiento",
    color: "#FF6B35",
    emoji: "🔥",
    description: "Especialista en transformación física intensa",
  },
  ATLAS: {
    name: "ATLAS",
    title: "Estratega de Progresión",
    color: "#6D00FF",
    emoji: "🗺️",
    description: "Experto en planificación y estructura",
  },
  SPARK: {
    name: "SPARK",
    title: "Coach de Bienestar",
    color: "#00D4FF",
    emoji: "⚡",
    description: "Balance entre rendimiento y bienestar",
  },
  NEXUS: {
    name: "NEXUS",
    title: "Director de Transformación",
    color: "#6D00FF",
    emoji: "🧠",
    description: "Coordinador de todos los aspectos",
  },
} as const;

type AgentKey = keyof typeof AGENTS;

function selectAgent(profile: AgentBridgeCTAProps["userProfile"]): AgentKey {
  const { focusZone, goal, stressLevel } = profile;

  if (stressLevel && stressLevel > 7) return "SPARK";
  if (focusZone === "upper" && goal === "masa") return "BLAZE";
  if (focusZone === "lower") return "ATLAS";
  return "NEXUS";
}

export function AgentBridgeCTA({
  userProfile,
  shareId,
  sessionId,
}: AgentBridgeCTAProps) {
  const agentKey = selectAgent(userProfile);
  const agent = AGENTS[agentKey];
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
          metadata: { shareId, agent: agent.name, ...metadata },
        }),
      }).catch(console.error);
    },
    [sessionId, shareId, agent.name]
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
      {/* Agent badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          {agent.emoji}
        </div>
        <div>
          <p className="text-sm text-white/50">{agent.title}</p>
          <p className="font-semibold text-white">{agent.name}</p>
        </div>
      </div>

      {/* Message */}
      <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
        {agent.name} está listo para ser tu coach
      </h3>
      <p className="text-white/60 mb-2">{agent.description}</p>
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
          background: `linear-gradient(135deg, ${agent.color}, #6D00FF)`,
          boxShadow: `0 0 30px ${agent.color}40`,
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
          <Sparkles className="h-3 w-3" /> 13 agentes de IA incluidos
        </span>
      </div>
    </motion.section>
  );
}
