"use client";

/**
 * HybridOfferV2 — Salida comercial post-resultados (v12)
 *
 * Reemplaza a HybridOfferSection con 4 caminos claros:
 *  1. Comprar NGX HYBRID directo (Mercado Pago Checkout Pro) — primary
 *  2. Ver video del fundador (3-5 min) — secondary
 *  3. Agendar llamada 1:1 (Calendly) — secondary
 *  4. WhatsApp directo al equipo — tertiary
 *
 * Mantiene el copy maduro de "cuándo sí tiene sentido" y la cohorte
 * scarcity. Si no hay pricing configurado, el camino de checkout se
 * deshabilita gracefully y reconduce a la llamada/WhatsApp.
 *
 * Telemetría granular por camino (ver lib/telemetry.ts).
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
  "Hola, acabo de ver mis resultados en NGX Transform y quiero entrar a HYBRID.";

function readNum(envVar?: string): number | null {
  if (!envVar) return null;
  const n = Number(envVar);
  return Number.isFinite(n) && n > 0 ? n : null;
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
  metadata?: Record<string, unknown>
) {
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
    fetch("/api/events/hybrid-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, shareId }),
    }).catch(() => {}),
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
  const [videoOpen, setVideoOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<Sku | null>(() =>
    pickDefaultSku()
  );
  const [checkoutLoading, setCheckoutLoading] = useState<Sku | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [briefState, setBriefState] = useState<
    "idle" | "loading" | "sent" | "error"
  >("idle");
  const [briefMessage, setBriefMessage] = useState<string | null>(null);

  const cohortLabel =
    cohorteInfo?.label ?? process.env.NEXT_PUBLIC_COHORT_LABEL ?? "Marzo";
  const cohortSpotsTotal =
    cohorteInfo?.spotsTotal ??
    Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_TOTAL ?? "20");
  const cohortSpotsLeft =
    cohorteInfo?.spotsLeft ??
    Number(process.env.NEXT_PUBLIC_COHORT_SPOTS_LEFT ?? "18");

  const calendlyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    "https://calendly.com/ngx-genesis";
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
      const res = await fetch("/api/checkout/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const onCalendly = async () => {
    await emitTelemetry(shareId, "calendly_v2_clicked");
    window.open(calendlyUrl, "_blank", "noopener,noreferrer");
  };

  const onWhatsapp = async () => {
    if (!whatsappUrl) return;
    await emitTelemetry(shareId, "whatsapp_v2_clicked");
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const onEmailBrief = async () => {
    if (briefState === "loading" || briefState === "sent") return;
    setBriefState("loading");
    setBriefMessage(null);
    await emitTelemetry(shareId, "brief_email_requested");

    try {
      const res = await fetch("/api/brief/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      className="relative mx-auto max-w-6xl px-4 py-12 scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="ngx-section-panel relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_15%,rgba(109,0,255,0.15),transparent_38%),radial-gradient(circle_at_88%_25%,rgba(184,148,255,0.08),transparent_28%)]" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(380px,1fr)]">
          {/* COLUMNA IZQUIERDA — Tesis */}
          <div>
            <span className="ngx-eyebrow-pill mb-4">NGX Hybrid · Cohorte {cohortLabel}</span>
            <h2 className="ngx-h1 !text-left">
              Ya viste hacia dónde puede ir tu cuerpo. Decide cómo quieres
              ejecutarlo.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
              La visualización abre la conversación. NGX HYBRID es el sistema
              que la convierte en ejecución real: GENESIS adapta tu plan cada
              semana, un coach humano valida tus decisiones, y 12 semanas de
              checkpoints sostienen la adherencia.
            </p>

            <div className="mt-7 ngx-card-grid ngx-card-grid-3 items-stretch">
              {[
                "Sistema GENESIS que adapta tu plan cada semana",
                "Coach humano que valida y acompaña",
                "12 semanas con checkpoints reales",
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
                className="ngx-eyebrow !text-[10px]"
                style={{ color: "var(--ngx-fg-3)" }}
              >
                Cuándo sí tiene sentido
              </span>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                Si entendiste lo que te está frenando y quieres acompañamiento
                real para ejecutarlo —no otra app de fitness, no otro plan
                genérico— este es el sistema.
              </p>
            </div>

            <div className="mt-5 ngx-card !p-5 md:!p-6">
              <span
                className="ngx-eyebrow !text-[10px]"
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
                    Ebook Conversacional GENESIS + Plan personalizado de 7 días
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    Se entrega en cuanto activamos tu acceso. Para aterrizar
                    el sistema desde la primera semana.
                  </p>
                </div>
              </div>
            </div>

            {/* Cohort scarcity */}
            <div className="mt-6 ngx-glass !p-5 md:!p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-3xl font-bold tabular-nums tracking-[-0.02em] text-white md:text-4xl leading-none">
                    {cohortSpotsLeft}
                    <span className="ml-2 text-lg font-medium tracking-normal text-white/35">
                      / {cohortSpotsTotal}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-white/55">
                    Plazas estimadas para cohorte {cohortLabel}
                  </p>
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
                    width: `${
                      ((cohortSpotsTotal - cohortSpotsLeft) /
                        cohortSpotsTotal) *
                      100
                    }%`,
                    background:
                      "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                    boxShadow: "0 0 12px rgba(109,0,255,0.40)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA — Los 4 caminos */}
          <div className="space-y-5">
            {/* CAMINO 1 — Checkout MP (PRIMARY) */}
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
                  className="ngx-eyebrow !text-[10px]"
                  style={{ color: "var(--ngx-fg-3)" }}
                >
                  Empezar ahora
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.18em]"
                  style={{
                    background: "rgba(109,0,255,0.16)",
                    border: "1px solid rgba(109,0,255,0.32)",
                    color: "var(--ngx-purple-light)",
                  }}
                >
                  <Crown className="h-3 w-3" />
                  Recomendado
                </span>
              </div>

              <h3 className="text-lg font-bold leading-tight text-white">
                Compra NGX HYBRID directo
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                Si ya entendiste el sistema y quieres entrar hoy mismo.
              </p>

              {/* SKU selector */}
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
                        boxShadow: isSelected
                          ? "0 0 0 1px rgba(109,0,255,0.45), 0 0 24px rgba(109,0,255,0.18)"
                          : "none",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            borderColor: isSelected
                              ? "var(--ngx-purple-light)"
                              : "rgba(255,255,255,0.18)",
                            background: isSelected
                              ? "var(--ngx-purple)"
                              : "transparent",
                          }}
                        >
                          {isSelected && (
                            <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <div className="leading-tight">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white">
                              {s.label}
                            </p>
                            {s.badge && (
                              <span className="rounded-full px-1.5 py-0.5 text-[8px] uppercase tracking-[0.18em] text-white"
                                style={{
                                  background:
                                    "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                                }}
                              >
                                {s.badge}
                              </span>
                            )}
                          </div>
                          {s.perMonthLabel && (
                            <p className="mt-0.5 text-[11px] text-white/45">
                              {s.perMonthLabel}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-white whitespace-nowrap">
                          {s.priceLabel}
                        </p>
                      </div>
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
                className="mt-4 inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-bold uppercase tracking-[0.06em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                style={{
                  backgroundColor: "var(--ngx-purple)",
                  boxShadow: "var(--ngx-glow-primary)",
                }}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirigiendo a Mercado Pago…
                  </>
                ) : (
                  <>
                    {anySkuAvailable
                      ? "Comprar y empezar hoy"
                      : "Pricing próximamente"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[10px] uppercase tracking-[0.16em] text-white/40">
                Pago seguro vía Mercado Pago · Acceso inmediato
              </p>
            </div>

            {/* CAMINO 2 — Video del fundador (SECONDARY) */}
            <button
              onClick={onVideo}
              className="ngx-glass !p-5 md:!p-6 group block w-full text-left transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(109,0,255,0.18)",
                    border: "1px solid rgba(109,0,255,0.38)",
                  }}
                >
                  <PlayCircle
                    className="h-5 w-5"
                    style={{ color: "var(--ngx-purple-light)" }}
                  />
                </span>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Antes de decidir
                  </p>
                  <p className="mt-0.5 text-base font-bold text-white">
                    Ver video del fundador
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    {Math.round(videoDuration / 60)} min · Cómo funciona
                    HYBRID por dentro
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/45 transition-transform duration-150 group-hover:translate-x-0.5" />
              </div>
            </button>

            {/* CAMINO 3 — Calendly (SECONDARY) */}
            <button
              onClick={onCalendly}
              className="ngx-glass !p-5 md:!p-6 group block w-full text-left transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <CalendarDays className="h-5 w-5 text-white/85" />
                </span>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Hablar con el equipo
                  </p>
                  <p className="mt-0.5 text-base font-bold text-white">
                    Agendar llamada 1:1
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    30 min · Para evaluar fit con tu contexto
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-white/45 transition-transform duration-150 group-hover:translate-x-0.5" />
              </div>
            </button>

            {/* CAMINO 4 — WhatsApp (TERTIARY) */}
            {whatsappUrl && (
              <button
                onClick={onWhatsapp}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/72 transition-all duration-150 hover:bg-white/[0.04] hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                ¿Tienes una duda rápida? Escríbenos por WhatsApp
              </button>
            )}

            {/* CAMINO 5 — Email brief (TERTIARY · captura, no conversión) */}
            <div className="ngx-glass !p-4 md:!p-5">
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <Mail className="h-4 w-4 text-white/72" />
                </span>
                <div className="flex-1 leading-tight">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    No estás listo hoy
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-white">
                    Recibe tu brief por correo
                  </p>
                  <p className="mt-1 text-xs text-white/55">
                    Tu visualización + diagnóstico + roadmap. Decides cuándo
                    quieras.
                  </p>
                </div>
              </div>

              <button
                onClick={onEmailBrief}
                disabled={briefState === "loading" || briefState === "sent"}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white/85 transition-all duration-150 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {briefState === "loading" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Enviando…
                  </>
                ) : briefState === "sent" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Brief enviado
                  </>
                ) : (
                  <>
                    Enviarme mi brief
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {briefMessage && (
                <p
                  className="mt-2 text-[11px] leading-relaxed"
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

            {/* Trust micro-row */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: ShieldCheck, label: "Pago protegido" },
                { icon: ShieldCheck, label: "Acceso inmediato" },
                { icon: ShieldCheck, label: "Coach humano" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/40"
                >
                  <Icon className="h-3 w-3" />
                  <span className="truncate">{label}</span>
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
        onCalendlyFallback={onCalendly}
        onWhatsappFallback={whatsappUrl ? onWhatsapp : undefined}
      />
    </section>
  );
}
