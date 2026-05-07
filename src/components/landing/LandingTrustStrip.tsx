"use client";

import { Lock } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { TrustStripCopy, TrustCardCopy } from "@/config/landing/types";

const FALLBACK: TrustStripCopy = {
  title: "Tu foto, tus datos, tu control.",
  subtitle:
    "Esta experiencia usa información sensible. Por eso la explicamos claro antes de pedirte avanzar.",
  cards: [
    {
      title: "Procesamiento privado",
      description:
        "Tu foto se usa solo para operar esta sesión y generar tu resultado.",
    },
    {
      title: "Sin promesa de resultado",
      description:
        "La visualización es aspiracional. No confirma cómo vas a verte.",
    },
    {
      title: "No es evaluación médica",
      description: "La lectura es educativa y no sustituye atención profesional.",
    },
    {
      title: "Control de datos",
      description:
        "Puedes solicitar eliminación de tu información cuando lo necesites.",
    },
  ],
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV"] as const;

function getCards(copy: TrustStripCopy): TrustCardCopy[] {
  if (copy.cards && copy.cards.length > 0) return copy.cards;
  if (copy.bullets && copy.bullets.length > 0) {
    return copy.bullets.map((text) => ({ title: text, description: "" }));
  }
  return FALLBACK.cards ?? [];
}

/**
 * LandingTrustStrip — "Privacidad". Rediseñado en feat/landing-visual-polish.
 *
 * Decisiones:
 * - Cero cards (sin ngx-metal-card). Layout tipo "declaración de principios"
 *   o manifiesto legal: numeración romana I/II/III/IV, verbo declarativo
 *   destacado, body explicativo debajo.
 * - Mood emerald — distinto del ámbar (Problem) y del purple-light
 *   (ValueStack). El verde es semánticamente correcto: "seguro / OK".
 * - Sticky en columna izquierda para que el heading + lock sigan visibles
 *   mientras el ojo recorre los 4 principios.
 */
export function LandingTrustStrip() {
  const { config } = useLandingConfig();
  const copy = config.copy.trustStrip ?? FALLBACK;
  const cards = getCards(copy);

  return (
    <section
      id="trust"
      className="relative w-full px-4 py-24 md:py-32 scroll-mt-24"
    >
      {/* Vignetting emerald sutil — el resto del landing usa purple, esta
          sección merece su propio mood "frío/seguro". */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 20%, rgba(0,245,170,0.05), transparent 38%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:items-start">
          {/* Header sticky — heading + subtitle */}
          <div className="animate-on-scroll lg:sticky lg:top-24">
            <div className="mb-6 flex items-center gap-3">
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                style={{
                  backgroundColor: "rgba(0, 245, 170, 0.10)",
                  border: "1px solid rgba(0, 245, 170, 0.32)",
                }}
              >
                <Lock
                  className="h-4 w-4"
                  style={{ color: "var(--ngx-success)" }}
                />
              </span>
              <span
                className="font-mono text-[11px] uppercase tracking-[0.32em]"
                style={{ color: "var(--ngx-success)" }}
              >
                Privacidad
              </span>
            </div>

            <h2
              className="font-body font-black text-white"
              style={{
                fontSize: "clamp(1.95rem, 3.6vw, 3.1rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {copy.title}
            </h2>

            {copy.subtitle ? (
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/62">
                {copy.subtitle}
              </p>
            ) : null}

            {/* Mini badge inferior — refuerza el mood "manifiesto" */}
            <div className="mt-8 inline-flex items-center gap-2">
              <span
                aria-hidden
                className="h-px w-8"
                style={{ background: "rgba(0, 245, 170, 0.45)" }}
              />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "rgba(0, 245, 170, 0.65)" }}
              >
                Cuatro principios
              </span>
            </div>
          </div>

          {/* 4 declaraciones de principios — layout declarativo,
              numeración romana, sin cards. */}
          <ol className="space-y-10 md:space-y-12">
            {cards.map((card, i) => (
              <li
                key={card.title}
                className={`animate-on-scroll ${
                  i > 0 ? `delay-${i}00` : ""
                } group relative grid grid-cols-[auto_minmax(0,1fr)] gap-6 md:gap-8`}
              >
                {/* Número romano outlined */}
                <div className="pt-1">
                  <span
                    className="font-mono font-bold tabular-nums leading-none transition-colors"
                    style={{
                      fontSize: "clamp(1.15rem, 1.5vw, 1.4rem)",
                      letterSpacing: "0.02em",
                      color: "rgba(0, 245, 170, 0.7)",
                    }}
                  >
                    {ROMAN_NUMERALS[i] ?? `0${i + 1}`}
                  </span>
                </div>

                <div className="min-w-0">
                  {/* Verbo declarativo grande */}
                  <h3
                    className="font-body font-bold text-white"
                    style={{
                      fontSize: "clamp(1.15rem, 1.7vw, 1.45rem)",
                      letterSpacing: "-0.018em",
                      lineHeight: 1.15,
                    }}
                  >
                    {card.title}
                    <span
                      className="ml-1 inline-block"
                      style={{ color: "rgba(0, 245, 170, 0.6)" }}
                    >
                      .
                    </span>
                  </h3>

                  {card.description ? (
                    <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-white/58 md:text-[0.97rem]">
                      {card.description}
                    </p>
                  ) : null}
                </div>

                {/* Hairline separator entre principios (excepto el último) */}
                {i < cards.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-5 h-px md:-bottom-6"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(0,245,170,0.10) 0%, rgba(255,255,255,0.04) 30%, transparent 75%)",
                    }}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
