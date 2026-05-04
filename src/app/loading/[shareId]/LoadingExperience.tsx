"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";

const LOADING_STEPS = [
  "Analizando tu foto...",
  "Generando mes 4...",
  "Generando mes 8...",
  "Generando mes 12...",
  "Preparando tus resultados...",
];

const TIPS = [
  "La salud muscular es uno de los predictores clave de longevidad.",
  "Tu sistema GENESIS analiza 12 variables biométricas.",
  "El 80% de los resultados depende del sistema, no de la motivación.",
];

const PROGRESS_BY_COUNT = [12, 45, 75, 100];

export function LoadingExperience({ shareId }: { shareId: string }) {
  const router = useRouter();
  const { loading: authLoading, getIdToken } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [status, setStatus] = useState<string>("processing");
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [hasAi, setHasAi] = useState(false);
  const [progress, setProgress] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const startedGenerationRef = useRef(false);

  const imageCount = imageKeys.length;
  const has = (key: string) => imageKeys.includes(key);
  const isReady = status === "ready";
  const isFailed = status === "failed";

  // Resolved per-step states from real Firestore data, not optimistic increments
  const stepStates = useMemo(() => {
    return [
      { label: "Analizando tu foto", done: hasAi || imageCount >= 1, active: !hasAi && imageCount === 0 },
      { label: "Generando mes 4", done: has("m4"), active: hasAi && !has("m4") },
      { label: "Generando mes 8", done: has("m8"), active: has("m4") && !has("m8") },
      { label: "Generando mes 12", done: has("m12"), active: has("m8") && !has("m12") },
      { label: "Preparando tus resultados", done: isReady, active: imageCount >= 3 && !isReady },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKeys, hasAi, isReady]);

  const stageLabel = useMemo(() => {
    if (isFailed) return "Proceso detenido";
    if (isReady) return "¡Listo! Cargando tus resultados...";
    const activeStep = stepStates.find((s) => s.active);
    return activeStep ? `${activeStep.label}...` : stepStates[0].label;
  }, [isFailed, isReady, stepStates]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sessions/${shareId}`, { cache: "no-store" });
        const json = await res.json();
        if (!mounted) return;

        const nextStatus = json?.status || "processing";
        const images = (json?.assets?.images || {}) as Record<string, string>;
        const keys = Object.keys(images);
        const count = keys.length;
        const aiPresent = json?.ai != null && json?.ai !== undefined;

        setStatus(nextStatus);
        setImageKeys(keys);
        setHasAi(aiPresent);
        setProgress(PROGRESS_BY_COUNT[Math.min(count, 3)]);

        if (!startedGenerationRef.current && (nextStatus === "analyzed" || nextStatus === "processing") && count === 0 && !authLoading) {
          startedGenerationRef.current = true;

          (async () => {
            try {
              const token = await getIdToken();

              if (!token) {
                setError("Error de autenticación. Inicia sesión e intenta de nuevo.");
                return;
              }

              const genRes = await fetch("/api/generate-images", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ sessionId: shareId }),
              });

              if (!genRes.ok) {
                const errData = await genRes.json();
                console.error("[Loading] Generation trigger failed:", errData.error);
                if (errData.error === "Unauthorized") {
                  setError("Error de autenticación. Redirigiendo...");
                } else if (errData.error === "AI generation is temporarily disabled") {
                  setError("La generación está pausada temporalmente. Intenta más tarde.");
                }
              }
            } catch (err) {
              console.error("[Loading] Error triggering generation:", err);
            }
          })();
        }

        if (nextStatus === "failed") {
          setError("No pudimos completar la generación. Intenta nuevamente.");
        }

        if (nextStatus === "ready" || count >= 3) {
          setTimeout(() => router.replace(`/s/${shareId}`), 800);
        }
      } catch {
        if (!mounted) return;
        setError("Problema de conexión. Reintentando...");
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [shareId, router, authLoading, getIdToken]);

  return (
    <div className="fixed inset-0 bg-[#050505]/95 z-50 flex flex-col items-center justify-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative w-64 h-64 mb-10">
        <div className="absolute inset-0 border-4 border-[#6D00FF]/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-2 border-2 border-dashed border-[#6D00FF]/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-[#6D00FF]/10 rounded-full animate-pulse blur-xl" />
        </div>
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden">
          <div className="w-full h-2 bg-[#6D00FF] shadow-[0_0_20px_#6D00FF] absolute top-0 animate-[scan_3s_ease-in-out_infinite]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold tracking-tighter text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-center z-10 max-w-xl px-6 space-y-4">
        <div className="flex justify-center">
          <Logo variant="full" size="lg" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#6D00FF] tracking-widest uppercase animate-pulse">
          {stageLabel || LOADING_STEPS[stepIndex]}
        </h2>
        <p className="text-sm text-neutral-300">{stageLabel}</p>

        <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6D00FF] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-4 text-xs">
          {stepStates.map((step) => {
            const stoppedHere = isFailed && !step.done && step.active;
            const stateLabel = step.done
              ? "Listo"
              : stoppedHere
                ? "Detenido"
                : step.active
                  ? "Procesando..."
                  : "Pendiente";
            return (
              <div
                key={step.label}
                className={cn(
                  "rounded-xl border border-white/10 bg-white/5 p-3 transition-colors",
                  step.done && "border-[#6D00FF] bg-[#6D00FF]/10",
                  step.active && !isFailed && "border-[#6D00FF]/40",
                  stoppedHere && "border-red-500/40 bg-red-500/5"
                )}
              >
                <p className="uppercase tracking-wider text-neutral-400">{step.label}</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.done && "text-[#6D00FF]",
                    stoppedHere && "text-red-400"
                  )}
                >
                  {stateLabel}
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      step.done
                        ? "w-full bg-[#6D00FF]"
                        : step.active && !isFailed
                          ? "w-2/3 bg-[#6D00FF] animate-pulse"
                          : stoppedHere
                            ? "w-1/3 bg-red-400/60"
                            : "w-0"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-red-400">{error}</p>
            <button
              onClick={async () => {
                if (retrying) return;
                setRetrying(true);
                setError(null);
                try {
                  const token = await getIdToken();
                  if (!token) {
                    setError("Error de autenticación. Recarga la página.");
                    setRetrying(false);
                    return;
                  }
                  // Reset start flag so the poll will trigger generation again
                  startedGenerationRef.current = false;
                  // Try analyze first (in case ai is missing), then images
                  await fetch("/api/analyze", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ sessionId: shareId }),
                  });
                  await fetch("/api/generate-images", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ sessionId: shareId }),
                  });
                } catch (e) {
                  setError("No pudimos reintentar. Intenta de nuevo en unos segundos.");
                  console.error("[Loading] Retry failed:", e);
                } finally {
                  setRetrying(false);
                }
              }}
              disabled={retrying}
              className="px-5 py-2 rounded-full bg-[#6D00FF] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retrying ? "Reintentando..." : "Reintentar generación"}
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 px-6 w-full max-w-lg text-center">
        <div className="bg-neutral-900/80 border border-neutral-800 p-4 rounded-xl backdrop-blur-sm">
          <p className="text-neutral-400 text-sm" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.replace(`/s/${shareId}`)}
        className="absolute top-6 right-6 text-xs text-neutral-400 border border-white/10 px-3 py-2 rounded-full hover:bg-white/10"
      >
        Ver resultados
      </motion.button>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
