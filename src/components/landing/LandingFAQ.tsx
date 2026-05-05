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
    <section id="faq" className="ngx-section" style={{ maxWidth: "48rem" }}>
      <div className="animate-on-scroll text-center mb-12 md:mb-16">
        <span className="ngx-eyebrow-pill" data-accent="neutral">{faq.sectionLabel}</span>
        <h2 className="ngx-section-heading-soft mx-auto" style={{ maxWidth: "24ch" }}>
          {faq.title}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {faq.items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`animate-on-scroll ${index > 0 ? `delay-${Math.min(index, 5)}00` : ""} ngx-card !p-0 overflow-hidden`}
              style={{ borderColor: isOpen ? "var(--ngx-border-active)" : undefined }}
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left text-ngx-fg-1"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="font-body font-medium text-sm md:text-base">{item.question}</span>
                <span className="flex w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] items-center justify-center flex-shrink-0">
                  <Plus
                    className={`w-3.5 h-3.5 text-ngx-purple transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                  />
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 md:px-6 pb-5 md:pb-6 ngx-card-desc">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
