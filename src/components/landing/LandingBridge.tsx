"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingBridge() {
  const { config, trackCta } = useLandingConfig();
  const { bridge } = config.copy;
  if (!bridge) return null;

  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? "";
  const isExternal = bookingUrl.startsWith("http");
  const buttonHref = bookingUrl || "#cta-final";

  return (
    <section id="puente" className="ngx-section">
      <div className="animate-on-scroll ngx-section-panel">
        {/* Soft gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(109,0,255,0.10), transparent 70%)",
          }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:items-start">
          <div className="flex flex-col gap-6">
            <div>
              <span className="ngx-eyebrow-pill">{bridge.sectionLabel}</span>
              <h2 className="ngx-section-heading">
                {bridge.title}
                <br />
                <span className="text-ngx-fg-2">{bridge.highlight}</span>
              </h2>
              <p className="mt-5 text-sm md:text-base max-w-xl leading-relaxed text-ngx-fg-2">
                {bridge.subtitle}
              </p>
            </div>

            <p className="ngx-eyebrow inline-flex self-start rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5">
              {bridge.footnote}
            </p>

            <div>
              <a
                href={buttonHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer noopener" : undefined}
                onClick={() => trackCta("bridge_primary", bridge.buttonIntent, bridge.buttonText)}
                className="group inline-flex items-center justify-center gap-2 px-7 rounded-full text-white font-bold font-body text-sm transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
                style={{
                  height: "52px",
                  backgroundColor: "var(--ngx-purple)",
                  boxShadow: "var(--ngx-glow-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--ngx-glow-primary)";
                }}
              >
                {bridge.buttonText}
              </a>
              <p className="ngx-caption mt-3">
                Sin presión. Si no es para ti ahora, también está bien.
              </p>
            </div>
          </div>

          {/* Right — cards as ordered steps */}
          <ol className="flex flex-col gap-3 md:gap-4">
            {bridge.cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <li key={card.title}>
                  <article className="ngx-metal-card !p-4 md:!p-5">
                    <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                      <span className="ngx-card-icon shrink-0">
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="ngx-eyebrow text-[10px] block mb-1.5">Paso 0{index + 1}</span>
                        <h3 className="ngx-card-title mb-1.5">{card.title}</h3>
                        <p className="ngx-card-desc">{card.description}</p>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
