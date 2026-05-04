"use client";

import { Lock, Eye, HeartPulse, Trash2 } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";
import type { TrustStripCopy } from "@/config/landing/types";

const FALLBACK: TrustStripCopy = {
  title: "Privado por diseño. Honesto por principio.",
  bullets: [
    "Tu foto se procesa con consentimiento explícito.",
    "La visualización es aspiracional, no una promesa.",
    "Tu resultado no sustituye evaluación médica.",
    "Puedes solicitar eliminación de tus datos.",
  ],
};

const ICONS = [Lock, Eye, HeartPulse, Trash2] as const;

export function LandingTrustStrip() {
  const { config } = useLandingConfig();
  const copy = config.copy.trustStrip ?? FALLBACK;

  return (
    <section id="trust" className="ngx-section">
      <div className="ngx-section-panel">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12 lg:items-center">
          <div className="animate-on-scroll">
            <span className="ngx-eyebrow-pill" data-accent="emerald">Trust</span>
            <h2 className="font-body font-bold text-2xl md:text-3xl leading-tight tracking-[-0.02em] text-ngx-fg-1 max-w-[18ch]">
              {copy.title}
            </h2>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {copy.bullets.map((text, i) => {
              const Icon = ICONS[i] ?? Lock;
              return (
                <li
                  key={text}
                  className={`animate-on-scroll ${i > 0 ? `delay-${i}00` : ""} flex items-start gap-3 ngx-glass-clear p-4 rounded-2xl`}
                >
                  <span
                    className="ngx-card-icon shrink-0"
                    style={{ width: "2rem", height: "2rem" }}
                    data-accent="emerald"
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="font-body text-sm leading-relaxed text-ngx-fg-1">
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
