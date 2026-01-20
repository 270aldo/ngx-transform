"use client";

import type { VariantId } from "@/config/landing";
import { useVariantTracking } from "@/hooks/useVariantTracking";
import { AnimatedBlobs } from "./AnimatedBlobs";
import { ScrollAnimator } from "./ScrollAnimator";
import { LandingProvider } from "./LandingProvider";
import { LandingHero } from "./LandingHero";
import { LandingStats } from "./LandingStats";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingExplainerVideo } from "./LandingExplainerVideo";
import { LandingTestimonials } from "./LandingTestimonials";
import { LandingCTA } from "./LandingCTA";
import { LandingFooter } from "./LandingFooter";
import { StickyCTA } from "./StickyCTA";

// ============================================================================
// Props
// ============================================================================

interface LandingPageProps {
  variant?: VariantId;
}

// ============================================================================
// Component
// ============================================================================

export function LandingPage({ variant = "general" }: LandingPageProps) {
  // Track variant for analytics
  useVariantTracking(variant);

  return (
    <LandingProvider variant={variant}>
      <ScrollAnimator>
        <div className="relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white">
          {/* Background */}
          <AnimatedBlobs />

          {/* Main Content */}
          <main className="relative z-10 pt-32 pb-20">
            <LandingHero />
            <LandingStats />
            <LandingFeatures />
            <LandingHowItWorks />
            <LandingExplainerVideo />
            <LandingTestimonials />
            <LandingCTA />
          </main>

          <LandingFooter />

          {/* Sticky CTA for mobile */}
          <StickyCTA />
        </div>
      </ScrollAnimator>
    </LandingProvider>
  );
}
