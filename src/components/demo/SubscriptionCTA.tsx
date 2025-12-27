"use client";

import { motion } from "framer-motion";
import { Bot, Check, Crown, Users, Video, MessageSquare, Zap, Clock, BarChart3 } from "lucide-react";

interface SubscriptionCTAProps {
  shareId: string;
  userName?: string;
  onSelectPlan?: (plan: "ascend" | "hybrid") => void;
}

const ASCEND_FEATURES = [
  { icon: Users, text: "13 agentes IA especializados" },
  { icon: BarChart3, text: "Planes personalizados semanales" },
  { icon: Zap, text: "Ajustes automáticos en tiempo real" },
  { icon: MessageSquare, text: "Soporte 24/7 vía chat" },
  { icon: Clock, text: "Acceso ilimitado por 12 meses" },
];

const HYBRID_FEATURES = [
  { icon: Check, text: "Todo lo de ASCEND", highlight: false },
  { icon: Crown, text: "Coach humano certificado", highlight: true },
  { icon: Video, text: "Videollamadas mensuales", highlight: true },
  { icon: Video, text: "Revisión de forma en video", highlight: true },
  { icon: MessageSquare, text: "WhatsApp directo con tu coach", highlight: true },
];

export function SubscriptionCTA({ shareId, userName, onSelectPlan }: SubscriptionCTAProps) {
  const handleSelectPlan = (plan: "ascend" | "hybrid") => {
    // Track selection
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "select_plan", {
        plan_type: plan,
        share_id: shareId,
      });
    }

    // Call parent handler or redirect to payment
    if (onSelectPlan) {
      onSelectPlan(plan);
    } else {
      // Default: redirect to payment page (placeholder)
      const paymentUrl = plan === "ascend"
        ? `https://ngxgenesis.com/checkout/ascend?ref=${shareId}`
        : `https://ngxgenesis.com/checkout/hybrid?ref=${shareId}`;
      window.open(paymentUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* GENESIS Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl border border-white/10 p-6"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6D00FF] to-[#B98CFF] flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-[#B98CFF] font-medium">GENESIS</p>
            <p className="text-neutral-300 leading-relaxed">
              {userName ? `${userName}, ` : ""}Acabas de experimentar una pequeña muestra de lo que puedo hacer por ti.
              En el programa completo, tendré acceso a <span className="text-white font-medium">13 agentes especializados</span> que
              trabajarán contigo durante <span className="text-white font-medium">12 meses</span> para lograr tu transformación.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ASCEND */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5 flex flex-col"
        >
          <div>
            <h3 className="text-xl font-bold text-white">ASCEND</h3>
            <p className="text-sm text-neutral-400 mt-1">100% IA</p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#6D00FF]">$99</span>
            <span className="text-neutral-400">/mes</span>
          </div>

          <ul className="space-y-3 flex-1">
            {ASCEND_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6D00FF]/20 flex items-center justify-center">
                  <feature.icon className="w-3.5 h-3.5 text-[#6D00FF]" />
                </div>
                <span className="text-sm text-neutral-300">{feature.text}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSelectPlan("ascend")}
            className="w-full py-3.5 rounded-xl bg-[#6D00FF] hover:bg-[#5B00E0] text-white font-semibold transition-all"
          >
            Comenzar ASCEND
          </button>
        </motion.div>

        {/* HYBRID */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#6D00FF]/50 bg-gradient-to-br from-[#6D00FF]/10 to-transparent p-6 space-y-5 relative flex flex-col"
        >
          <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-[#6D00FF] to-[#B98CFF] text-white text-xs font-medium rounded-full">
            Recomendado
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">HYBRID</h3>
            <p className="text-sm text-neutral-400 mt-1">IA + Coach Humano</p>
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#B98CFF]">$199</span>
            <span className="text-neutral-400">/mes</span>
          </div>

          <ul className="space-y-3 flex-1">
            {HYBRID_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  feature.highlight
                    ? "bg-[#B98CFF]/20"
                    : "bg-[#6D00FF]/20"
                }`}>
                  <feature.icon className={`w-3.5 h-3.5 ${
                    feature.highlight
                      ? "text-[#B98CFF]"
                      : "text-[#6D00FF]"
                  }`} />
                </div>
                <span className={`text-sm ${
                  feature.highlight
                    ? "text-white font-medium"
                    : "text-neutral-300"
                }`}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSelectPlan("hybrid")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D00FF] to-[#B98CFF] hover:opacity-90 text-white font-semibold transition-all"
          >
            Comenzar HYBRID
          </button>
        </motion.div>
      </div>

      {/* Guarantee */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-xs text-neutral-500"
      >
        Garantía de 30 días. Cancela cuando quieras. Sin compromisos.
      </motion.p>
    </div>
  );
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}
