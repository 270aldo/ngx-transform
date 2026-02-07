"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingCTA() {
  const { config } = useLandingConfig();
  const { cta } = config.copy;
  const { theme } = config;

  return (
    <section id="cta-final" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 scroll-mt-32">
      <div className="animate-on-scroll-scale relative glass-panel rounded-3xl p-12 md:p-16 text-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.primary}26, transparent 70%)`,
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[120px] opacity-20"
          style={{ backgroundColor: theme.primary }}
        />
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D00FF] to-[#5B21B6] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(109,0,255,0.3)]">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl text-white mb-4 tracking-tight font-display font-semibold">
            {cta.headline}
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 md:mb-10 max-w-lg mx-auto leading-relaxed font-body">
            {cta.subtitle}
          </p>
          <div className="flex justify-center">
            <Link
              href="/wizard"
              className="group relative px-10 md:px-12 py-4 md:py-5 rounded-full text-white text-base md:text-lg font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 40px -5px ${theme.primary}99`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center gap-2 font-body">
                {cta.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-6 font-body">{cta.footnote}</p>
        </div>
      </div>
    </section>
  );
}
