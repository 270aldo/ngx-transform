"use client";

/**
 * PR-2: Letter From Future Component
 *
 * Modal displaying a motivational letter from the user's
 * future self (m12). Features typewriter animation effect.
 *
 * Features:
 * - Typewriter text reveal animation
 * - Stoic but empathetic tone
 * - Share CTA button
 * - Elegant modal design
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LetterFromFutureProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  userName?: string;
}

export function LetterFromFuture({
  content,
  isOpen,
  onClose,
  onShare,
  userName,
}: LetterFromFutureProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || !content) {
      setDisplayedText("");
      setIsTyping(false);
      setShowCTA(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText("");
    setShowCTA(false);

    let currentIndex = 0;
    const typingSpeed = 30; // ms per character

    const typeInterval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedText(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Show CTA after typing completes
        setTimeout(() => setShowCTA(true), 500);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [isOpen, content]);

  // Skip to end
  const handleSkipTyping = useCallback(() => {
    if (isTyping) {
      setDisplayedText(content);
      setIsTyping(false);
      setTimeout(() => setShowCTA(true), 300);
    }
  }, [isTyping, content]);

  const handleShare = () => {
    onShare?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleSkipTyping}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "relative z-10 w-full max-w-lg",
              "bg-gradient-to-b from-neutral-900 to-black",
              "rounded-3xl border border-white/10",
              "shadow-[0_0_60px_rgba(109,0,255,0.2)]",
              "overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#6D00FF] to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>

            {/* Content */}
            <div className="p-8 pt-12">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-[#6D00FF]/20 text-[#6D00FF] text-xs font-bold tracking-widest mb-3">
                    MES 12
                  </span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-black italic text-white"
                >
                  CARTA DE TU YO FUTURO
                </motion.h2>
                {userName && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-neutral-400 mt-2"
                  >
                    Para {userName}
                  </motion.p>
                )}
              </div>

              {/* Letter content */}
              <div className="relative min-h-[200px]">
                {/* Paper texture effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/20 to-transparent rounded-xl pointer-events-none" />

                <div className="relative p-6 rounded-xl bg-neutral-900/50 border border-white/5">
                  {/* Quote mark */}
                  <div className="absolute top-2 left-4 text-6xl text-[#6D00FF]/20 font-serif leading-none">
                    "
                  </div>

                  {/* Letter text with typewriter effect */}
                  <p className="relative text-lg md:text-xl text-white/90 leading-relaxed font-light italic pl-8 pt-4">
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-5 bg-[#6D00FF] ml-1 align-middle"
                      />
                    )}
                  </p>

                  {/* Signature */}
                  <AnimatePresence>
                    {!isTyping && displayedText.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 pt-4 border-t border-white/10 text-right"
                      >
                        <p className="text-neutral-400 text-sm">
                          — Tu mejor versión
                        </p>
                        <p className="text-[#6D00FF] font-bold tracking-wider text-xs mt-1">
                          MES 12 • PEAK FORM
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Skip hint */}
                {isTyping && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-neutral-500 text-xs mt-4"
                  >
                    Toca para saltar
                  </motion.p>
                )}
              </div>

              {/* CTA */}
              <AnimatePresence>
                {showCTA && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 space-y-3"
                  >
                    {onShare && (
                      <button
                        onClick={handleShare}
                        className={cn(
                          "w-full flex items-center justify-center gap-3",
                          "px-6 py-4 rounded-2xl",
                          "bg-[#6D00FF] hover:bg-[#5800CC]",
                          "text-white font-bold",
                          "transition-all duration-200",
                          "shadow-[0_0_30px_rgba(109,0,255,0.4)]",
                          "hover:shadow-[0_0_40px_rgba(109,0,255,0.6)]"
                        )}
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Compartir carta + transformación</span>
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 text-neutral-400 hover:text-white transition-colors"
                    >
                      <span>Ver mi transformación</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#6D00FF]/20 blur-3xl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
