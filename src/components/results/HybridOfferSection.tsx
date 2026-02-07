"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Bot,
  ArrowRight,
  X,
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
    const payload = { sessionId: shareId, shareId, event, metadata: { shareId } };
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
    <section id="hybrid-offer" className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#6D00FF]/25 via-[#111111] to-[#0A0A0A] backdrop-blur-xl"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#0A0A0A]/90" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-8">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-widest text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-[#6D00FF]" />
              NGX HYBRID
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
              Tu Temporada de 12 Semanas
            </h2>
          </div>

          <ul className="grid gap-3 text-sm sm:text-base text-white/85">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-[#6D00FF] mt-0.5" />Sistema GENESIS que adapta tu plan cada semana</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-[#6D00FF] mt-0.5" />Coach humano que valida y te acompaña</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-[#6D00FF] mt-0.5" />3 fases progresivas con checkpoints</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-[#6D00FF] mt-0.5" />Tracking de fuerza, energía y adherencia</li>
          </ul>

          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/70 p-5">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Bonus incluido</p>
            <p className="text-white font-semibold">Ebook Conversacional GENESIS</p>
            <p className="text-white/70 text-sm">Valor: $197 — Incluido en tu cohorte</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/70 p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5" />
            <p className="text-sm sm:text-base text-white/85">
              Garantía: Progreso medible en 30 días o +4 semanas sin costo.
            </p>
          </div>

          <div className="rounded-2xl border border-[#6D00FF]/40 bg-[#6D00FF]/10 p-4 text-sm text-white">
            Cohorte {cohortLabel}: {cohortSpotsLeft}/{cohortSpotsTotal} plazas disponibles
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={onCalendly}
              className="min-h-[44px] rounded-xl bg-white text-black font-semibold px-4 py-3 flex items-center justify-center gap-2 hover:brightness-95 transition"
            >
              <CalendarDays className="h-4 w-4" />
              Agendar llamada
            </button>
            <button
              onClick={onWhatsapp}
              className="min-h-[44px] rounded-xl bg-[#6D00FF] text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 hover:bg-[#7D1AFF] transition"
            >
              <MessageCircle className="h-4 w-4" />
              Hablar por WhatsApp
            </button>
            <button
              onClick={onChat}
              className="min-h-[44px] rounded-xl border border-white/20 bg-white/5 text-white font-semibold px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
              <Bot className="h-4 w-4" />
              Pregúntale a GENESIS
            </button>
          </div>
        </div>
      </motion.div>

      {chatOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4">
          <div className="mx-auto h-full max-w-3xl rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">GENESIS • Resuelve tus dudas</p>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition"
                aria-label="Cerrar chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100%-53px)] overflow-auto">
              <GenesisChat
                shareId={shareId}
                responses={{ trainingDays: null, goal: null, equipment: null }}
                onPlanReady={() => window.location.assign(`/s/${shareId}/plan`)}
              />
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-[#111111]">
              <a
                href={`/s/${shareId}/plan`}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 hover:text-white transition"
              >
                Ver plan completo
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

