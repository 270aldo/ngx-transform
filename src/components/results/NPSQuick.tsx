"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquareText, Send, Share2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

interface NPSQuickProps {
  shareId: string;
}

const LOW_SCORE_OPTIONS = [
  "No entendí el siguiente paso",
  "Me faltó claridad en el roadmap",
  "Se sintió demasiado general",
];

const SCORE_SCALE = Array.from({ length: 10 }, (_, index) => index + 1);

export function NPSQuick({ shareId }: NPSQuickProps) {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const highIntent = useMemo(() => (score ?? 0) >= 9, [score]);

  async function submitFeedback() {
    if (score === null || loading || sent) return false;
    setLoading(true);
    const token = !authLoading && user ? await getIdToken() : null;

    const payload = {
      shareId,
      score,
      reason: selectedReason || null,
      comment: comment.trim() || null,
      category: highIntent ? "promoter" : "needs_clarity",
    };

    await Promise.allSettled([
      token
        ? fetch("/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          })
        : Promise.resolve(),
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: shareId,
          shareId,
          event: "nps_submitted",
          metadata: payload,
        }),
      }),
    ]);

    setLoading(false);
    setSent(true);
    return true;
  }

  async function onShare() {
    const url = `${window.location.origin}/s/${shareId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Mi visualización en NGX Transform",
          text: "Mira mi visualización de potencial en NGX Transform.",
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
    } catch {
      // Ignora cancelaciones de share sheet o permisos del clipboard.
    }
  }

  async function onShareAndSave() {
    await submitFeedback();
    await onShare();
  }

  return (
    <section className="mx-auto max-w-4xl px-4 pb-14">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="ngx-section-panel"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(109,0,255,0.06),transparent_34%)]" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-[#C8A5FF]" />
            <span className="ngx-eyebrow !text-[11px]" style={{ color: "var(--ngx-fg-3)" }}>Cierre rápido</span>
          </div>

          <h3 className="ngx-h1 !text-left">
            ¿El siguiente paso ya te quedó claro?
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            No estamos midiendo satisfacción vacía. Estamos validando si el flujo realmente te llevó de impacto visual a dirección concreta.
          </p>

          <div className="mt-6 ngx-glass !p-5 md:!p-6">
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {SCORE_SCALE.map((value) => {
                const active = score === value;
                return (
                  <button
                    key={value}
                    onClick={() => setScore(value)}
                    className={[
                      "min-h-[48px] rounded-2xl border text-sm font-semibold transition-all",
                      active
                        ? "border-[var(--ngx-purple)] bg-[var(--ngx-purple)]/15 text-white shadow-[var(--ngx-glow-primary-soft)]"
                        : "border-white/10 bg-white/[0.03] text-white/68 hover:border-white/18 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/45">
              <span>Nada claro</span>
              <span>Muy claro</span>
            </div>

            <div className="mt-5">
              {sent ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="ngx-eyebrow !text-[11px] !text-emerald-200/80">Feedback guardado</p>
                      <p className="mt-3 text-base font-semibold text-white">
                        {highIntent ? "Perfecto. Ya hay claridad suficiente para avanzar." : "Gracias. Esto ayuda a afinar el puente hacia el siguiente paso."}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">
                        {highIntent
                          ? "Si quieres, ahora puedes compartir tu visualización o seguir con tu roadmap."
                          : "Tu señal ya quedó registrada y la usaremos para hacer el flujo más claro y más útil."}
                      </p>
                    </div>
                  </div>

                  {highIntent ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={onShare}
                        className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/86 transition-all hover:bg-white/[0.06]"
                      >
                        <Share2 className="h-4 w-4" />
                        Compartir resultado
                      </button>
                      <a
                        href={`/s/${shareId}/plan`}
                        className="ngx-primary-cta inline-flex px-5 py-4 text-sm"
                      >
                        Ver roadmap
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : score === null ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    "Si el paso siguiente se entiende con fricción cero.",
                    "Si el salto entre visualización, roadmap e HYBRID se siente lógico.",
                    "Si algo sigue viéndose bonito, pero no convincente.",
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C8A5FF]" />
                        <p className="text-sm leading-relaxed text-white/68">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : highIntent ? (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
                  <p className="ngx-eyebrow !text-[11px]">Lectura del resultado</p>
                  <p className="mt-3 text-lg font-semibold text-white">Se siente suficientemente claro como para avanzar.</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Si el flujo ya te dejó claro qué hacer después, guarda ese feedback y, si quieres, comparte tu resultado.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button
                      onClick={onShareAndSave}
                      disabled={loading}
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/86 transition-all hover:bg-white/[0.06] disabled:opacity-70"
                    >
                      <Share2 className="h-4 w-4" />
                      Compartir resultado
                    </button>
                    <button
                      onClick={submitFeedback}
                      disabled={loading}
                      className="ngx-primary-cta inline-flex px-5 py-4 text-sm disabled:opacity-70"
                    >
                      <Send className="h-4 w-4" />
                      Guardar feedback
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
                  <p className="ngx-eyebrow !text-[11px]">Qué faltó para cerrar</p>
                  <p className="mt-3 text-base font-semibold text-white">Marca lo que rompió claridad.</p>

                  <div className="mt-4 grid gap-3">
                    {LOW_SCORE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedReason(opt)}
                        className={[
                          "min-h-[52px] rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                          selectedReason === opt
                            ? "border-[var(--ngx-purple)] bg-[var(--ngx-purple)]/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/68 hover:border-white/18 hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="¿Qué te faltó para que el siguiente paso se sintiera obvio? (opcional)"
                    className="mt-4 min-h-[120px] w-full rounded-2xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[var(--ngx-purple)]/45 focus:outline-none transition-colors"
                  />

                  <button
                    onClick={submitFeedback}
                    disabled={loading}
                    className="ngx-primary-cta mt-4 inline-flex w-full px-5 py-4 text-sm disabled:opacity-70"
                  >
                    <Send className="h-4 w-4" />
                    Enviar feedback
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
