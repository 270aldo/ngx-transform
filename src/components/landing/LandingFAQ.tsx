"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useLandingConfig } from "./LandingProvider";

export function LandingFAQ() {
  const { config } = useLandingConfig();
  const { faq } = config.copy;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!faq) return null;

  return (
    <section id="faq" className="ngx-faq-section relative overflow-hidden py-12 md:py-16">
      <div className="relative z-10 mx-auto grid max-w-[1180px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.62fr_1.38fr] lg:px-8">
        <div className="animate-on-scroll lg:sticky lg:top-32">
          <span className="ngx-lg-label">{faq.sectionLabel}</span>
          <h2 className="ngx-lg-heading ngx-faq-heading mt-4 max-w-[10ch]">
            {faq.title}
          </h2>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/54">
            Respuestas cortas para decidir si vale la pena iniciar tu diagnóstico visual.
          </p>
        </div>

        <div className="animate-on-scroll ngx-faq-panel">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="border-t border-white/[0.075] first:border-t-0"
              >
                <button
                  type="button"
                  className="group flex min-h-[76px] w-full items-center justify-between gap-5 px-5 py-4 text-left text-ngx-fg-1 md:px-6"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="font-body text-base font-bold leading-snug text-white/88 md:text-[1.05rem]">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border transition ${
                      isOpen
                        ? "border-[var(--lg-rim-purple)] bg-[var(--lg-glass-purple-soft)]"
                        : "border-white/[0.08] bg-white/[0.045] group-hover:border-white/[0.16]"
                    }`}
                  >
                    <Plus
                      className={`h-3.5 w-3.5 text-ngx-purple transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl px-5 pb-5 text-sm leading-relaxed text-white/58 md:px-6 md:pb-6 md:text-[0.98rem]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
