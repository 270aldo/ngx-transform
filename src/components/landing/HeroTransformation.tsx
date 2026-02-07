"use client";

import Image from "next/image";
import { useState } from "react";
import { Brain, Camera, ShieldCheck, Sparkles, Zap } from "lucide-react";

interface HeroTransformationProps {
  className?: string;
}

export function HeroTransformation({ className }: HeroTransformationProps) {
  const [heroArtSrc, setHeroArtSrc] = useState("/images/backgrounds/hero-transformacion.svg");

  return (
    <div className={`animate-on-scroll-scale delay-400 relative w-full max-w-4xl mx-auto ${className ?? ""}`}>
      <div className="glass-panel rounded-3xl p-4 md:p-6 border border-white/10">
        <div className="bg-[#07070A] rounded-2xl overflow-hidden border border-white/5">
          <div className="relative grid grid-cols-2 gap-0 min-h-[240px] md:min-h-[360px]">
            <Image
              src={heroArtSrc}
              alt="Visualización de transformación NGX"
              fill
              className="object-cover opacity-55"
              priority
              onError={() => setHeroArtSrc("/images/backgrounds/hero-abstract.svg")}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-[#050505]/92" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(109,0,255,0.18),transparent_60%)]" />

            <div className="relative z-10 p-6 md:p-10 flex flex-col items-center justify-center border-r border-white/5">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                <Camera className="w-9 h-9 md:w-10 md:h-10 text-white/30" />
              </div>
              <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">Tu foto</span>
              <span className="text-sm text-slate-600 mt-1 font-body">Hoy</span>
            </div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col items-center justify-center">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#6D00FF]/25 to-[#B98CFF]/20 border-2 border-[#6D00FF]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(109,0,255,0.25)]">
                <Sparkles className="w-9 h-9 md:w-10 md:h-10 text-[#B98CFF]" />
              </div>
              <span className="font-mono text-xs text-[#B98CFF] uppercase tracking-widest">Tu potencial</span>
              <span className="text-sm text-slate-600 mt-1 font-body">12 semanas</span>
            </div>
          </div>

          <div className="border-t border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between bg-[#050505]/90">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#6D00FF]/20 flex items-center justify-center">
                <Brain className="w-3 h-3 text-[#B98CFF]" />
              </div>
              <span className="text-[10px] md:text-xs text-slate-500 font-mono uppercase tracking-widest">GENESIS AI Analysis</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400 font-body">
                <ShieldCheck className="w-3 h-3" /> Privado
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400 font-body">
                <Zap className="w-3 h-3" /> 60s
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -inset-6 bg-[#6D00FF]/10 blur-[90px] rounded-full -z-10" />
    </div>
  );
}
