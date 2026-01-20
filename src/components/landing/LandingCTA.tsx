"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingCTA() {
  const { config } = useLandingConfig();
  const { cta } = config.copy;
  const { theme } = config;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
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
          <h2 className="text-3xl md:text-4xl text-white mb-6 tracking-tight font-semibold">
            {cta.headline}
          </h2>
          <p className="text-slate-400 text-sm mb-10 max-w-md mx-auto">
            {cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/wizard"
              className="group relative px-10 py-4 rounded-full text-white text-sm font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: theme.primary,
                boxShadow: `0 0 40px -5px ${theme.primary}99`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <span className="relative flex items-center gap-2">
                {cta.buttonText}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            <span className="text-slate-500 text-xs">{cta.footnote}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
