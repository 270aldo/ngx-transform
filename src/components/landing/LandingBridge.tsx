"use client";

import { useLandingConfig } from "./LandingProvider";

/**
 * LandingBridge — "Cuándo HYBRID / Coach Split". Rediseñado en feat/landing-visual-polish.
 *
 * Decisiones:
 * - Cero cards. Los 3 pasos se renderizan como una timeline vertical
 *   conectada con dots y line connectors — visualiza la progresión.
 * - Mood purple primary (NGX brand) — distinto del ámbar (Problem),
 *   purple-light (ValueStack) y emerald (Privacy).
 * - Heading + CTA sticky a la izquierda en desktop.
 */
export function LandingBridge() {
  const { config, trackCta } = useLandingConfig();
  const { bridge } = config.copy;
  if (!bridge) return null;

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? "";
  const isExternal = bookingUrl.startsWith("http");
  const buttonHref = bookingUrl || "#cta-final";

  return (
    <section
      id="puente"
      className="relative w-full px-4 py-24 md:py-32 scroll-mt-24"
    >
      {/* Vignetting purple primary — la sección "puente" lleva al CTA HYBRID */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 35%, rgba(109,0,255,0.10), transparent 42%), radial-gradient(circle at 78% 70%, rgba(184,148,255,0.06), transparent 32%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20 lg:items-start">
          {/* COLUMNA IZQUIERDA — heading + CTA, sticky */}
          <div className="animate-on-scroll lg:sticky lg:top-24 flex flex-col gap-7">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-px w-10"
                  style={{ background: "rgba(184,148,255,0.55)" }}
                />
                <span
                  className="font-mono text-[11px] uppercase tracking-[0.32em]"
                  style={{ color: "var(--ngx-purple-light)" }}
                >
                  {bridge.sectionLabel}
                </span>
              </div>

              <h2 className="ngx-h1 !text-left">
                {bridge.title}
                <br />
                <span style={{ color: "rgba(255,255,255,0.42)" }}>
                  {bridge.highlight}
                </span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-relaxed text-white/62">
                {bridge.subtitle}
              </p>
            </div>

            {bridge.footnote && (
              <p
                className="inline-flex self-start font-mono text-[11px] uppercase tracking-[0.28em]"
                style={{ color: "rgba(184,148,255,0.7)" }}
              >
                <span
                  aria-hidden
                  className="mr-3 inline-block h-px w-6 self-center"
                  style={{ background: "rgba(184,148,255,0.45)" }}
                />
                {bridge.footnote}
              </p>
            )}

            <div className="pt-2">
              <span className="mb-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
                15 min · gratis · sin compromiso
              </span>
              <a
                href={buttonHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                onClick={() =>
                  trackCta(
                    "bridge_primary",
                    bridge.buttonIntent,
                    bridge.buttonText
                  )
                }
                className="ngx-primary-cta group inline-flex w-full max-w-[360px] px-7 text-sm"
                style={{ minHeight: "60px" }}
              >
                {bridge.buttonText}
              </a>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                Sin presión. Si no es para ti ahora, también está bien.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA — Timeline vertical conectada */}
          <ol className="relative pl-12">
            {/* Línea vertical conectora — corre por toda la altura de la lista,
                con gradient fade en los extremos */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[18px] top-2 bottom-2 w-px"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(109,0,255,0.45) 8%, rgba(184,148,255,0.55) 50%, rgba(109,0,255,0.35) 92%, transparent)",
              }}
            />

            {bridge.cards.map((card, index) => {
              const Icon = card.icon;
              const isLast = index === bridge.cards.length - 1;
              return (
                <li
                  key={card.title}
                  className={`animate-on-scroll ${
                    index > 0 ? `delay-${index}00` : ""
                  } relative ${isLast ? "" : "pb-12 md:pb-16"}`}
                >
                  {/* Dot del timeline — 36x36 con icono dentro */}
                  <div
                    className="absolute -left-12 top-0 flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      background:
                        index === 0
                          ? "rgba(109,0,255,0.18)"
                          : "rgba(255,255,255,0.04)",
                      border:
                        index === 0
                          ? "1px solid rgba(109,0,255,0.55)"
                          : "1px solid rgba(184,148,255,0.30)",
                      boxShadow:
                        index === 0
                          ? "0 0 0 4px rgba(109,0,255,0.10)"
                          : "0 0 0 3px rgba(0,0,0,0.6)",
                    }}
                  >
                    <Icon
                      className="h-4 w-4"
                      style={{
                        color:
                          index === 0
                            ? "var(--ngx-purple-light)"
                            : "rgba(184,148,255,0.7)",
                      }}
                    />
                  </div>

                  {/* Contenido del paso — sin card */}
                  <div>
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.28em]"
                      style={{ color: "rgba(184,148,255,0.65)" }}
                    >
                      Paso 0{index + 1}
                    </span>
                    <h3 className="ngx-h3 mt-2 !text-left">{card.title}</h3>
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60 md:text-[0.97rem]">
                      {card.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
