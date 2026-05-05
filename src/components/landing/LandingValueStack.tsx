"use client";

import { useLandingConfig } from "./LandingProvider";

const RECEIVE_LABELS = ["Visual", "Lectura", "Ruta", "Siguiente paso"] as const;

export function LandingValueStack() {
  const { config } = useLandingConfig();
  const { valueStack } = config.copy;
  if (!valueStack) return null;

  return (
    <section id="que-recibes" className="ngx-section">
      <div className="ngx-section-header">
        <div className="animate-on-scroll">
          <span className="ngx-eyebrow-pill" data-accent="emerald">{valueStack.sectionLabel}</span>
          <h2 className="ngx-section-heading">
            {valueStack.title}
            <br />
            <span className="text-ngx-fg-2">{valueStack.highlight}</span>
          </h2>
        </div>
        <p className="animate-on-scroll delay-100 max-w-2xl text-sm md:text-base leading-relaxed text-ngx-fg-2 lg:ml-auto">
          {valueStack.subtitle}
        </p>
      </div>

      <div className="ngx-card-grid ngx-card-grid-2 items-stretch">
        {valueStack.items.map((item, index) => {
          const Icon = item.icon;
          const animationDelay = ["", "delay-100", "delay-200", "delay-300"][index] ?? "";
          const label = RECEIVE_LABELS[index] ?? `Recibes 0${index + 1}`;
          return (
            <article
              key={item.title}
              className={`group animate-on-scroll ${animationDelay} ngx-metal-card h-full p-5 md:p-6`}
            >
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                <span className="ngx-card-icon">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="ngx-eyebrow text-[10px] block mb-2">{label}</span>
                  <h3 className="ngx-card-title mb-2">{item.title}</h3>
                  <p className="ngx-card-desc">{item.description}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
