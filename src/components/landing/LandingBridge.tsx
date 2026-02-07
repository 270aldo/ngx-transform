"use client";

import { BookOpen, Brain, Users } from "lucide-react";

const bridgeCards = [
  {
    icon: Brain,
    title: "IA que se adapta",
    description:
      "GENESIS diseña tu season de 12 semanas con progresión y ajustes semanales basados en tus datos reales.",
  },
  {
    icon: Users,
    title: "Coach que valida",
    description:
      "Un humano revisa, ajusta y te acompaña. La IA propone, el coach valida. Eso es control de calidad.",
  },
  {
    icon: BookOpen,
    title: "Bonus: Ebook IA",
    description:
      "\"El Músculo: Tu Órgano de Longevidad\" — un ebook conversacional con IA que te educa y responde tus dudas en tiempo real.",
  },
];

export function LandingBridge() {
  return (
    <section className="max-w-5xl mx-auto px-4 mb-32 md:mb-48">
      <div className="animate-on-scroll glass-panel rounded-2xl md:rounded-3xl p-6 md:p-12 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 cta-gradient" />
        <div className="absolute inset-0 opacity-[0.18] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-flex px-3 py-1 rounded-full bg-[#6D00FF]/10 border border-[#6D00FF]/20 text-[10px] text-[#B98CFF] font-mono uppercase tracking-widest mb-6">
              El siguiente paso
            </span>
            <h2 className="text-2xl md:text-4xl text-white font-display font-semibold mb-4 tracking-tight">
              Visualizar es el primer paso.
              <br />
              <span className="text-[#EDE9FE]">Transformarte es el segundo.</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-body">
              NGX HYBRID es una cohorte de 12 semanas donde la IA propone y un coach humano valida. No es una app. Es un sistema completo de transformación diseñado para tu vida real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {bridgeCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="glass-panel rounded-xl p-5 md:p-6 text-center border-glow-hover">
                  <Icon className="w-8 h-8 text-[#B98CFF] mx-auto mb-3" />
                  <h4 className="text-white text-sm font-display font-medium mb-2">{card.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed font-body">{card.description}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-widest">Cupos limitados por cohorte · Capacidad de coaches</p>
            <a href="#cta-final" className="inline-flex px-8 py-4 rounded-full bg-[#6D00FF] text-white font-semibold font-body shadow-[0_0_30px_-5px_rgba(109,0,255,0.6)] hover:bg-[#5B21B6] transition-colors">
              Empieza con Transform (Gratis)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
