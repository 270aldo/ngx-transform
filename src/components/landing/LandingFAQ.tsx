"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    question: "¿Es realmente gratis?",
    answer:
      "Sí. NGX Transform es 100% gratuito. Sin tarjeta de crédito, sin compromisos. Recibes tu análisis completo y tu proyección visual sin pagar nada. Es nuestra forma de demostrarte lo que GENESIS puede hacer.",
  },
  {
    question: "¿Qué pasa con mi foto? ¿Es segura?",
    answer:
      "Tu privacidad es prioridad. La foto se procesa de forma segura, se usa únicamente para generar tu análisis, y se elimina después. No la almacenamos, no la compartimos, no la usamos para entrenar modelos.",
  },
  {
    question: "¿La proyección es realista?",
    answer:
      "Sí. GENESIS no genera imágenes de fantasía. La proyección se basa en lo que es fisiológicamente alcanzable para tu tipo de cuerpo en 12 semanas con un sistema de entrenamiento y nutrición adecuado. Es ambiciosa pero realista.",
  },
  {
    question: "¿Qué es NGX HYBRID?",
    answer:
      "NGX HYBRID es nuestro programa de transformación de 12 semanas que combina inteligencia artificial (GENESIS) con coaching humano. La IA diseña y ajusta tu plan; el coach valida, corrige técnica y te acompaña. Es el siguiente paso natural después de ver tu potencial con Transform.",
  },
  {
    question: "¿Funciona para mayores de 40?",
    answer:
      "Está diseñado especialmente para personas de 30 a 60 años. De hecho, es donde más impacto tiene: después de los 30, la salud muscular se convierte en el factor más importante para tu energía, metabolismo y longevidad. GENESIS entiende tu contexto y adapta todo a tu realidad.",
  },
];

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-4 mb-32 md:mb-48 scroll-mt-32">
      <div className="animate-on-scroll text-center mb-12 md:mb-16">
        <span className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-6">
          FAQ
        </span>
        <h2 className="text-3xl md:text-4xl text-white font-display font-semibold tracking-tight">Preguntas frecuentes</h2>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} glass-panel rounded-2xl border border-white/10 overflow-hidden`}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 md:p-6 text-left text-white"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium font-body pr-4">{item.question}</span>
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Plus className={`w-3 h-3 text-[#B98CFF] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </div>
              </button>
              <div className={`px-5 md:px-6 transition-all duration-300 ${isOpen ? "max-h-80 pb-6" : "max-h-0 pb-0 overflow-hidden"}`}>
                <p className="text-slate-400 text-sm leading-relaxed font-body">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
