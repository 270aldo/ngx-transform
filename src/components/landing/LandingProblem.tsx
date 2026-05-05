"use client";

import { Layers, RefreshCw, AlertTriangle } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { ProblemCopy } from "@/config/landing/types";

const FALLBACK: ProblemCopy = {
  sectionLabel: "El problema real",
  title: "El problema no es tu disciplina.",
  highlight: "Es que sigues usando planes que no te conocen.",
  subtitle:
    "Has probado rutinas, apps, dietas y consejos sueltos. Algunos funcionan unos días. Luego llega tu vida real: estrés, horarios, sueño, cansancio, lesiones o falta de estructura. Ahí se rompe el plan.",
  cards: [
    {
      title: "Tu plan no conoce tu contexto",
      description:
        "No sabe cómo duermes, cuánto tiempo tienes, qué equipo usas, qué lesiones arrastras ni qué tan constante has sido antes.",
    },
    {
      title: "Empiezas fuerte, pero el sistema no se adapta",
      description:
        "Cuando baja la motivación o se complica la semana, una rutina genérica no ajusta nada. Solo te deja con culpa.",
    },
    {
      title: "Después de los 30, improvisar sale caro",
      description:
        "Músculo, energía, recuperación y metabolismo necesitan estrategia. No más planes hechos para alguien que no eres tú.",
    },
  ],
};

const ICONS = [Layers, RefreshCw, AlertTriangle];

export function LandingProblem() {
  const { config } = useLandingConfig();
  const copy = config.copy.problem ?? FALLBACK;

  return (
    <section id="problema" className="ngx-section">
      <div className="ngx-section-header">
        <div className="animate-on-scroll">
          <span className="ngx-eyebrow-pill" data-accent="red">{copy.sectionLabel}</span>
          <h2 className="ngx-section-heading">
            {copy.title}
            <br />
            <span className="text-ngx-fg-3">{copy.highlight}</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 max-w-2xl text-sm md:text-base leading-relaxed text-ngx-fg-2 lg:ml-auto">
          {copy.subtitle}
        </p>
      </div>

      <div className="ngx-card-grid ngx-card-grid-3 items-stretch">
        {copy.cards.map((card, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <article
              key={card.title}
              className={`animate-on-scroll ${index > 0 ? `delay-${index}00` : ""} ngx-card h-full`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <span className="ngx-card-icon" data-accent="red">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="ngx-eyebrow text-[10px]" style={{ color: "rgba(252, 165, 165, 0.55)" }}>
                  0{index + 1}
                </span>
              </div>
              <h3 className="ngx-card-title mb-2">{card.title}</h3>
              <p className="ngx-card-desc">{card.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
