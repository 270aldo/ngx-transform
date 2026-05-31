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

import { useState, useCallback } from "react";
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
import { getSeasonMilestoneLabel } from "@/lib/seasonMilestones";

export type TimelineStep = "m0" | "m4" | "m8" | "m12";

const STEPS: TimelineStep[] = ["m0", "m4", "m8", "m12"];

const STEP_LABELS: Record<TimelineStep, string> = {
  m0: getSeasonMilestoneLabel("m0"),
  m4: getSeasonMilestoneLabel("m4"),
  m8: getSeasonMilestoneLabel("m8"),
  m12: getSeasonMilestoneLabel("m12"),
};

const STEP_SHORT_LABELS: Record<TimelineStep, string> = {
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
  surfaceMode?: "default" | "lead-magnet";
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
    FF_SHARE_UNLOCK?: boolean;
    FF_REFERRAL_TRACKING?: boolean;
  };
}

export function TransformationViewer2({
  ai,
  imageUrls,
  shareId,
  isReady = true,
  surfaceMode = "default",
  letterFromFuture,
  // v2.1 Viral props
  userName,
  userProfile,
  referralCode,
  referralCount = 0,
  sessionId,
  featureFlags = {},
}: TransformationViewer2Props) {
  const isLeadMagnet = surfaceMode === "lead-magnet";

  // Feature flags with defaults
  const {
    FF_DRAMATIC_REVEAL = true,
    FF_SOCIAL_COUNTER = true,
    FF_AGENT_BRIDGE_CTA = true,
    FF_SHARE_TO_UNLOCK = false,
    FF_SHARE_UNLOCK,
    FF_REFERRAL_TRACKING = true,
  } = featureFlags;
  const allowDramaticReveal = !isLeadMagnet && FF_DRAMATIC_REVEAL;
  const allowCinematicAutoplay = !isLeadMagnet && !FF_DRAMATIC_REVEAL;
  const shareUnlockEnabled =
    !isLeadMagnet && (FF_SHARE_UNLOCK ?? FF_SHARE_TO_UNLOCK);

  // State
  const [showDramaticReveal, setShowDramaticReveal] = useState(() => {
    if (typeof window === "undefined") return allowDramaticReveal;
    return allowDramaticReveal && !localStorage.getItem(`ngx-dramatic-seen-${shareId}`);
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [unlockedContent, setUnlockedContent] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const unlocked = localStorage.getItem(`ngx-unlocked-${shareId}`);
    if (!unlocked) return [];
    try {
      return JSON.parse(unlocked);
    } catch {
      localStorage.removeItem(`ngx-unlocked-${shareId}`);
      return [];
    }
  });
  const [showCinematic, setShowCinematic] = useState(() => {
    if (typeof window === "undefined") return allowCinematicAutoplay;
    return allowCinematicAutoplay && !localStorage.getItem(`ngx-cinematic-seen-${shareId}`);
  }); // Only show if no dramatic reveal
  const [currentStep, setCurrentStep] = useState<TimelineStep>("m0");
  const [showLetter, setShowLetter] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [hasSeenCinematic, setHasSeenCinematic] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(`ngx-cinematic-seen-${shareId}`);
  });

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
  }, [shareId]);

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
    if (currentStep === "m12") {
      window.location.href = `/dashboard/${shareId}`;
      return;
    }
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleShare = async (milestone: TimelineStep) => {
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi diagnóstico visual ${STEP_LABELS[milestone]} - NGX`,
          text: `Mira mi diagnóstico visual de salud muscular en ${STEP_LABELS[milestone]}`,
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
  if (showDramaticReveal && isReady && allowDramaticReveal) {
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
  if (showCinematic && isReady && allowCinematicAutoplay) {
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
    <div className="min-h-screen bg-transparent text-white">
      <section className="relative min-h-screen overflow-hidden">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-30 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Menu / Back */}
            <button
              type="button"
              aria-label={showNav ? "Cerrar navegación" : "Abrir navegación"}
              onClick={() => setShowNav(!showNav)}
              className="ngx-glass-clear p-2 rounded-full transition-all hover:bg-white/[0.10]"
            >
              {showNav ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Center: Segmented Timeline Navigation */}
            <div className="flex items-center">
              {/* On mobile we allow horizontal scroll so the 4 pills remain comfortable to tap */}
              <div className="ngx-range-pills shadow-[var(--lg-glow-primary-soft)] border-[rgba(255,255,255,0.06)] bg-black/40 overflow-x-auto max-w-[68vw] sm:max-w-none snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
                {STEPS.map((step) => {
                  const isActive = step === currentStep;
                  return (
                    <button
                      key={step}
                      type="button"
                      onClick={() => handleStepChange(step)}
                      className={cn(
                        "ngx-range-pill snap-center shrink-0 !px-3.5 sm:!px-5 !py-1.5 text-[10px] sm:text-[10.5px] !font-black tracking-[0.16em] uppercase cursor-pointer min-w-[58px] sm:min-w-0",
                        isActive && "is-active"
                      )}
                    >
                      {STEP_SHORT_LABELS[step]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {isReady ? (
                <>
              <SocialShareButton shareId={shareId} imageUrl={currentImage} />
                </>
              ) : (
                <div className="ngx-glass-clear flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white/65">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
              {!isLeadMagnet && <BookingHeaderButton />}
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
                <span className="ngx-eyebrow !text-[10px] mb-6 block" style={{ color: "var(--ngx-fg-3)" }}>
                  Ir a
                </span>
                {STEPS.map((step, index) => (
                  <motion.button
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleStepChange(step)}
                    className={cn(
                      "block w-full px-8 py-4 rounded-2xl text-xl font-bold uppercase tracking-[0.02em] transition-all duration-150 active:scale-[0.97]",
                      step === currentStep
                        ? "text-white"
                        : "bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white"
                    )}
                    style={
                      step === currentStep
                        ? {
                            backgroundColor: "var(--ngx-purple)",
                            boxShadow: "var(--ngx-glow-primary-soft)",
                          }
                        : undefined
                    }
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
                    className="mt-8 px-6 py-3 rounded-full text-white/55 hover:text-white transition-colors text-sm"
                  >
                    Reproducir experiencia cinematográfica
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
                surfaceMode={surfaceMode}
                onShare={isLeadMagnet ? undefined : handleShare}
                onShowLetter={
                  !isLeadMagnet && currentStep === "m12"
                    ? () => setShowLetter(true)
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Arrows */}
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-between px-6 pointer-events-none">
          <button
            onClick={handlePrevStep}
            disabled={!hasPrev}
            className={cn(
              "p-4 rounded-full transition-all duration-150 pointer-events-auto active:scale-[0.97]",
              hasPrev
                ? "ngx-glass-clear hover:bg-white/[0.10] text-white"
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
      </section>

      {!isLeadMagnet && (
        <div className="px-6 py-8 space-y-8 border-t border-white/[0.08] backdrop-blur-xl bg-[var(--ngx-surface-glass)]">
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
      )}

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
      {shareUnlockEnabled && (
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
