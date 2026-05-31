"use client";

import { useLandingConfig } from "./LandingProvider";

export function LandingHowItWorks() {
  const { config } = useLandingConfig();
  const { howItWorks } = config.copy;

  return (
    <section id="como-funciona" className="relative w-full px-4 py-24 md:py-32 scroll-mt-24">
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
        <div className="animate-on-scroll lg:sticky lg:top-24">
          <span className="ngx-eyebrow-pill">Cómo funciona</span>
          <h2 className="ngx-h1 !text-left max-w-[11ch]">
            {howItWorks.title}
          </h2>
          {howItWorks.subtitle ? (
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/62 md:text-base">
              {howItWorks.subtitle}
            </p>
          ) : null}
        </div>

        <ol className="ngx-section-panel !p-0">
          {howItWorks.steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <li
                key={item.step}
                className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""}`}
              >
                <article className="group grid gap-4 border-t border-white/[0.08] p-5 first:border-t-0 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6 md:p-7">
                  <span className="ngx-icon-box h-12 w-12">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-tight text-white md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/58 md:text-[0.97rem]">
                      {item.description}
                    </p>
                  </div>

                  <span
                    className="font-mono text-[2.85rem] font-bold leading-none tabular-nums text-transparent md:text-[4.4rem]"
                    style={{
                      WebkitTextStroke:
                        i === 0
                          ? "1px rgba(184,148,255,0.78)"
                          : "1px rgba(255,255,255,0.22)",
                    }}
                  >
                    {item.step}
                  </span>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
