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

  // Dev-only demo bypass: ?demo=1 skips polling and shows the loader UI
  // with a stubbed progressing state — used for visual QA without a real session.
  const isDemo =
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("demo") === "1";

  useEffect(() => {
    if (isDemo) {
      // Stubbed progress: AI ready, then m4 → m8 → m12 every 3s
      const ticks = [
        { hasAi: true, keys: [] as string[] },
        { hasAi: true, keys: ["m4"] },
        { hasAi: true, keys: ["m4", "m8"] },
        { hasAi: true, keys: ["m4", "m8", "m12"] },
      ];
      let i = 0;
      setHasAi(true);
      const id = setInterval(() => {
        if (i >= ticks.length) {
          clearInterval(id);
          return;
        }
        const t = ticks[i];
        setHasAi(t.hasAi);
        setImageKeys(t.keys);
        setProgress(PROGRESS_BY_COUNT[Math.min(t.keys.length, 3)]);
        i++;
      }, 3000);
      return () => clearInterval(id);
    }

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

        if (
          !startedGenerationRef.current &&
          (nextStatus === "analyzed" || nextStatus === "processing") &&
          count === 0 &&
          !authLoading
        ) {
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
  }, [shareId, router, authLoading, getIdToken, isDemo]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto md:overflow-hidden text-white py-10 md:py-0"
      style={{ background: "rgba(5, 5, 8, 0.95)" }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(109,0,255,0.18)" }}
      />

      {/* Scanner ring */}
      <div className="relative w-64 h-64 mb-10">
        <div
          className="absolute inset-0 rounded-full animate-[spin_10s_linear_infinite]"
          style={{ border: "4px solid rgba(109,0,255,0.30)" }}
        />
        <div
          className="absolute inset-2 rounded-full animate-[spin_15s_linear_infinite_reverse]"
          style={{ border: "2px dashed rgba(109,0,255,0.50)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full animate-pulse blur-xl" style={{ background: "rgba(109,0,255,0.10)" }} />
        </div>
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden">
          <div
            className="w-full h-2 absolute top-0 animate-[scan_3s_ease-in-out_infinite]"
            style={{ backgroundColor: "var(--ngx-purple)", boxShadow: "0 0 20px var(--ngx-purple)" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-4xl tabular-nums tracking-[-0.02em] text-white">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center z-10 max-w-xl px-6 space-y-4">
        <div className="flex justify-center">
          <Logo variant="full" size="lg" />
        </div>
        <h2
          className="ngx-eyebrow text-[12px] !tracking-[0.22em] animate-pulse"
          style={{ color: "var(--ngx-purple-light)" }}
        >
          {stageLabel || LOADING_STEPS[stepIndex]}
        </h2>

        <div className="h-1 w-full rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.04]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
              boxShadow: "0 0 12px rgba(109,0,255,0.40)",
            }}
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
                  "rounded-xl border p-3 transition-colors",
                  step.done
                    ? "border-[var(--ngx-purple)] bg-[var(--ngx-purple)]/[0.08]"
                    : step.active && !isFailed
                      ? "border-[var(--ngx-purple)]/40 bg-white/[0.03]"
                      : stoppedHere
                        ? "border-[var(--ngx-error)]/40 bg-[var(--ngx-error)]/[0.05]"
                        : "border-white/[0.08] bg-white/[0.025]"
                )}
              >
                <p className="ngx-eyebrow !text-[10px]" style={{ color: "var(--ngx-fg-3)" }}>
                  {step.label}
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-sm font-bold",
                    step.done ? "text-[var(--ngx-purple-light)]" : stoppedHere ? "text-[var(--ngx-error)]" : "text-white/85"
                  )}
                >
                  {stateLabel}
                </p>
                <div className="mt-2 h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      step.done
                        ? "w-full"
                        : step.active && !isFailed
                          ? "w-2/3 animate-pulse"
                          : stoppedHere
                            ? "w-1/3"
                            : "w-0"
                    )}
                    style={{
                      background: stoppedHere
                        ? "var(--ngx-error)"
                        : "linear-gradient(90deg, var(--ngx-purple), var(--ngx-purple-light))",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-[var(--ngx-error)]">{error}</p>
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
                  startedGenerationRef.current = false;
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
              className="rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{
                backgroundColor: "var(--ngx-purple)",
                boxShadow: "var(--ngx-glow-primary-soft)",
              }}
            >
              {retrying ? "Reintentando..." : "Reintentar generación"}
            </button>
          </div>
        )}
      </div>

      {/* Tip — relative on mobile (avoids overlap with stacked steps), absolute on md+ */}
      <div className="mt-8 px-6 w-full max-w-lg text-center md:absolute md:mt-0 md:bottom-12">
        <div className="ngx-glass-clear !p-4 rounded-2xl">
          <p className="text-sm text-white/65 leading-relaxed" key={tipIndex}>
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.replace(`/s/${shareId}`)}
        className="absolute top-6 right-6 ngx-glass-clear text-xs text-white/65 px-3 py-2 rounded-full hover:text-white"
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
