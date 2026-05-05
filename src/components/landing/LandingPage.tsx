"use client";

import type { VariantId } from "@/config/landing";
import { useVariantTracking } from "@/hooks/useVariantTracking";
import { ScrollAnimator } from "./ScrollAnimator";
import { LandingProvider } from "./LandingProvider";
import { LandingTopNav } from "./LandingTopNav";
import { LandingHero } from "./LandingHero";
import { LandingProblem } from "./LandingProblem";
import { LandingStats } from "./LandingStats";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingExplainerVideo } from "./LandingExplainerVideo";
import { LandingValueStack } from "./LandingValueStack";
import { LandingReportPreview } from "./LandingReportPreview";
import { LandingBridge } from "./LandingBridge";
import { LandingTrustStrip } from "./LandingTrustStrip";
import { LandingFAQ } from "./LandingFAQ";
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
          <LandingTopNav />

          {/* Main Content */}
          <main className="relative z-10 pt-36 pb-20 md:pt-40">
            <LandingHero />
            <LandingProblem />
            <LandingHowItWorks />
            <LandingExplainerVideo />
            <LandingValueStack />
            <LandingReportPreview />
            <LandingStats />
            <LandingBridge />
            <LandingTrustStrip />
            <LandingFAQ />
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
