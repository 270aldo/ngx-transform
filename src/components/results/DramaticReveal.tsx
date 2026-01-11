"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DramaticRevealProps {
  images: {
    m0: string;
    m4: string;
    m8: string;
    m12: string;
  };
  userName?: string;
  onRevealComplete: () => void;
  sessionId?: string;
}

const COUNTDOWN_DURATION = 5;
const TRANSITION_DURATION = 2000; // ms per image

export function DramaticReveal({
  images,
  userName,
  onRevealComplete,
  sessionId,
}: DramaticRevealProps) {
  const [phase, setPhase] = useState<
    "intro" | "countdown" | "reveal" | "complete"
  >("intro");
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [currentImage, setCurrentImage] = useState<"m0" | "m4" | "m8" | "m12">(
    "m0"
  );

  // Track event helper
  const trackEvent = useCallback(
    (event: string) => {
      if (!sessionId) return;
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          event,
          metadata: { userName },
        }),
      }).catch(console.error);
    },
    [sessionId, userName]
  );

  // Track reveal start
  useEffect(() => {
    trackEvent("reveal_start");
  }, [trackEvent]);

  // Intro phase - 2 seconds
  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => setPhase("countdown"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Countdown phase
  useEffect(() => {
    if (phase === "countdown" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === "countdown" && countdown === 0) {
      setPhase("reveal");
    }
  }, [phase, countdown]);

  // Reveal phase - transition through images
  useEffect(() => {
    if (phase === "reveal") {
      const sequence: Array<"m0" | "m4" | "m8" | "m12"> = [
        "m0",
        "m4",
        "m8",
        "m12",
      ];
      let index = 0;

      const interval = setInterval(() => {
        index++;
        if (index < sequence.length) {
          setCurrentImage(sequence[index]);
        } else {
          clearInterval(interval);
          setPhase("complete");
          trackEvent("reveal_complete");
          setTimeout(onRevealComplete, 1500);
        }
      }, TRANSITION_DURATION);

      return () => clearInterval(interval);
    }
  }, [phase, onRevealComplete, trackEvent]);

  const handleSkip = () => {
    trackEvent("reveal_skip");
    onRevealComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 text-white/40 hover:text-white/80 text-sm z-10 px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all"
      >
        Saltar
      </button>

      <AnimatePresence mode="wait">
        {/* Intro Phase */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center px-4"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-light text-white"
            >
              {userName ? `${userName}, ` : ""}Tu transformación está lista...
            </motion.p>
          </motion.div>
        )}

        {/* Countdown Phase */}
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-8xl md:text-9xl font-bold text-white tabular-nums"
              style={{
                textShadow: "0 0 60px rgba(109, 0, 255, 0.8)",
              }}
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}

        {/* Reveal Phase */}
        {(phase === "reveal" || phase === "complete") && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full h-full max-w-2xl max-h-[80vh] mx-auto px-4"
          >
            {/* Image with crossfade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="relative w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[currentImage]}
                  alt={`Transformación ${currentImage}`}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Milestone indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
              {(["m0", "m4", "m8", "m12"] as const).map((m) => (
                <div
                  key={m}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentImage === m
                      ? "bg-violet-500 scale-125"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Milestone label */}
            <motion.div
              key={`label-${currentImage}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2"
            >
              <span className="px-4 py-2 rounded-full bg-white/10 text-sm text-white/80 backdrop-blur-sm">
                {currentImage === "m0" && "HOY"}
                {currentImage === "m4" && "MES 4"}
                {currentImage === "m8" && "MES 8"}
                {currentImage === "m12" && "MES 12"}
              </span>
            </motion.div>

            {/* Final message */}
            {phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center"
              >
                <p className="text-xl md:text-2xl font-semibold text-white">
                  Este eres tú en 12 meses
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
