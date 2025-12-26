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
import { Share2, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
  m0: { label: "HOY", subtitle: "Tu punto de partida" },
  m4: { label: "MES 4", subtitle: "Primera transformación" },
  m8: { label: "MES 8", subtitle: "Progreso consolidado" },
  m12: { label: "MES 12", subtitle: "Tu mejor versión" },
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
                beforeLabel="ANTES"
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
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentImage})` }}
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
          <span className="inline-block px-4 py-2 rounded-full bg-[#6D00FF] text-white text-sm font-bold tracking-wider shadow-lg shadow-[#6D00FF]/30">
            {milestoneInfo.label}
          </span>
        </div>

        {/* Compare toggle (not for m0) */}
        {!isM0 && originalImage && (
          <button
            onClick={() => setShowCompare(!showCompare)}
            className={cn(
              "absolute top-6 right-6 z-10",
              "px-4 py-2 rounded-full",
              "text-sm font-medium",
              "transition-all duration-200",
              showCompare
                ? "bg-white text-black"
                : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
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
            <h2 className="text-4xl md:text-5xl font-black italic text-white mb-2">
              {timelineEntry.title}
            </h2>
            <p className="text-neutral-300 text-lg">
              {milestoneInfo.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 px-6 py-8 -mt-6 bg-gradient-to-b from-black to-neutral-950 rounded-t-3xl">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-4">
            PROGRESO
          </h3>
          <StatsDelta
            from={baselineStats}
            to={timelineEntry.stats}
            animate={true}
          />
        </motion.div>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-4">
            TU EVOLUCIÓN
          </h3>
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-white/5">
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
                onClick={() => setShowFullNarrative(!showFullNarrative)}
                className="flex items-center gap-1 mt-3 text-[#6D00FF] text-sm font-medium hover:text-[#8B33FF] transition-colors"
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
        </motion.div>

        {/* Mental note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-xs font-bold text-neutral-500 tracking-widest mb-4">
            MENTALIDAD
          </h3>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#6D00FF]/10 to-transparent border border-[#6D00FF]/20">
            <div className="flex gap-3">
              <div className="text-2xl">🧠</div>
              <p className="text-white/80 leading-relaxed italic">
                &ldquo;{timelineEntry.mental}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {/* Share CTA */}
          {onShare && (
            <button
              onClick={() => onShare(milestone)}
              className={cn(
                "w-full flex items-center justify-center gap-3",
                "px-6 py-4 rounded-2xl",
                "bg-[#6D00FF] hover:bg-[#5800CC]",
                "text-white font-bold",
                "transition-all duration-200",
                "shadow-[0_0_20px_rgba(109,0,255,0.3)]"
              )}
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir {milestoneInfo.label}</span>
            </button>
          )}

          {/* Letter CTA (only for m12) */}
          {isM12 && onShowLetter && (
            <button
              onClick={onShowLetter}
              className={cn(
                "w-full flex items-center justify-center gap-3",
                "px-6 py-4 rounded-2xl",
                "bg-white/5 hover:bg-white/10",
                "border border-white/10",
                "text-white font-medium",
                "transition-all duration-200"
              )}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Leer carta de tu yo futuro</span>
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
