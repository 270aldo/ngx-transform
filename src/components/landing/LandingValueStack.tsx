"use client";

import { Image as ImageIcon, ScanFace, Share2, Target } from "lucide-react";

const items = [
  {
    icon: ScanFace,
    title: "Análisis Biométrico por IA",
    description:
      "Evaluación de composición corporal estimada, proporción muscular y áreas de oportunidad. No adivinanzas: datos.",
  },
  {
    icon: ImageIcon,
    title: "Proyección Visual Realista",
    description:
      "Una imagen generada por IA de tu potencial físico a 12 semanas. Basada en ciencia, no en fantasía.",
  },
  {
    icon: Target,
    title: "Plan de Acción Personalizado",
    description:
      "Recomendaciones específicas para tu caso: qué priorizar, qué evitar, y por dónde empezar. No plantillas genéricas.",
  },
  {
    icon: Share2,
    title: "Social Pack (Compartible)",
    description:
      "Tu resultado en formato optimizado para compartir en redes. Comparte y desbloquea contenido adicional exclusivo.",
  },
];

export function LandingValueStack() {
  return (
    <section id="que-recibes" className="max-w-5xl mx-auto px-4 mb-32 md:mb-48 scroll-mt-32">
      <div className="animate-on-scroll text-center mb-12 md:mb-16">
        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono uppercase tracking-widest mb-6">
          Qué recibes gratis
        </span>
        <h2 className="text-3xl md:text-4xl text-white font-display font-semibold mb-4 tracking-tight">
          No es solo una foto bonita.
          <br />
          <span className="text-[#EDE9FE]">Es tu diagnóstico completo.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} glass-panel rounded-2xl p-6 md:p-8 border-glow-hover`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#6D00FF]/10 border border-[#6D00FF]/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[#B98CFF]" />
                </div>
                <div>
                  <h3 className="text-white font-display font-medium mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-body">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
