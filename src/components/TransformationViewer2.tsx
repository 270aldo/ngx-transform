"use client";

/**
 * PR-2: TransformationViewer2 - Results 2.0
 *
 * New immersive results experience with:
 * - Cinematic autoplay on first view
 * - Chapter-based navigation
 * - Compare slider integration
 * - Letter from future modal
 *
 * v2.1 Viral Optimization:
 * - Dramatic reveal countdown
 * - Share to unlock modal
 * - Social counter
 * - Agent bridge CTA
 * - Referral card
 *
 * Controlled by feature flags
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import type { InsightsResult, TimelineEntry } from "@/types/ai";
import { CinematicAutoplay } from "./results/CinematicAutoplay";
import { ChapterView } from "./results/ChapterView";
// CompareSlider imported but reserved for future use
// import { CompareSlider } from "./results/CompareSlider";
import { LetterFromFuture } from "./results/LetterFromFuture";
import { DramaticReveal } from "./results/DramaticReveal";
import { SocialShareButton } from "./SocialShareButton";
import { BookingHeaderButton } from "./BookingHeaderButton";
import { BookingCTA } from "./BookingCTA";
import { ShareToUnlockModal } from "./viral/ShareToUnlockModal";
import { SocialCounter } from "./SocialCounter";
import { AgentBridgeCTA } from "./AgentBridgeCTA";
import { ReferralCard } from "./ReferralCard";
import { cn } from "@/lib/utils";

export type TimelineStep = "m0" | "m4" | "m8" | "m12";

const STEPS: TimelineStep[] = ["m0", "m4", "m8", "m12"];

const STEP_LABELS: Record<TimelineStep, string> = {
  m0: "HOY",
  m4: "MES 4",
  m8: "MES 8",
  m12: "MES 12",
};

interface TransformationViewer2Props {
  ai: InsightsResult;
  imageUrls: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
  shareId: string;
  isReady?: boolean;
  letterFromFuture?: string;
  // v2.1 Viral props
  userName?: string;
  userProfile?: {
    focusZone?: "upper" | "lower" | "abs" | "full";
    goal?: "definicion" | "masa" | "mixto";
    stressLevel?: number;
  };
  referralCode?: string;
  referralCount?: number;
  sessionId?: string;
  // Feature flags (passed from server)
  featureFlags?: {
    FF_DRAMATIC_REVEAL?: boolean;
    FF_SOCIAL_COUNTER?: boolean;
    FF_AGENT_BRIDGE_CTA?: boolean;
    FF_SHARE_TO_UNLOCK?: boolean;
    FF_REFERRAL_TRACKING?: boolean;
  };
}

export function TransformationViewer2({
  ai,
  imageUrls,
  shareId,
  isReady = true,
  letterFromFuture,
  // v2.1 Viral props
  userName,
  userProfile,
  referralCode,
  referralCount = 0,
  sessionId,
  featureFlags = {},
}: TransformationViewer2Props) {
  // Feature flags with defaults
  const {
    FF_DRAMATIC_REVEAL = true,
    FF_SOCIAL_COUNTER = true,
    FF_AGENT_BRIDGE_CTA = true,
    FF_SHARE_TO_UNLOCK = true,
    FF_REFERRAL_TRACKING = true,
  } = featureFlags;

  // State
  const [showDramaticReveal, setShowDramaticReveal] = useState(FF_DRAMATIC_REVEAL);
  const [showShareModal, setShowShareModal] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<string[]>([]);
  const [showCinematic, setShowCinematic] = useState(!FF_DRAMATIC_REVEAL); // Only show if no dramatic reveal
  const [currentStep, setCurrentStep] = useState<TimelineStep>("m0");
  const [showLetter, setShowLetter] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [hasSeenCinematic, setHasSeenCinematic] = useState(false);

  // Check if user has already seen the dramatic reveal / cinematic
  useEffect(() => {
    const dramaticKey = `ngx-dramatic-seen-${shareId}`;
    const cinematicKey = `ngx-cinematic-seen-${shareId}`;
    const unlockKey = `ngx-unlocked-${shareId}`;

    // Check dramatic reveal
    if (localStorage.getItem(dramaticKey)) {
      setShowDramaticReveal(false);
    }

    // Check cinematic
    if (localStorage.getItem(cinematicKey)) {
      setShowCinematic(false);
      setHasSeenCinematic(true);
    }

    // Check unlocked content
    const unlocked = localStorage.getItem(unlockKey);
    if (unlocked) {
      try {
        setUnlockedContent(JSON.parse(unlocked));
      } catch {
        // Invalid JSON, reset
        localStorage.removeItem(unlockKey);
      }
    }
  }, [shareId]);

  // Get current data
  const currentEntry = ai.timeline[currentStep] as TimelineEntry;
  const currentImage = currentStep === "m0"
    ? imageUrls.originalUrl
    : imageUrls.images?.[currentStep];
  const originalImage = imageUrls.originalUrl;
  const baselineStats = ai.timeline.m0.stats || {
    strength: 30,
    aesthetics: 30,
    endurance: 30,
    mental: 30,
  };

  // Handlers

  // Dramatic Reveal completion
  const handleDramaticRevealComplete = useCallback(() => {
    setShowDramaticReveal(false);
    localStorage.setItem(`ngx-dramatic-seen-${shareId}`, "true");

    // Show share modal if enabled
    if (FF_SHARE_TO_UNLOCK && unlockedContent.length === 0) {
      setShowShareModal(true);
    }
  }, [shareId, FF_SHARE_TO_UNLOCK, unlockedContent.length]);

  // Content unlock handler
  const handleContentUnlock = useCallback(
    (contentType: string) => {
      const newUnlocked = [...unlockedContent, contentType];
      setUnlockedContent(newUnlocked);
      localStorage.setItem(`ngx-unlocked-${shareId}`, JSON.stringify(newUnlocked));
    },
    [shareId, unlockedContent]
  );

  const handleCinematicComplete = useCallback(() => {
    setShowCinematic(false);
    setCurrentStep("m12"); // Jump to m12 after cinematic
    const key = `ngx-cinematic-seen-${shareId}`;
    localStorage.setItem(key, "true");
    setHasSeenCinematic(true);
  }, [shareId]);

  const handleCinematicSkip = useCallback(() => {
    setShowCinematic(false);
    setCurrentStep("m0");
    const key = `ngx-cinematic-seen-${shareId}`;
    localStorage.setItem(key, "true");
    setHasSeenCinematic(true);
  }, [shareId]);

  const handleStepChange = (step: TimelineStep) => {
    setCurrentStep(step);
    setShowNav(false);
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleShare = async (milestone: TimelineStep) => {
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi Transformación ${STEP_LABELS[milestone]} - NGX`,
          text: `Mira mi transformación proyectada para ${STEP_LABELS[milestone]}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled or failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Build images object for cinematic
  const cinematicImages = {
    m0: originalImage,
    m4: imageUrls.images?.m4,
    m8: imageUrls.images?.m8,
    m12: imageUrls.images?.m12,
  };

  // Show dramatic reveal first (v2.1)
  if (showDramaticReveal && isReady && FF_DRAMATIC_REVEAL) {
    return (
      <DramaticReveal
        images={{
          m0: originalImage || "",
          m4: imageUrls.images?.m4 || "",
          m8: imageUrls.images?.m8 || "",
          m12: imageUrls.images?.m12 || "",
        }}
        userName={userName}
        onRevealComplete={handleDramaticRevealComplete}
        sessionId={sessionId}
      />
    );
  }

  // Show cinematic on first view (only if ready and no dramatic reveal)
  if (showCinematic && isReady && !FF_DRAMATIC_REVEAL) {
    return (
      <CinematicAutoplay
        images={cinematicImages}
        originalUrl={originalImage}
        onComplete={handleCinematicComplete}
        onSkip={handleCinematicSkip}
        autoStart={true}
      />
    );
  }

  const currentIndex = STEPS.indexOf(currentStep);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < STEPS.length - 1;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu / Back */}
          <button
            onClick={() => setShowNav(!showNav)}
            className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            {showNav ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Center: Current milestone */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">
              {currentIndex + 1}/{STEPS.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#6D00FF] text-white text-sm font-bold">
              {STEP_LABELS[currentStep]}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {isReady ? (
              <>
                <SocialShareButton shareId={shareId} imageUrl={currentImage} />
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm text-neutral-300">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            <BookingHeaderButton />
          </div>
        </div>
      </header>

      {/* Navigation Overlay */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg flex items-center justify-center"
          >
            <div className="space-y-4 text-center">
              <p className="text-neutral-500 text-sm mb-6">Ir a:</p>
              {STEPS.map((step, index) => (
                <motion.button
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleStepChange(step)}
                  className={cn(
                    "block w-full px-8 py-4 rounded-2xl text-xl font-bold transition-all",
                    step === currentStep
                      ? "bg-[#6D00FF] text-white"
                      : "bg-white/5 text-neutral-300 hover:bg-white/10"
                  )}
                >
                  {STEP_LABELS[step]}
                </motion.button>
              ))}

              {/* Replay cinematic */}
              {hasSeenCinematic && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    setShowNav(false);
                    setShowCinematic(true);
                  }}
                  className="mt-8 px-6 py-3 rounded-full text-neutral-400 hover:text-white transition-colors text-sm"
                >
                  🎬 Reproducir experiencia cinematográfica
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <ChapterView
              milestone={currentStep}
              timelineEntry={{
                month: parseInt(currentStep.replace("m", "")),
                title: currentEntry.title || STEP_LABELS[currentStep],
                description: currentEntry.description || currentEntry.focus || "",
                mental: currentEntry.mental,
                stats: currentEntry.stats || baselineStats,
              }}
              baselineStats={baselineStats}
              currentImage={currentImage}
              originalImage={originalImage}
              onShare={handleShare}
              onShowLetter={currentStep === "m12" ? () => setShowLetter(true) : undefined}
            />
          </motion.div>
        </AnimatePresence>

        {/* v2.1 Viral Section */}
        <div className="px-6 py-8 bg-gradient-to-t from-neutral-950 to-black space-y-8">
          {/* Social Counter */}
          {FF_SOCIAL_COUNTER && (
            <div className="text-center">
              <SocialCounter variant="results" sessionId={sessionId} />
            </div>
          )}

          {/* Agent Bridge CTA (replaces BookingCTA when enabled) */}
          {FF_AGENT_BRIDGE_CTA && userProfile ? (
            <AgentBridgeCTA
              userProfile={userProfile}
              shareId={shareId}
              sessionId={sessionId}
            />
          ) : (
            <BookingCTA />
          )}

          {/* Referral Card */}
          {FF_REFERRAL_TRACKING && referralCode && (
            <ReferralCard
              referralCode={referralCode}
              referralCount={referralCount}
              shareId={shareId}
              sessionId={sessionId}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation Arrows */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-between px-6 pointer-events-none">
        <button
          onClick={handlePrevStep}
          disabled={!hasPrev}
          className={cn(
            "p-4 rounded-full transition-all pointer-events-auto",
            hasPrev
              ? "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
              : "opacity-0"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextStep}
          disabled={!hasNext}
          className={cn(
            "p-4 rounded-full transition-all pointer-events-auto",
            hasNext
              ? "bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
              : "opacity-0"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Letter From Future Modal */}
      <LetterFromFuture
        content={
          letterFromFuture ||
          "Estás leyendo esto porque lo lograste. Cada gota de sudor, cada momento de duda superado, te trajo aquí. No fue fácil, pero lo que vale la pena nunca lo es. Ahora mira hacia atrás y agradece a quien empezó este camino. Ese fuiste tú."
        }
        isOpen={showLetter}
        onClose={() => setShowLetter(false)}
        onShare={() => {
          handleShare("m12");
          setShowLetter(false);
        }}
      />

      {/* v2.1: Share to Unlock Modal */}
      {FF_SHARE_TO_UNLOCK && (
        <ShareToUnlockModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareId={shareId}
          unlockedContent={unlockedContent}
          onUnlock={handleContentUnlock}
          sessionId={sessionId}
          stats={baselineStats}
          userName={userName}
        />
      )}
    </div>
  );
}
