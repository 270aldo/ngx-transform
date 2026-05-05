"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLandingConfig } from "./LandingProvider";

export function LandingCTA() {
  const { config, trackCta } = useLandingConfig();
  const { cta } = config.copy;

  return (
    <section id="cta-final" className="ngx-section" style={{ maxWidth: "60rem", paddingBlockEnd: "5rem" }}>
      <div className="animate-on-scroll-scale ngx-section-panel text-center">
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{
              background: "linear-gradient(135deg, var(--ngx-purple), var(--ngx-purple-deep))",
              boxShadow: "0 0 40px rgba(109,0,255,0.35)",
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="ngx-section-heading-soft mx-auto" style={{ maxWidth: "22ch" }}>
            {cta.headline}
          </h2>
          <p className="mt-5 text-sm md:text-base text-ngx-fg-2 max-w-lg mx-auto leading-relaxed">
            {cta.subtitle}
          </p>
          <div className="flex justify-center mt-8">
            <Link
              href="/wizard"
              onClick={() => trackCta("final_cta", cta.intent, cta.buttonText)}
              className="group inline-flex items-center gap-2 px-9 py-4 rounded-full text-white font-bold font-body text-base transition-all duration-150 active:scale-[0.97] hover:-translate-y-0.5"
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
          <p className="mt-6 text-xs text-ngx-fg-3 font-mono uppercase tracking-[0.2em]">
            {cta.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}
