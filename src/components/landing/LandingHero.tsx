"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import { HeroTransformation } from "./HeroTransformation";

export function LandingHero() {
  const { config } = useLandingConfig();
  const { hero } = config.copy;
  const { theme } = config;

  // Scale class for mayores variant
  const textScaleClass = theme.textScale > 1 ? "scale-[1.1]" : "";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-48">
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div
          className="animate-on-scroll inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-12 shadow-[0_0_40px_-10px_rgba(109,0,255,0.4)] hover:shadow-[0_0_50px_-10px_rgba(109,0,255,0.5)] transition-all duration-300 cursor-default"
          style={{ borderColor: `${theme.primary}40` }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] text-slate-300 tracking-wide">
            {hero.badge.aiLabel}
          </span>
          <span className="h-3 w-px bg-white/20" />
          <span
            className="text-[11px] tracking-wide"
            style={{ color: theme.accent }}
          >
            {hero.badge.version}
          </span>
        </div>

        {/* Title */}
        <h1 className={`animate-on-scroll delay-100 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] text-white tracking-tighter mb-6 font-semibold ${textScaleClass} origin-center`}>
          {hero.headline.line1}
          <br className="hidden sm:block" />
          <span className="text-gradient-lg">{hero.headline.line2}</span>
        </h1>

        {/* Subtitle */}
        <p className={`animate-on-scroll delay-200 text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-14 font-light ${textScaleClass} origin-center`}>
          {hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="animate-on-scroll delay-300 flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <Link
            href="/wizard"
            className="group relative px-8 py-4 rounded-full text-white text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 0 30px -5px ${theme.primary}99`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center gap-2">
              {hero.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Social Proof */}
        <div className="animate-on-scroll delay-400 flex items-center gap-4 mb-16">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 border-2 border-[#030005]" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-300 border-2 border-[#030005]" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-300 border-2 border-[#030005]" />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-300 border-2 border-[#030005]" />
          </div>
          <div className="text-left">
            <p className="text-xs text-white font-medium">
              {hero.socialProof.count}
            </p>
            <p className="text-[11px] text-slate-500">
              {hero.socialProof.label}
            </p>
          </div>
        </div>

        {/* Hero Transformation Preview */}
        <HeroTransformation />
      </div>
    </section>
  );
}
