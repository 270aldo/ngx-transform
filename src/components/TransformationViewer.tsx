"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { InsightsResult } from "@/types/ai";
import { ImageHero } from "./ImageHero";
import { StatsPanel } from "./StatsPanel";
import { TimelineNav } from "./TimelineNav";
import { SocialShareButton } from "./SocialShareButton";
import { BookingHeaderButton } from "./BookingHeaderButton";
import { BookingCTA } from "./BookingCTA";
import { DownloadButton } from "./DownloadButton";

export type TimelineStep = "m0" | "m4" | "m8" | "m12";

interface TransformationViewerProps {
  ai: InsightsResult;
  imageUrls: {
    originalUrl?: string;
    images?: Record<string, string>;
  };
  shareId: string;
  isReady?: boolean;
}

export function TransformationViewer({ ai, imageUrls, shareId, isReady = true }: TransformationViewerProps) {
  const [currentStep, setCurrentStep] = useState<TimelineStep>("m0");

  const currentEntry = ai.timeline[currentStep];
  const currentImage = currentStep === "m0"
    ? imageUrls.originalUrl
    : imageUrls.images?.[currentStep];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Actions only */}
      <header className="fixed top-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          {isReady ? (
            <>
              <DownloadButton imageUrl={currentImage} filename={`ngx-${currentStep}`} />
              <SocialShareButton shareId={shareId} imageUrl={currentImage} />
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-sm text-neutral-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Generando...</span>
            </div>
          )}
          <BookingHeaderButton />
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <main className="flex flex-col lg:flex-row min-h-screen pt-14 sm:pt-16 lg:pt-0">
        {/* Left: Image Hero (50% on desktop) */}
        <section className="lg:w-1/2 h-[50vh] sm:h-[55vh] lg:h-screen relative lg:sticky lg:top-0">
          <ImageHero imageUrl={currentImage} />
        </section>

        {/* Right: Stats Panel (50% on desktop) */}
        <section className="lg:w-1/2 min-h-[45vh] lg:min-h-screen flex flex-col">
          {/* Timeline Nav - Visible on mobile between image and stats */}
          <div className="lg:hidden py-3 sm:py-4 px-3 sm:px-4 bg-black/90 backdrop-blur-sm sticky top-14 sm:top-16 z-30">
            <TimelineNav
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>

          {/* Stats Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-10 lg:pt-24 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <StatsPanel
                  entry={currentEntry}
                  step={currentStep}
                  insightsText={ai.insightsText}
                />
              </motion.div>
            </AnimatePresence>

            {/* Booking CTA */}
            <div className="mt-8 lg:mt-12">
              <BookingCTA />
            </div>
          </div>

          {/* Timeline Nav - Desktop (sticky bottom) */}
          <div className="hidden lg:block sticky bottom-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent">
            <TimelineNav
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
