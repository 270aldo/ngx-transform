"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingHowItWorks() {
  const { config } = useLandingConfig();
  const { howItWorks } = config.copy;

  return (
    <section id="como-funciona" className="ngx-section">
      <div className="text-center mb-12 md:mb-16 animate-on-scroll max-w-3xl mx-auto">
        <span className="ngx-eyebrow-pill">Cómo funciona</span>
        <h2 className="ngx-section-heading mx-auto" style={{ maxWidth: "20ch" }}>
          {howItWorks.title}
        </h2>
        {howItWorks.subtitle ? (
          <p className="mt-4 text-ngx-fg-2 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {howItWorks.subtitle}
          </p>
        ) : null}
      </div>

      <ol className="grid gap-4 md:grid-cols-2">
        {howItWorks.steps.map((item, i) => {
          const Icon = item.icon;
          return (
            <li key={item.step} className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""}`}>
              <article className="ngx-process-card h-full">
                <div className="relative z-10">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="ngx-process-number">PASO {item.step}</span>
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
                      style={{
                        backgroundColor: "rgba(109,0,255,0.15)",
                        borderColor: "rgba(109,0,255,0.25)",
                      }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: "var(--ngx-purple-light)" }}
                      />
                    </span>
                  </div>
                  <h3 className="font-body font-bold text-lg text-ngx-fg-1 leading-tight tracking-[-0.015em] mb-2">
                    {item.title}
                  </h3>
                  <p className="ngx-card-desc">{item.description}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
