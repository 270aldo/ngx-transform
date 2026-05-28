"use client";

import type { VariantId } from "@/config/landing";
import { useVariantTracking } from "@/hooks/useVariantTracking";
import { ScrollAnimator } from "./ScrollAnimator";
import { LandingProvider } from "./LandingProvider";
import { LandingTopNav } from "./LandingTopNav";
import { LandingHero } from "./LandingHero";
import { LandingJourney } from "./LandingJourney";
import { LandingFAQ } from "./LandingFAQ";
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
        <div className="ngx-landing-shell relative min-h-screen overflow-x-hidden selection:bg-[#6D00FF] selection:text-white">
          <LandingTopNav />

          {/* Main Content */}
          <main className="relative z-10 pt-28 sm:pt-32 md:pt-40">
            <LandingHero />
            <LandingJourney />
            <LandingFAQ />
          </main>

          <LandingFooter />

          {/* Sticky CTA for mobile */}
          <StickyCTA />
        </div>
      </ScrollAnimator>
    </LandingProvider>
  );
}
