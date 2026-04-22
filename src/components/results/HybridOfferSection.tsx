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
        className="relative overflow-hidden rounded-[32px] landing-surface-strong p-6 md:p-8 lg:p-10"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(109,0,255,0.14),transparent_34%),radial-gradient(circle_at_88%_25%,rgba(184,148,255,0.08),transparent_24%)]" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.85fr)]">
          <div>
            <p className="landing-kicker mb-4">NGX Hybrid</p>
            <h2 className="landing-heading text-[2.2rem] leading-[0.92] text-white md:text-[3rem]">
              Cuando el roadmap
              <br />
              te haga sentido,
              <br />
              HYBRID entra aquí.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              La visualización abre la conversación. El roadmap pone orden. HYBRID sólo debería aparecer cuando ya quieres ejecutar esa visión dentro de un sistema guiado, no antes.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                "Sistema GENESIS que adapta tu plan cada semana",
                "Coach humano que valida y acompaña",
                "12 semanas con checkpoints y seguimiento real",
              ].map((item) => (
                <div key={item} className="rounded-[24px] landing-surface px-4 py-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-[#6D00FF]/20 bg-[#6D00FF]/10">
                    <CheckCircle2 className="h-4 w-4 text-[#C8A5FF]" />
                  </div>
                  <p className="text-sm leading-relaxed text-white/72">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Cuándo sí tiene sentido</p>
              <p className="mt-3 text-sm leading-relaxed text-white/72">
                Si ya viste tu visualización, entiendes lo que te está frenando y quieres acompañamiento real para ejecutarlo, aquí es donde HYBRID empieza a tener fit.
              </p>
            </div>

            <div className="mt-5 rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Bonus incluido</p>
              <div className="mt-3 flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#C8A5FF]" />
                <div>
                  <p className="text-base font-semibold text-white">Ebook Conversacional GENESIS</p>
                  <p className="mt-1 text-sm leading-relaxed text-white/56">
                    Valor referencial: $197. Incluido en tu cohorte para ayudarte a aterrizar el sistema desde las primeras semanas.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] landing-surface p-5 md:p-6">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Cohorte actual</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-3xl font-black italic tracking-[-0.06em] text-white md:text-4xl">
                    {cohortSpotsLeft}
                    <span className="ml-2 text-lg font-medium not-italic tracking-normal text-white/35">/ {cohortSpotsTotal}</span>
                  </p>
                  <p className="mt-2 text-sm text-white/52">Plazas estimadas para {cohortLabel}</p>
                </div>
                <span className="rounded-full border border-[#6D00FF]/25 bg-[#6D00FF]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#C8A5FF]">
                  Cohorte guiada
                </span>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full border border-white/8 bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D00FF] to-[#B98CFF]"
                  style={{ width: `${((cohortSpotsTotal - cohortSpotsLeft) / cohortSpotsTotal) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-[30px] landing-surface p-5 md:p-6">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Qué estás comprando aquí</p>
              <div className="mt-4 space-y-3 text-sm text-white/72">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Dirección, ajustes y seguimiento para que el sistema no dependa sólo de motivación.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Una capa humana encima de GENESIS para validar decisiones y sostener adherencia.</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Un marco más serio para convertir potencial en ejecución real.</span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] landing-surface p-5 md:p-6">
              <p className="landing-kicker !text-[0.62rem] !tracking-[0.22em]">Siguiente acción</p>
              <div className="mt-5 grid gap-3">
                <button
                  onClick={onCalendly}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#6D00FF] px-5 py-4 text-sm font-semibold text-white shadow-[0_0_28px_rgba(109,0,255,0.26)] transition-all hover:scale-[1.01] hover:bg-[#5F00DE]"
                >
                  <CalendarDays className="h-4 w-4" />
                  Ver si HYBRID es fit
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onWhatsapp}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/86 transition-all hover:bg-white/[0.06]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hablar por WhatsApp
                </button>
                <button
                  onClick={onChat}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/86 transition-all hover:bg-white/[0.06]"
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
