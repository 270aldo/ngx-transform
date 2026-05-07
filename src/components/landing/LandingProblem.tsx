"use client";

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

export function LandingProblem() {
  const { config } = useLandingConfig();
  const copy = config.copy.problem ?? FALLBACK;

  return (
    <section
      id="problema"
      className="relative w-full px-4 py-24 md:py-32 scroll-mt-24"
    >
      {/* Vignetting con tono cálido — diferente del purple del resto del
          landing. La sección "problema" merece un mood propio: ámbar
          tenue de "alarma", no glow purple aspiracional. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 75% 12%, rgba(245,158,11,0.08), transparent 38%), radial-gradient(circle at 12% 80%, rgba(109,0,255,0.06), transparent 32%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* HEADER — split asimétrico: heading domina 60% izq, párrafo 40% der */}
        <div className="grid gap-8 md:gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end">
          <div className="animate-on-scroll">
            <div className="mb-8 flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-12 shrink-0"
                style={{ background: "rgba(252, 211, 77, 0.45)" }}
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "rgb(252, 211, 77)" }}
              >
                {copy.sectionLabel}
              </span>
            </div>

            <h2 className="ngx-h1 !text-left">
              {copy.title}
              <br />
              <span style={{ color: "rgba(255,255,255,0.42)" }}>
                {copy.highlight}
              </span>
            </h2>
          </div>

          <p
            className="animate-on-scroll delay-100 max-w-md text-base leading-relaxed text-white/62 lg:text-[1.05rem]"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: "1.25rem" }}
          >
            {copy.subtitle}
          </p>
        </div>

        {/* DIVIDER — elegante hairline gradient, no border-top típico */}
        <div
          aria-hidden
          className="my-16 h-px md:my-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 50%, transparent)",
          }}
        />

        {/* PROBLEMAS — sin cards. Cada problema es una entrada editorial:
            número gigante (7xl/8xl tabular-nums) a la izquierda, título
            tipográfico fuerte + body al lado. Separadores hairline entre
            entradas, no boxes alrededor. */}
        <ol className="space-y-12 md:space-y-16">
          {copy.cards.map((card, index) => (
            <li
              key={card.title}
              className={`animate-on-scroll ${
                index > 0 ? `delay-${index}00` : ""
              } group relative grid gap-6 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12 lg:gap-16`}
            >
              {/* Número editorial — outlined en lugar de filled, gigante */}
              <div className="relative md:pt-2">
                <span
                  aria-hidden
                  className="block font-mono font-bold tabular-nums leading-none transition-colors duration-300"
                  style={{
                    fontSize: "clamp(4rem, 7vw, 6.5rem)",
                    color: "transparent",
                    WebkitTextStroke:
                      index === 0
                        ? "1.5px rgba(252, 211, 77, 0.85)"
                        : "1.5px rgba(255,255,255,0.18)",
                    letterSpacing: "-0.06em",
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="ngx-h3 !text-left">{card.title}</h3>
                <p className="mt-4 max-w-xl leading-relaxed text-white/62 md:text-[1.02rem]">
                  {card.description}
                </p>
              </div>

              {/* Hairline separator entre items (excepto el último) */}
              {index < copy.cards.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-6 h-px md:-bottom-8"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, transparent 70%)",
                  }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
