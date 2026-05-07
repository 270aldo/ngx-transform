"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

/**
 * LandingCTA — cierre del landing. Rediseñado en feat/landing-visual-polish.
 *
 * Decisiones:
 * - Cero card / panel. Layout full-bleed con glow purple radial expandido
 *   que evoca el producto (CinematicAutoplay del /s/[shareId]).
 * - Heading clamp generoso (hasta 6rem) — DOMINA la pantalla. Es el
 *   cierre, no un párrafo más.
 * - Sparkles eliminado: el ícono lucide chiquito rompía la escala
 *   cinematográfica. La firma visual la pone el glow + la tipografía.
 * - Disclaimer mono uppercase tracking-wide al final como crédito.
 */
export function LandingCTA() {
  const { config, trackCta } = useLandingConfig();
  const { cta } = config.copy;

  return (
    <section
      id="cta-final"
      className="relative w-full px-4 py-32 md:py-44 scroll-mt-24"
    >
      {/* Glow radial expandido — el cierre cinematic. Más generoso que
          el resto del landing para enmarcar el momento "final". */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 50% 60%, rgba(109,0,255,0.22), transparent 65%), radial-gradient(ellipse 40% 50% at 50% 100%, rgba(184,148,255,0.15), transparent 55%)",
        }}
      />

      {/* Frame line — top hairline del cierre, separa simbólicamente del FAQ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(184,148,255,0.32) 50%, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="animate-on-scroll-scale flex flex-col items-center text-center">
          {/* Eyebrow editorial */}
          <div className="mb-10 flex items-center gap-3">
            <span
              aria-hidden
              className="h-px w-10"
              style={{ background: "rgba(184,148,255,0.55)" }}
            />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.36em]"
              style={{ color: "var(--ngx-purple-light)" }}
            >
              Cierre · Tu siguiente paso
            </span>
            <span
              aria-hidden
              className="h-px w-10"
              style={{ background: "rgba(184,148,255,0.55)" }}
            />
          </div>

          {/* Heading cinematic */}
          <h2
            className="font-body font-black text-white"
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 5.6rem)",
              letterSpacing: "-0.045em",
              lineHeight: 0.94,
              maxWidth: "20ch",
            }}
          >
            {cta.headline}
          </h2>

          {/* Subtitle generoso */}
          <p
            className="mx-auto mt-8 max-w-xl leading-relaxed text-white/65"
            style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)" }}
          >
            {cta.subtitle}
          </p>

          {/* CTA grande con glow */}
          <div className="mt-12">
            <Link
              href="/wizard"
              onClick={() => trackCta("final_cta", cta.intent, cta.buttonText)}
              className="group relative inline-flex items-center gap-3 rounded-full text-white font-bold uppercase tracking-[0.08em] transition-all duration-200 hover:-translate-y-1 active:scale-[0.97]"
              style={{
                height: "64px",
                paddingInline: "2.5rem",
                fontSize: "0.95rem",
                backgroundColor: "var(--ngx-purple)",
                boxShadow:
                  "0 0 0 1px rgba(184,148,255,0.20), 0 18px 50px -8px rgba(109,0,255,0.55), 0 0 80px -10px rgba(184,148,255,0.40)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(184,148,255,0.32), 0 24px 64px -8px rgba(109,0,255,0.70), 0 0 110px -10px rgba(184,148,255,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 0 1px rgba(184,148,255,0.20), 0 18px 50px -8px rgba(109,0,255,0.55), 0 0 80px -10px rgba(184,148,255,0.40)";
              }}
            >
              <span>{cta.buttonText}</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Footnote disclaimer — crédito final, escala generosa */}
          <p
            className="mt-12 font-mono uppercase text-white/35"
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.36em",
            }}
          >
            {cta.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
