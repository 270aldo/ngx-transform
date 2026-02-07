"use client";

import { useMemo, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";

interface NPSQuickProps {
  shareId: string;
}

const LOW_SCORE_OPTIONS = [
  "No entendí el plan exacto",
  "Me faltó claridad en el siguiente paso",
];

export function NPSQuick({ shareId }: NPSQuickProps) {
  const [score, setScore] = useState<number | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const highIntent = useMemo(() => (score ?? 0) >= 9, [score]);

  async function submitFeedback() {
    if (score === null || loading) return;
    setLoading(true);
    const payload = {
      shareId,
      score,
      reason: selectedReason || null,
      comment: comment.trim() || null,
      category: highIntent ? "promoter" : "needs_clarity",
    };

    await Promise.allSettled([
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
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
  }

  async function onShare() {
    const url = `${window.location.origin}/s/${shareId}`;
    if (navigator.share) {
      await navigator.share({
        title: "Mi resultado en NGX Transform",
        text: "Mira mi proyección de 12 meses en NGX Transform.",
        url,
      });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquareText className="h-4 w-4 text-[#6D00FF]" />
          <p className="text-xs uppercase tracking-widest text-white/70">Feedback rápido</p>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">
          ¿Qué tan claro te quedó lo que es posible?
        </h3>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6">
          {Array.from({ length: 10 }).map((_, idx) => {
            const value = idx + 1;
            const active = score === value;
            return (
              <button
                key={value}
                onClick={() => setScore(value)}
                className={`min-h-[44px] rounded-lg border text-sm font-medium transition ${
                  active
                    ? "border-[#6D00FF] bg-[#6D00FF]/20 text-white"
                    : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>

        {score !== null && !sent && (
          <div className="space-y-4">
            {highIntent ? (
              <button
                onClick={onShare}
                className="w-full sm:w-auto min-h-[44px] rounded-lg bg-white text-black font-semibold px-4 py-2 hover:brightness-95 transition"
              >
                Compartir mi resultado
              </button>
            ) : (
              <>
                <div className="grid gap-2">
                  {LOW_SCORE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedReason(opt)}
                      className={`text-left min-h-[44px] rounded-lg border px-3 py-2 text-sm transition ${
                        selectedReason === opt
                          ? "border-[#6D00FF] bg-[#6D00FF]/15 text-white"
                          : "border-white/15 bg-white/5 text-white/70"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="¿Qué te faltó? (opcional)"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 min-h-[96px]"
                />
              </>
            )}

            <button
              onClick={submitFeedback}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] rounded-lg bg-[#6D00FF] text-white font-semibold px-4 py-2 hover:bg-[#7D1AFF] disabled:opacity-70 transition inline-flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar feedback
            </button>
          </div>
        )}

        {sent && (
          <p className="text-sm text-emerald-400">Gracias. Tu feedback quedó guardado.</p>
        )}
      </div>
    </section>
  );
}

