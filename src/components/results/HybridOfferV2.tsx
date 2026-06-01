"use client";

/**
 * HybridOfferV2 — Salida comercial post-resultados (v12)
 *
 * Lead magnet exit: Transform entrega insight y dirige al diagnóstico HYBRID.
 * La compra directa queda detrás de feature flag; el CTA primario es agenda.
 *
 * Telemetría granular por camino.
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  Crown,
} from "lucide-react";
import { VideoFounderModal } from "./VideoFounderModal";
import { useAuth } from "@/components/auth/AuthProvider";

interface CohorteInfo {
  label?: string;
  spotsLeft?: number;
  spotsTotal?: number;
}

interface HybridOfferV2Props {
  shareId: string;
  cohorteInfo?: CohorteInfo;
}

type Sku = "monthly" | "quarterly" | "annual";

interface SkuCardData {
  sku: Sku;
  label: string;
  priceLabel: string;
  perMonthLabel?: string;
  badge?: string;
  highlight?: boolean;
  available: boolean;
}

const WHATSAPP_TEXT =
  "Hola, acabo de ver mi diagnóstico visual en NGX Transform y tengo una duda sobre HYBRID.";

const HYBRID_OFFER_WEBHOOK_EVENTS: Partial<Record<string, string>> = {
  calendly_v2_clicked: "hybrid_offer_calendly_click",
  whatsapp_v2_clicked: "hybrid_offer_whatsapp_click",
};

function readNum(envVar?: string): number | null {
  if (!envVar) return null;
  const n = Number(envVar);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readText(envVar?: string): string | null {
  const value = envVar?.trim();
  return value ? value : null;
}

function formatMxn(amount: number): string {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString("es-MX")} MXN`;
  }
}

async function emitTelemetry(
  shareId: string,
  event: string,
  metadata?: Record<string, unknown>,
  ownerToken?: string | null
) {
  const webhookEvent = HYBRID_OFFER_WEBHOOK_EVENTS[event];

  await Promise.allSettled([
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: shareId,
        shareId,
        event,
        metadata: { ...metadata, location: "hybrid_offer_v2" },
      }),
    }),
    webhookEvent
      ? fetch("/api/events/hybrid-offer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(ownerToken ? { Authorization: `Bearer ${ownerToken}` } : {}),
          },
          body: JSON.stringify({ event: webhookEvent, shareId }),
        }).catch(() => {})
      : Promise.resolve(),
  ]);
}

function pickDefaultSku(): Sku | null {
  const monthly = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY);
  const quarterly = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_QUARTERLY);
  const annual = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_ANNUAL);
  if (quarterly) return "quarterly"; // highlight default
  if (monthly) return "monthly";
  if (annual) return "annual";
  return null;
}

export function HybridOfferV2({ shareId, cohorteInfo }: HybridOfferV2Props) {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const directCheckoutEnabled =
    process.env.NEXT_PUBLIC_FF_HYBRID_DIRECT_CHECKOUT === "true";
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(() =>
    directCheckoutEnabled ? pickDefaultSku() : null
  );
  const [checkoutLoading, setCheckoutLoading] = useState<Sku | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [briefState, setBriefState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [briefMessage, setBriefMessage] = useState<string | null>(null);

  const cohortLabel =
    cohorteInfo?.label ??
    readText(process.env.NEXT_PUBLIC_COHORT_LABEL);
  const configuredSpotsTotal =
    cohorteInfo?.spotsTotal ??
    readNum(process.env.NEXT_PUBLIC_COHORT_SPOTS_TOTAL);
  const configuredSpotsLeft =
    cohorteInfo?.spotsLeft ??
    readNum(process.env.NEXT_PUBLIC_COHORT_SPOTS_LEFT);
  const hasCohortSpots =
    typeof configuredSpotsTotal === "number" &&
    typeof configuredSpotsLeft === "number" &&
    configuredSpotsTotal > 0 &&
    configuredSpotsLeft >= 0 &&
    configuredSpotsLeft <= configuredSpotsTotal;
  const showCohortSignal = hasCohortSpots || Boolean(cohortLabel);
  const cohortSpotsTotal = configuredSpotsTotal ?? 0;
  const cohortSpotsLeft = configuredSpotsLeft ?? 0;

  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    process.env.NEXT_PUBLIC_BOOKING_URL ||
    "";
  const whatsappRaw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappNumber = whatsappRaw.replace(/[^\d]/g, "");
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        WHATSAPP_TEXT
      )}`
    : "";

  const videoUrl = process.env.NEXT_PUBLIC_HYBRID_VIDEO_URL || undefined;
  const videoPoster = process.env.NEXT_PUBLIC_HYBRID_VIDEO_POSTER || undefined;
  const videoDuration =
    Number(process.env.NEXT_PUBLIC_HYBRID_VIDEO_DURATION_SEC || "240") || 240;
  const voiceAgentEnabled =
    process.env.NEXT_PUBLIC_FF_HYBRID_VOICE_AGENT === "true";

  const getOwnerToken = async (): Promise<string | null> => {
    if (authLoading || !user) return null;
    return getIdToken();
  };

  // Construir SKUs disponibles desde env vars
  const skus = useMemo<SkuCardData[]>(() => {
    const monthly = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_MONTHLY);
    const quarterly = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_QUARTERLY);
    const annual = readNum(process.env.NEXT_PUBLIC_HYBRID_PRICE_ANNUAL);

    const cards: SkuCardData[] = [];

    cards.push({
      sku: "monthly",
      label:
        process.env.NEXT_PUBLIC_HYBRID_LABEL_MONTHLY || "Acceso mensual",
      priceLabel: monthly ? `${formatMxn(monthly)} / mes` : "Próximamente",
      available: !!monthly,
    });

    cards.push({
      sku: "quarterly",
      label:
        process.env.NEXT_PUBLIC_HYBRID_LABEL_QUARTERLY ||
        "12 semanas (cohorte completa)",
      priceLabel: quarterly ? formatMxn(quarterly) : "Próximamente",
      perMonthLabel:
        quarterly && monthly
          ? `Equivale a ${formatMxn(Math.round(quarterly / 3))}/mes`
          : undefined,
      badge: "MÁS ELEGIDO",
      highlight: true,
      available: !!quarterly,
    });

    cards.push({
      sku: "annual",
      label:
        process.env.NEXT_PUBLIC_HYBRID_LABEL_ANNUAL || "Programa anual",
      priceLabel: annual ? formatMxn(annual) : "Próximamente",
      perMonthLabel:
        annual && monthly
          ? `Equivale a ${formatMxn(Math.round(annual / 12))}/mes`
          : undefined,
      available: !!annual,
    });

    return cards;
  }, []);

  // Telemetría: viewed (una sola vez al montar)
  useEffect(() => {
    emitTelemetry(shareId, "hybrid_offer_v2_viewed");
  }, [shareId]);

  const onSelectSku = async (sku: Sku) => {
    setSelectedSku(sku);
    await emitTelemetry(shareId, "hybrid_sku_selected", { sku });
  };

  const onCheckout = async () => {
    if (!selectedSku) return;
    setCheckoutError(null);
    setCheckoutLoading(selectedSku);
    await emitTelemetry(shareId, "mp_checkout_clicked", { sku: selectedSku });

    try {
      const token = await getOwnerToken();
      if (!token) {
        throw new Error("Abre tu sesión original para iniciar checkout.");
      }

      const res = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareId, sku: selectedSku }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok || !data.initPoint) {
        throw new Error(data.error || "No se pudo iniciar el checkout");
      }

      window.location.href = data.initPoint;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo iniciar el checkout. Intenta de nuevo o agenda una llamada.";
      setCheckoutError(msg);
      setCheckoutLoading(null);
    }
  };

  const onVideo = async () => {
    setVideoOpen(true);
    // El modal emite "video_founder_opened" cuando monta
  };

  const onVoiceAgent = async () => {
    const target = document.getElementById("hybrid-voice-agent");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onCalendly = async () => {
    if (!calendlyUrl) return;
    const token = await getOwnerToken();
    await emitTelemetry(shareId, "calendly_v2_clicked", undefined, token);
    window.open(calendlyUrl, "_blank", "noopener,noreferrer");
  };

  const onWhatsapp = async () => {
    if (!whatsappUrl) return;
    const token = await getOwnerToken();
    await emitTelemetry(shareId, "whatsapp_v2_clicked", undefined, token);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const onEmailBrief = async () => {
    if (briefState === "loading" || briefState === "sent") return;
    setBriefState("loading");
    setBriefMessage(null);
    await emitTelemetry(shareId, "brief_email_requested");

    try {
      const token = await getOwnerToken();
      if (!token) {
        throw new Error("Abre tu sesión original para recibir el brief por correo.");
      }

      const res = await fetch("/api/brief/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareId }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 503) {
        setBriefState("error");
        setBriefMessage(
          "El envío de email no está activo todavía. Contáctanos por WhatsApp y te lo mandamos manual."
        );
        return;
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No pudimos enviar el brief.");
      }

      setBriefState("sent");
      setBriefMessage(
        data.alreadySent
          ? "Ya te lo enviamos antes — revisa tu bandeja (y spam)."
          : "Listo. Lo enviamos a tu correo. Llega en pocos minutos."
      );
    } catch (err) {
      setBriefState("error");
      setBriefMessage(
        err instanceof Error
          ? err.message
          : "No pudimos enviar el brief. Intenta de nuevo o escríbenos por WhatsApp."
      );
    }
  };

  const anySkuAvailable = skus.some((s) => s.available);

  return (
    <section
      id="hybrid-offer"
      className="relative mx-auto max-w-6xl px-4 py-14 md:py-20 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="ngx-section-panel relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_15%,rgba(109,0,255,0.07),transparent_40%)]" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-2">
          {/* COLUMNA IZQUIERDA — Tesis */}
          <div>
            <span className="ngx-eyebrow-pill mb-4">
              NGX HYBRID · Diagnóstico
            </span>
            <h2 className="ngx-h1 !text-left">
              La imagen inspira. El sistema transforma. El humano sostiene.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
              Tu visualización no promete un resultado. Sirve para abrir una
              conversación seria: qué señales aparecen, qué sistema tendría
              sentido durante 12 semanas y qué necesita revisar un humano antes
              de recomendar HYBRID.
            </p>

            <div className="mt-7 ngx-card-grid ngx-card-grid-3 items-stretch">
              {[
                "GENESIS ordena dirección, entrenamiento y hábitos",
                "Un coach humano revisa el contexto real",
                "12 semanas con checkpoints, no promesas",
              ].map((item) => (
                <div key={item} className="ngx-card !p-4 h-full">
                  <span
                    className="ngx-card-icon mb-3"
                    style={{ width: "2.25rem", height: "2.25rem" }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="ngx-card-desc">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 ngx-card !p-5 md:!p-6">
              <span
                className="ngx-eyebrow !text-[11px]"
                style={{ color: "var(--ngx-fg-3)" }}
              >
                Cuándo sí tiene sentido
              </span>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Si la lectura te dio claridad y quieres saber si vale la pena
                ejecutarla con acompañamiento, el siguiente paso no es comprar a
                ciegas. Es revisar fit, fricción y compromiso.
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA — Acción principal */}
          <div className="space-y-4">
            <div className="ngx-glass !p-5 md:!p-6 relative overflow-hidden">
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background:
                    "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light), var(--ngx-purple))",
                }}
              />
              <div className="flex items-center justify-between gap-3 mb-3">
                <span
                  className="ngx-eyebrow !text-[11px]"
                  style={{ color: "var(--ngx-fg-3)" }}
                >
                  Siguiente paso recomendado
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(109,0,255,0.16)",
                    border: "1px solid rgba(109,0,255,0.32)",
                    color: "var(--ngx-purple-light)",
                  }}
                >
                  <CalendarDays className="h-3 w-3" />
                  Diagnóstico
                </span>
              </div>

              <h3 className="text-lg font-bold leading-tight text-white">
                Revisa si HYBRID tiene fit contigo
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                Una llamada breve para convertir tu lectura en una decisión:
                avanzar solo, ajustar primero o entrar a una temporada HYBRID.
              </p>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={onCalendly}
                  disabled={!calendlyUrl}
                  className="ngx-primary-cta inline-flex w-full px-5 py-4 text-sm disabled:cursor-not-allowed"
                >
                  <CalendarDays className="h-4 w-4" />
                  Agendar diagnóstico HYBRID
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={onEmailBrief}
                  disabled={briefState === "loading" || briefState === "sent"}
                  className="ngx-secondary-cta inline-flex min-h-[54px] w-full px-5 py-4 text-sm font-bold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {briefState === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando brief
                    </>
                  ) : briefState === "sent" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Brief enviado
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Recibir mi brief por correo
                    </>
                  )}
                </button>
              </div>

              {!calendlyUrl && (
                <p
                  className="mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed"
                  style={{
                    borderColor: "rgba(245,158,11,0.30)",
                    background: "rgba(245,158,11,0.08)",
                    color: "#fde68a",
                  }}
                >
                  La agenda todavía no está configurada. Usa WhatsApp si
                  necesitas ayuda rápida.
                </p>
              )}

              {briefMessage && (
                <p
                  className="mt-3 text-[11px] leading-relaxed"
                  style={{
                    color:
                      briefState === "error"
                        ? "#fca5a5"
                        : "rgba(255,255,255,0.62)",
                  }}
                >
                  {briefMessage}
                </p>
              )}
            </div>

            <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] px-4 py-3">
              <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-white/35">
                Ayudas antes de decidir
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onVideo}
                  className="group inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-medium text-white/68 transition-all duration-150 hover:bg-white/[0.07] hover:text-white"
                >
                  <PlayCircle
                    className="h-4 w-4"
                    style={{ color: "var(--ngx-purple-light)" }}
                  />
                  <span className="leading-tight">
                    Ver video del fundador
                  </span>
                </button>

                {whatsappUrl ? (
                  <button
                    onClick={onWhatsapp}
                    className="group inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-xs font-medium text-white/68 transition-all duration-150 hover:bg-white/[0.07] hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="leading-tight">Ayuda rápida WhatsApp</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Bonus incluido */}
            <div className="ngx-card !p-5 md:!p-6">
              <span
                className="ngx-eyebrow !text-[11px]"
                style={{ color: "var(--ngx-fg-3)" }}
              >
                Bonus incluido
              </span>
              <div className="mt-2 flex items-start gap-3">
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: "var(--ngx-purple-light)" }}
                />
                <div>
                  <p className="text-base font-bold text-white">
                    Brief de diagnóstico + dirección de temporada
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    Te llevas el resumen por correo y, si hace sentido, una
                    llamada corta para aterrizar el sistema HYBRID a tu caso.
                  </p>
                </div>
              </div>
            </div>

            {/* Cohorte guiada spots/progress */}
            {showCohortSignal && (
              <div className="ngx-glass !p-5 md:!p-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    {hasCohortSpots ? (
                      <p className="font-mono text-3xl font-bold tabular-nums tracking-[-0.02em] text-white md:text-4xl leading-none">
                        {cohortSpotsLeft}
                        <span className="ml-2 text-lg font-medium tracking-normal text-white/35">
                          / {cohortSpotsTotal}
                        </span>
                      </p>
                    ) : (
                      <p className="font-mono text-xl font-bold tracking-[-0.02em] text-white md:text-2xl leading-tight">
                        {cohortLabel ?? "Ruta por confirmar"}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-white/55">
                      {hasCohortSpots
                        ? `Plazas confirmadas para cohorte ${cohortLabel ?? "Marzo"}`
                        : "Los cupos y la ruta se confirman después del diagnóstico"}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]"
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
                      width: hasCohortSpots
                        ? `${
                            ((cohortSpotsTotal - cohortSpotsLeft) /
                              cohortSpotsTotal) *
                            100
                          }%`
                        : "0%",
                      background:
                        "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                      boxShadow: "0 0 12px rgba(109,0,255,0.40)",
                    }}
                  />
                </div>
              </div>
            )}

            {directCheckoutEnabled && (
              <div className="ngx-glass !p-5 md:!p-6 relative overflow-hidden">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span
                    className="ngx-eyebrow !text-[11px]"
                    style={{ color: "var(--ngx-fg-3)" }}
                  >
                    Compra directa opcional
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.62)",
                    }}
                  >
                    <Crown className="h-3 w-3" />
                    Flag activo
                  </span>
                </div>

                <h3 className="text-base font-bold leading-tight text-white">
                  Inscripción directa a HYBRID
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                  Visible solo cuando el equipo habilita checkout directo.
                </p>

                <div className="mt-4 grid gap-2">
                  {skus.map((s) => {
                    const isSelected = selectedSku === s.sku;
                    return (
                      <button
                        key={s.sku}
                        onClick={() => s.available && onSelectSku(s.sku)}
                        disabled={!s.available}
                        className={`group relative flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                          s.available
                            ? "cursor-pointer hover:bg-white/[0.04]"
                            : "cursor-not-allowed opacity-50"
                        }`}
                        style={{
                          borderColor: isSelected
                            ? "rgba(109,0,255,0.55)"
                            : "rgba(255,255,255,0.08)",
                          background: isSelected
                            ? "linear-gradient(180deg, rgba(109,0,255,0.10), rgba(109,0,255,0.04))"
                            : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-sm font-bold text-white">
                            {s.label}
                          </p>
                          {s.perMonthLabel && (
                            <p className="mt-0.5 text-[11px] text-white/45">
                              {s.perMonthLabel}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-bold text-white">
                          {s.priceLabel}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {checkoutError && (
                  <p
                    className="mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed"
                    style={{
                      borderColor: "rgba(239,68,68,0.32)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#fca5a5",
                    }}
                  >
                    {checkoutError}
                  </p>
                )}

                <button
                  onClick={onCheckout}
                  disabled={!selectedSku || !anySkuAvailable || !!checkoutLoading}
                  className="ngx-secondary-cta mt-4 inline-flex min-h-[52px] w-full px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] disabled:cursor-not-allowed"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirigiendo a Mercado Pago
                    </>
                  ) : (
                    <>
                      {anySkuAvailable
                        ? "Continuar a checkout"
                        : "Pricing próximamente"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Trust micro-row */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: ShieldCheck, label: "Aspiración" },
                { icon: ShieldCheck, label: "No médico" },
                { icon: ShieldCheck, label: "Humano" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center justify-center gap-1 text-[11px] uppercase tracking-[0.10em] text-white/40 sm:justify-start sm:text-[11px] sm:tracking-[0.14em]"
                >
                  <Icon className="h-3 w-3" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de video */}
      <VideoFounderModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        shareId={shareId}
        videoUrl={videoUrl}
        posterUrl={videoPoster}
        durationSeconds={videoDuration}
        onCalendlyFallback={calendlyUrl ? onCalendly : undefined}
        onWhatsappFallback={whatsappUrl ? onWhatsapp : undefined}
        onVoiceAgentFallback={voiceAgentEnabled ? onVoiceAgent : undefined}
      />
    </section>
  );
}
