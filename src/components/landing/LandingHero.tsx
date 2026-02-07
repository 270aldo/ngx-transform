"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import { HeroTransformation } from "./HeroTransformation";

export function LandingHero() {
  const { config } = useLandingConfig();
  const { theme } = config;

  // Scale class for mayores variant
  const textScaleClass = theme.textScale > 1 ? "scale-[1.1]" : "";

  return (
    <section className="max-w-5xl mx-auto px-4 text-center mb-32 md:mb-48">
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div
          className="animate-on-scroll inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-12 shadow-[0_0_40px_-10px_rgba(109,0,255,0.4)] hover:shadow-[0_0_50px_-10px_rgba(109,0,255,0.5)] transition-all duration-300 cursor-default"
          style={{ borderColor: `${theme.primary}40` }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] text-slate-300 tracking-wide font-mono">Gratis</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[11px] text-slate-300 tracking-wide font-mono">Sin tarjeta</span>
          <span className="h-3 w-px bg-white/20" />
          <span className="text-[11px] tracking-wide font-mono" style={{ color: theme.accent }}>60 segundos</span>
        </div>

        {/* Title */}
        <h1 className={`animate-on-scroll delay-100 text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-white tracking-[-0.03em] mb-6 font-display font-semibold ${textScaleClass} origin-center`}>
          Visualiza tu
          <br />
          <span className="text-[#EDE9FE]">transformación física.</span>
        </h1>

        {/* Subtitle */}
        <p className={`animate-on-scroll delay-200 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mb-6 font-body font-normal ${textScaleClass} origin-center`}>
          Sube una foto. La IA analiza tu composición corporal, identifica tu potencial y genera una proyección visual realista de lo que tu cuerpo puede lograr en 12 semanas.
        </p>
        <p className="animate-on-scroll delay-200 text-xs text-slate-500 mb-10 md:mb-14 font-body">
          Desarrollado por <span className="text-[#B98CFF]">GENESIS</span> — el sistema de IA de NGX con 3 años de desarrollo especializado en salud muscular.
        </p>

        {/* CTAs */}
        <div className="animate-on-scroll delay-300 flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            href="/wizard"
            className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full text-white text-base font-semibold tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-0.5 min-h-[52px] inline-flex items-center justify-center"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 0 40px -5px ${theme.primary}99`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center gap-2 font-body">
              Descubre Tu Potencial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <a
            href="#como-funciona"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 rounded-full border border-white/15 bg-white/5 text-white font-body text-base hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2 min-h-[52px]"
          >
            <PlayCircle className="w-5 h-5" />
            Cómo Funciona
          </a>
        </div>

        {/* Hero Transformation Preview */}
        <HeroTransformation />
      </div>
    </section>
  );
}
