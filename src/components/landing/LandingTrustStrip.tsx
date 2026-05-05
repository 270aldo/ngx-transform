"use client";

import { Lock } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { TrustStripCopy, TrustCardCopy } from "@/config/landing/types";

const FALLBACK: TrustStripCopy = {
  title: "Tu foto, tus datos, tu control.",
  subtitle:
    "Esta experiencia usa información sensible. Por eso la explicamos claro antes de pedirte avanzar.",
  cards: [
    { title: "Procesamiento privado", description: "Tu foto se usa solo para operar esta sesión y generar tu resultado." },
    { title: "Sin promesa de resultado", description: "La visualización es aspiracional. No confirma cómo vas a verte." },
    { title: "No es evaluación médica", description: "La lectura es educativa y no sustituye atención profesional." },
    { title: "Control de datos", description: "Puedes solicitar eliminación de tu información cuando lo necesites." },
  ],
};

function getCards(copy: TrustStripCopy): TrustCardCopy[] {
  if (copy.cards && copy.cards.length > 0) return copy.cards;
  if (copy.bullets && copy.bullets.length > 0) {
    return copy.bullets.map((text) => ({ title: text, description: "" }));
  }
  return FALLBACK.cards ?? [];
}

export function LandingTrustStrip() {
  const { config } = useLandingConfig();
  const copy = config.copy.trustStrip ?? FALLBACK;
  const cards = getCards(copy);

  return (
    <section id="trust" className="ngx-section">
      <div className="ngx-section-panel ngx-trust-panel">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:gap-12 lg:items-center">
          <div className="animate-on-scroll">
            <span className="ngx-eyebrow-pill" data-accent="emerald">Privacidad</span>
            <span
              className="mb-5 mt-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                backgroundColor: "rgba(0, 245, 170, 0.12)",
                borderColor: "rgba(0, 245, 170, 0.28)",
              }}
            >
              <Lock className="h-6 w-6" style={{ color: "var(--ngx-success)" }} />
            </span>
            <h2 className="font-body font-bold text-2xl md:text-3xl leading-tight tracking-[-0.02em] text-ngx-fg-1 max-w-[18ch]">
              {copy.title}
            </h2>
            {copy.subtitle ? (
              <p className="mt-4 text-sm leading-relaxed text-ngx-fg-2 max-w-md">
                {copy.subtitle}
              </p>
            ) : null}
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {cards.map((card, i) => (
              <li
                key={card.title}
                className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""}`}
              >
                <article className="ngx-metal-card h-full !p-4 md:!p-5">
                  <div className="relative z-10">
                    <h3 className="font-body font-bold text-sm md:text-base text-ngx-fg-1 leading-tight tracking-[-0.01em] mb-1.5">
                      {card.title}
                    </h3>
                    {card.description ? (
                      <p className="font-body text-xs md:text-sm leading-relaxed text-ngx-fg-2">
                        {card.description}
                      </p>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
