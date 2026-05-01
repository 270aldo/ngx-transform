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
    <section className="max-w-6xl mx-auto px-4 mb-32 md:mb-48">
      <div className="grid gap-8 mb-10 md:mb-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-end">
        <div className="animate-on-scroll">
          <span className="inline-flex px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-mono uppercase tracking-widest mb-6">
            El problema real
          </span>
          <h2 className="landing-heading-section text-[2rem] leading-[1.05] text-white sm:text-[2.4rem] md:text-[2.9rem] max-w-[20ch]">
            El problema no es tu disciplina.
            <br />
            <span className="text-slate-400">Es que tu modelo está roto.</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 max-w-2xl text-[15px] leading-relaxed text-slate-400 md:text-base lg:ml-auto">
          Llevas años intentando transformar tu cuerpo con apps genéricas, rutinas de internet y dietas que no entienden tu vida real. El resultado siempre es el mismo: empiezas fuerte, y a las 3 semanas se cae todo.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {problems.map((problem, index) => {
          const Icon = problem.icon;
          return (
            <div
              key={problem.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} landing-surface rounded-[24px] p-5 md:p-7 border-glow-hover`}
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-red-400" />
                </div>
                <span className="landing-kicker !text-[0.62rem] !tracking-[0.22em] text-red-300/70">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-white font-body font-semibold text-[1.3rem] leading-[1.05] mb-3 tracking-[-0.03em]">
                {problem.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-body">{problem.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
