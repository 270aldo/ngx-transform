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
        "lg:hidden mx-auto max-w-6xl px-4 pt-10 pb-12",
        className
      )}
    >
      <span className="ngx-eyebrow !text-[11px] mb-3 block text-center tracking-[0.16em] text-[var(--ngx-purple-light)]">
        Tu siguiente paso
      </span>
      <button
        type="button"
        onClick={scrollToVoiceAgent}
        aria-label="Hablar con GENESIS por voz"
        className="group relative block w-full cursor-pointer overflow-hidden rounded-[28px] border border-[var(--ngx-purple)]/35 bg-[var(--ngx-purple)]/[0.06] p-6 text-left shadow-[var(--ngx-glow-primary-soft)] transition-all duration-150 active:scale-[0.98]"
      >
        {/* Accent rail — signals this is the hero action, not just a card */}
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light), var(--ngx-purple))",
          }}
        />

        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/15 text-[var(--ngx-purple-light)]">
            <Mic className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <span className="ngx-eyebrow !text-[11px] tracking-[0.14em] text-[var(--ngx-purple-light)]">
              GENESIS · POR VOZ
            </span>

            <h3 className="mt-1.5 text-[21px] font-black leading-[1.05] tracking-[-0.01em] text-white">
              Habla con GENESIS ahora
            </h3>

            <p className="mt-2 text-[14px] leading-snug text-white/65">
              Un agente de voz te entrevista en minutos, te explica HYBRID y
              clasifica tu siguiente paso.
            </p>
          </div>
        </div>

        <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--ngx-purple)] px-5 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[var(--ngx-glow-primary)] transition-transform group-active:scale-[0.98]">
          Empezar conversación por voz
          <ArrowRight className="h-4 w-4 transition-transform group-active:translate-x-0.5" />
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--ngx-purple)]/15 blur-3xl" />
      </button>
    </section>
  );
}
