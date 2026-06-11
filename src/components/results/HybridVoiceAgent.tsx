"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Mic,
  MicOff,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiveOrb } from "@/components/RiveOrb";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  parseClassification,
  CLASSIFICATION_LABELS,
  CTA_BY_CLASSIFICATION,
  type FitClassification,
  type RouteIntent,
} from "@/lib/genesis/leadClassification";

type ConnectionState = "idle" | "connecting" | "connected" | "error";

interface HybridVoiceAgentProps {
  shareId: string;
  className?: string;
}

const REALTIME_SDP_URL = "https://api.openai.com/v1/realtime/calls";

async function emitTelemetry(
  shareId: string,
  event:
    | "voice_agent_opened"
    | "voice_agent_connected"
    | "voice_agent_classified"
    | "voice_agent_cta_clicked",
  metadata?: Record<string, unknown>
) {
  await fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: shareId,
      shareId,
      event,
      metadata: { ...metadata, location: "hybrid_voice_agent" },
    }),
  }).catch(() => {});
}

export function HybridVoiceAgent({ shareId, className }: HybridVoiceAgentProps) {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [state, setState] = useState<ConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveTranscript, setSaveTranscript] = useState(false);
  const [classification, setClassification] =
    useState<FitClassification | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ownerTokenRef = useRef<string | null>(null);

  const closeConnection = useCallback(() => {
    dataChannelRef.current?.close();
    dataChannelRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    ownerTokenRef.current = null;
    setState("idle");
  }, []);

  useEffect(() => closeConnection, [closeConnection]);

  const handleRealtimeEvent = useCallback(
    (message: MessageEvent<string>) => {
      let event: unknown;
      try {
        event = JSON.parse(message.data);
      } catch {
        return;
      }

      if (!event || typeof event !== "object") return;
      const payload = event as {
        type?: string;
        delta?: string;
        transcript?: string;
        response?: { output_text?: string };
      };
      const text =
        payload.delta ?? payload.transcript ?? payload.response?.output_text;
      if (!text) return;

      setTranscript((current) => {
        const next = [...current, text].slice(-8);
        return next;
      });

      const parsed = parseClassification(text);
      if (parsed) {
        setClassification(parsed);
        emitTelemetry(shareId, "voice_agent_classified", {
          classification: parsed,
        });
        // Persist the fit classification + route the lead into the funnel.
        // Fire-and-forget: never block the live conversation on this write.
        const token = ownerTokenRef.current;
        if (!token) return;
        void fetch(`/api/sessions/${shareId}/classify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classification: parsed,
            consentSummary: saveTranscript,
            summary: saveTranscript ? transcript.join(" ").slice(0, 2000) : undefined,
          }),
        }).catch(() => {});
      }
    },
    [shareId, saveTranscript, transcript]
  );

  const startConversation = async () => {
    if (state === "connecting" || state === "connected") return;
    setError(null);
    setClassification(null);
    setTranscript([]);
    setState("connecting");

    try {
      if (authLoading) {
        throw new Error("Estamos validando tu sesión. Intenta de nuevo en unos segundos.");
      }
      if (!user) {
        throw new Error("Abre tu sesión original para hablar con GENESIS.");
      }
      const token = await getIdToken();
      if (!token) {
        throw new Error("No se pudo validar tu sesión para iniciar GENESIS.");
      }
      ownerTokenRef.current = token;
      await emitTelemetry(shareId, "voice_agent_opened", { saveTranscript });

      const sessionRes = await fetch("/api/realtime/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareId, saveTranscript }),
      });
      const session = await sessionRes.json();
      if (!sessionRes.ok || !session.ok || !session.client_secret) {
        throw new Error(session.error || "No se pudo iniciar GENESIS.");
      }

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0];
        }
      };

      const dc = pc.createDataChannel("oai-events");
      dataChannelRef.current = dc;
      dc.onmessage = handleRealtimeEvent;
      dc.onopen = () => {
        setState("connected");
        emitTelemetry(shareId, "voice_agent_connected");
        dc.send(
          JSON.stringify({
            type: "response.create",
            response: {
              modalities: ["audio", "text"],
              instructions:
                "Saluda en español. Explica que harás una entrevista corta para clasificar fit HYBRID. Haz una pregunta a la vez. Al final di literalmente una de estas etiquetas: listo_para_diagnostico, necesita_claridad o no_fit_ahora.",
            },
          })
        );
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(REALTIME_SDP_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.client_secret}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });
      if (!sdpRes.ok) {
        throw new Error("No se pudo conectar audio en tiempo real.");
      }

      await pc.setRemoteDescription({
        type: "answer",
        sdp: await sdpRes.text(),
      });
    } catch (err) {
      closeConnection();
      setState("error");
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar el agente conversacional."
      );
    }
  };

  // Segmented CTA: defaults to the HYBRID diagnosis path until the agent
  // classifies the lead, then adapts the label + destination to the track.
  const cta = classification
    ? CTA_BY_CLASSIFICATION[classification]
    : { intent: "hybrid" as RouteIntent, label: "Agendar diagnóstico HYBRID" };

  const scrollToOffer = () => {
    document
      .getElementById("hybrid-offer")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onCtaClick = async () => {
    await emitTelemetry(shareId, "voice_agent_cta_clicked", {
      classification,
      intent: cta.intent,
    });

    // HYBRID lead → open the booking flow if configured.
    if (cta.intent === "hybrid") {
      const calendlyUrl =
        process.env.NEXT_PUBLIC_CALENDLY_URL ||
        process.env.NEXT_PUBLIC_BOOKING_URL;
      if (calendlyUrl) {
        window.open(calendlyUrl, "_blank", "noopener,noreferrer");
        return;
      }
    }
    // ASCEND / nurture (and HYBRID fallback) → the offer section handles
    // direct checkout, brief-by-email and WhatsApp paths.
    scrollToOffer();
  };

  return (
    <section
      id="hybrid-voice-agent"
      className={cn("relative mx-auto max-w-6xl px-4 py-14 md:py-20 scroll-mt-24", className)}
    >
      <div className="ngx-section-panel relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_72%_20%,rgba(109,0,255,0.10),transparent_36%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] lg:items-center">
          <div>
            <span className="ngx-eyebrow-pill mb-4">
              GENESIS · entrevista breve
            </span>
            <h2 className="ngx-h1 !text-left">
              Habla con GENESIS antes de decidir.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
              Un agente de voz te entrevista, aclara cómo funciona HYBRID y
              clasifica si el siguiente paso es diagnóstico, más claridad o
              esperar. No da diagnóstico médico ni promete resultados.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                "Preguntas cortas",
                "Clasificación de fit",
                "Siguiente paso claro",
              ].map((item) => (
                <div key={item} className="ngx-metal-card !p-4">
                  <div className="relative z-10 flex items-center gap-2 text-sm text-white/72">
                    <ShieldCheck className="h-4 w-4 text-[var(--ngx-purple-light)]" />
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="ngx-glass !p-5 md:!p-6">
            <audio ref={audioRef} autoPlay className="hidden" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>
                  Estado
                </span>
                <p className="mt-1 text-base font-bold text-white">
                  {state === "connected"
                    ? "GENESIS escuchando"
                    : state === "connecting"
                      ? "Conectando audio"
                      : state === "error"
                        ? "Requiere atención"
                        : "Listo para conversar"}
                </p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                {state === "connected" ? (
                  <Mic className="h-5 w-5 text-[var(--ngx-success)]" />
                ) : (
                  <MicOff className="h-5 w-5 text-white/55" />
                )}
              </span>
            </div>

            {/* GENESIS Visual RiveOrb */}
            <div className="my-8 flex justify-center items-center">
              <RiveOrb
                size={230}
                minSize={160}
                fluid="32vw"
                className={cn(
                  "transition-all duration-700 ease-out transform",
                  state === "connected"
                    ? "scale-105 opacity-100 filter drop-shadow-[0_0_35px_rgba(109,0,255,0.45)]"
                    : state === "connecting"
                      ? "animate-pulse scale-100 opacity-90"
                      : "scale-95 opacity-60 hover:opacity-85"
                )}
              />
            </div>

            <label className="mt-5 flex items-start gap-3 border-t border-white/[0.08] pt-4">
              <input
                type="checkbox"
                checked={saveTranscript}
                onChange={(event) => setSaveTranscript(event.target.checked)}
                disabled={state !== "idle" && state !== "error"}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[var(--ngx-purple)]"
              />
              <span className="text-xs leading-relaxed text-white/55">
                Permitir guardar un resumen de esta conversación para el
                diagnóstico. Opcional; sin esto, la conversación vive solo en
                esta sesión.
              </span>
            </label>

            {classification && (
              <div className="mt-4 rounded-2xl border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/10 px-4 py-3">
                <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-purple-light)" }}>
                  Clasificación preliminar
                </span>
                <p className="mt-1 font-bold text-white">
                  {CLASSIFICATION_LABELS[classification]}
                </p>
              </div>
            )}

            {transcript.length > 0 && (
              <div className="mt-4 max-h-28 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3">
                <p className="text-xs leading-relaxed text-white/48">
                  {transcript.join(" ")}
                </p>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
                {error}
              </p>
            )}

            <div className="mt-5 grid gap-3">
              {state === "connected" ? (
                <button
                  onClick={closeConnection}
                  className="ngx-secondary-cta inline-flex min-h-[52px] w-full px-5 py-3 text-sm"
                >
                  <MicOff className="h-4 w-4" />
                  Terminar conversación
                </button>
              ) : (
                <button
                  onClick={startConversation}
                  disabled={state === "connecting" || authLoading || !user}
                  className="ngx-primary-cta inline-flex min-h-[54px] w-full px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Sparkles className="h-4 w-4" />
                  {state === "connecting"
                    ? "Conectando"
                    : !user && !authLoading
                      ? "Abre tu sesión original"
                      : "Hablar con GENESIS"}
                </button>
              )}

              <button
                onClick={onCtaClick}
                className="ngx-glass-clear inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.97]"
              >
                <CalendarDays className="h-4 w-4" />
                {cta.label}
                {cta.intent === "hybrid" ? (
                  <PhoneCall className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
