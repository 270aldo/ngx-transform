"use client";

/**
 * PR-2: Chapter View Component
 *
 * Detailed view for each transformation milestone.
 * Includes hero image, narrative, stats, and compare slider.
 *
 * Features:
 * - Fullscreen hero image
 * - Narrative card with scrollable content
 * - Animated stats delta
 * - Integrated compare slider
 * - Share CTA per milestone
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ChevronDown, ChevronUp, MessageCircle, Dna, Quote, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEASON_MILESTONE_COPY } from "@/lib/seasonMilestones";
import { CompareSlider } from "./CompareSlider";
import { StatsDelta } from "./StatsDelta";

type Milestone = "m0" | "m4" | "m8" | "m12";

interface Stats {
  strength: number;
  aesthetics: number;
  endurance: number;
  mental: number;
}

interface TimelineEntry {
  month: number;
  title: string;
  description: string;
  mental: string;
  stats: Stats;
}

interface ChapterViewProps {
  milestone: Milestone;
  timelineEntry: TimelineEntry;
  baselineStats: Stats;
  currentImage?: string;
  originalImage?: string;
  surfaceMode?: "default" | "lead-magnet";
  onShare?: (milestone: Milestone) => void;
  onShowLetter?: () => void;
  className?: string;
}

const MILESTONE_LABELS: Record<Milestone, { label: string; subtitle: string }> = {
  m0: SEASON_MILESTONE_COPY.m0,
  m4: SEASON_MILESTONE_COPY.m4,
  m8: SEASON_MILESTONE_COPY.m8,
  m12: SEASON_MILESTONE_COPY.m12,
};

const ORIENTATION_CONTEXT: Record<Milestone, string> = {
  m0: "Línea base orientativa: foto, biometría y autopercepción para ordenar el punto de partida.",
  m4: "Primer hito estimado: adaptación visual y hábitos iniciales si existe consistencia real.",
  m8: "Segundo hito estimado: más claridad sobre qué responde y qué fricción aparece.",
  m12: "Cierre de temporada aspiracional: una posibilidad visual, no una garantía ni medición clínica.",
};

export function ChapterView({
  milestone,
  timelineEntry,
  baselineStats,
  currentImage,
  originalImage,
  surfaceMode = "default",
  onShare,
  onShowLetter,
  className,
}: ChapterViewProps) {
  const [showFullNarrative, setShowFullNarrative] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const milestoneInfo = MILESTONE_LABELS[milestone];
  const isM12 = milestone === "m12";
  const isM0 = milestone === "m0";
  const isLeadMagnet = surfaceMode === "lead-magnet";

  if (isLeadMagnet) {
    return (
      <div className={cn("relative min-h-screen bg-transparent px-4 py-20 md:px-6 lg:py-24", className)}>
        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)] lg:items-center">
          <div className="relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.025]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(109,0,255,0.16),transparent_42%)]" />
            <div className="relative aspect-[4/5] max-h-[78vh] min-h-[460px] lg:aspect-[5/6]">
              <AnimatePresence mode="wait">
                {showCompare && !isM0 && originalImage && currentImage ? (
                  <motion.div
                    key="compare-lead"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <CompareSlider
                      beforeImage={originalImage}
                      afterImage={currentImage}
                      beforeLabel={SEASON_MILESTONE_COPY.m0.label}
                      afterLabel={milestoneInfo.label}
                      className="h-full rounded-none"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="image-lead"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {currentImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentImage}
                        alt={timelineEntry.title}
                        className="h-full w-full object-contain object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-950 text-white/40">
                        Imagen en proceso
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/88 to-transparent" />
              <div className="absolute left-4 top-4 z-10">
                <span className="ngx-primary-cta inline-flex !min-h-0 px-4 py-2 text-xs">
                  {milestoneInfo.label}
                </span>
              </div>
              {!isM0 && originalImage && (
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className={cn(
                    "absolute right-4 top-4 z-10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-all duration-150 active:scale-[0.97]",
                    showCompare
                      ? "bg-white text-black"
                      : "ngx-glass-clear text-white hover:bg-white/[0.10]"
                  )}
                >
                  {showCompare ? "Ver hito" : "Comparar"}
                </button>
              )}
              <div className="absolute bottom-5 left-5 right-5 z-10">
                <h2 className="ngx-h1 !text-left text-white">
                  {timelineEntry.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">
                  {milestoneInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="ngx-metal-card !p-5 md:!p-6">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                    Tu resultado en esta vista
                  </span>
                  <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Aspiracional · no clínico
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Visualización aspiracional", "Scores orientativos", "Dirección de 12 semanas"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] leading-none text-white/58"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <p
                  className={cn(
                    "mt-4 text-sm leading-relaxed text-white/72 md:text-base",
                    !showFullNarrative && "line-clamp-5"
                  )}
                >
                  {timelineEntry.description}
                </p>
                {timelineEntry.description.length > 220 && (
                  <button
                    type="button"
                    onClick={() => setShowFullNarrative(!showFullNarrative)}
                    className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:text-white"
                    style={{ color: "var(--ngx-purple-light)" }}
                  >
                    {showFullNarrative ? "Ver menos" : "Leer más"}
                    {showFullNarrative ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <span className="ngx-eyebrow !text-[11px] mb-3 block" style={{ color: "var(--ngx-fg-3)" }}>
                Scores orientativos
              </span>
              <StatsDelta
                from={baselineStats}
                to={timelineEntry.stats}
                animate={!isM0}
                showMethodology
                baselineMode={isM0}
                className="grid-cols-1 sm:grid-cols-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="ngx-metal-card !p-5">
                <div className="relative z-10 flex items-start gap-3">
                  <span className="ngx-icon-box h-9 w-9 shrink-0">
                    <Dna className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-white/68">
                    {ORIENTATION_CONTEXT[milestone]}
                  </p>
                </div>
              </div>

              <div className="ngx-metal-card !p-5">
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="ngx-icon-box h-9 w-9">
                      <Quote className="h-4 w-4" />
                    </span>
                    <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                      Mentalidad
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/75 italic">
                    &ldquo;{timelineEntry.mental}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-screen bg-transparent", className)}>
      {/* Hero Image Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        {/* Background Image or Compare Slider */}
        <AnimatePresence mode="wait">
          {showCompare && originalImage && currentImage ? (
            <motion.div
              key="compare"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <CompareSlider
                beforeImage={originalImage}
                afterImage={currentImage}
                beforeLabel={SEASON_MILESTONE_COPY.m0.label}
                afterLabel={milestoneInfo.label}
                className="h-full rounded-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {currentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImage}
                  alt={timelineEntry.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Top badge */}
        <div className="absolute top-6 left-6 z-10">
          <span
            className="ngx-primary-cta inline-flex !min-h-0 px-4 py-2 text-sm"
          >
            {milestoneInfo.label}
          </span>
        </div>

        {/* Compare toggle (not for m0) */}
        {!isM0 && originalImage && (
          <button
            onClick={() => setShowCompare(!showCompare)}
            className={cn(
              "absolute top-6 right-6 z-10",
              "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-[0.04em]",
              "transition-all duration-150 active:scale-[0.97]",
              showCompare
                ? "bg-white text-black"
                : "ngx-glass-clear text-white hover:bg-white/[0.10]"
            )}
          >
            {showCompare ? "Ver imagen" : "Comparar"}
          </button>
        )}

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="ngx-h1 !text-left text-white mb-2">
              {timelineEntry.title}
            </h2>
            <p className="text-white/65 text-lg">
              {milestoneInfo.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section — constrained on desktop for better legibility */}
      <div
        className="relative z-10 px-6 py-10 md:py-12 -mt-6 rounded-t-[18px] border-t border-white/[0.08] backdrop-blur-xl bg-[var(--ngx-surface-glass)]"
      >
        <div className="max-w-5xl mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 md:mb-10"
        >
          <span className="ngx-eyebrow !text-[11px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>
            Progreso
          </span>
          <StatsDelta
            from={baselineStats}
            to={timelineEntry.stats}
            animate={true}
            showMethodology
          />
        </motion.div>

        {/* Two-column on desktop: narrative + longevity stack on left, mentalidad on right */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-[1.2fr_1fr] mb-8 md:mb-10">
          {/* Left: Narrative + Longevity */}
          <div className="flex flex-col gap-6">
            {/* Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="ngx-metal-card !p-5 md:!p-6">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="ngx-icon-box h-9 w-9">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                    <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                      Tu evolución
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-white/80 leading-relaxed",
                      !showFullNarrative && "line-clamp-4"
                    )}
                  >
                    {timelineEntry.description}
                  </p>
                  {timelineEntry.description.length > 200 && (
                    <button
                      type="button"
                      onClick={() => setShowFullNarrative(!showFullNarrative)}
                      className="flex items-center gap-1 mt-3 text-sm font-medium transition-colors hover:text-white"
                      style={{ color: "var(--ngx-purple-light)" }}
                    >
                      {showFullNarrative ? (
                        <>
                          <span>Ver menos</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Leer más</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Longevity context */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="ngx-metal-card !p-4 md:!p-5">
                <div className="relative z-10 flex items-center gap-3">
                  <span className="ngx-icon-box h-9 w-9 shrink-0">
                    <Dna className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-snug text-white/75">
                    {ORIENTATION_CONTEXT[milestone]}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Mental note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:h-full"
          >
            <div className="ngx-metal-card !p-5 md:!p-6 md:h-full">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="ngx-icon-box h-9 w-9">
                    <Quote className="h-4 w-4" />
                  </span>
                  <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                    Mentalidad
                  </span>
                </div>
                <p className="text-white/80 leading-relaxed italic">
                  &ldquo;{timelineEntry.mental}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTAs — constrained on desktop, side-by-side when both visible */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          {/* Share CTA */}
          {onShare && (
            <button
              type="button"
              onClick={() => onShare(milestone)}
              className="ngx-primary-cta inline-flex flex-1 px-6 py-4"
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir {milestoneInfo.label}</span>
            </button>
          )}

          {/* Letter CTA (only for m12) */}
          {isM12 && onShowLetter && (
            <button
              type="button"
              onClick={onShowLetter}
              className="ngx-glass-clear flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-full text-white font-medium transition-all duration-150 active:scale-[0.98] hover:bg-white/[0.10]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Carta de tu yo futuro</span>
            </button>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  );
}
