"use client";

/**
 * PR-4: Enhanced Booking CTA
 *
 * Two-tier CTA:
 * 1. Primary: Get 7-day plan (free, immediate value)
 * 2. Secondary: Book NGX coaching (conversion)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Download, Loader2, Check, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingCTA2Props {
  shareId: string;
  hasPlan?: boolean;
  className?: string;
}

export function BookingCTA2({ shareId, hasPlan = false, className }: BookingCTA2Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(hasPlan);
  const [error, setError] = useState<string | null>(null);

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  const handleGetPlan = async () => {
    if (planGenerated) {
      // Navigate to plan
      window.location.href = `/plan/${shareId}`;
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId }),
      });

      const data = await res.json();

      if (data.success) {
        setPlanGenerated(true);
        // Navigate to plan
        window.location.href = `/plan/${shareId}`;
      } else {
        setError(data.message || "Error generando plan");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Primary CTA: Get Plan */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6D00FF] via-[#5B21B6] to-[#6D00FF] p-6">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6D00FF]/0 via-white/10 to-[#6D00FF]/0 translate-x-[-100%] animate-shimmer" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
              {planGenerated ? "Tu plan está listo" : "Plan personalizado gratis"}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {planGenerated
              ? "Ver tu plan de 7 días"
              : "Obtén el plan exacto para lograr ESTO"}
          </h3>

          <p className="text-white/70 text-sm mb-6">
            Entrenamiento, nutrición y hábitos personalizados basados en tu análisis.
          </p>

          <button
            onClick={handleGetPlan}
            disabled={isGenerating}
            className={cn(
              "w-full flex items-center justify-center gap-3",
              "px-6 py-4 rounded-xl",
              "bg-white text-[#6D00FF] font-bold",
              "shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40",
              "transition-all duration-200",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generando plan...</span>
              </>
            ) : planGenerated ? (
              <>
                <Check className="w-5 h-5" />
                <span>VER MI PLAN DE 7 DÍAS</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>OBTENER PLAN GRATIS</span>
              </>
            )}
          </button>

          {error && (
            <p className="text-red-300 text-sm mt-3 text-center">{error}</p>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#5B21B6]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Secondary CTA: Book Coaching */}
      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#6D00FF]/20">
                <Calendar className="w-5 h-5 text-[#6D00FF]" />
              </div>
              <div>
                <p className="font-medium text-white">Coaching NGX</p>
                <p className="text-sm text-neutral-400">
                  Acompañamiento personalizado
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-400" />
          </div>
        </a>
      )}

      {/* Divider with info */}
      <div className="text-center">
        <p className="text-xs text-neutral-500">
          El plan de 7 días es gratuito y se genera con IA
        </p>
      </div>
    </motion.div>
  );
}
