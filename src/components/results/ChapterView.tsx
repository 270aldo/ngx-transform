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

const LONGEVITY_CONTEXT: Record<Milestone, string> = {
  m0: "Línea base. Tu cuerpo está perdiendo ~0.5% de masa muscular este año.",
  m4: "+3kg masa magra = reducción estimada de 2 años en edad metabólica.",
  m8: "Tu sensibilidad a insulina ha mejorado. Tu músculo trabaja para ti.",
  m12: "Has revertido ~5 años de deterioro muscular metabólico. Este es tu nuevo baseline.",
};

export function ChapterView({
  milestone,
  timelineEntry,
  baselineStats,
  currentImage,
  originalImage,
  onShare,
  onShowLetter,
  className,
}: ChapterViewProps) {
  const [showFullNarrative, setShowFullNarrative] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const milestoneInfo = MILESTONE_LABELS[milestone];
  const isM12 = milestone === "m12";
  const isM0 = milestone === "m0";

  return (
    <div className={cn("relative min-h-screen bg-black", className)}>
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
        className="relative z-10 px-6 py-10 md:py-12 -mt-6 rounded-t-3xl"
        style={{ background: "linear-gradient(to bottom, var(--ngx-bg-end), var(--ngx-bg-mid))" }}
      >
        <div className="max-w-5xl mx-auto">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 md:mb-10"
        >
          <span className="ngx-eyebrow !text-[10px] block mb-4" style={{ color: "var(--ngx-fg-3)" }}>
            Progreso
          </span>
          <StatsDelta
            from={baselineStats}
            to={timelineEntry.stats}
            animate={true}
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
                    <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
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
                    {LONGEVITY_CONTEXT[milestone]}
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
                  <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
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
