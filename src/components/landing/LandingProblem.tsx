"use client";

import { Layers, RefreshCw, AlertTriangle } from "lucide-react";

const problems = [
  {
    icon: Layers,
    title: "Tu rutina no sabe cómo vives",
    description:
      "No sabe cuánto duermes, cuánto estrés traes, qué lesiones arrastras ni qué equipo tienes disponible.",
  },
  {
    icon: RefreshCw,
    title: "Tu cuerpo cambia, tu plan no",
    description:
      "Empiezas fuerte. Te agotas. Paras. Vuelves con culpa. El problema no es la voluntad: es un sistema que no se adapta.",
  },
  {
    icon: AlertTriangle,
    title: "Después de los 30, improvisar sale caro",
    description:
      "Músculo, energía, sueño y recuperación ya no responden igual. Necesitas precisión, no motivación genérica.",
  },
];

export function LandingProblem() {
  return (
    <section id="problema" className="ngx-section">
      <div className="ngx-section-header">
        <div className="animate-on-scroll">
          <span className="ngx-eyebrow-pill" data-accent="red">El problema real</span>
          <h2 className="ngx-section-heading">
            El problema no es tu disciplina.
            <br />
            <span className="text-ngx-fg-3">Es que usas un sistema que no te conoce.</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 max-w-2xl text-sm md:text-base leading-relaxed text-ngx-fg-2 lg:ml-auto">
          Llevas años intentando transformar tu cuerpo con apps genéricas, rutinas de internet y dietas que no entienden tu vida real. El resultado se repite: empiezas fuerte, se complica la semana y el plan deja de tener sentido.
        </p>
      </div>

      <div className="ngx-card-grid ngx-card-grid-3">
        {problems.map((problem, index) => {
          const Icon = problem.icon;
          return (
            <article
              key={problem.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ngx-card`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="ngx-card-icon" data-accent="red">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="ngx-eyebrow text-[10px]" style={{ color: "rgba(252, 165, 165, 0.55)" }}>
                  0{index + 1}
                </span>
              </div>
              <h3 className="ngx-card-title mb-2">{problem.title}</h3>
              <p className="ngx-card-desc">{problem.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
