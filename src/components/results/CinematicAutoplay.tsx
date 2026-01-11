"use client";

/**
 * PR-2: Cinematic Autoplay Component
 *
 * Automatically plays through transformation milestones:
 * m0 (2s) -> m4 (2s) -> m8 (2s) -> m12 (3s)
 * Total: ~12 seconds
 *
 * Features:
 * - Smooth crossfade transitions
 * - Skip button always visible
 * - Progress indicator
 * - Callback when complete
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SkipForward, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Milestone = "m0" | "m4" | "m8" | "m12";

interface MilestoneConfig {
  key: Milestone;
  duration: number;  // seconds
  label: string;
  subtitle: string;
}

const MILESTONES: MilestoneConfig[] = [
  { key: "m0", duration: 2, label: "HOY", subtitle: "Tu punto de partida" },
  { key: "m4", duration: 2, label: "MES 4", subtitle: "Primeras transformaciones" },
  { key: "m8", duration: 2, label: "MES 8", subtitle: "Progreso notable" },
  { key: "m12", duration: 3, label: "MES 12", subtitle: "Tu mejor versión" },
];

interface CinematicAutoplayProps {
  images: {
    m0?: string;
    m4?: string;
    m8?: string;
    m12?: string;
  };
  originalUrl?: string;
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
  showAudio?: boolean;
}

export function CinematicAutoplay({
  images,
  originalUrl,
  onComplete,
  onSkip,
  autoStart = true,
  showAudio = false,
}: CinematicAutoplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [isMuted, setIsMuted] = useState(true);

  const currentMilestone = MILESTONES[currentIndex];
  const currentImage = currentMilestone.key === "m0"
    ? (images.m0 || originalUrl)
    : images[currentMilestone.key];

  // Calculate total duration
  const totalDuration = MILESTONES.reduce((acc, m) => acc + m.duration, 0);

  // Progress update
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const duration = currentMilestone.duration * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const milestoneProgress = Math.min(elapsed / duration, 1);
      setProgress(milestoneProgress);

      if (milestoneProgress >= 1) {
        clearInterval(interval);
        if (currentIndex < MILESTONES.length - 1) {
          setCurrentIndex((prev) => prev + 1);
          setProgress(0);
        } else {
          onComplete();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, currentMilestone.duration, onComplete]);

  // Calculate overall progress
  const overallProgress = useCallback(() => {
    let completedDuration = 0;
    for (let i = 0; i < currentIndex; i++) {
      completedDuration += MILESTONES[i].duration;
    }
    completedDuration += currentMilestone.duration * progress;
    return completedDuration / totalDuration;
  }, [currentIndex, progress, currentMilestone.duration, totalDuration]);

  const handleSkip = () => {
    setIsPaused(true);
    onSkip();
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMilestone.key}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt={currentMilestone.label}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
          )}
          {/* Gradient overlays for cinematic look */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-start p-6">
          {/* Logo */}
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">
              NGX <span className="text-[#6D00FF]">TRANSFORM</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 tracking-widest">
              EXPERIENCIA INMERSIVA
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {showAudio && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            )}
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-white text-sm font-medium"
            >
              <span>Saltar</span>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" onClick={handleTogglePause} />

        {/* Bottom Content */}
        <div className="p-6 pb-10">
          {/* Milestone Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMilestone.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-5xl font-black italic text-white mb-2">
                {currentMilestone.label}
              </h2>
              <p className="text-lg text-neutral-300">
                {currentMilestone.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicators */}
          <div className="flex gap-2 mb-4">
            {MILESTONES.map((milestone, index) => {
              const isActive = index === currentIndex;
              const isComplete = index < currentIndex;

              return (
                <div
                  key={milestone.key}
                  className={cn(
                    "relative h-1 rounded-full overflow-hidden transition-all",
                    isActive ? "flex-[2]" : "flex-1",
                    "bg-white/20"
                  )}
                >
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      isActive ? "bg-[#6D00FF]" : "bg-white"
                    )}
                    initial={false}
                    animate={{
                      width: isComplete
                        ? "100%"
                        : isActive
                          ? `${progress * 100}%`
                          : "0%",
                    }}
                    transition={{ duration: 0.05, ease: "linear" }}
                  />
                </div>
              );
            })}
          </div>

          {/* Overall Progress */}
          <div className="flex justify-between items-center text-xs text-neutral-500">
            <span>
              {currentIndex + 1} de {MILESTONES.length}
            </span>
            <span>{Math.round(overallProgress() * 100)}% completado</span>
          </div>
        </div>
      </div>

      {/* Pause Indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 z-20"
            onClick={handleTogglePause}
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-4 mx-auto">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-y-[12px] border-y-transparent ml-2" />
              </div>
              <p className="text-white text-lg">Toca para continuar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
