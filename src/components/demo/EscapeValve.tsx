"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Gift, Clock, Mail } from "lucide-react";

interface EscapeValveProps {
  shareId: string;
  source?: "escape_valve" | "demo_exit" | "plan_download";
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function EscapeValve({ shareId, source = "escape_valve" }: EscapeValveProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setErrorMessage("Ingresa un email válido");
      setSubmitState("error");
      return;
    }

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/remarketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          shareId,
          source,
          reminderDays: 7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar");
      }

      setSubmitState("success");

      // Track conversion
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "remarketing_signup", {
          share_id: shareId,
          source,
        });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error al registrar");
      setSubmitState("error");
    }
  };

  // Success state
  if (submitState === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
      >
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">¡Listo!</h3>
        <p className="text-sm text-neutral-300">
          Te contactaré pronto con recursos gratuitos para que sigas avanzando.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Clock className="w-3.5 h-3.5" />
          <span>Recibirás un email en los próximos 7 días</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trigger Button */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="text-center"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors underline underline-offset-4"
            >
              Todavía no estoy listo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#6D00FF]/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-[#B98CFF]" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Sin problema</h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Déjame tu correo y te enviaré recursos gratuitos para que sigas avanzando mientras decides.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-black/30 rounded-lg p-3 space-y-2">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Recibirás:</p>
                <ul className="text-sm text-neutral-300 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="text-[#6D00FF]">✓</span>
                    Guía de inicio rápido (PDF)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#6D00FF]">✓</span>
                    Tips personalizados basados en tu análisis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#6D00FF]">✓</span>
                    Descuento exclusivo cuando estés listo
                  </li>
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitState === "error") {
                        setSubmitState("idle");
                        setErrorMessage("");
                      }
                    }}
                    placeholder="tu@email.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-black border text-white placeholder:text-neutral-500 focus:outline-none transition-colors ${
                      submitState === "error"
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/20 focus:border-[#6D00FF]"
                    }`}
                    disabled={submitState === "submitting"}
                  />
                </div>

                {/* Error Message */}
                {submitState === "error" && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitState === "submitting" || !email}
                  className="w-full py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all flex items-center justify-center gap-2"
                >
                  {submitState === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Recibir recursos gratuitos</span>
                  )}
                </button>
              </form>

              {/* Privacy Note */}
              <p className="text-xs text-neutral-500 text-center">
                No spam. Puedes cancelar cuando quieras.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
