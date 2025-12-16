"use client";

/**
 * PR-3: Share-to-Unlock Component
 *
 * UI component for the share-to-unlock flow:
 * 1. Shows locked state with share prompt
 * 2. User clicks share
 * 3. Countdown timer appears
 * 4. After delay, unlock options appear
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Lock, Unlock, Download, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type UnlockType = "social_pack" | "4k_hero";

interface ShareToUnlockProps {
  shareId: string;
  isUnlocked?: boolean;
  onShare?: () => Promise<boolean>;
  onUnlock?: (type: UnlockType) => void;
  className?: string;
}

const UNLOCK_DELAY_SECONDS = parseInt(
  process.env.NEXT_PUBLIC_SHARE_UNLOCK_DELAY_SECONDS || "5",
  10
);

export function ShareToUnlock({
  shareId,
  isUnlocked: initialUnlocked = false,
  onShare,
  onUnlock,
  className,
}: ShareToUnlockProps) {
  const [state, setState] = useState<
    "locked" | "sharing" | "countdown" | "unlocked"
  >(initialUnlocked ? "unlocked" : "locked");
  const [countdown, setCountdown] = useState(UNLOCK_DELAY_SECONDS);
  const [selectedUnlock, setSelectedUnlock] = useState<UnlockType | null>(null);

  // Countdown effect
  useEffect(() => {
    if (state !== "countdown") return;

    if (countdown <= 0) {
      setState("unlocked");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state, countdown]);

  const handleShare = useCallback(async () => {
    setState("sharing");

    try {
      // Record share intent
      await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId, action: "share_intent" }),
      });

      // Try native share
      if (navigator.share) {
        await navigator.share({
          title: "Mi Transformación - NGX",
          text: "Mira mi transformación proyectada de 12 meses",
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
      }

      // Start countdown
      setCountdown(UNLOCK_DELAY_SECONDS);
      setState("countdown");

      // Notify parent
      if (onShare) {
        await onShare();
      }
    } catch (error) {
      // User cancelled share or error
      console.log("Share cancelled or failed:", error);
      setState("locked");
    }
  }, [shareId, onShare]);

  const handleSelectUnlock = async (type: UnlockType) => {
    setSelectedUnlock(type);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId,
          action: "request_unlock",
          unlockType: type,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onUnlock?.(type);
      }
    } catch (error) {
      console.error("Unlock error:", error);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {/* Locked State */}
        {state === "locked" && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-gradient-to-br from-neutral-900 to-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">Contenido Premium</h3>
                <p className="text-sm text-neutral-400">
                  Comparte para desbloquear
                </p>
              </div>
            </div>

            <p className="text-neutral-300 text-sm mb-4">
              Comparte tu transformación para desbloquear el Social Pack (3
              formatos) o la imagen 4K de alta resolución.
            </p>

            <button
              onClick={handleShare}
              className={cn(
                "w-full flex items-center justify-center gap-3",
                "px-6 py-4 rounded-xl",
                "bg-[#6D00FF] hover:bg-[#5800CC]",
                "text-white font-bold",
                "transition-all duration-200",
                "shadow-[0_0_20px_rgba(109,0,255,0.3)]"
              )}
            >
              <Share2 className="w-5 h-5" />
              <span>Compartir para desbloquear</span>
            </button>
          </motion.div>
        )}

        {/* Sharing State */}
        {state === "sharing" && (
          <motion.div
            key="sharing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-gradient-to-br from-neutral-900 to-black text-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#6D00FF]/20 flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-6 h-6 text-[#6D00FF] animate-pulse" />
            </div>
            <p className="text-neutral-300">Compartiendo...</p>
          </motion.div>
        )}

        {/* Countdown State */}
        {state === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-gradient-to-br from-neutral-900 to-black text-center"
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              {/* Circular progress */}
              <svg className="w-20 h-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-neutral-800"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="text-[#6D00FF]"
                  initial={{ strokeDasharray: 226, strokeDashoffset: 0 }}
                  animate={{
                    strokeDashoffset:
                      226 * (1 - countdown / UNLOCK_DELAY_SECONDS),
                  }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{countdown}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-neutral-300">
              <Clock className="w-4 h-4" />
              <span>Desbloqueando...</span>
            </div>
          </motion.div>
        )}

        {/* Unlocked State */}
        {state === "unlocked" && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 bg-gradient-to-br from-emerald-900/30 to-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <Unlock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">¡Desbloqueado!</h3>
                <p className="text-sm text-neutral-400">
                  Elige tu descarga
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Social Pack Option */}
              <button
                onClick={() => handleSelectUnlock("social_pack")}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all",
                  "border",
                  selectedUnlock === "social_pack"
                    ? "border-[#6D00FF] bg-[#6D00FF]/10"
                    : "border-white/10 hover:border-white/20 bg-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-4 h-4 text-[#6D00FF]" />
                      <span className="font-bold text-white">Social Pack</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      3 formatos: Story (9:16), Post (4:5), Square (1:1)
                    </p>
                  </div>
                  {selectedUnlock === "social_pack" && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </button>

              {/* 4K Hero Option */}
              <button
                onClick={() => handleSelectUnlock("4k_hero")}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all",
                  "border",
                  selectedUnlock === "4k_hero"
                    ? "border-[#6D00FF] bg-[#6D00FF]/10"
                    : "border-white/10 hover:border-white/20 bg-white/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-4 h-4 text-[#6D00FF]" />
                      <span className="font-bold text-white">4K Hero</span>
                    </div>
                    <p className="text-sm text-neutral-400">
                      Tu mejor versión (m12) en ultra alta resolución
                    </p>
                  </div>
                  {selectedUnlock === "4k_hero" && (
                    <Check className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
