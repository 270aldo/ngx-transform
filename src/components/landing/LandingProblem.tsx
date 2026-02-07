"use client";

import { Repeat, TimerOff, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: TimerOff,
    title: "Planes que ignoran tu vida",
    description:
      "Tu trabajo, tu familia, tu gym real y tu historial de lesiones. Nada de eso existe para una app genérica.",
  },
  {
    icon: Repeat,
    title: "El ciclo de culpa",
    description:
      "Empiezas fuerte. Te agotas. Paras. Vuelves con culpa. Repites. Años así. El problema no es la voluntad, es el sistema.",
  },
  {
    icon: TrendingDown,
    title: "Después de los 30, se acelera",
    description:
      "Pierdes entre 3-8% de masa muscular por década. Tu metabolismo baja. La energía cae. Y nadie te lo explica.",
  },
];

export function LandingProblem() {
  return (
    <section className="max-w-4xl mx-auto px-4 mb-32 md:mb-48">
      <div className="animate-on-scroll text-center mb-12 md:mb-16">
        <span className="inline-flex px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono uppercase tracking-widest mb-6">
          El problema real
        </span>
        <h2 className="text-3xl md:text-4xl text-white font-display font-semibold mb-6 tracking-tight">
          El problema no es tu disciplina.
          <br />
          <span className="text-slate-400">Es que tu modelo está roto.</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-body">
          Llevas años intentando transformar tu cuerpo con apps genéricas, rutinas de internet y dietas que no entienden tu vida real. El resultado siempre es el mismo: empiezas fuerte, y a las 3 semanas se cae todo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((problem, index) => {
          const Icon = problem.icon;
          return (
            <div
              key={problem.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} glass-panel rounded-2xl p-6 md:p-8 border-glow-hover`}
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-display font-medium mb-3">{problem.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-body">{problem.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
