"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ImageHeroProps {
  imageUrl?: string;
}

export function ImageHero({ imageUrl }: ImageHeroProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-950">
      {/* Image with crossfade animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Transformación NGX Vision"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Subtle gradient overlay - ONLY at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* NGX VISION watermark overlay at bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 lg:bottom-6 lg:right-8"
      >
        <span className="text-lg sm:text-xl lg:text-2xl font-black italic tracking-tighter text-white/70 drop-shadow-lg">
          NGX <span className="text-[var(--primary)]/70">VISION</span>
        </span>
      </motion.div>
    </div>
  );
}
