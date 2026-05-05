"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/ui/Logo";
import { RiveOrb } from "@/components/RiveOrb";
import { LoadingStepper } from "@/components/LoadingStepper";

const TIPS = [
  "La salud muscular es uno de los predictores clave de longevidad.",
  "El 80% del resultado depende del sistema, no de la motivación.",
  "GENESIS no diagnostica. Te muestra dirección y un siguiente paso.",
  "La disciplina vence a la motivación cuando hay estructura.",
];

const PROGRESS_BY_COUNT = [12, 45, 75, 100];

export function LoadingExperience({ shareId }: { shareId: string }) {
  const router = useRouter();
  const { loading: authLoading, getIdToken } = useAuth();
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
      { label: "Visualizando mes 4", done: has("m4"), active: hasAi && !has("m4") },
      { label: "Visualizando mes 8", done: has("m8"), active: has("m4") && !has("m8") },
      { label: "Visualizando mes 12", done: has("m12"), active: has("m8") && !has("m12") },
      { label: "Preparando tu lectura inicial", done: isReady, active: imageCount >= 3 && !isReady },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageKeys, hasAi, isReady]);

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

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(109,0,255,0.18)" }}
      />
      <div
        className="pointer-events-none absolute right-[-8%] bottom-[12%] h-[360px] w-[360px] rounded-full blur-[120px]"
        style={{ backgroundColor: "rgba(109,0,255,0.10)" }}
      />

      {/* Logo */}
      <div className="mb-4 md:mb-6 z-10">
        <Logo variant="full" size="md" />
      </div>

      {/* GENESIS orb — Rive ambient animation with progress overlay */}
      <div className="mb-8 md:mb-10 z-10">
        <RiveOrb>
          <span className="font-mono font-bold text-3xl md:text-4xl tabular-nums tracking-[-0.02em] text-white">
            {Math.round(progress)}%
          </span>
        </RiveOrb>
      </div>

      {/* Stepper-timeline — single source of step state */}
      <div className="z-10 w-full max-w-3xl px-6">
        <LoadingStepper steps={stepStates} failed={isFailed} />
      </div>

      {/* Error + retry */}
      {error && (
        <div className="z-10 mt-6 flex flex-col items-center gap-3 px-6 text-center">
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

      {/* Tip — relative on mobile (avoids overlap), absolute on md+ */}
      <div className="mt-8 px-6 w-full max-w-lg text-center md:absolute md:mt-0 md:bottom-10 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="ngx-metal-card !p-5"
          >
            <div className="relative z-10">
              <p className="text-sm text-white/75 leading-relaxed">
                {TIPS[tipIndex]}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* "Ver resultados" — only when actually ready, otherwise hidden */}
      {isReady ? (
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.replace(`/s/${shareId}`)}
          className="absolute top-6 right-6 z-20 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[var(--ngx-glow-primary-soft)] transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: "var(--ngx-purple)" }}
        >
          Ver resultados →
        </motion.button>
      ) : null}
    </div>
  );
}
