"use client";

/**
 * GENESIS Readiness Report — Sprint 2 Funnel HYBRID.
 *
 * Renderiza los 3 scores del Readiness Report y la recomendación de tier
 * (ASCEND vs HYBRID) con CTA contextual. Diseño coherente con StatsDelta
 * (cards oscuros, números animados, progress bars).
 */

import { useEffect } from "react";
import { Activity, Dumbbell, Users, ArrowRight } from "lucide-react";
import type { ReadinessReport as Report } from "@/lib/readiness";
import { DISCLAIMERS, HYBRID_COPY } from "@/config/ngxTransformCopy";
import { cn } from "@/lib/utils";

interface Props {
  report: Report;
  sessionId?: string;
  shareId: string;
  onValidateWithCoach?: () => void;
  onAscendClick?: () => void;
}

const TIER_STYLES = {
  HYBRID: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    button: "bg-emerald-500 hover:bg-emerald-400 text-black",
    accent: "text-emerald-300",
  },
  ASCEND: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    button: "bg-violet-500 hover:bg-violet-400 text-white",
    accent: "text-violet-300",
  },
} as const;

function trackReadiness(
  shareId: string,
  event: string,
  metadata?: Record<string, unknown>,
) {
  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ sessionId: shareId, event, metadata }),
  }).catch(() => {});
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: typeof Activity }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className="text-xl font-black tabular-nums text-white">{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 transition-[width] duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ReadinessReport({
  report,
  shareId,
  onValidateWithCoach,
  onAscendClick,
}: Props) {
  const { transformationReadiness, muscleFoundation, hybridFit, recommendation } = report;
  const tierStyle = TIER_STYLES[recommendation.tier];

  useEffect(() => {
    trackReadiness(shareId, "readiness_viewed", {
      tier: recommendation.tier,
      readiness: transformationReadiness.score,
      foundation: muscleFoundation.score,
      hybridFit: hybridFit.score,
    });
    trackReadiness(
      shareId,
      recommendation.tier === "HYBRID" ? "hybrid_recommended" : "ascend_recommended",
      { reason: recommendation.reason },
    );
  }, [
    shareId,
    recommendation.tier,
    recommendation.reason,
    transformationReadiness.score,
    muscleFoundation.score,
    hybridFit.score,
  ]);

  const handleHybridClick = () => {
    trackReadiness(shareId, "coach_validation_clicked", { tier: recommendation.tier });
    onValidateWithCoach?.();
  };

  const handleAscendClick = () => {
    trackReadiness(shareId, "ascend_clicked", { tier: recommendation.tier });
    onAscendClick?.();
  };

  return (
    <section
      aria-label="GENESIS Readiness Report"
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-sm p-6 space-y-6"
    >
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border", tierStyle.badge)}>
            GENESIS · Readiness
          </span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Tu lectura inicial
        </h2>
        <p className="text-sm text-neutral-400 leading-relaxed">
          {transformationReadiness.explanation}
        </p>
      </header>

      {/* Scores */}
      <div className="space-y-5">
        <ScoreBar
          label={`Adherencia · ${transformationReadiness.label}`}
          score={transformationReadiness.score}
          icon={Activity}
        />
        <ScoreBar
          label={`Base muscular · prioridad: ${muscleFoundation.priority}`}
          score={muscleFoundation.score}
          icon={Dumbbell}
        />
        <ScoreBar
          label="HYBRID Fit"
          score={hybridFit.score}
          icon={Users}
        />
      </div>

      {/* Recommendation */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] uppercase tracking-widest font-black", tierStyle.accent)}>
            Recomendación
          </span>
          <span className={cn("text-sm font-black", tierStyle.accent)}>
            {recommendation.tier}
          </span>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">{recommendation.reason}</p>
        <p className="text-xs text-neutral-500 italic">{HYBRID_COPY.thesis}</p>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        {recommendation.tier === "HYBRID" ? (
          <>
            <button
              type="button"
              onClick={handleHybridClick}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02]",
                tierStyle.button,
              )}
            >
              {recommendation.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleAscendClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              {HYBRID_COPY.ascendCta}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAscendClick}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02]",
                tierStyle.button,
              )}
            >
              {recommendation.cta}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleHybridClick}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              {HYBRID_COPY.cta}
            </button>
          </>
        )}
      </div>

      {/* Trust badges */}
      <ul className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
        {HYBRID_COPY.trustBadges.map((badge) => (
          <li
            key={badge}
            className="text-[10px] uppercase tracking-widest text-neutral-500 px-2 py-1 rounded-full border border-white/5"
          >
            {badge}
          </li>
        ))}
      </ul>

      {/* Disclaimer */}
      <p className="text-[10px] leading-snug text-neutral-500 italic">{DISCLAIMERS.health}</p>
    </section>
  );
}
