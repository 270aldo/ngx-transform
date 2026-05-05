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

      {/* Mobile: simple stacked rows (icon + card). md+: zigzag with center timeline */}
      <ol className="relative">
        {/* Center timeline (md+ only) */}
        <div
          aria-hidden
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--ngx-purple) 12%, var(--ngx-purple) 88%, transparent)",
            opacity: 0.55,
          }}
        />

        <div className="flex flex-col gap-6 md:gap-16">
          {howItWorks.steps.map((item, i) => {
            const Icon = item.icon;
            const isLeftCard = i % 2 === 0;

            return (
              <li key={item.step} className="md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-center">
                {/* MOBILE: simple horizontal row [icon, card] */}
                <div className="flex items-stretch gap-4 md:hidden">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--ngx-purple)",
                        boxShadow: "0 0 20px rgba(109,0,255,0.45)",
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <article className={`flex-1 ngx-card animate-on-scroll ${i > 0 ? `delay-${i}00` : ""} min-h-[140px]`}>
                    <span className="ngx-eyebrow inline-block mb-2">PASO {item.step}</span>
                    <h3 className="font-body font-bold text-lg text-ngx-fg-1 leading-tight tracking-[-0.015em] mb-2">
                      {item.title}
                    </h3>
                    <p className="ngx-card-desc">{item.description}</p>
                  </article>
                </div>

                {/* DESKTOP md+: zigzag layout */}
                <div
                  className={`hidden md:block ${isLeftCard ? "md:col-start-1 md:justify-self-end" : "md:col-start-3 md:justify-self-start"} w-full md:max-w-[460px] animate-on-scroll${isLeftCard ? "-left" : "-right"} ${i > 0 ? `delay-${i}00` : ""}`}
                >
                  <article className="ngx-card !p-7 min-h-[200px]">
                    <span className="ngx-eyebrow inline-block mb-3">PASO {item.step}</span>
                    <h3 className="font-body font-bold text-xl text-ngx-fg-1 leading-tight tracking-[-0.015em] mb-3">
                      {item.title}
                    </h3>
                    <p className="ngx-card-desc">{item.description}</p>
                  </article>
                </div>

                <div
                  className={`hidden md:flex md:col-start-2 md:justify-self-center relative z-10 animate-on-scroll-scale ${i > 0 ? `delay-${i}00` : ""}`}
                >
                  <div
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--ngx-purple)",
                      boxShadow: "0 0 30px rgba(109,0,255,0.5)",
                    }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                </div>

                <div className={`hidden md:block ${isLeftCard ? "md:col-start-3" : "md:col-start-1"}`} />
              </li>
            );
          })}
        </div>
      </ol>
    </section>
  );
}
