"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

// ============================================================================
// Component
// ============================================================================

export function StickyCTA() {
  const { config } = useLandingConfig();
  const { hero } = config.copy;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 600px (roughly past hero)
      const scrolledPastHero = window.scrollY > 600;

      // Hide when near the bottom CTA section (last 800px of page)
      const nearBottom =
        window.scrollY + window.innerHeight >
        document.documentElement.scrollHeight - 800;

      setIsVisible(scrolledPastHero && !nearBottom);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Gradient fade effect at top */}
      <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#030005] to-transparent pointer-events-none" />

      {/* CTA Container */}
      <div className="bg-[#030005]/95 backdrop-blur-xl border-t border-white/10 px-4 py-3 safe-area-inset-bottom">
        <Link
          href="/auth?next=/wizard"
          className="ngx-primary-cta group relative flex w-full overflow-hidden px-6 py-3.5 text-sm"
        >
          <span className="relative">{hero.primaryCta.label}</span>
          <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Subtle text below */}
        <p className="text-center text-[11px] text-slate-500 mt-2">
          Sin costo • Sin compromiso • Con honestidad
        </p>
      </div>
    </div>
  );
}
