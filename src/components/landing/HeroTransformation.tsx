"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Brain, Camera, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";

interface HeroTransformationProps {
  className?: string;
}

export function HeroTransformation({ className }: HeroTransformationProps) {
  const [heroArtSrc, setHeroArtSrc] = useState("/images/backgrounds/hero-transformacion.svg");

  return (
    <div className={`animate-on-scroll-scale delay-400 relative w-full ${className ?? ""}`}>
      <div className="landing-surface rounded-[28px] p-4 md:p-5">
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#07070A]">
          <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6D00FF]/15 border border-[#6D00FF]/25">
                <Brain className="h-4 w-4 text-[#B98CFF]" />
              </div>
              <div>
                <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">briefing privado</p>
                <p className="text-sm font-semibold text-white">Visualización GENESIS</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              No compartida
            </span>
          </div>

          <div className="relative min-h-[300px] md:min-h-[360px] p-5 md:p-6">
            <Image
              src={heroArtSrc}
              alt="Visualización de potencial NGX"
              fill
              className="object-cover opacity-25"
              priority
              onError={() => setHeroArtSrc("/images/backgrounds/hero-abstract.svg")}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/55 to-[#050505]/94" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,0,255,0.18),transparent_55%)]" />

            <div className="relative z-10 grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_auto_minmax(0,1fr)] lg:items-center">
              <div className="landing-surface rounded-[22px] p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">input</span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">1 foto</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5">
                    <Camera className="h-6 w-6 text-white/35" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Tu punto de partida</p>
                    <p className="text-sm leading-relaxed text-slate-400">
                      Foto, objetivo y contexto base para construir una lectura menos genérica.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {["Privado", "12 meses", "Con contexto", "Siguiente paso"].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-400"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex flex-col items-center gap-2">
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#6D00FF] to-transparent" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6D00FF]/40 bg-[#6D00FF]/20">
                  <ArrowRight className="h-4 w-4 text-[#C5A4FF]" />
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-transparent via-[#6D00FF] to-transparent" />
              </div>

              <div className="landing-surface rounded-[22px] border border-[#6D00FF]/18 p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">salida</span>
                  <span className="inline-flex items-center rounded-full border border-[#6D00FF]/25 bg-[#6D00FF]/12 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#C5A4FF]">
                    horizonte 12 meses
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6D00FF]/35 bg-gradient-to-br from-[#6D00FF]/20 to-[#B98CFF]/10 shadow-[0_0_30px_rgba(109,0,255,0.18)]">
                    <Sparkles className="h-6 w-6 text-[#C5A4FF]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Una visión que provoca acción</p>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Primero genera deseo. Después abre el puente hacia hábitos, estructura y fit real.
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {[
                    { icon: Target, title: "Visualización motivacional", value: "No diagnóstico" },
                    { icon: Zap, title: "Lectura inicial", value: "Contexto antes de venta" },
                    { icon: ShieldCheck, title: "Resultado privado", value: "Compartes si tú quieres" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/6">
                            <Icon className="h-4 w-4 text-[#C5A4FF]" />
                          </div>
                          <span className="text-sm text-slate-300">{item.title}</span>
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/6 bg-[#050505]/92 px-4 py-3 md:px-6">
            {[
              { icon: Brain, label: "Visualización GENESIS" },
              { icon: ShieldCheck, label: "Privado" },
              { icon: Zap, label: "4 etapas" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-slate-400"
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute -inset-6 bg-[#6D00FF]/10 blur-[90px] rounded-full -z-10" />
    </div>
  );
}
