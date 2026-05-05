"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingCTA() {
  const { config, trackCta } = useLandingConfig();
  const { cta } = config.copy;

  return (
    <section id="cta-final" className="ngx-section" style={{ maxWidth: "60rem", paddingBlockEnd: "5rem" }}>
      <div className="animate-on-scroll-scale ngx-section-panel text-center !p-6 md:!p-10">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(109,0,255,0.18), transparent 70%)",
          }}
        />
        <div className="relative">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, var(--ngx-purple), var(--ngx-purple-deep))",
              boxShadow: "0 0 32px rgba(109,0,255,0.32)",
            }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="ngx-section-heading-soft mx-auto" style={{ maxWidth: "22ch" }}>
            {cta.headline}
          </h2>
          <p className="mt-5 text-sm md:text-base text-ngx-fg-2 max-w-lg mx-auto leading-relaxed">
            {cta.subtitle}
          </p>
          <div className="flex justify-center mt-7">
            <Link
              href="/wizard"
              onClick={() => trackCta("final_cta", cta.intent, cta.buttonText)}
              className="group inline-flex h-14 items-center gap-2 px-9 rounded-full text-white font-bold font-body text-base transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
              style={{
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
              <span>{cta.buttonText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-ngx-fg-3 font-mono uppercase tracking-[0.2em]">
            {cta.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
