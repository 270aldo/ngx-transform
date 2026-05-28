"use client";

/**
 * VideoFounderModal
 * Modal de video del fundador (Aldo) para la sección comercial post-resultados.
 *
 * Soporta 3 modos:
 *  - YouTube embed (cuando videoUrl es youtube.com/embed/* o youtu.be/*)
 *  - Vimeo embed (cuando videoUrl es player.vimeo.com/video/*)
 *  - MP4 propio (cuando videoUrl es .mp4 / .webm / signed URL)
 *
 * Cuando no hay videoUrl, muestra un placeholder cinemático "Próximamente"
 * con CTAs alternativos para no perder al usuario.
 *
 * Telemetría:
 *  - video_founder_opened (al abrir el modal)
 *  - video_founder_played (al primer play)
 *  - video_founder_progress_25/50/75 (milestones)
 *  - video_founder_completed (al terminar)
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Calendar, MessageCircle, Sparkles } from "lucide-react";

interface VideoFounderModalProps {
  open: boolean;
  onClose: () => void;
  shareId: string;
  videoUrl?: string;
  posterUrl?: string;
  durationSeconds?: number;
  onCalendlyFallback?: () => void;
  onWhatsappFallback?: () => void;
  onVoiceAgentFallback?: () => void;
}

type VideoKind = "youtube" | "vimeo" | "mp4" | "none";

function detectVideoKind(url?: string): VideoKind {
  if (!url) return "none";
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("vimeo.com")) return "vimeo";
  if (u.endsWith(".mp4") || u.endsWith(".webm") || u.endsWith(".mov") || u.includes(".mp4?")) {
    return "mp4";
  }
  return "mp4"; // default to native player for signed URLs
}

function normalizeYouTubeUrl(url: string): string {
  // Convierte cualquier URL de YouTube al formato embed
  if (url.includes("/embed/")) return url;
  const idMatch =
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtube\.com\/shorts\/([\w-]{11})/);
  const id = idMatch?.[1];
  if (!id) return url;
  return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
}

function normalizeVimeoUrl(url: string): string {
  if (url.includes("player.vimeo.com")) return url;
  const idMatch = url.match(/vimeo\.com\/(\d+)/);
  const id = idMatch?.[1];
  if (!id) return url;
  return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
}

async function emit(
  shareId: string,
  event:
    | "video_founder_opened"
    | "video_founder_played"
    | "video_founder_progress_25"
    | "video_founder_progress_50"
    | "video_founder_progress_75"
    | "video_founder_completed"
) {
  await fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: shareId,
      shareId,
      event,
      metadata: { location: "hybrid_offer_v2" },
    }),
  }).catch(() => {});
}

export function VideoFounderModal({
  open,
  onClose,
  shareId,
  videoUrl,
  posterUrl,
  durationSeconds,
  onCalendlyFallback,
  onWhatsappFallback,
  onVoiceAgentFallback,
}: VideoFounderModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // useRef para milestones — evitamos setState en useEffect de reset al reabrir.
  // Las flags se mutan al disparar cada evento; reset en handleClose.
  const playedRef = useRef(false);
  const milestonesRef = useRef({ p25: false, p50: false, p75: false, p100: false });

  const kind = useMemo(() => detectVideoKind(videoUrl), [videoUrl]);
  const normalizedUrl = useMemo(() => {
    if (!videoUrl) return undefined;
    if (kind === "youtube") return normalizeYouTubeUrl(videoUrl);
    if (kind === "vimeo") return normalizeVimeoUrl(videoUrl);
    return videoUrl;
  }, [videoUrl, kind]);

  // Disparar evento al abrir
  useEffect(() => {
    if (open) {
      emit(shareId, "video_founder_opened");
      // Reset flags para una nueva apertura (mutación de ref, no re-render)
      playedRef.current = false;
      milestonesRef.current = { p25: false, p50: false, p75: false, p100: false };
    }
  }, [open, shareId]);

  // ESC para cerrar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Tracking de progreso para MP4 nativo
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;

    const pct = (v.currentTime / v.duration) * 100;
    const m = milestonesRef.current;

    if (!m.p25 && pct >= 25) {
      m.p25 = true;
      emit(shareId, "video_founder_progress_25");
    }
    if (!m.p50 && pct >= 50) {
      m.p50 = true;
      emit(shareId, "video_founder_progress_50");
    }
    if (!m.p75 && pct >= 75) {
      m.p75 = true;
      emit(shareId, "video_founder_progress_75");
    }
  }, [shareId]);

  const handlePlay = useCallback(() => {
    if (!playedRef.current) {
      playedRef.current = true;
      emit(shareId, "video_founder_played");
    }
  }, [shareId]);

  const handleEnded = useCallback(() => {
    if (!milestonesRef.current.p100) {
      milestonesRef.current.p100 = true;
      emit(shareId, "video_founder_completed");
    }
  }, [shareId]);

  if (!open) return null;

  const durationLabel = durationSeconds
    ? `${Math.round(durationSeconds / 60)} min`
    : "3-5 min";

  return (
    <AnimatePresence>
      <motion.div
        key="video-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Video del fundador NGX"
      >
        <motion.div
          key="video-modal-panel"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0A0510]"
          style={{
            boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(109,0,255,0.18)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "rgba(109,0,255,0.16)",
                  border: "1px solid rgba(109,0,255,0.32)",
                }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "var(--ngx-purple-light)" }} />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">Aldo Olivas · CEO NGX</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                  Por qué HYBRID · Fit · Diagnóstico · {durationLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar video"
              className="rounded-lg p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Video player */}
          <div className="relative aspect-video w-full bg-black">
            {kind === "none" && (
              <VideoPlaceholder
                posterUrl={posterUrl}
                onCalendly={onCalendlyFallback}
                onWhatsapp={onWhatsappFallback}
                onVoiceAgent={onVoiceAgentFallback}
              />
            )}

            {kind === "youtube" && normalizedUrl && (
              <iframe
                src={`${normalizedUrl}${normalizedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title="NGX HYBRID — Aldo Olivas"
                className="absolute inset-0 h-full w-full"
                allow="accelerator; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handlePlay}
              />
            )}

            {kind === "vimeo" && normalizedUrl && (
              <iframe
                src={`${normalizedUrl}${normalizedUrl.includes("?") ? "&" : "?"}autoplay=1`}
                title="NGX HYBRID — Aldo Olivas"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                onLoad={handlePlay}
              />
            )}

            {kind === "mp4" && normalizedUrl && (
              <video
                ref={videoRef}
                src={normalizedUrl}
                poster={posterUrl}
                controls
                playsInline
                autoPlay
                className="absolute inset-0 h-full w-full object-contain"
                onPlay={handlePlay}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              >
                Tu navegador no soporta video HTML5.
              </video>
            )}
          </div>

          {/* Footer con CTAs siguientes */}
          <div className="border-t border-white/10 bg-[#0A0510]/95 px-5 py-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/45">
              ¿Qué sigue después del video?
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {onCalendlyFallback && (
                <button
                  onClick={() => {
                    onClose();
                    onCalendlyFallback();
                  }}
                  className="ngx-glass-clear inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
                >
                  <Calendar className="h-4 w-4" />
                  Agendar diagnóstico HYBRID
                </button>
              )}
              {onWhatsappFallback && (
                <button
                  onClick={() => {
                    onClose();
                    onWhatsappFallback();
                  }}
                  className="ngx-glass-clear inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/90 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Hablar por WhatsApp
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Placeholder cinemático para cuando aún no hay videoUrl configurado.
 * Mantiene el wow factor y reconduce a Calendly/WhatsApp.
 */
function VideoPlaceholder({
  posterUrl,
  onCalendly,
  onWhatsapp,
  onVoiceAgent,
}: {
  posterUrl?: string;
  onCalendly?: () => void;
  onWhatsapp?: () => void;
  onVoiceAgent?: () => void;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_45%,rgba(109,0,255,0.20),transparent_55%),linear-gradient(180deg,#0A0510_0%,#06030C_100%)] text-center"
      style={posterUrl ? { backgroundImage: `url(${posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {posterUrl && <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />}

      <div className="relative z-10 max-w-md px-6">
        <span
          className="inline-flex h-14 w-14 items-center justify-center rounded-full mb-5"
          style={{
            background: "rgba(109,0,255,0.18)",
            border: "1px solid rgba(109,0,255,0.38)",
            boxShadow: "0 0 30px rgba(109,0,255,0.30)",
          }}
        >
          <Play className="h-6 w-6 fill-white" style={{ color: "white" }} />
        </span>
        <h3 className="ngx-h2 mb-3" style={{ fontSize: "1.5rem" }}>
          Guía rápida HYBRID
        </h3>
        <p className="text-sm leading-relaxed text-white/65 mb-6">
          Aquí debe quedar claro por qué HYBRID existe, para quién sí tiene
          sentido, para quién no, y qué pasa dentro del diagnóstico. Mientras el
          video oficial se carga, usa el diagnóstico o habla con GENESIS para
          clasificar tu caso.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {onVoiceAgent && (
            <button
              onClick={onVoiceAgent}
              className="ngx-primary-cta inline-flex !min-h-[44px] px-5 py-2.5 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Hablar con GENESIS
            </button>
          )}
          {onCalendly && (
            <button
              onClick={onCalendly}
              className={onVoiceAgent ? "ngx-glass-clear inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]" : "ngx-primary-cta inline-flex !min-h-[44px] px-5 py-2.5 text-sm"}
            >
              <Calendar className="h-4 w-4" />
              Agendar diagnóstico
            </button>
          )}
          {onWhatsapp && (
            <button
              onClick={onWhatsapp}
              className="ngx-glass-clear inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
