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
  const { theme } = config;

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
          href="/wizard"
          className="group relative flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-full text-white text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 active:scale-[0.98]"
          style={{
            backgroundColor: theme.primary,
            boxShadow: `0 0 30px -5px ${theme.primary}99`,
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />

          <span className="relative">{hero.cta}</span>
          <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Subtle text below */}
        <p className="text-center text-[10px] text-slate-500 mt-2">
          Gratis • Sin tarjeta de crédito • 2 min
        </p>
      </div>
    </div>
  );
}
