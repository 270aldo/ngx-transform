"use client";

import { useCallback } from "react";
import { Mic, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileVoiceAgentTeaserProps {
  shareId: string;
  className?: string;
}

/**
 * Mobile-only teaser that promotes the Voice Agent experience
 * right after the main TransformationViewer2.
 *
 * Goal (Phase 1): Make the highest-quality lead filter (Voice Agent)
 * reachable much earlier on mobile, instead of being buried after
 * Summary + Roadmap.
 */
export function MobileVoiceAgentTeaser({
  shareId,
  className,
}: MobileVoiceAgentTeaserProps) {
  const scrollToVoiceAgent = useCallback(() => {
    const el = document.getElementById("hybrid-voice-agent");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Fallback: scroll to the offer area
      document
        .getElementById("hybrid-offer")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section
      className={cn(
        "lg:hidden mx-auto max-w-6xl px-4 pt-6 pb-8",
        className
      )}
    >
      <div
        onClick={scrollToVoiceAgent}
        className="group cursor-pointer ngx-glass relative overflow-hidden rounded-3xl border border-white/[0.08] p-5 active:scale-[0.985] transition-all duration-150"
      >
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ngx-purple)]/10 text-[var(--ngx-purple)]">
            <Mic className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="ngx-eyebrow !text-[10px] tracking-[0.14em] text-[var(--ngx-purple-light)]">
                GENESIS · POR VOZ
              </span>
            </div>

            <h3 className="mt-1 text-[17px] font-bold leading-tight tracking-[-0.01em] text-white">
              Habla con GENESIS ahora
            </h3>

            <p className="mt-1.5 text-[13px] leading-snug text-white/60">
              Un agente de voz te entrevista en minutos, te explica HYBRID y
              clasifica tu siguiente paso.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition-colors group-active:bg-white/[0.1]">
              Empezar conversación por voz
              <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Subtle purple glow accent on the right */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--ngx-purple)]/5 blur-3xl" />
      </div>
    </section>
  );
}
