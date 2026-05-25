"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GenesisChat } from "@/components/demo/GenesisChat";

interface CohorteInfo {
  label?: string;
  spotsLeft?: number;
  spotsTotal?: number;
}

interface HybridOfferSectionProps {
  shareId: string;
  cohorteInfo?: CohorteInfo;
}

const WHATSAPP_TEXT =
  "Hola, acabo de ver mis resultados en NGX Transform y me interesa HYBRID.";

export function HybridOfferSection({ shareId, cohorteInfo }: HybridOfferSectionProps) {
  const [chatOpen, setChatOpen] = useState(false);

  const cohortLabel = cohorteInfo?.label ?? process.env.NEXT_PUBLIC_COHORT_LABEL ?? "Marzo";
  const cohortSpotsTotal = cohorteInfo?.spotsTotal ?? Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_TOTAL ?? "20");
  const cohortSpotsLeft = cohorteInfo?.spotsLeft ?? Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_LEFT ?? "18");
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/ngx-genesis";
  const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappNumber = whatsappRaw.replace(/[^\d]/g, "");

  const whatsappUrl = useMemo(() => {
    if (!whatsappNumber) return "";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WHATSAPP_TEXT)}`;
  }, [whatsappNumber]);

  async function emit(event: "hybrid_offer_calendly_click" | "hybrid_offer_whatsapp_click" | "hybrid_offer_chat_click") {
    const payload = {
      sessionId: shareId,
      shareId,
      event,
      metadata: { shareId, intent: "conversion", location: "hybrid_offer" },
    };
    await Promise.allSettled([
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch("/api/events/hybrid-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, shareId }),
      }),
    ]);
  }

  const onCalendly = async () => {
    await emit("hybrid_offer_calendly_click");
    window.open(calendlyUrl, "_blank", "noopener,noreferrer");
  };

  const onWhatsapp = async () => {
    await emit("hybrid_offer_whatsapp_click");
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const onChat = async () => {
    await emit("hybrid_offer_chat_click");
    setChatOpen(true);
  };

  return (
    <section id="hybrid-offer" className="relative mx-auto max-w-5xl px-4 py-10 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="ngx-section-panel"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(109,0,255,0.06),transparent_36%)] pointer-events-none" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.85fr)]">
          <div>
            <span className="ngx-eyebrow-pill mb-4">NGX Hybrid</span>
            <h2 className="ngx-h1 !text-left">
              Cuando el roadmap te haga sentido, HYBRID entra aquí.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              La visualización abre la conversación. El roadmap pone orden. HYBRID sólo debería aparecer cuando ya quieres ejecutar esa visión dentro de un sistema guiado, no antes.
            </p>

            <div className="mt-7 ngx-card-grid ngx-card-grid-3 items-stretch">
              {[
                "Sistema GENESIS que adapta tu plan cada semana",
                "Coach humano que valida y acompaña",
                "12 semanas con checkpoints y seguimiento real",
              ].map((item) => (
                <div key={item} className="ngx-card !p-4 h-full">
                  <span className="ngx-card-icon mb-3" style={{ width: "2.25rem", height: "2.25rem" }}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="ngx-card-desc">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 ngx-card !p-5 md:!p-6">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Cuándo sí tiene sentido</span>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Si ya viste tu visualización, entiendes lo que te está frenando y quieres acompañamiento real para ejecutarlo, aquí es donde HYBRID empieza a tener fit.
              </p>
            </div>

            <div className="mt-5 ngx-card !p-5 md:!p-6">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Bonus incluido</span>
              <div className="mt-2 flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--ngx-purple-light)" }} />
                <div>
                  <p className="text-base font-bold text-white">Ebook Conversacional GENESIS</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    Valor referencial: $197. Incluido en tu cohorte para ayudarte a aterrizar el sistema desde las primeras semanas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="ngx-glass !p-5 md:!p-6">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Cohorte actual</span>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-[-0.02em] text-white md:text-4xl leading-none">
                    {cohortSpotsLeft}
                    <span className="ml-2 text-lg font-medium tracking-normal text-white/35">/ {cohortSpotsTotal}</span>
                  </p>
                  <p className="mt-2 text-sm text-white/55">Plazas estimadas para {cohortLabel}</p>
                </div>
                <span
                  className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(109,0,255,0.10)",
                    border: "1px solid rgba(109,0,255,0.25)",
                    color: "var(--ngx-purple-light)",
                  }}
                >
                  Cohorte guiada
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06] border border-white/[0.04]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${((cohortSpotsTotal - cohortSpotsLeft) / cohortSpotsTotal) * 100}%`,
                    background: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                    boxShadow: "0 0 12px rgba(109,0,255,0.40)",
                  }}
                />
              </div>
            </div>

            <div className="ngx-glass !p-5 md:!p-6">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Qué estás comprando aquí</span>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--ngx-success)" }} />
                  <span>Dirección, ajustes y seguimiento para que el sistema no dependa sólo de motivación.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--ngx-success)" }} />
                  <span>Una capa humana encima de GENESIS para validar decisiones y sostener adherencia.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--ngx-success)" }} />
                  <span>Un marco más serio para convertir potencial en ejecución real.</span>
                </div>
              </div>
            </div>

            <div className="ngx-glass !p-5 md:!p-6">
              <span className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>Siguiente acción</span>
              <div className="mt-5 grid gap-3">
                <button
                  onClick={onCalendly}
                  className="ngx-primary-cta inline-flex px-5 py-4 text-sm"
                >
                  <CalendarDays className="h-4 w-4" />
                  Ver si HYBRID es fit
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onWhatsapp}
                  className="ngx-glass-clear inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hablar por WhatsApp
                </button>
                <button
                  onClick={onChat}
                  className="ngx-glass-clear inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
                >
                  <Bot className="h-4 w-4" />
                  Resolver dudas con GENESIS
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {chatOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4">
          <div className="mx-auto h-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-medium text-white">GENESIS • Resuelve tus dudas</p>
              <button
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
                aria-label="Cerrar chat"
              >
                <ArrowRight className="h-4 w-4 rotate-45" />
              </button>
            </div>
            <div className="h-[calc(100%-53px)] overflow-auto">
              <GenesisChat
                shareId={shareId}
                responses={{ trainingDays: null, goal: null, equipment: null }}
                onPlanReady={() => window.location.assign(`/s/${shareId}/plan`)}
              />
            </div>
            <div className="border-t border-white/10 bg-[#111111] px-4 py-3">
              <a
                href={`/s/${shareId}/plan`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 transition hover:text-white"
              >
                Ver roadmap inicial
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
