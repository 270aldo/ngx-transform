"use client";

import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  PhoneCall,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  parseClassification,
  CLASSIFICATION_LABELS,
  CTA_BY_CLASSIFICATION,
  type FitClassification,
  type RouteIntent,
} from "@/lib/genesis/leadClassification";

interface GenesisTextChatProps {
  shareId: string;
  className?: string;
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

const MAX_INPUT = 2000;

async function emitTelemetry(
  shareId: string,
  event: "genesis_text_chat_opened" | "genesis_text_chat_classified",
  metadata?: Record<string, unknown>,
) {
  await fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: shareId,
      shareId,
      event,
      metadata: { ...metadata, location: "genesis_text_chat" },
    }),
  }).catch(() => {});
}

export function GenesisTextChat({ shareId, className }: GenesisTextChatProps) {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] =
    useState<FitClassification | null>(null);
  const openedRef = useRef(false);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    if (authLoading) {
      setError("Estamos validando tu sesión. Intenta de nuevo en unos segundos.");
      return;
    }
    if (!user) {
      setError("Abre tu sesión original para chatear con GENESIS.");
      return;
    }
    setError(null);

    const token = await getIdToken();
    if (!token) {
      setError("No se pudo validar tu sesión para chatear con GENESIS.");
      return;
    }
    if (!openedRef.current) {
      openedRef.current = true;
      void emitTelemetry(shareId, "genesis_text_chat_opened");
    }

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "model", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/genesis-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shareId, messages: history }),
      });
      if (!res.ok || !res.body) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "GENESIS no pudo responder.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const next = [...cur];
          next[next.length - 1] = { role: "model", content: acc };
          return next;
        });
      }

      const parsed = parseClassification(acc);
      if (parsed && parsed !== classification) {
        setClassification(parsed);
        void emitTelemetry(shareId, "genesis_text_chat_classified", {
          classification: parsed,
        });
        // Persist fit + route the lead into the funnel (same endpoint as voice).
        const t = await getIdToken();
        if (t) {
          void fetch(`/api/sessions/${shareId}/classify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify({ classification: parsed }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al hablar con GENESIS.",
      );
      // Drop the trailing empty model bubble on failure.
      setMessages((cur) =>
        cur.filter(
          (m, i) =>
            !(i === cur.length - 1 && m.role === "model" && m.content === ""),
        ),
      );
    } finally {
      setStreaming(false);
    }
  }, [
    input,
    streaming,
    authLoading,
    user,
    getIdToken,
    messages,
    shareId,
    classification,
  ]);

  const cta = classification
    ? CTA_BY_CLASSIFICATION[classification]
    : { intent: "hybrid" as RouteIntent, label: "Agendar diagnóstico HYBRID" };

  const onCtaClick = () => {
    if (cta.intent === "hybrid") {
      const url =
        process.env.NEXT_PUBLIC_CALENDLY_URL ||
        process.env.NEXT_PUBLIC_BOOKING_URL;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
    }
    document
      .getElementById("hybrid-offer")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="genesis-text-chat"
      className={cn(
        "relative mx-auto max-w-6xl px-4 py-14 md:py-20 scroll-mt-24",
        className,
      )}
    >
      <div className="ngx-section-panel relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_28%_18%,rgba(109,0,255,0.10),transparent_36%)]" />
        <div className="relative z-10">
          <span className="ngx-eyebrow-pill mb-4">GENESIS · chat</span>
          <h2 className="ngx-h1 !text-left">
            Pregúntale a GENESIS lo que quieras.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/62 md:text-base">
            Resuelve tus dudas sobre NGX y el programa HYBRID por texto. GENESIS
            te orienta y, cuando hace sentido, te dice el siguiente paso. No da
            diagnóstico médico ni promete resultados.
          </p>

          <div className="ngx-glass mt-6 !p-4 md:!p-5">
            <div className="flex max-h-[42vh] min-h-[160px] flex-col gap-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <p className="m-auto max-w-sm text-center text-sm text-white/45">
                  Escribe tu primera pregunta para empezar.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "self-end bg-[var(--ngx-purple)]/15 text-white"
                      : "self-start border border-white/[0.08] bg-black/20 text-white/85",
                  )}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-relaxed text-red-200">
                {error}
              </p>
            )}

            {classification && (
              <div className="mt-3 rounded-2xl border border-[var(--ngx-purple)]/30 bg-[var(--ngx-purple)]/10 px-4 py-2.5">
                <span
                  className="ngx-eyebrow !text-[11px]"
                  style={{ color: "var(--ngx-purple-light)" }}
                >
                  Clasificación preliminar
                </span>
                <p className="mt-0.5 font-bold text-white">
                  {CLASSIFICATION_LABELS[classification]}
                </p>
              </div>
            )}

            <form
              className="mt-4 flex items-end gap-2 border-t border-white/[0.08] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                maxLength={MAX_INPUT}
                rows={1}
                disabled={streaming || authLoading || !user}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={
                  !user && !authLoading
                    ? "Abre tu sesión original para chatear"
                    : "Escribe tu pregunta…"
                }
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--ngx-purple)]/40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={streaming || authLoading || !user || !input.trim()}
                className="ngx-primary-cta inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {streaming ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar
              </button>
            </form>

            <button
              onClick={onCtaClick}
              className="ngx-glass-clear mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/85 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98]"
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
    </section>
  );
}
